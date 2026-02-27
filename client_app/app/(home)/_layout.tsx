import { Stack } from "expo-router";

import AuthBoundary from "@/components/AuthBoundary";
import Header from "@/components/Header";

export default function HomeLayout() {
  return (
    <AuthBoundary>
      <Stack
        initialRouteName="index"
        screenOptions={{ header: () => <Header variant="primary" /> }}
      >
        <Stack.Screen name="index" />
      </Stack>
    </AuthBoundary>
  );
}
