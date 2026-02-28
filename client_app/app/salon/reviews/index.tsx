import Spinner from "@/components/Spinner";
import { blackFont, largeFontSize } from "@/constants/style-vars";
import { OpinionModel } from "@/models/data-models/opinionModel";
import { SalonModel } from "@/models/data-models/salonModel";
import SalonNavbarElementType from "@/models/enums/salonNavbarElementType";
import { fetchSalon, fetchSalonReviews } from "@/services/api";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import ImageWithRoundedBottom from "../ImageWithRoundedBottom";
import SalonNavbar from "../SalonNavbar";
import ReviewListComponent from "./ReviewListComponent";

const SalonReviewsScreen = () => {
  const { salonId } = useLocalSearchParams<{ salonId?: string }>();
  const [salon, setSalon] = useState<SalonModel | null>(null);
  const [reviews, setReviews] = useState<OpinionModel[] | null>(null);

  useEffect(() => {
    async function getSalonData(id: number) {
      const salonResponse = await fetchSalon(id);
      setSalon(salonResponse);

      const reviewsResponse = await fetchSalonReviews(id);
      setReviews(reviewsResponse);
    }

    if (salonId) {
      getSalonData(+salonId);
    }
  }, [salonId]);

  if (!salonId) {
    return null;
  }

  if (!salon || reviews === null) {
    return <Spinner />;
  }
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <ImageWithRoundedBottom />

        <Text style={styles.headerText}>{salon?.name}</Text>

        <SalonNavbar
          selectedElement={SalonNavbarElementType.SalonReviewsScreen}
          currentSalon={salon}
        />

        <View style={styles.reviewsWrapper}>
          <ReviewListComponent reviews={reviews} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
  },
  scrollContainer: {
    flexGrow: 1,
    width: "100%",
  },
  headerText: {
    fontSize: largeFontSize,
    color: blackFont,
    textAlign: "center",
    marginVertical: 24,
  },
  reviewsWrapper: {
    marginVertical: 24,
    marginHorizontal: 16,
  },
});

export default SalonReviewsScreen;
