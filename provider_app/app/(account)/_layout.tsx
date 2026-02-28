import { Stack } from "expo-router";

export default function AccountLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right", animationDuration: 250 }}>
      <Stack.Screen name="edit" />
      <Stack.Screen name="business-card" />
      <Stack.Screen name="subscription" />
    </Stack>
  );
}
