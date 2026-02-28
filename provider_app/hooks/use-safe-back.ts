import { useNavigation, useRouter } from "expo-router";
import { useCallback } from "react";

/**
 * Returns a `goBack` function that navigates back if possible,
 * or falls back to the dashboard if there's no valid back destination.
 */
export function useSafeBack() {
  const router = useRouter();
  const navigation = useNavigation();

  const goBack = useCallback(() => {
    if (navigation.canGoBack()) {
      router.back();
    } else {
      router.replace("/(dashboard)");
    }
  }, [navigation, router]);

  return goBack;
}
