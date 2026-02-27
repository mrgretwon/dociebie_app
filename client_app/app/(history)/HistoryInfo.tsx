import GoBackButton from "@/components/GoBackButton";
import { darkBlueFont, greyedOutFont, largeFontSize } from "@/constants/style-vars";
import { useTranslations } from "@/hooks/use-translations";
import { StyleSheet, Text, View } from "react-native";

const HistoryInfo = () => {
  const translate = useTranslations();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{translate("VISITS_HISTORY")}</Text>
      <Text style={styles.text}>{translate("VISITS_HISTORY_INFO")}</Text>
      <GoBackButton />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: "white",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginVertical: 16,
  },
  title: {
    fontSize: largeFontSize,
    fontWeight: 500,
    color: darkBlueFont,
  },
  text: {
    color: greyedOutFont,
  },
});

export default HistoryInfo;
