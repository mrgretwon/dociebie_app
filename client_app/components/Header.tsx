import logoCyanImage from "@/assets/images/logo-dociebie.png";
import logoImage from "@/assets/images/logo-dociebie_white_new.png";
import { baseGrey, darkBlueFont, primaryColor } from "@/constants/style-vars";
import { useRouter } from "expo-router";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MenuButton from "./icons/menu-button";

type HeaderVariant = "primary" | "grey";

type HeaderProps = {
  variant?: HeaderVariant;
};

const Header = ({ variant = "primary" }: HeaderProps) => {
  const router = useRouter();

  const usePrimary = variant === "primary";
  const backgroundColor = usePrimary ? primaryColor : baseGrey;
  const logo = usePrimary ? logoImage : logoCyanImage;

  return (
    <SafeAreaView edges={["top"]}>
      <View style={[styles.container, { backgroundColor }]}>
        <TouchableOpacity onPress={() => router.navigate("/(home)")}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </TouchableOpacity>
        <MenuButton color={variant === "primary" ? baseGrey : darkBlueFont} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  logo: {
    width: 140,
    height: 40,
    resizeMode: "contain",
  },
});

export default Header;
