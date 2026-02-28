import { Stack } from "expo-router";
import AuthBoundary from "@/components/AuthBoundary";

export default function SalonDetailsLayout() {
  return (
    <AuthBoundary>
      <Stack initialRouteName="index" screenOptions={{ headerShown: false, animation: "slide_from_right", animationDuration: 250 }}>
        <Stack.Screen name="index" />
      </Stack>
    </AuthBoundary>
  );
}
