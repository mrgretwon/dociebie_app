import Spinner from "@/components/Spinner";
import { blackFont, largeFontSize } from "@/constants/style-vars";
import { SalonModel } from "@/models/data-models/salonModel";
import SalonNavbarElementType from "@/models/enums/salonNavbarElementType";
import { fetchSalon } from "@/services/api";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import ImageWithRoundedBottom from "../ImageWithRoundedBottom";
import SalonNavbar from "../SalonNavbar";
import ReviewListComponent from "./ReviewListComponent";

const SalonReviewsScreen = () => {
  const { salonId } = useLocalSearchParams<{ salonId?: string }>();
  const [salon, setSalon] = useState<SalonModel | null>(null);

  useEffect(() => {
    async function getSalonData(salonId: number) {
      const salonResponse = await fetchSalon(salonId);
      setSalon(salonResponse);
    }

    if (salonId) {
      getSalonData(+salonId);
    }
  }, [salonId]);

  if (!salonId) {
    return null;
  }

  if (!salon) {
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
          <ReviewListComponent reviews={salon?.opinions ?? []} />
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
