import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import {
  baseGrey,
  blackFont,
  greyedOutFont,
  largestFontSize,
  smallFontSize,
} from "@/constants/style-vars";

import ConfirmedCheckmarkIconSvg from "@/assets/svg/confirmed-checkmark-icon-svg";
import Button from "@/components/Button";
import { useTranslations } from "@/hooks/use-translations";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const AppointmentConfirmedScreen = () => {
  const router = useRouter();
  const translate = useTranslations();

  return (
    <View style={styles.container}>
      <ConfirmedCheckmarkIconSvg />
      <Text style={styles.thanksText}>{translate("APPOINTMENT_CONFIRMED_THANKS")}</Text>
      <Text style={styles.infoText}>{translate("APPOINTMENT_CONFIRMED_INFO")}</Text>
      <Button
        text={translate("GO_TO_VISITS_HISTORY")}
        onClick={() => router.navigate("/(history)")}
        style={styles.continueButton}
      />
      <TouchableOpacity style={styles.goBackContainer} onPress={() => router.navigate("/(home)")}>
        <AntDesign name="arrow-left" size={17} color={greyedOutFont} />
        <Text style={styles.goBackText}>{translate("BACK_TO_HOME")}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: baseGrey,
    padding: 16,
  },
  thanksText: {
    fontSize: largestFontSize,
    fontWeight: "600",
    color: blackFont,
    marginTop: 24,
  },
  infoText: {
    marginTop: 8,
    color: greyedOutFont,
    textAlign: "center",
  },
  continueButton: {
    width: "100%",
    marginTop: 32,
  },
  goBackContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 32,
    gap: 4,
  },
  goBackText: {
    color: greyedOutFont,
    fontSize: smallFontSize,
    marginLeft: 8,
  },
});

export default AppointmentConfirmedScreen;
