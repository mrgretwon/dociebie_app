import logoImage from "@/assets/images/logo.png";
import { Image, StyleSheet, Text, View } from "react-native";
import FooterLinks from "./FooterLinks";
import SocialIcons from "./SocialIcons";

const Footer = () => {
  return (
    <View style={styles.container}>
      <Image source={logoImage} style={styles.logo} resizeMode="contain" />
      <FooterLinks />

      <View style={styles.socialIconsAndTrademark}>
        <Text style={styles.copyright}>
          &copy; {new Date().getFullYear()} dociebie.pl. Wszystkie prawa zastrzeżone
        </Text>
        <SocialIcons />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  logo: {
    width: 140,
    height: 40,
    resizeMode: "contain",
  },
  copyright: {
    flex: 1,
    color: "#fff",
  },
  socialIconsAndTrademark: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    columnGap: 16,
  },
});

export default Footer;
