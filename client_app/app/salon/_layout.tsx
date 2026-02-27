import { Stack } from "expo-router";
import AuthBoundary from "@/components/AuthBoundary";

export default function SalonLayout() {
  return (
    <AuthBoundary>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthBoundary>
  );
}
