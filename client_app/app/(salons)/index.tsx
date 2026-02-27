import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import SalonList from "@/components/SalonList";
import Spinner from "@/components/Spinner";
import { baseGrey } from "@/constants/style-vars";
import { useSalonsSearch } from "@/contexts/SalonsSearchContext";
import { SalonModel } from "@/models/data-models/salonModel";
import { fetchAllSalons } from "@/services/api";
import { useRouter } from "expo-router";
import SalonsSearchFilter from "./SalonsSearchFilter";

export default function SalonsScreen() {
  const router = useRouter();
  const { searchText, locationText, startDate, endDate, distance } = useSalonsSearch();

  const [salons, setSalons] = useState<SalonModel[] | null>(null);

  useEffect(() => {
    async function getAllSalons() {
      const fetchedSalons = await fetchAllSalons({
        searchText,
        locationText,
        startDate,
        endDate,
        distance,
      });
      setSalons(fetchedSalons);
    }

    getAllSalons();
  }, [searchText, locationText, startDate, endDate, distance]);

  const handleSalonClicked = (salon: SalonModel): void => {
    router.push({
      pathname: "/salon/services",
      params: { salonId: salon.id },
    });
  };

  if (!salons) {
    return <Spinner />;
  }

  return (
    <SafeAreaView edges={["top"]}>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <SalonsSearchFilter />

          <View style={styles.contentWrapper}>
            <SalonList salons={salons} onClick={(salon) => handleSalonClicked(salon)} />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    display: "flex",
    backgroundColor: baseGrey,
  },
  contentWrapper: {
    flexGrow: 1,
    width: "100%",
    paddingLeft: 16,
    paddingVertical: 16,
  },
});
