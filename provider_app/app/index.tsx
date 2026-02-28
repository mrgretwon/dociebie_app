import Spinner from "@/components/Spinner";
import { useAuth } from "@/contexts/AuthContext";
import { Redirect } from "expo-router";

export default function IndexRedirect() {
  const { token, isHydrating } = useAuth();

  if (isHydrating) {
    return <Spinner />;
  }

  if (token) {
    return <Redirect href="/(dashboard)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
