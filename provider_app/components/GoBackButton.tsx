import { greyFont, primaryColor } from "@/constants/style-vars";
import { useSafeBack } from "@/hooks/use-safe-back";
import { useTranslations } from "@/hooks/use-translations";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const GoBackButton = () => {
  const translate = useTranslations();
  const goBack = useSafeBack();

  return (
    <View>
      <TouchableOpacity onPress={goBack}>
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
