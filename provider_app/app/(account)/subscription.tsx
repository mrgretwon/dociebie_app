import { useSafeBack } from "@/hooks/use-safe-back";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";

import Header from "@/components/Header";
import Spinner from "@/components/Spinner";
import Button from "@/components/Button";
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
import { fetchProviderSalon } from "@/services/api";
import { Toast } from "toastify-react-native";

export default function SubscriptionScreen() {
  const router = useRouter();
  const goBack = useSafeBack();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [expiryDate, setExpiryDate] = useState("");

  useEffect(() => {
    const loadData = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const salon = await fetchProviderSalon(token);
        setIsActive(salon.subscription_active === true);
        if (salon.subscription_expiry) {
          const date = new Date(String(salon.subscription_expiry));
          setExpiryDate(
            `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}.${date.getFullYear()}`
          );
        }
      } catch {
        Toast.error("Nie udało się pobrać danych subskrypcji");
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

  const statusText = isActive
    ? `Jest aktywna do: ${expiryDate}`
    : `Wygasła w dniu: ${expiryDate}`;

  return (
    <View style={styles.root}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Twoja subskrypcja</Text>
          <Text style={styles.statusText}>{statusText}</Text>

          <Text style={styles.infoText}>
            Pamiętaj o opłaceniu subskrypcji, przed datą wygaśnięcia, brak
            płatności ukryje Twoje usługi z wyszukiwarki.
          </Text>

          <View style={styles.buttonsContainer}>
            <Button
              text="Opłać"
              onClick={() => {}}
              style={styles.payButton}
              textStyle={styles.payButtonText}
            />

            <TouchableOpacity style={styles.outlineButton}>
              <Text style={styles.outlineButtonText}>
                Aktualizuj metodę płatności
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => goBack()}
            >
              <Text style={styles.outlineButtonText}>Wróć</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.supportContainer}>
            <Text style={styles.supportText}>
              Biuro obsługi klienta +48 512 512 512
            </Text>
          </View>
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
  statusText: {
    fontSize: smallFontSize,
    fontFamily: Fonts.regular,
    color: greyedOutFont,
    marginBottom: 20,
  },
  infoText: {
    fontSize: standardFontSize,
    fontFamily: Fonts.regular,
    color: blackFont,
    lineHeight: 24,
    marginBottom: 40,
  },
  buttonsContainer: {
    gap: 12,
    marginBottom: 40,
  },
  payButton: {
    backgroundColor: primaryColor,
    borderColor: primaryColor,
    borderRadius: 24,
  },
  payButtonText: {
    fontFamily: Fonts.bold,
    fontSize: standardFontSize,
    color: "white",
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: lightGrey,
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: "center",
  },
  outlineButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: standardFontSize,
    color: blackFont,
  },
  supportContainer: {
    marginTop: "auto",
    paddingTop: 20,
  },
  supportText: {
    fontSize: smallFontSize,
    fontFamily: Fonts.regular,
    color: blackFont,
  },
});
