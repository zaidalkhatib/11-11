import { View } from "react-native";
import { Slot } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { FlowProvider, InviteEntranceHost } from "../../App";
import { color } from "../theme";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <FlowProvider>
        <View style={{ flex: 1, backgroundColor: color.background }}>
          <Slot />
          <InviteEntranceHost />
        </View>
      </FlowProvider>
    </SafeAreaProvider>
  );
}
