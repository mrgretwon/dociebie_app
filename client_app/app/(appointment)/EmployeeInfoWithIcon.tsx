import portrait from "@/assets/images/portrait.png";
import { blackFont, greyedOutFont } from "@/constants/style-vars";
import SalonEmployeeModel from "@/models/data-models/salonEmployeeModel";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface EmployeeInfoProps {
  employee: SalonEmployeeModel;
  style?: object;
}

export const IMAGE_WIDTH = 40;

const EmployeeInfoWithIcon = ({ employee, style }: EmployeeInfoProps) => {
  return (
    <View style={[styles.container, style]}>
      <Image style={styles.image} contentFit="cover" source={portrait as any} />
      <Text style={styles.nameText}>
        {employee.name} {employee.surname}
      </Text>
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
  image: {
    borderRadius: IMAGE_WIDTH / 2,
    height: IMAGE_WIDTH,
    width: IMAGE_WIDTH,
    borderWidth: 1,
    borderColor: greyedOutFont,
  },
  nameText: {
    color: blackFont,
    marginLeft: 16,
  },
});

export default EmployeeInfoWithIcon;
