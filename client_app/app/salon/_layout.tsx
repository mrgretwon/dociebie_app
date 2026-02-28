import { Stack } from "expo-router";
import AuthBoundary from "@/components/AuthBoundary";

export default function SalonLayout() {
  return (
    <AuthBoundary>
      <Stack screenOptions={{ headerShown: false, animation: "slide_from_right", animationDuration: 250 }} />
    </AuthBoundary>
  );
}
