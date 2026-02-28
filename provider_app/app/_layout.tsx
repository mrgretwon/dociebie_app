import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  useFonts,
} from "@expo-google-fonts/nunito";
import { Drawer } from "expo-router/drawer";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import ToastManager from "toastify-react-native";

import { AuthProvider } from "@/contexts/AuthContext";
import { Fonts } from "@/constants/theme";
import { primaryColor } from "@/constants/style-vars";
import { GestureHandlerRootView } from "react-native-gesture-handler";

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ToastManager position="bottom" />
      <AuthProvider>
        <Drawer
          screenOptions={{
            headerShown: false,
            drawerActiveTintColor: primaryColor,
            drawerLabelStyle: {
              fontFamily: Fonts.semiBold,
            },
          }}
        >
          <Drawer.Screen
            name="index"
            options={{ drawerItemStyle: { display: "none" } }}
          />
          <Drawer.Screen
            name="(auth)"
            options={{ drawerItemStyle: { display: "none" } }}
          />
          <Drawer.Screen
            name="(dashboard)"
            options={{ title: "Dashboard" }}
          />
          <Drawer.Screen
            name="(calendar)"
            options={{ title: "Kalendarz rezerwacji" }}
          />
          <Drawer.Screen
            name="(clients)"
            options={{ title: "Lista klientów" }}
          />
          <Drawer.Screen
            name="(finance)"
            options={{ title: "Dane finansowe" }}
          />
          <Drawer.Screen
            name="(employees)"
            options={{ title: "Pracownicy" }}
          />
          <Drawer.Screen
            name="(services)"
            options={{ title: "Edytuj usługi" }}
          />
          <Drawer.Screen
            name="(account)"
            options={{ title: "Edytuj wizytówkę" }}
          />
          <Drawer.Screen
            name="(preview)"
            options={{ title: "Podgląd" }}
          />
        </Drawer>
        <StatusBar style="auto" />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
