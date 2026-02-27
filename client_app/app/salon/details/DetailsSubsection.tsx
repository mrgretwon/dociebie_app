import React from "react";
import { StyleSheet, View } from "react-native";
import DetailsIconWithText from "./DetailsIconWithText";

interface SalonDetailsSubsectionProps {
  icon: React.ReactNode;
  headerText: string;
  style?: object;
  children?: React.ReactNode;
}

const DetailsSubsection = ({ icon, headerText, style, children }: SalonDetailsSubsectionProps) => {
  return (
    <View style={[styles.container, style]}>
      <DetailsIconWithText icon={icon} headerText={headerText} />
      <View style={styles.sectionDataContainer}>
        <View style={styles.leftPartContainer} />
        <View style={styles.rightPartContainer}>{children}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  sectionDataContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  leftPartContainer: {
    flexBasis: 0,
    flexGrow: 1,
  },
  rightPartContainer: {
    flexBasis: 0,
    flexGrow: 6,
    paddingLeft: 16,
  },
});

export default DetailsSubsection;
