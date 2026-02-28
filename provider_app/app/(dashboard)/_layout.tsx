import { Stack } from "expo-router";

export default function DashboardLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right", animationDuration: 250 }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
