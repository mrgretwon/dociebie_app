import { blackFont, largeFontSize } from "@/constants/style-vars";
import { StyleSheet, Text, View } from "react-native";

interface SalonDetailsIconWithTextProps {
  icon: React.ReactNode;
  headerText: string;
}

const DetailsIconWithText = ({ icon, headerText }: SalonDetailsIconWithTextProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftPartContainer}>{icon}</View>
      <View style={styles.rightPartContainer}>
        <Text style={styles.text}>{headerText}</Text>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  leftPartContainer: {
    flexBasis: 0,
    flexGrow: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  rightPartContainer: {
    flexBasis: 0,
    flexGrow: 6,
    paddingLeft: 16,
  },
  text: {
    fontSize: largeFontSize,
    color: blackFont,
  },
});

export default DetailsIconWithText;
