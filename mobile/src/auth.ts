import {
  PhoneAuthProvider,
  deleteUser,
  signInWithCredential,
  signOut,
  type ApplicationVerifier,
  type User,
} from "firebase/auth";
import Constants from "expo-constants";
import { getFirebaseAuth, isFirebaseConfigured } from "./firebase";

/** Expo Go cannot complete native phone reCAPTCHA / APNs verification. */
export function isExpoGo(): boolean {
  return Constants.appOwnership === "expo";
}

function allowAuthTestingBypass(): boolean {
  if (process.env.EXPO_PUBLIC_FIREBASE_AUTH_TESTING === "1") return true;
  return isExpoGo();
}

let idToken: string | null = null;
let verificationId: string | null = null;

/** Stub verifier for Firebase test numbers when native reCAPTCHA is unavailable (Expo Go). */
const testingVerifier: ApplicationVerifier = {
  type: "recaptcha",
  verify: () => Promise.resolve("test"),
};

export function toE164Us(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const national = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  return `+1${national}`;
}

export function getAuthIdToken(): string | null {
  return idToken;
}

export function clearAuthSession(): void {
  idToken = null;
  verificationId = null;
}

/** Permanently remove the Firebase Auth user, then sign out. No-op if none signed in. */
export async function deleteFirebaseAccount(): Promise<void> {
  if (!isFirebaseConfigured()) {
    clearAuthSession();
    return;
  }
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  clearAuthSession();
  if (user) {
    await deleteUser(user);
  }
  await signOut(auth).catch(() => undefined);
}

export async function refreshAuthIdToken(): Promise<string | null> {
  const user = getFirebaseAuth().currentUser;
  if (!user) {
    idToken = null;
    return null;
  }
  idToken = await user.getIdToken(true);
  return idToken;
}

function enableAuthTestingMode(): void {
  if (!allowAuthTestingBypass()) return;
  const auth = getFirebaseAuth();
  // Expo Go / explicit test flag only — never in store or EAS dev-client builds.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (auth.settings as any).appVerificationDisabledForTesting = true;
}

export async function sendPhoneCode(
  phone: string,
  verifier?: ApplicationVerifier | null,
): Promise<void> {
  if (!isFirebaseConfigured()) throw new Error("FIREBASE_NOT_CONFIGURED");
  const auth = getFirebaseAuth();
  enableAuthTestingMode();
  const provider = new PhoneAuthProvider(auth);
  const e164 = toE164Us(phone);
  const primary = verifier ?? (allowAuthTestingBypass() ? testingVerifier : null);
  if (!primary) throw new Error("PHONE_VERIFIER_REQUIRED");
  try {
    verificationId = await provider.verifyPhoneNumber(e164, primary);
  } catch (first) {
    if (!allowAuthTestingBypass()) throw first;
    // Expo Go often lacks native reCAPTCHA — retry with the testing stub.
    verificationId = await provider.verifyPhoneNumber(e164, testingVerifier).catch(() => {
      throw first;
    });
  }
}

export async function confirmPhoneCode(code: string): Promise<User> {
  if (!verificationId) throw new Error("PHONE_CODE_NOT_SENT");
  const credential = PhoneAuthProvider.credential(verificationId, code.trim());
  const result = await signInWithCredential(getFirebaseAuth(), credential);
  idToken = await result.user.getIdToken();
  return result.user;
}

export function hasPendingPhoneVerification(): boolean {
  return !!verificationId;
}

export function authErrorMessage(error: unknown): string {
  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code?: string }).code ?? "")
      : "";
  const message = error instanceof Error ? error.message : String(error ?? "");
  if (code.includes("invalid-phone-number") || message.includes("invalid-phone-number")) {
    return "That phone number doesn’t look valid.";
  }
  if (code.includes("too-many-requests") || message.includes("too-many-requests")) {
    return "Too many attempts. Wait a bit and try again.";
  }
  if (code.includes("missing-client-identifier") || message.includes("reCAPTCHA")) {
    return "Verification isn’t available in this build. Use a Firebase test number, or a dev build.";
  }
  if (code.includes("argument-error") || message.includes("ARGUMENT_ERROR")) {
    return "Verification failed to start. Try the test number from Firebase settings.";
  }
  return message.slice(0, 140) || "Couldn’t send a code. Check the number and try again.";
}
