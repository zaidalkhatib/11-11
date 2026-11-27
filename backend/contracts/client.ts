/** Opt-in adapter only: importing this file performs no I/O; not wired into Expo. */
export type Answer = { version: number; status: 'ANSWERED' | 'DECLINED'; choices: string[]; sensitiveConsent: boolean };
export type AnswersSnapshot = { revision: string; answers: Record<string, Answer> };
export type AnswerAcknowledgement = { revision: string };
export type Question = {
  id: string; version: number; title: string; kind: 'SELF' | 'PREFERENCE' | 'IMPORTANCE';
  optional?: boolean | null; target: string | null; sensitive: boolean; scoring: 'INACTIVE' | 'EXCLUDED'; maximum: number;
  options: { id: string; label: string; declined: boolean; exclusive: boolean }[];
};
export type Catalog = { version: string; revision?: string | null; questions: Question[] };
export type Profile = { displayName: string; dateOfBirth: string | null; version: number; identityVerified: boolean };
export type Event = { id: string; title: string; cityCode: string; neighborhood: string; timeZone: string | null; startsAt: string; endsAt: string };
export type Disclosure = { eventId: string; neighborhood: string; startsAt: string; timeZone: string | null; state: 'HIDDEN' | 'REVEALED'; venueName: string | null; venueAddress: string | null; partnerName: string | null };
export type Invitation = {
  eventId: string;
  state: 'WAITING' | 'MATCHED';
  arrangementId: string | null;
  title: string;
  neighborhood: string;
  timeZone: string | null;
  startsAt: string;
  endsAt: string;
};
export class ApiError extends Error {
  constructor(readonly status: number, readonly code: string, readonly outcomeUncertain = false, readonly currentRevision?: string) { super(code); }
}
export class TransportError extends Error {
  constructor(readonly outcomeUncertain: boolean) { super('NETWORK_OR_TIMEOUT'); }
}
function assertBackendBaseUrl(baseUrl: string, allowInsecureLocalhost: boolean) {
  const url = new URL(baseUrl);
  if (url.username || url.password || url.search || url.hash) throw new Error('Backend URL must not include credentials, query, or fragment');
  const localHost = url.hostname === '127.0.0.1' || url.hostname === 'localhost' || url.hostname === '10.0.2.2';
  if (url.protocol === 'https:') return;
  if (allowInsecureLocalhost && url.protocol === 'http:' && localHost) return;
  throw new Error('An explicitly configured HTTPS backend is required');
}

/** Loopback-only: run the matcher once (local-dev profile). */
export async function runLocalDevMatcher(
  baseUrl: string,
  transport: typeof fetch = fetch,
  options: { timeoutMs?: number } = {},
): Promise<{ eventsScanned: number; pairsCreated: number; candidatesConsidered: number }> {
  assertBackendBaseUrl(baseUrl, true);
  const timeoutMs = options.timeoutMs ?? 10000;
  const base = baseUrl.replace(/\/$/, '');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await transport(base + '/api/v1/local-dev/run-matcher', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({})) as { code?: string };
      throw new ApiError(response.status, payload.code ?? 'LOCAL_DEV_MATCHER_FAILED');
    }
    return await response.json() as { eventsScanned: number; pairsCreated: number; candidatesConsidered: number };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new TransportError(true);
  } finally {
    clearTimeout(timeout);
  }
}

/** Loopback local-dev session only. Rejects non-local bases. */
export async function createLocalDevSession(
  baseUrl: string,
  transport: typeof fetch = fetch,
  body: { subject?: string } = {},
  options: { timeoutMs?: number } = {},
): Promise<{ accessToken: string; expiresAt: string; tokenType: string }> {
  assertBackendBaseUrl(baseUrl, true);
  const timeoutMs = options.timeoutMs ?? 10000;
  const base = baseUrl.replace(/\/$/, '');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await transport(base + '/api/v1/local-dev/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({})) as { code?: string };
      throw new ApiError(response.status, payload.code ?? 'LOCAL_DEV_SESSION_FAILED');
    }
    return await response.json() as { accessToken: string; expiresAt: string; tokenType: string };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new TransportError(true);
  } finally {
    clearTimeout(timeout);
  }
}

export function createClient(
  baseUrl: string,
  getAccessToken: () => Promise<string>,
  transport: typeof fetch = fetch,
  options: { timeoutMs?: number; allowInsecureLocalhost?: boolean } = {},
) {
  assertBackendBaseUrl(baseUrl, options.allowInsecureLocalhost === true);
  const timeoutMs = options.timeoutMs ?? 10000;
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new Error('Invalid timeout');
  const base = baseUrl.replace(/\/$/, '');
  async function request<T>(path: string, method = 'GET', body?: unknown, headers: Record<string, string> = {}): Promise<T> {
    const token = await getAccessToken();
    if (!token) throw new Error('Authenticated session required');
    // No automatic mutation retry: a disconnected response may already have committed.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await transport(base + '/api/v1' + path, {
        method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...headers },
        body: body === undefined ? undefined : JSON.stringify(body), cache: 'no-store', signal: controller.signal,
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({})) as { code?: string; currentRevision?: string };
        throw new ApiError(response.status, payload.code ?? 'REQUEST_FAILED', method !== 'GET' && response.status >= 500, payload.currentRevision);
      }
      const text = await response.text(); return (text ? JSON.parse(text) : undefined) as T;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new TransportError(method !== 'GET');
    } finally { clearTimeout(timeout); }
  }

  function precondition(revision: string) {
    if (typeof revision !== 'string' || !/^(0|[1-9][0-9]{0,18})$/.test(revision)) throw new Error('ANSWER_REVISION_REQUIRED');
    return { 'If-Match': `"answers-${revision}"` };
  }
  return {
    questionnaire: () => request<Catalog>('/questionnaire'),
    events: () => request<Event[]>('/events'),
    profile: () => request<Profile>('/me/profile'),
    saveProfile: (body: { displayName: string; dateOfBirth: string | null; expectedVersion: number | null }) => request<Profile>('/me/profile', 'PUT', body),
    answers: () => request<AnswersSnapshot>('/me/answers'),
    saveAnswer: (id: string, answer: Answer, revision: string) => request<AnswerAcknowledgement>(`/me/answers/${encodeURIComponent(id)}`, 'PUT', answer, precondition(revision)),
    deleteAnswer: (id: string, revision: string) => request<AnswerAcknowledgement>(`/me/answers/${encodeURIComponent(id)}`, 'DELETE', undefined, precondition(revision)),
    interests: () => request<string[]>('/me/interests'),
    invitations: () => request<Invitation[]>('/me/invitations'),
    join: (event: string) => request<{ state: 'INTEREST_RECORDED'; bookingConfirmed: false }>(`/me/interests/${encodeURIComponent(event)}`, 'PUT'),
    leave: (event: string) => request<void>(`/me/interests/${encodeURIComponent(event)}`, 'DELETE'),
    date: (id: string) => request<Disclosure>(`/me/dates/${encodeURIComponent(id)}`),
    safety: (id: string, kind: 'BLOCK' | 'REPORT') => request<void>(`/me/dates/${encodeURIComponent(id)}/safety/${kind}`, 'PUT'),
  };
}
/** Pure migration helper. Only explicitly selected labels are mapped. Never sends anything.
 * Empty selections are absent/unknown; opt-out labels become DECLINED. No inferred consent.
 * Phone, code, photo, notes and name must never be passed as questionnaire answers.
 */
export function mapPreviewLabels(catalog: Catalog, selections: Record<string, string[]>, consentedQuestionIds: ReadonlySet<string> = new Set()) {
  if (catalog.version !== 'onboarding-v1') throw new Error('Unsupported questionnaire snapshot');
  const answers: Record<string, Answer> = {};
  const issues: { questionId: string; code: string }[] = [];
  for (const [id, labels] of Object.entries(selections)) {
    if (!labels.length) continue;
    const q = catalog.questions.find(q => q.id === id);
    if (!q) { issues.push({ questionId: id, code: 'UNKNOWN_QUESTION' }); continue; }
    const options = labels.map(label => q.options.find(o => o.label === label));
    if (options.some(o => !o) || new Set(labels).size !== labels.length || labels.length > q.maximum) {
      issues.push({ questionId: id, code: 'INVALID_SELECTION' }); continue;
    }
    if (options.some(o => o!.exclusive) && labels.length !== 1) { issues.push({ questionId: id, code: 'EXCLUSIVE_OPTION' }); continue; }
    if (options.some(o => o!.declined)) { answers[id] = { version: q.version, status: 'DECLINED', choices: [], sensitiveConsent: false }; continue; }
    if (q.scoring === 'EXCLUDED') { issues.push({ questionId: id, code: 'COLLECTION_DISABLED' }); continue; }
    if (q.sensitive && !consentedQuestionIds.has(id)) { issues.push({ questionId: id, code: 'CONSENT_REQUIRED' }); continue; }
    answers[id] = { version: q.version, status: 'ANSWERED', choices: options.map(o => o!.id), sensitiveConsent: q.sensitive && consentedQuestionIds.has(id) };
  }
  return { answers, issues };
}
