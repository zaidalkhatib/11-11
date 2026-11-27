import { ApiError, TransportError, mapPreviewLabels } from './client';
import type { AnswersSnapshot, Catalog, Event, Profile, createClient } from './client';

/** Structural subset of current mobile Answers. No native APIs or implicit I/O. */
export type PreviewAnswers = {
  name: string; energy: number | null; conversations: string[];
  chemistry: string; traits: Record<string, string[]>;
};
export type Client = ReturnType<typeof createClient>;
export function prepareAnswers(catalog: Catalog, preview: PreviewAnswers, consentedQuestionIds: ReadonlySet<string> = new Set()) {
  const plan = mapPreviewLabels(catalog, {
    ...preview.traits,
    energy: preview.energy === null ? [] : [String(preview.energy)],
    conversations: preview.conversations,
    chemistry: preview.chemistry ? [preview.chemistry] : [],
  }, consentedQuestionIds);
  // height / bodyBuild / childhoodResources stay EXCLUDED server-side; omit without blocking the batch.
  return {
    answers: plan.answers,
    issues: plan.issues.filter((issue) => issue.code !== 'COLLECTION_DISABLED'),
  };
}
/** DOB is separately supplied, never inferred from a preview code or completed onboarding. */
export function prepareProfile(preview: PreviewAnswers, dateOfBirth: string | null, expectedVersion: number | null) {
  return { displayName: preview.name.trim(), dateOfBirth, expectedVersion };
}
/** A preview type (Dinner etc.) can never become an event selection. */
export function selectScheduledEvent(events: Event[], explicitEventId: string): Event {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(explicitEventId)) throw new Error('EXPLICIT_EVENT_ID_REQUIRED');
  const matches = events.filter(event => event.id === explicitEventId);
  if (matches.length !== 1) throw new Error('EVENT_NOT_IN_CURRENT_CATALOG');
  return { ...matches[0] };
}
export type Failure = { state: 'conflict' | 'unauthorized' | 'rejected' | 'unconfirmed'; code: string; currentRevision?: string };
export function failure(error: unknown): Failure {
  if (error instanceof ApiError) return {
    state: error.outcomeUncertain ? 'unconfirmed' : (error.status === 409 || error.status === 412) ? 'conflict' : error.status === 401 ? 'unauthorized' : 'rejected',
    code: error.code, currentRevision: error.currentRevision,
  };
  return { state: 'unconfirmed', code: error instanceof TransportError ? error.message : 'REQUEST_NOT_CONFIRMED' };
}
/** Call only after an explicit save action. Never resolve 409 by overwriting newer data. */
export async function saveProfile(client: Client, update: ReturnType<typeof prepareProfile>): Promise<{ state: 'acknowledged'; profile: Profile } | Failure> {
  try { return { state: 'acknowledged', profile: await client.saveProfile(update) }; }
  catch (error) { return failure(error); }
}
/** Deliberately not atomic: preserve acknowledged IDs and stop at the first error.
 * Missing answers do not delete existing server answers; deletion must be explicit.
 */
export async function savePreparedAnswers(client: Client, plan: ReturnType<typeof prepareAnswers>, editingSnapshot: AnswersSnapshot) {
  let lastAcknowledgedRevision = editingSnapshot.revision;
  const acknowledged: string[] = [];
  const ids = Object.keys(plan.answers).sort();
  if (plan.issues.length) return { state: 'blocked' as const, acknowledged, remaining: ids, lastAcknowledgedRevision, requiresReload: false, issues: plan.issues };
  for (const id of ids) {
    try {
      const ack = await client.saveAnswer(id, plan.answers[id], lastAcknowledgedRevision);
      lastAcknowledgedRevision = ack.revision; acknowledged.push(id);
    }
    catch (error) { return { state: 'incomplete' as const, acknowledged, remaining: ids.slice(acknowledged.length), lastAcknowledgedRevision, requiresReload: true, error: failure(error) }; }
  }
  return { state: 'acknowledged' as const, acknowledged, remaining: [], lastAcknowledgedRevision, requiresReload: false };
}
