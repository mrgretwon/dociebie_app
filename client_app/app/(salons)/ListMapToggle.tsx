import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Fonts } from "@/constants/theme";
import { greyFont, lightGrey, primaryColor, smallFontSize } from "@/constants/style-vars";

interface ListMapToggleProps {
  mode: "lista" | "mapa";
  onModeChange: (mode: "lista" | "mapa") => void;
}

const ListMapToggle = ({ mode, onModeChange }: ListMapToggleProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.toggleWrapper}>
        <TouchableOpacity
          style={[styles.button, mode === "lista" && styles.activeButton]}
          onPress={() => onModeChange("lista")}
        >
          <Text style={[styles.buttonText, mode === "lista" && styles.activeButtonText]}>Lista</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, mode === "mapa" && styles.activeButton]}
          onPress={() => onModeChange("mapa")}
        >
          <Text style={[styles.buttonText, mode === "mapa" && styles.activeButtonText]}>Mapa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ListMapToggle;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 12,
  },
  toggleWrapper: {
    flexDirection: "row",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: lightGrey,
    overflow: "hidden",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "white",
  },
  activeButton: {
    backgroundColor: primaryColor,
  },
  buttonText: {
    color: greyFont,
    fontFamily: Fonts.semiBold,
    fontSize: smallFontSize,
  },
  activeButtonText: {
    color: "white",
  },
});
