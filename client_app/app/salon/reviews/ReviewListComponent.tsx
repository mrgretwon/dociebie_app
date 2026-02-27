import HorizontalLine from "@/components/HorizontalLine";
import { OpinionModel } from "@/models/data-models/opinionModel";
import React from "react";
import { StyleSheet, View } from "react-native";
import ReviewComponent from "./ReviewComponent";

interface ReviewListComponentProps {
  reviews: OpinionModel[];
}

const ReviewListComponent = ({ reviews }: ReviewListComponentProps) => {
  return (
    <View style={styles.container}>
      {reviews.length > 0 &&
        reviews.map((review, i) => (
          <View key={review.id} style={styles.ratingWrapper}>
            {i !== 0 && <HorizontalLine style={styles.line} />}
            <ReviewComponent review={review} />
          </View>
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
  },
  ratingWrapper: {
    width: "100%",
  },
  line: {
    marginVertical: 24,
  },
});

export default ReviewListComponent;
