import { Stack } from "expo-router";

export default function AccountLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="edit" />
      <Stack.Screen name="business-card" />
      <Stack.Screen name="subscription" />
    </Stack>
  );
}
