import { useSafeBack } from "@/hooks/use-safe-back";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import Header from "@/components/Header";
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
import { generateReport } from "@/services/api";
import Svg, { Path } from "react-native-svg";
import { Toast } from "toastify-react-native";

export default function ReportsScreen() {
  const router = useRouter();
  const goBack = useSafeBack();
  const { token } = useAuth();
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState<Record<string, unknown> | null>(null);

  // Default to last month
  const now = new Date();
  const monthAgo = new Date();
  monthAgo.setMonth(now.getMonth() - 1);
  const startDateStr = monthAgo.toISOString().split("T")[0];
  const endDateStr = now.toISOString().split("T")[0];

  const startDisplay = `${String(monthAgo.getDate()).padStart(2, "0")}.${String(monthAgo.getMonth() + 1).padStart(2, "0")}.${monthAgo.getFullYear()}`;
  const endDisplay = `${String(now.getDate()).padStart(2, "0")}.${String(now.getMonth() + 1).padStart(2, "0")}.${now.getFullYear()}`;

  const handleGenerate = async () => {
    if (!token) return;
    setGenerating(true);
    try {
      const data = await generateReport(
        { start_date: startDateStr, end_date: endDateStr },
        token
      );
      setReport(data);
      Toast.success("Raport został wygenerowany");
    } catch {
      Toast.error("Nie udało się wygenerować raportu");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <View style={styles.root}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Generuj raport</Text>
          <Text style={styles.subtitle}>
            Dla określonego zakresu czasowego.
          </Text>

          <Text style={styles.sectionTitle}>Wybierz zakres czasu</Text>
          <View style={styles.dateFilters}>
            <TouchableOpacity style={styles.dateButton}>
              <Svg width={16} height={12} viewBox="0 0 20 16" fill="none" style={{ marginRight: 6 }}>
                <Path
                  d="M18 0H2C0.9 0 0 0.9 0 2V14C0 15.1 0.9 16 2 16H18C19.1 16 20 15.1 20 14V2C20 0.9 19.1 0 18 0ZM18 4L10 9L2 4V2L10 7L18 2V4Z"
                  fill={greyedOutFont}
                />
              </Svg>
              <Text style={styles.dateButtonText}>{startDisplay}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateButton}>
              <Svg width={16} height={12} viewBox="0 0 20 16" fill="none" style={{ marginRight: 6 }}>
                <Path
                  d="M18 0H2C0.9 0 0 0.9 0 2V14C0 15.1 0.9 16 2 16H18C19.1 16 20 15.1 20 14V2C20 0.9 19.1 0 18 0ZM18 4L10 9L2 4V2L10 7L18 2V4Z"
                  fill={greyedOutFont}
                />
              </Svg>
              <Text style={styles.dateButtonText}>{endDisplay}</Text>
            </TouchableOpacity>
          </View>

          {report && (
            <View style={styles.reportSection}>
              <Text style={styles.sectionTitle}>Wyniki raportu</Text>
              {report.summary && (
                <View style={styles.reportBlock}>
                  <Text style={styles.reportLabel}>Podsumowanie:</Text>
                  <Text style={styles.reportValue}>
                    Przychód: {String((report.summary as Record<string, unknown>)?.total_revenue ?? "0")} zł
                  </Text>
                  <Text style={styles.reportValue}>
                    Rezerwacje: {String((report.summary as Record<string, unknown>)?.total_bookings ?? "0")}
                  </Text>
                </View>
              )}
              {Array.isArray(report.by_service) && (report.by_service as Record<string, unknown>[]).length > 0 && (
                <View style={styles.reportBlock}>
                  <Text style={styles.reportLabel}>Wg usług:</Text>
                  {(report.by_service as Record<string, unknown>[]).map((s, i) => (
                    <Text key={i} style={styles.reportValue}>
                      {String(s.service_name ?? "Usługa")} - {String(s.revenue ?? "0")} zł ({String(s.count ?? "0")} wizyt)
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.bottomButtons}>
          <Button
            text={generating ? "Generowanie..." : "Generuj raport"}
            onClick={handleGenerate}
            style={styles.generateButton}
            textStyle={styles.generateButtonText}
            disabled={generating}
          />
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
    color: blackFont,
    marginBottom: 12,
  },
  dateFilters: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
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
  reportSection: {
    marginTop: 20,
  },
  reportBlock: {
    marginBottom: 16,
  },
  reportLabel: {
    fontSize: smallFontSize,
    fontFamily: Fonts.bold,
    color: blackFont,
    marginBottom: 4,
  },
  reportValue: {
    fontSize: smallFontSize,
    fontFamily: Fonts.regular,
    color: blackFont,
    marginBottom: 2,
  },
  bottomButtons: {
    padding: 20,
    gap: 12,
  },
  generateButton: {
    backgroundColor: primaryColor,
    borderColor: primaryColor,
    borderRadius: 24,
  },
  generateButtonText: {
    fontFamily: Fonts.bold,
    fontSize: standardFontSize,
    color: "white",
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
