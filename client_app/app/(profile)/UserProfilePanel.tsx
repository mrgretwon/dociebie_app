import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { greyFont, largeFontSize, smallFontSize } from "@/constants/style-vars";
import { useTranslations } from "@/hooks/use-translations";
import { useRouter } from "expo-router";

export default function UserProfilePanel() {
  const translate = useTranslations();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>{translate("CLIENT_MENU")}</Text>

      <TouchableOpacity style={styles.iconWithTextRow} onPress={() => router.push("/(history)")}>
        <MaterialCommunityIcons name="account-clock" size={45} color={greyFont} />
        <Text style={styles.text}>{translate("VISITS")}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.iconWithTextRow} onPress={() => router.push("/(payments)")}>
        <Ionicons name="wallet-outline" size={45} color={greyFont} />
        <Text style={styles.text}>{translate("PAYMENTS")}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.iconWithTextRow} onPress={() => router.push("/(user-data)")}>
        <MaterialCommunityIcons name="account-cog-outline" size={45} color={greyFont} />
        <Text style={styles.text}>{translate("USER_DATA")}</Text>
      </TouchableOpacity>
    </View>
  );
}

export const styles = StyleSheet.create({
  container: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 32,
    paddingHorizontal: 40,
  },
  headerText: {
    fontSize: largeFontSize,
  },
  iconWithTextRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  text: {
    fontSize: smallFontSize,
    color: greyFont,
    marginLeft: 24,
  },
});
