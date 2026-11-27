import { View } from "react-native";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { FlowProvider, InviteEntranceHost } from "../../App";
import { color } from "../theme";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <FlowProvider>
        <View style={{ flex: 1, backgroundColor: color.background }}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "none",
              contentStyle: { backgroundColor: color.background },
            }}
          />
          <InviteEntranceHost />
        </View>
      </FlowProvider>
    </SafeAreaProvider>
  );
}
