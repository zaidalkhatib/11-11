import { Platform } from "react-native";
import { tokens } from "../../website/packages/design-tokens/index";

export const color = tokens.color;

/** Headlines, wordmark, and body. */
export const serif = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "Georgia, 'Times New Roman', serif",
});

/** Small labels and eyebrows. */
export const sans = Platform.select({
  ios: "System",
  android: "sans-serif",
  default: "Arial, Helvetica, sans-serif",
});

export const motion = tokens.motion;
