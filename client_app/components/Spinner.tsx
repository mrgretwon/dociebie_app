import { baseGrey } from "@/constants/style-vars";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

const Spinner = () => {
  return (
    <View style={styles.loaderWrapper}>
      <ActivityIndicator size="large" />
    </View>
  );
};

const styles = StyleSheet.create({
  loaderWrapper: {
    flex: 1,
    backgroundColor: baseGrey,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Spinner;
