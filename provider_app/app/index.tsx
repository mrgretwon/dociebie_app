import { useAuth } from "@/contexts/AuthContext";
import { Redirect } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.setOptions({
  duration: 2000,
  fade: true,
});

export default function Index() {
  const { token, isHydrating } = useAuth();

  if (isHydrating) return null;

  return <Redirect href={token ? "/(dashboard)" : "/(auth)/login"} />;
}
