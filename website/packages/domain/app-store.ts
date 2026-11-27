/**
 * When the iOS app is on the App Store, set NEXT_PUBLIC_APP_STORE_URL.
 * Until then, download CTAs are no-ops (button stays visible, does nothing).
 */
export const APP_STORE_URL = (process.env.NEXT_PUBLIC_APP_STORE_URL ?? "").trim();

export function openAppDownload(): "store" | "noop" {
  if (typeof window !== "undefined" && APP_STORE_URL) {
    window.location.assign(APP_STORE_URL);
    return "store";
  }
  return "noop";
}
