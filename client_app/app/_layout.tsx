import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  useFonts,
} from "@expo-google-fonts/nunito";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import ToastManager from "toastify-react-native";

import Header from "@/components/Header";
import { AuthProvider } from "@/contexts/AuthContext";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <ToastManager position="bottom" />
      <AuthProvider>
        <Stack initialRouteName="(home)">
          <Stack.Screen name="(home)" options={{ headerShown: false }} />
          <Stack.Screen name="(history)" options={{ headerShown: false }} />
          <Stack.Screen name="(profile)" options={{ headerShown: false }} />
          <Stack.Screen name="(user-data)" options={{ headerShown: false }} />
          <Stack.Screen name="(salons)" options={{ headerShown: false }} />
          <Stack.Screen name="(appointment)" options={{ headerShown: false }} />
          <Stack.Screen name="(login)" options={{ headerShown: false }} />
          <Stack.Screen name="(register)" options={{ headerShown: false }} />
          <Stack.Screen name="(payments)" options={{ headerShown: false }} />
          <Stack.Screen name="(appointment-confirmed)" options={{ headerShown: false }} />
          <Stack.Screen name="salon" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", header: () => <Header variant="grey" /> }}
          />
        </Stack>
        <StatusBar style="auto" />
      </AuthProvider>
    </>
  );
}
