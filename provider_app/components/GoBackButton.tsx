import { greyFont, primaryColor } from "@/constants/style-vars";
import { useTranslations } from "@/hooks/use-translations";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const GoBackButton = () => {
  const translate = useTranslations();
  const router = useRouter();

  return (
    <View>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.goBackButton}>{translate("BACK")}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  goBackButton: {
    alignSelf: "flex-start",
    backgroundColor: primaryColor,
    color: "white",
    borderWidth: 1,
    borderColor: greyFont,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});

export default GoBackButton;
