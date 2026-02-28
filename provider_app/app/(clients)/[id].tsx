import { useSafeBack } from "@/hooks/use-safe-back";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import Header from "@/components/Header";
import Spinner from "@/components/Spinner";
import {
  baseGrey,
  blackFont,
  greyedOutFont,
  lightGrey,
  primaryColor,
  smallFontSize,
  standardFontSize,
  largestFontSize,
  smallerFontSize,
} from "@/constants/style-vars";
import { Fonts } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { fetchProviderClient, fetchProviderClientVisits } from "@/services/api";
import Svg, { Path } from "react-native-svg";
import { Toast } from "toastify-react-native";

type Visit = {
  id: number;
  service: string;
  date: string;
  status: string;
};

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const goBack = useSafeBack();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<{ name: string; surname: string; email: string } | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<Visit[] | null>(null);
  const [isFiltering, setIsFiltering] = useState(false);

  const clientId = Number(id);

  useEffect(() => {
    const loadData = async () => {
      if (!token || !clientId) { setLoading(false); return; }
      try {
        const [clientData, visitsData] = await Promise.all([
          fetchProviderClient(clientId, token),
          fetchProviderClientVisits(clientId, token),
        ]);
        setClient({
          name: String(clientData.name ?? ""),
          surname: String(clientData.surname ?? ""),
          email: String(clientData.email ?? ""),
        });
        setVisits(visitsData.map((v) => ({
          id: Number(v.id),
          service: String(v.service ?? v.service_name ?? "Usługa"),
          date: String(v.date ?? ""),
          status: String(v.status ?? ""),
        })));
      } catch {
        Toast.error("Nie udało się pobrać danych klienta");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token, clientId]);

  const handleFilter = async () => {
    if (!token || !clientId) return;
    if (isFiltering) {
      setIsFiltering(false);
      setFilteredVisits(null);
      return;
    }
    try {
      const now = new Date();
      const monthAgo = new Date();
      monthAgo.setMonth(now.getMonth() - 1);
      const startDate = monthAgo.toISOString().split("T")[0];
      const endDate = now.toISOString().split("T")[0];
      const data = await fetchProviderClientVisits(clientId, token, {
        start_date: startDate,
        end_date: endDate,
      });
      setFilteredVisits(data.map((v) => ({
        id: Number(v.id),
        service: String(v.service ?? v.service_name ?? "Usługa"),
        date: String(v.date ?? ""),
        status: String(v.status ?? ""),
      })));
      setIsFiltering(true);
    } catch {
      Toast.error("Nie udało się pobrać filtrowanych wizyt");
    }
  };

  if (loading) {
    return (
      <View style={styles.root}>
        <Header />
        <Spinner />
      </View>
    );
  }

  const displayVisits = isFiltering && filteredVisits ? filteredVisits : visits;

  const formatVisitDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()} godzina: ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <View style={styles.root}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Wizyty klienta</Text>

          {/* Client info */}
          <View style={styles.clientRow}>
            <View style={styles.clientAvatar}>
              <Svg width={40} height={40} viewBox="0 0 40 40" fill="none">
                <Path
                  d="M20 0C8.96 0 0 8.96 0 20C0 31.04 8.96 40 20 40C31.04 40 40 31.04 40 20C40 8.96 31.04 0 20 0ZM20 6C23.32 6 26 8.68 26 12C26 15.32 23.32 18 20 18C16.68 18 14 15.32 14 12C14 8.68 16.68 6 20 6ZM20 34.4C15 34.4 10.58 31.84 8 27.92C8.06 23.96 16 21.8 20 21.8C23.98 21.8 31.94 23.96 32 27.92C29.42 31.84 25 34.4 20 34.4Z"
                  fill={lightGrey}
                />
              </Svg>
            </View>
            <View>
              <Text style={styles.clientName}>{client?.name} {client?.surname}</Text>
              <Text style={styles.clientDetail}>Email: {client?.email}</Text>
            </View>
          </View>

          {/* Recent visits */}
          <Text style={styles.sectionTitle}>Ostatnie wizyty</Text>
          {displayVisits.length === 0 ? (
            <Text style={styles.visitText}>Brak wizyt</Text>
          ) : (
            displayVisits.map((visit) => (
              <Text key={visit.id} style={styles.visitText}>
                {visit.service} - {formatVisitDate(visit.date)}
              </Text>
            ))
          )}

          {/* Date filter section */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
            Filtruj względem okresu
          </Text>
          <View style={styles.dateFilters}>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={handleFilter}
            >
              <Text style={styles.dateButtonText}>
                {isFiltering ? "Wyczyść filtr" : "Ostatni miesiąc"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomButtons}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => goBack()}
          >
            <Text style={styles.backButtonText}>Wróć</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
    flex: 1,
  },
  title: {
    fontSize: largestFontSize,
    fontFamily: Fonts.bold,
    color: blackFont,
    marginBottom: 16,
  },
  clientRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  clientAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: baseGrey,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  clientName: {
    fontSize: standardFontSize,
    fontFamily: Fonts.bold,
    color: blackFont,
    marginBottom: 2,
  },
  clientDetail: {
    fontSize: smallerFontSize,
    fontFamily: Fonts.regular,
    color: greyedOutFont,
  },
  sectionTitle: {
    fontSize: standardFontSize,
    fontFamily: Fonts.bold,
    color: primaryColor,
    marginBottom: 12,
  },
  visitText: {
    fontSize: smallFontSize,
    fontFamily: Fonts.regular,
    color: blackFont,
    marginBottom: 6,
  },
  dateFilters: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: lightGrey,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  dateButtonText: {
    fontSize: smallFontSize,
    fontFamily: Fonts.regular,
    color: blackFont,
  },
  bottomButtons: {
    padding: 20,
  },
  backButton: {
    borderWidth: 1,
    borderColor: lightGrey,
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: "center",
  },
  backButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: standardFontSize,
    color: blackFont,
  },
});
