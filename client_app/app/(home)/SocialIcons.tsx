import FacebookIconSvg from "@/assets/svg/facebook-icon-svg";
import LinkedinIconSvg from "@/assets/svg/linkedin-icon-svg";
import TwitterIconSvg from "@/assets/svg/twitter-icon-svg";
import { StyleSheet, View } from "react-native";

const SocialIcons = () => {
  return (
    <View style={styles.container}>
      <TwitterIconSvg />
      <LinkedinIconSvg />
      <FacebookIconSvg />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 24,
    alignItems: "center",
  },
});

export default SocialIcons;
