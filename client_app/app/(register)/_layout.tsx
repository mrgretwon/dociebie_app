import { Stack } from "expo-router";
import AuthBoundary from "@/components/AuthBoundary";

export default function RegisterLayout() {
  return (
    <AuthBoundary requireAuth={false}>
      <Stack initialRouteName="index" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </AuthBoundary>
  );
}
