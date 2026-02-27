import { darkGreyFont, greyedOutFont, greyFont, smallFontSize } from "@/constants/style-vars";
import { SalonModel } from "@/models/data-models/salonModel";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import DetailsSubsection from "./DetailsSubsection";

interface SalonProps {
  salon: SalonModel;
}

const DetailsSection = ({ salon }: SalonProps) => {
  return (
    <View style={styles.container}>
      <DetailsSubsection
        icon={<Feather name="phone" size={24} color={darkGreyFont} />}
        headerText="Zadzwoń"
      >
        <Text style={styles.standardText}>{salon?.phoneNumber}</Text>
        {!!salon?.openingHours &&
          salon.openingHours.length > 0 &&
          salon.openingHours.map((hoursInfo, i) => (
            <Text key={i} style={styles.greyedOutText}>
              {hoursInfo}
            </Text>
          ))}
      </DetailsSubsection>

      <DetailsSubsection
        icon={<Feather name="map-pin" size={24} color={darkGreyFont} />}
        headerText={salon?.name ?? ""}
        style={styles.sectionMarginTop}
      >
        <Text style={styles.greyedOutText}>{salon?.address}</Text>
      </DetailsSubsection>

      <DetailsSubsection
        icon={<Feather name="mail" size={24} color={darkGreyFont} />}
        headerText={salon?.mail ?? ""}
        style={styles.sectionMarginTop}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
  },
  standardText: {
    color: greyFont,
    marginTop: 4,
    fontSize: smallFontSize,
  },
  greyedOutText: {
    color: greyedOutFont,
    marginTop: 4,
    fontSize: smallFontSize,
  },
  marginTop: {
    marginTop: 4,
  },
  sectionMarginTop: {
    marginTop: 24,
  },
});

export default DetailsSection;
