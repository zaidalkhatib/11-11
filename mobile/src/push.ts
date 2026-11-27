/** Expo push token registration — stores token on the API for match/reminder delivery. */
import { Platform } from "react-native";
import Constants from "expo-constants";
import { registerPushToken } from "./api";
import { isExpoGo } from "./auth";

export async function registerDevicePushToken(): Promise<string | null> {
  if (Platform.OS === "web" || isExpoGo()) return null;
  try {
    // Lazy require so Expo Go / web bundles still load if native module is absent.
    const Notifications = await import("expo-notifications");
    const Device = await import("expo-device");
    if (!Device.isDevice) return null;
    const { status: existing } = await Notifications.getPermissionsAsync();
    let status = existing;
    if (existing !== "granted") {
      const asked = await Notifications.requestPermissionsAsync();
      status = asked.status;
    }
    if (status !== "granted") return null;
    const projectId =
      Constants.easConfig?.projectId ??
      (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas?.projectId;
    const token = (
      await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined)
    ).data;
    if (!token) return null;
    await registerPushToken(token);
    return token;
  } catch {
    return null;
  }
}
