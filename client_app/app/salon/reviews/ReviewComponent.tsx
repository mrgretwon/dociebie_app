import { blackFont, greyedOutFont, largeFontSize, smallFontSize } from "@/constants/style-vars";
import { OpinionModel } from "@/models/data-models/opinionModel";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AirbnbRating } from "react-native-ratings";

interface ReviewComponentProps {
  review: OpinionModel;
  style?: object;
}

const ReviewComponent = ({ review, style = {} }: ReviewComponentProps) => {
  return (
    <View style={[styles.container, style]}>
      <AirbnbRating
        defaultRating={review.rating}
        showRating={false}
        size={18}
        isDisabled
        ratingContainerStyle={styles.starsContainer}
      />
      <Text style={styles.reviewText}>{review.opinionText}</Text>
      <Text style={styles.reviewName}>{review.customerName}</Text>
      <Text style={styles.locationText}>{review.customerLocation}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  reviewText: {
    color: blackFont,
    fontSize: largeFontSize,
    marginTop: 16,
  },
  reviewName: {
    color: blackFont,
    marginTop: 16,
  },
  locationText: {
    color: greyedOutFont,
    fontSize: smallFontSize,
  },
  starsContainer: {
    alignSelf: "flex-start",
  },
});

export default ReviewComponent;
