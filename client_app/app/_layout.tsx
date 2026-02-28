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
import { CategoriesProvider } from "@/contexts/CategoriesContext";
import { SalonsSearchProvider } from "@/contexts/SalonsSearchContext";

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
      <CategoriesProvider>
      <AuthProvider>
        <SalonsSearchProvider>
        <Stack
          initialRouteName="(home)"
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
            animationDuration: 250,
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(home)" />
          <Stack.Screen name="(history)" />
          <Stack.Screen name="(profile)" />
          <Stack.Screen name="(user-data)" options={{ animation: "slide_from_bottom" }} />
          <Stack.Screen name="(salons)" />
          <Stack.Screen name="(appointment)" />
          <Stack.Screen name="(login)" />
          <Stack.Screen name="(register)" />
          <Stack.Screen name="(payments)" />
          <Stack.Screen name="(appointment-confirmed)" />
          <Stack.Screen name="salon" options={{ animation: "slide_from_right" }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", header: () => <Header variant="grey" /> }}
          />
        </Stack>
        <StatusBar style="auto" />
        </SalonsSearchProvider>
      </AuthProvider>
      </CategoriesProvider>
    </>
  );
}
