import { Stack } from "expo-router";

import AuthBoundary from "@/components/AuthBoundary";

export default function UserDataLayout() {
  return (
    <AuthBoundary>
      <Stack initialRouteName="index" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </AuthBoundary>
  );
}
