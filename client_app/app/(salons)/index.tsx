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
import ListMapToggle from "./ListMapToggle";
import SalonMapView from "@/components/SalonMapView";
import SalonsSearchFilter from "./SalonsSearchFilter";

export default function SalonsScreen() {
  const router = useRouter();
  const { searchText, locationText, date, startHour, endHour, distance, userLatitude, userLongitude, subcategoryId } = useSalonsSearch();

  const [salons, setSalons] = useState<SalonModel[] | null>(null);
  const [viewMode, setViewMode] = useState<"lista" | "mapa">("lista");

  useEffect(() => {
    async function getAllSalons() {
      const fetchedSalons = await fetchAllSalons({
        searchText,
        locationText,
        date,
        startHour,
        endHour,
        distance,
        ...(userLatitude != null && userLongitude != null
          ? { latitude: userLatitude, longitude: userLongitude }
          : {}),
        subcategoryId,
      });
      setSalons(fetchedSalons);
    }

    getAllSalons();
  }, [searchText, locationText, date, startHour, endHour, distance, userLatitude, userLongitude, subcategoryId]);

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
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.container}>
        {viewMode === "lista" ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            <SalonsSearchFilter />
            <ListMapToggle mode={viewMode} onModeChange={setViewMode} />
            <View style={styles.contentWrapper}>
              <SalonList salons={salons} onClick={(salon) => handleSalonClicked(salon)} />
            </View>
          </ScrollView>
        ) : (
          <>
            <SalonsSearchFilter />
            <ListMapToggle mode={viewMode} onModeChange={setViewMode} />
            <SalonMapView salons={salons} onSalonPress={handleSalonClicked} />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: baseGrey,
  },
  contentWrapper: {
    flexGrow: 1,
    width: "100%",
    paddingLeft: 16,
    paddingVertical: 16,
  },
});
