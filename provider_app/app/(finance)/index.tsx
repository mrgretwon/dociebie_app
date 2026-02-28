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
import { fetchFinancialSummary, fetchProviderSalon } from "@/services/api";
import { Toast } from "toastify-react-native";

export default function FinanceScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState("0,00");
  const [totalBookings, setTotalBookings] = useState("0,00");
  const [subscriptionText, setSubscriptionText] = useState("");

  useEffect(() => {
    const loadData = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const [summary, salon] = await Promise.all([
          fetchFinancialSummary(token),
          fetchProviderSalon(token),
        ]);
        const rev = Number(summary.total_revenue ?? 0);
        const book = Number(summary.bookings_revenue ?? 0);
        setTotalRevenue(rev.toFixed(2).replace(".", ","));
        setTotalBookings(book.toFixed(2).replace(".", ","));

        if (salon.subscription_active && salon.subscription_expiry) {
          const d = new Date(String(salon.subscription_expiry));
          setSubscriptionText(
            `Jest aktywna do: ${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`
          );
        } else {
          setSubscriptionText("Nieaktywna");
        }
      } catch {
        Toast.error("Nie udało się pobrać danych finansowych");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token]);

  if (loading) {
    return (
      <View style={styles.root}>
        <Header />
        <Spinner />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Dane Finansowe</Text>
          <Text style={styles.subtitle}>Sprawdź swoje dane finansowe.</Text>

          <Text style={styles.financialRow}>Obrót: {totalRevenue} zł</Text>
          <Text style={styles.financialRow}>Rezerwacje: {totalBookings} zł</Text>

          <TouchableOpacity
            onPress={() => router.push("/(finance)/payment-history")}
          >
            <Text style={styles.linkRow}>Historia płatności</Text>
          </TouchableOpacity>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => router.push("/(finance)/reports")}
            >
              <Text style={styles.actionBtnText}>Generuj raport</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>Dla danego okresu</Text>
            </TouchableOpacity>
          </View>

          {/* Settings section */}
          <Text style={styles.sectionTitle}>Ustawienia</Text>
          <TouchableOpacity
            onPress={() => router.push("/(finance)/bank-account")}
          >
            <Text style={styles.settingsLink}>Aktualizuj numer rachunku</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/(finance)/bank-account",
                params: { tab: "assign" },
              })
            }
          >
            <Text style={styles.settingsLink}>
              Przypisz rachunek do usługi
            </Text>
          </TouchableOpacity>

          {/* Subscription */}
          <Text style={styles.sectionTitle}>Twoja subskrypcja</Text>
          <Text style={styles.subscriptionText}>
            {subscriptionText}
          </Text>
        </View>

        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Wróć</Text>
          </TouchableOpacity>

          <Text style={styles.supportText}>
            Biuro obsługi klienta +48 512 512 512
          </Text>
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
  financialRow: {
    fontSize: standardFontSize,
    fontFamily: Fonts.regular,
    color: blackFont,
    marginBottom: 4,
  },
  linkRow: {
    fontSize: standardFontSize,
    fontFamily: Fonts.regular,
    color: blackFont,
    marginBottom: 16,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 28,
  },
  actionBtn: {
    backgroundColor: primaryColor,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionBtnText: {
    fontSize: smallFontSize,
    fontFamily: Fonts.semiBold,
    color: "white",
  },
  sectionTitle: {
    fontSize: largestFontSize,
    fontFamily: Fonts.bold,
    color: blackFont,
    marginBottom: 8,
    marginTop: 8,
  },
  settingsLink: {
    fontSize: smallFontSize,
    fontFamily: Fonts.regular,
    color: greyedOutFont,
    marginBottom: 4,
  },
  subscriptionText: {
    fontSize: smallFontSize,
    fontFamily: Fonts.regular,
    color: greyedOutFont,
  },
  bottomSection: {
    padding: 20,
    gap: 16,
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
  supportText: {
    fontSize: smallFontSize,
    fontFamily: Fonts.regular,
    color: blackFont,
  },
});
