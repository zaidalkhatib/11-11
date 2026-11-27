import {
  PhoneAuthProvider,
  signInWithCredential,
  type ApplicationVerifier,
  type User,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "./firebase";

let idToken: string | null = null;
let verificationId: string | null = null;

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

export async function refreshAuthIdToken(): Promise<string | null> {
  const user = getFirebaseAuth().currentUser;
  if (!user) {
    idToken = null;
    return null;
  }
  idToken = await user.getIdToken(true);
  return idToken;
}

export async function sendPhoneCode(
  phone: string,
  verifier: ApplicationVerifier,
): Promise<void> {
  if (!isFirebaseConfigured()) throw new Error("FIREBASE_NOT_CONFIGURED");
  const auth = getFirebaseAuth();
  const provider = new PhoneAuthProvider(auth);
  verificationId = await provider.verifyPhoneNumber(toE164Us(phone), verifier);
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
