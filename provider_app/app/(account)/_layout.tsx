import { Stack } from "expo-router";

export default function AccountLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade", animationDuration: 200 }}>
      <Stack.Screen name="edit" />
      <Stack.Screen name="business-card" />
      <Stack.Screen name="subscription" />
    </Stack>
  );
}
