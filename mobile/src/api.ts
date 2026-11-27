/** API session: Firebase ID token in production; local-dev JWT only on loopback. */
import {
  ApiError,
  createClient,
  createLocalDevSession,
  runLocalDevMatcher,
  type Event,
  type Invitation,
} from "./contracts/client";
import {
  failure,
  prepareAnswers,
  prepareProfile,
  savePreparedAnswers,
  saveProfile,
  selectScheduledEvent,
  type Client,
} from "./contracts/preview-adapter";
import { clearAuthSession, getAuthIdToken, refreshAuthIdToken } from "./auth";
import { isFirebaseConfigured } from "./firebase";
import { isValidUsPhone, type Answers } from "./onboarding";

export type { Event, Client, Invitation };
export { failure, prepareAnswers, prepareProfile, savePreparedAnswers, saveProfile, selectScheduledEvent, runLocalDevMatcher };

const DEFAULT_BASE = "http://127.0.0.1:8080";

let accessToken: string | null = null;
let client: Client | null = null;

export function apiBaseUrl(): string {
  return (process.env.EXPO_PUBLIC_API_BASE_URL ?? DEFAULT_BASE).replace(/\/$/, "");
}

function isLoopbackApi(): boolean {
  const base = apiBaseUrl();
  return base.includes("127.0.0.1") || base.includes("localhost");
}

async function tokenProvider(): Promise<string> {
  if (isFirebaseConfigured()) {
    const fresh = (await refreshAuthIdToken()) ?? getAuthIdToken();
    if (fresh) {
      accessToken = fresh;
      return fresh;
    }
  }
  return accessToken ?? "";
}

function buildClient(token: string): Client {
  accessToken = token;
  client = createClient(apiBaseUrl(), tokenProvider, fetch, {
    allowInsecureLocalhost: isLoopbackApi(),
  });
  return client;
}

/** Use after Firebase phone sign-in. */
export async function ensureFirebaseSession(): Promise<Client> {
  const token = (await refreshAuthIdToken()) ?? getAuthIdToken();
  if (!token) throw new Error("FIREBASE_SESSION_EMPTY");
  return buildClient(token);
}

export async function ensureSession(subject?: string): Promise<Client> {
  if (client && accessToken) return client;

  if (isFirebaseConfigured() && (getAuthIdToken() || (await refreshAuthIdToken()))) {
    return ensureFirebaseSession();
  }

  // Production Railway has no local-dev routes — require Firebase.
  if (!isLoopbackApi()) {
    throw new Error("FIREBASE_SIGN_IN_REQUIRED");
  }

  const session = await createLocalDevSession(apiBaseUrl(), fetch, subject ? { subject } : {});
  if (!session.accessToken) throw new Error("LOCAL_DEV_SESSION_EMPTY");
  return buildClient(session.accessToken);
}

export function clearSession(): void {
  accessToken = null;
  client = null;
  clearAuthSession();
}

/** Provisional DOB from age trait — adult check only, not identity verification. */
export function provisionalDobFromAge(ageLabel: string | undefined): string | null {
  if (!ageLabel) return null;
  const age = Number(ageLabel);
  if (!Number.isInteger(age) || age < 18 || age > 120) return null;
  const year = new Date().getFullYear() - age;
  return `${year}-01-01`;
}

export function previewFromAnswers(answers: Answers) {
  return {
    name: answers.name,
    energy: answers.energy,
    conversations: answers.conversations,
    chemistry: answers.chemistry,
    traits: answers.traits,
  };
}

export async function createProfileAndAnswers(answers: Answers) {
  const api = await ensureSession(
    isFirebaseConfigured() ? undefined : `mobile-${answers.phone.replace(/\D/g, "").slice(-10) || "anon"}`,
  );
  const catalog = await api.questionnaire();
  const dob = provisionalDobFromAge(answers.traits.age?.[0]);
  if (!dob) return { state: "blocked" as const, code: "AGE_REQUIRED" };
  let expectedVersion: number | null = null;
  try {
    expectedVersion = (await api.profile()).version;
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 404) return failure(error);
  }
  const profileUpdate = prepareProfile(previewFromAnswers(answers), dob, expectedVersion);
  const saved = await saveProfile(api, profileUpdate);
  if (saved.state !== "acknowledged") return saved;
  const snapshot = await api.answers();
  const consented = new Set(catalog.questions.filter((q) => q.sensitive).map((q) => q.id));
  const plan = prepareAnswers(catalog, previewFromAnswers(answers), consented);
  const batch = await savePreparedAnswers(api, plan, snapshot);
  return batch;
}

export async function fetchDinnerEvents(): Promise<Event[]> {
  const api = await ensureSession();
  return api.events();
}

export async function joinEvent(eventId: string): Promise<{ state: "INTEREST_RECORDED"; bookingConfirmed: false }> {
  const api = await ensureSession();
  const events = await api.events();
  selectScheduledEvent(events, eventId);
  return api.join(eventId);
}

export async function leaveEvent(eventId: string): Promise<void> {
  const api = await ensureSession();
  await api.leave(eventId);
}

export async function fetchInterests(): Promise<string[]> {
  const api = await ensureSession();
  return api.interests();
}

export async function fetchInvitations(): Promise<Invitation[]> {
  const api = await ensureSession();
  return api.invitations();
}

export async function triggerMatcher(): Promise<{ pairsCreated: number }> {
  if (!isLoopbackApi()) return { pairsCreated: 0 };
  return runLocalDevMatcher(apiBaseUrl());
}

/** After Firebase sign-in (or local-dev), load profile if it already exists. */
export async function tryReturningLogin(phone: string): Promise<{ name: string } | null> {
  if (!isValidUsPhone(phone)) return null;
  const digits = phone.replace(/\D/g, "");
  const national = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  try {
    const api = isFirebaseConfigured() && getAuthIdToken()
      ? await ensureFirebaseSession()
      : await ensureSession(`mobile-${national}`);
    const profile = await api.profile();
    if (!profile?.displayName?.trim()) return null;
    return { name: profile.displayName.trim() };
  } catch {
    return null;
  }
}
