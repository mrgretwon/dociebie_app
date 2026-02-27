import {
  blackFont,
  greenFont,
  greyedOutFont,
  lightGreen,
  smallerFontSize,
  smallFontSize,
} from "@/constants/style-vars";
import { ServiceModel } from "@/models/data-models/serviceModel";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface ServiceComponentProps {
  service: ServiceModel;
}

const ServiceComponent = ({ service }: ServiceComponentProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftPartContainer}>
        <Text style={styles.serviceNameText}>{service.name}</Text>
        <Text style={styles.serviceDurationText}>{service.minutesDuration} min</Text>
      </View>
      <View style={styles.rightPartContainer}>
        <Text style={styles.priceText}>{service.price} zł</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
  },
  leftPartContainer: {
    display: "flex",
    flexBasis: 0,
    flexGrow: 2,
  },
  rightPartContainer: {
    display: "flex",
    flexBasis: 0,
    flexGrow: 1,
  },
  serviceNameText: {
    fontSize: smallFontSize,
    color: blackFont,
  },
  serviceDurationText: {
    marginTop: 2,
    color: greyedOutFont,
    fontSize: smallerFontSize,
  },
  priceText: {
    backgroundColor: lightGreen,
    color: greenFont,
    borderRadius: 16,
    alignSelf: "center",
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
});

export default ServiceComponent;
