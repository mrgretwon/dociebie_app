import {
  blackFont,
  greyedOutFont,
  smallerFontSize,
  smallFontSize,
  standardFontSize,
} from "@/constants/style-vars";
import { SalonModel } from "@/models/data-models/salonModel";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
// import SalonPreviewProps from '../../../models/props/salonPreviewProps'
// import styles, { maxWidth } from './SalonPreview.style'
import { Image } from "expo-image";
import salonPreviewImage from "@/assets/images/salon-preview.png";
import StarSvg from "@/assets/svg/star-svg";
import { useTranslations } from "@/hooks/use-translations";

export const maxWidth = 200;

interface SalonPreviewProps {
  salon: SalonModel;
  onClick: (data: SalonModel) => void;
  style?: object;
}

const SalonPreview = ({ salon, onClick, style = {} }: SalonPreviewProps) => {
  const translate = useTranslations();

  return (
    <TouchableOpacity style={[styles.container, style]} onPress={() => onClick(salon)}>
      <Image
        source={salon.mainImage || salonPreviewImage}
        style={[styles.image, { width: maxWidth, aspectRatio: 1 }]}
        contentFit="cover"
      />
      <View style={styles.infoContainer}>
        <Text style={styles.primaryText}>{salon.name}</Text>
        <Text style={styles.secondaryText}>{salon.address}</Text>

        <View style={styles.bottomWrapper}>
          <View>
            <Text style={styles.secondaryText}>{translate("PRICES_FROM")}</Text>
            <Text style={styles.price}>135zł</Text>
          </View>

          <View style={styles.ratingWrapper}>
            <StarSvg />
            <Text style={styles.primaryText}>{salon.rating}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: maxWidth,
    backgroundColor: "white",
    borderRadius: 15,
    overflow: "hidden",
  },
  image: {
    aspectRatio: 1,
  },
  infoContainer: {
    padding: 12,
  },
  primaryText: {
    fontSize: smallFontSize,
    fontWeight: "700",
    color: blackFont,
  },
  secondaryText: {
    fontSize: smallerFontSize,
    color: greyedOutFont,
    fontWeight: "700",
  },
  price: {
    fontSize: standardFontSize,
    fontWeight: "700",
    color: blackFont,
    lineHeight: 16,
  },
  bottomWrapper: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  ratingWrapper: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
});

export default SalonPreview;
