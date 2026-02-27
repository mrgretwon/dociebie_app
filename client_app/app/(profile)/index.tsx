import React from "react";
import { StyleSheet, View } from "react-native";

import { baseGrey } from "@/constants/style-vars";
import UserProfileInfo from "./UserProfileInfo";
import UserProfilePanel from "./UserProfilePanel";

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <UserProfileInfo />
        <View style={styles.panelWrapper}>
          <UserProfilePanel />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    display: "flex",
    backgroundColor: baseGrey,
  },
  contentWrapper: {
    flexGrow: 1,
    width: "100%",
  },
  panelWrapper: {
    flexGrow: 1,
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
});
