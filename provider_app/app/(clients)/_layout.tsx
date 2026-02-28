import { Stack } from "expo-router";

export default function ClientsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade", animationDuration: 200 }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="pending" />
      <Stack.Screen name="add" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="groups/index" />
      <Stack.Screen name="groups/[groupId]" />
      <Stack.Screen name="groups/create" />
    </Stack>
  );
}
