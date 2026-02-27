import Header from "@/components/Header";
import { Stack } from "expo-router";
import AuthBoundary from "@/components/AuthBoundary";

export default function PaymentsLayout() {
  return (
    <AuthBoundary>
      <Stack initialRouteName="index" screenOptions={{ header: () => <Header variant="grey" /> }}>
        <Stack.Screen name="index" />
      </Stack>
    </AuthBoundary>
  );
}
