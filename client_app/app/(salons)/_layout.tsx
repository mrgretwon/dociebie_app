import { Stack } from "expo-router";

import AuthBoundary from "@/components/AuthBoundary";
import { SalonsSearchProvider } from "@/contexts/SalonsSearchContext";

export default function SalonsLayout() {
  return (
    <AuthBoundary>
      <SalonsSearchProvider>
        <Stack initialRouteName="index" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
        </Stack>
      </SalonsSearchProvider>
    </AuthBoundary>
  );
}
