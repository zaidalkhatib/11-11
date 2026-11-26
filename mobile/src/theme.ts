import { Platform } from "react-native";
import { tokens } from "../../website/packages/design-tokens/index";
export const color = tokens.color;
export const serif = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "Georgia, Times New Roman, serif",
});
export const motion = tokens.motion;
