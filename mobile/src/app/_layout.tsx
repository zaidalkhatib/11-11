import { Slot } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { FlowProvider } from "../../App";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <FlowProvider>
        <Slot />
      </FlowProvider>
    </SafeAreaProvider>
  );
}
