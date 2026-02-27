import { greyedOutFont, greyFont, smallFontSize } from "@/constants/style-vars";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const TextInHorizontalLine = ({ text }: { text: string }) => {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <Text style={styles.text}>{text}</Text>
      <View style={styles.line} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    color: greyedOutFont,
    fontSize: smallFontSize,
    marginHorizontal: 16,
  },
  line: {
    flexGrow: 1,
    borderBottomWidth: 1.5,
    borderBottomColor: greyFont,
  },
});

export default TextInHorizontalLine;
