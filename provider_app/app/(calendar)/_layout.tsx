import { Stack } from "expo-router";

export default function CalendarLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade", animationDuration: 200 }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="add-visit" />
      <Stack.Screen name="free-slot" />
    </Stack>
  );
}
