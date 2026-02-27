import Feather from "@expo/vector-icons/Feather";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { primaryColor } from "@/constants/style-vars";
import { useTranslations } from "@/hooks/use-translations";
import { useRouter } from "expo-router";
import Categories from "./Categories";
import Footer from "./Footer";

export default function HomeScreen() {
  const translate = useTranslations();
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.horizontalPadding}>
        <Text style={styles.title}>{translate("HOMEPAGE_SLOGAN")}</Text>
        <Text style={styles.subtitle}>{translate("HOMEPAGE_SLOGAN_SUBTEXT")}</Text>

        <TouchableOpacity style={styles.searchContainer} onPress={() => router.push("/(salons)")}>
          <Feather name="search" size={24} color="black" />
          <Text style={styles.searchText}>{translate("SEARCH")}</Text>
        </TouchableOpacity>
      </View>

      <Categories />
      <Footer />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: primaryColor,
  },
  horizontalPadding: {
    paddingHorizontal: 24,
  },
  title: {
    color: "#F2F2F2",
    textAlign: "center",
    marginTop: 24,
    fontSize: 26,
    lineHeight: 28,
    fontWeight: "700",
  },
  subtitle: {
    color: "#F2F2F2",
    textAlign: "center",
    marginTop: 8,
    fontSize: 16,
    fontWeight: "500",
  },
  sloganText: {
    color: "#F2F2F2",
    textAlign: "center",
  },
  searchContainer: {
    backgroundColor: "#F2F4F7",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12,
    marginTop: 20,
    marginBottom: 40,
    borderRadius: 9999,
  },
  searchText: {
    fontSize: 16,
    lineHeight: 24,
  },
});
