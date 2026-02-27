import { Stack } from "expo-router";

import AuthBoundary from "@/components/AuthBoundary";
import Header from "@/components/Header";

export default function ProfileLayout() {
  return (
    <AuthBoundary>
      <Stack initialRouteName="index" screenOptions={{ header: () => <Header variant="grey" /> }}>
        <Stack.Screen name="index" />
      </Stack>
    </AuthBoundary>
  );
}
