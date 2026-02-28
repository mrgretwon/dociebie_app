import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import Header from "@/components/Header";
import Spinner from "@/components/Spinner";
import {
  blackFont,
  greyedOutFont,
  lightGrey,
  primaryColor,
  smallFontSize,
  standardFontSize,
  largestFontSize,
} from "@/constants/style-vars";
import { Fonts } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { fetchPaymentHistory } from "@/services/api";
import Svg, { Path } from "react-native-svg";
import { Toast } from "toastify-react-native";

type PaymentGroup = {
  date: string;
  items: string[];
};

export default function PaymentHistoryScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<PaymentGroup[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<PaymentGroup[] | null>(null);
  const [isFiltering, setIsFiltering] = useState(false);

  const groupPayments = (payments: Record<string, unknown>[]): PaymentGroup[] => {
    const grouped: Record<string, string[]> = {};
    payments.forEach((p) => {
      const dateStr = String(p.date ?? "");
      let dateKey: string;
      try {
        const d = new Date(dateStr);
        dateKey = `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
      } catch {
        dateKey = dateStr;
      }
      const userName = String(p.user_name ?? p.client_name ?? "Klient");
      const serviceName = String(p.service_name ?? "usługa");
      const price = Number(p.price ?? p.amount ?? 0).toFixed(2).replace(".", ",");
      const item = `${userName} - ${serviceName} - ${price} zł`;
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(item);
    });
    return Object.entries(grouped).map(([date, items]) => ({ date, items }));
  };

  useEffect(() => {
    const loadData = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const data = await fetchPaymentHistory(token);
        setGroups(groupPayments(data));
      } catch {
        Toast.error("Nie udało się pobrać historii płatności");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token]);

  const handleFilter = async () => {
    if (!token) return;
    if (isFiltering) {
      setIsFiltering(false);
      setFilteredGroups(null);
      return;
    }
    try {
      const now = new Date();
      const monthAgo = new Date();
      monthAgo.setMonth(now.getMonth() - 1);
      const data = await fetchPaymentHistory(token, {
        start_date: monthAgo.toISOString().split("T")[0],
        end_date: now.toISOString().split("T")[0],
      });
      setFilteredGroups(groupPayments(data));
      setIsFiltering(true);
    } catch {
      Toast.error("Nie udało się pobrać filtrowanych danych");
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

  const displayGroups = isFiltering && filteredGroups ? filteredGroups : groups;

  return (
    <View style={styles.root}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Historia płatności</Text>
          <Text style={styles.subtitle}>
            Znajdziesz tu informacje o swoich wszystkich płatnościach.
          </Text>

          <Text style={styles.sectionTitle}>Ostatnie</Text>

          {displayGroups.length === 0 ? (
            <Text style={styles.paymentItem}>Brak płatności</Text>
          ) : (
            displayGroups.map((group, gi) => (
              <View key={gi} style={styles.paymentGroup}>
                <Text style={styles.paymentDate}>{group.date}</Text>
                {group.items.map((item, ii) => (
                  <Text key={ii} style={styles.paymentItem}>
                    {item}
                  </Text>
                ))}
              </View>
            ))
          )}

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
            Filtruj względem okresu
          </Text>
          <View style={styles.dateFilters}>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={handleFilter}
            >
              <Svg width={16} height={12} viewBox="0 0 20 16" fill="none" style={{ marginRight: 6 }}>
                <Path
                  d="M18 0H2C0.9 0 0 0.9 0 2V14C0 15.1 0.9 16 2 16H18C19.1 16 20 15.1 20 14V2C20 0.9 19.1 0 18 0ZM18 4L10 9L2 4V2L10 7L18 2V4Z"
                  fill={greyedOutFont}
                />
              </Svg>
              <Text style={styles.dateButtonText}>
                {isFiltering ? "Wyczyść filtr" : "Ostatni miesiąc"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomButtons}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: smallFontSize,
    fontFamily: Fonts.regular,
    color: greyedOutFont,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: standardFontSize,
    fontFamily: Fonts.bold,
    color: primaryColor,
    marginBottom: 12,
  },
  paymentGroup: {
    marginBottom: 16,
  },
  paymentDate: {
    fontSize: smallFontSize,
    fontFamily: Fonts.bold,
    color: blackFont,
    marginBottom: 6,
  },
  paymentItem: {
    fontSize: smallFontSize,
    fontFamily: Fonts.regular,
    color: blackFont,
    marginBottom: 4,
  },
  dateFilters: {
    flexDirection: "row",
    gap: 12,
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
