import StarSvg from "@/assets/svg/star-svg";
import { blackFont, greyedOutFont, largeFontSize, smallFontSize } from "@/constants/style-vars";
import { OpinionModel } from "@/models/data-models/opinionModel";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface ReviewComponentProps {
  review: OpinionModel;
  style?: object;
}

const StarRating = ({ rating }: { rating: number }) => (
  <View style={styles.starsContainer}>
    {[1, 2, 3, 4, 5].map((i) => (
      <View key={i} style={{ opacity: i <= rating ? 1 : 0.25 }}>
        <StarSvg />
      </View>
    ))}
  </View>
);

const ReviewComponent = ({ review, style = {} }: ReviewComponentProps) => {
  return (
    <View style={[styles.container, style]}>
      <StarRating rating={review.rating} />
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
    flexDirection: "row",
    gap: 4,
    alignSelf: "flex-start",
  },
});

export default ReviewComponent;
