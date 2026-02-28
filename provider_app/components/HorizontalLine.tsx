import { greyFont } from "@/constants/style-vars";
import { StyleProps } from "@/models/props";
import React from "react";
import { StyleSheet, View } from "react-native";

const HorizontalLine = ({ style }: StyleProps) => {
  return <View style={[styles.line, style ?? {}]} />;
};

const styles = StyleSheet.create({
  line: {
    width: "100%",
    borderBottomWidth: 1.5,
    borderBottomColor: greyFont,
  },
});

export default HorizontalLine;
