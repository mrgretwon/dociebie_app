import { Stack } from "expo-router";

export default function DashboardLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade", animationDuration: 200 }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
