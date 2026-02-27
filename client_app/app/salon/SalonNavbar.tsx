import { greyedOutFont, greyFont, primaryColor, smallerFontSize } from "@/constants/style-vars";
import { useTranslations } from "@/hooks/use-translations";
import { SalonModel } from "@/models/data-models/salonModel";
import SalonNavbarElementType, {
  salonNavbarElementTypeToScreen,
} from "@/models/enums/salonNavbarElementType";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface SalonNavbarProps {
  selectedElement: SalonNavbarElementType;
  currentSalon: SalonModel | null;
}

const SalonNavbar = ({ selectedElement, currentSalon: currentSalon }: SalonNavbarProps) => {
  const router = useRouter();
  const translate = useTranslations();

  const handleElementClicked = (clickedElement: SalonNavbarElementType) => {
    if (clickedElement !== selectedElement) {
      const pathname = salonNavbarElementTypeToScreen(clickedElement);
      if (currentSalon) {
        router.push({
          pathname,
          params: { salonId: currentSalon.id },
        });
      } else {
        router.push(pathname);
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={
          selectedElement === SalonNavbarElementType.SalonServicesScreen
            ? styles.selectedTextContainer
            : styles.textContainer
        }
        onPress={() => handleElementClicked(SalonNavbarElementType.SalonServicesScreen)}
      >
        <Text
          style={
            selectedElement === SalonNavbarElementType.SalonServicesScreen
              ? styles.selectedText
              : styles.unselectedText
          }
        >
          {translate("SERVICES")}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          selectedElement === SalonNavbarElementType.SalonReviewsScreen
            ? styles.selectedTextContainer
            : styles.textContainer,
          styles.leftBorder,
        ]}
        onPress={() => handleElementClicked(SalonNavbarElementType.SalonReviewsScreen)}
      >
        <Text
          style={
            selectedElement === SalonNavbarElementType.SalonReviewsScreen
              ? styles.selectedText
              : styles.unselectedText
          }
        >
          {translate("OPINIONS")}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          selectedElement === SalonNavbarElementType.SalonDetailsScreen
            ? styles.selectedTextContainer
            : styles.textContainer,
          ,
          styles.leftBorder,
        ]}
        onPress={() => handleElementClicked(SalonNavbarElementType.SalonDetailsScreen)}
      >
        <Text
          style={
            selectedElement === SalonNavbarElementType.SalonDetailsScreen
              ? styles.selectedText
              : styles.unselectedText
          }
        >
          {translate("DETAILS")}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: greyFont,
    overflow: "hidden",
  },
  leftBorder: {
    borderLeftWidth: 1,
    borderColor: greyFont,
  },
  textContainer: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  selectedTextContainer: {
    backgroundColor: primaryColor,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  selectedText: {
    alignSelf: "flex-start",
    fontSize: smallerFontSize,
    color: "white",
  },
  unselectedText: {
    alignSelf: "flex-start",
    fontSize: smallerFontSize,
    color: greyedOutFont,
  },
});

export default SalonNavbar;
