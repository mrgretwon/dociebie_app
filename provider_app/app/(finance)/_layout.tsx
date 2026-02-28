import { Stack } from "expo-router";

export default function FinanceLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="payment-history" />
      <Stack.Screen name="reports" />
      <Stack.Screen name="bank-account" />
    </Stack>
  );
}
