/** Upload a local profile photo to Firebase Storage; returns HTTPS download URL. */
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { getFirebaseApp, getFirebaseAuth, isFirebaseConfigured } from "./firebase";

export async function uploadProfilePhoto(localUri: string): Promise<string | null> {
  if (!isFirebaseConfigured()) return null;
  if (!localUri || localUri.startsWith("https://") || localUri.startsWith("http://")) {
    return localUri || null;
  }
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error("FIREBASE_SESSION_EMPTY");
  const response = await fetch(localUri);
  const blob = await response.blob();
  const storage = getStorage(getFirebaseApp());
  const path = `profiles/${user.uid}/photo.jpg`;
  const objectRef = ref(storage, path);
  await uploadBytes(objectRef, blob, { contentType: blob.type || "image/jpeg" });
  return getDownloadURL(objectRef);
}
