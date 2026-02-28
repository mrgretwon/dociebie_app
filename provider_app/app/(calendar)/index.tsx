import React, { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import Header from "@/components/Header";
import Button from "@/components/Button";
import CalendarGrid from "./CalendarGrid";
import {
  baseGrey,
  blackFont,
  greyedOutFont,
  greyFont,
  lightGrey,
  primaryColor,
  smallerFontSize,
  smallFontSize,
  standardFontSize,
  largeFontSize,
  largestFontSize,
} from "@/constants/style-vars";
import { Fonts } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { fetchProviderAppointments } from "@/services/api";
import Svg, { Path } from "react-native-svg";

interface AppointmentItem {
  id: number;
  date: string;
  status: string;
  service_name: string;
  service_duration: number;
  employee_name: string;
  client_name: string;
  client_email: string;
}

const AVATAR_COLORS = [
  "#7C5CFC", "#FFA726", "#42A5F5", "#66BB6A", "#EF5350",
  "#AB47BC", "#26C6DA", "#EC407A", "#8D6E63", "#5C6BC0",
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0]?.[0] ?? "?").toUpperCase();
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

function getEndTime(dateStr: string, durationMinutes: number): string {
  const d = new Date(dateStr);
  d.setMinutes(d.getMinutes() + durationMinutes);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

export default function CalendarScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [highlightedDays, setHighlightedDays] = useState<number[]>([]);

  useEffect(() => {
    const loadAppointments = async () => {
      if (!token) return;
      try {
        const data = await fetchProviderAppointments(token, {
          month: month + 1,
          year,
        });
        const items = data as unknown as AppointmentItem[];
        setAppointments(items);
        const days = new Set<number>();
        items.forEach((a) => {
          const dateStr = String(a.date ?? "");
          if (dateStr) {
            const d = new Date(dateStr);
            if (!isNaN(d.getTime())) {
              days.add(d.getDate());
            }
          }
        });
        setHighlightedDays(Array.from(days));
      } catch {
        // silent fail for calendar highlighting
      }
    };
    loadAppointments();
  }, [token, month, year]);

  const selectedDayAppointments = useMemo(() => {
    if (selectedDay === null) return [];
    return appointments
      .filter((a) => {
        const d = new Date(a.date);
        return d.getDate() === selectedDay && d.getMonth() === month && d.getFullYear() === year;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [appointments, selectedDay, month, year]);

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
    setSelectedDay(null);
  };

  const startDateStr = `01.${String(month + 1).padStart(2, "0")}.${year}`;
  const endDateStr = `31.${String(month + 1).padStart(2, "0")}.${year}`;

  return (
    <View style={styles.root}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Kalendarz rezerwacji</Text>
          <Text style={styles.subtitle}>
            Wybierz interesujący Cię zakres.
          </Text>

          <View style={styles.dateFilters}>
            <TouchableOpacity style={styles.dateButton}>
              <Svg width={16} height={12} viewBox="0 0 20 16" fill="none" style={{ marginRight: 6 }}>
                <Path
                  d="M18 0H2C0.9 0 0 0.9 0 2V14C0 15.1 0.9 16 2 16H18C19.1 16 20 15.1 20 14V2C20 0.9 19.1 0 18 0ZM18 4L10 9L2 4V2L10 7L18 2V4Z"
                  fill={greyedOutFont}
                />
              </Svg>
              <Text style={styles.dateButtonText}>{startDateStr}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateButton}>
              <Svg width={16} height={12} viewBox="0 0 20 16" fill="none" style={{ marginRight: 6 }}>
                <Path
                  d="M18 0H2C0.9 0 0 0.9 0 2V14C0 15.1 0.9 16 2 16H18C19.1 16 20 15.1 20 14V2C20 0.9 19.1 0 18 0ZM18 4L10 9L2 4V2L10 7L18 2V4Z"
                  fill={greyedOutFont}
                />
              </Svg>
              <Text style={styles.dateButtonText}>{endDateStr}</Text>
            </TouchableOpacity>
          </View>

          <CalendarGrid
            month={month}
            year={year}
            selectedDay={selectedDay}
            highlightedDays={highlightedDays}
            onDayPress={setSelectedDay}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />

          {selectedDay !== null && (
            <View style={styles.agenda}>
              <Text style={styles.agendaTitle}>
                Agenda — {selectedDay}.{String(month + 1).padStart(2, "0")}.{year}
              </Text>
              {selectedDayAppointments.length === 0 ? (
                <Text style={styles.agendaEmpty}>Brak wizyt w tym dniu.</Text>
              ) : (
                selectedDayAppointments.map((appt, index) => (
                  <View key={appt.id} style={styles.agendaCard}>
                    <View style={styles.agendaCardContent}>
                      <View style={styles.agendaCardLeft}>
                        <Text style={styles.agendaTime}>
                          {formatTime(appt.date)} – {getEndTime(appt.date, appt.service_duration ?? 0)}
                        </Text>
                        <Text style={styles.agendaClientName}>{appt.client_name || appt.client_email}</Text>
                        <Text style={styles.agendaService}>{appt.service_name}</Text>
                        <Text style={styles.agendaEmployee}>z {appt.employee_name}</Text>
                      </View>
                      <View
                        style={[
                          styles.agendaAvatar,
                          { backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] },
                        ]}
                      >
                        <Text style={styles.agendaAvatarText}>
                          {getInitials(appt.client_name || appt.client_email)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}
        </View>

        <View style={styles.bottomButtons}>
          <Button
            text="Dodaj wizytę"
            onClick={() => {
              if (selectedDay !== null) {
                const dateParam = `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
                router.push(`/(calendar)/add-visit?date=${dateParam}`);
              } else {
                router.push("/(calendar)/add-visit");
              }
            }}
            style={styles.primaryButton}
            textStyle={styles.primaryButtonText}
          />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.navigate("/(dashboard)")}
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
    marginBottom: 16,
  },
  dateFilters: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
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
    gap: 12,
  },
  primaryButton: {
    backgroundColor: primaryColor,
    borderColor: primaryColor,
    borderRadius: 24,
  },
  primaryButtonText: {
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
  agenda: {
    marginTop: 16,
  },
  agendaTitle: {
    fontSize: largeFontSize,
    fontFamily: Fonts.bold,
    color: primaryColor,
    marginBottom: 12,
  },
  agendaEmpty: {
    fontSize: standardFontSize,
    fontFamily: Fonts.regular,
    color: greyedOutFont,
    paddingVertical: 16,
  },
  agendaCard: {
    backgroundColor: baseGrey,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: primaryColor,
  },
  agendaCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  agendaCardLeft: {
    flex: 1,
    marginRight: 12,
  },
  agendaTime: {
    fontSize: smallerFontSize,
    fontFamily: Fonts.bold,
    color: blackFont,
    marginBottom: 4,
  },
  agendaClientName: {
    fontSize: standardFontSize,
    fontFamily: Fonts.bold,
    color: blackFont,
    marginBottom: 2,
  },
  agendaService: {
    fontSize: smallFontSize,
    fontFamily: Fonts.regular,
    color: primaryColor,
  },
  agendaEmployee: {
    fontSize: smallFontSize,
    fontFamily: Fonts.regular,
    color: greyFont,
  },
  agendaAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  agendaAvatarText: {
    fontSize: standardFontSize,
    fontFamily: Fonts.bold,
    color: "white",
  },
});
