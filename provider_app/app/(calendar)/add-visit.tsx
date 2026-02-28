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
import TextInputComponent from "@/components/TextInputComponent";
import Button from "@/components/Button";
import CalendarGrid from "./CalendarGrid";
import {
  baseGrey,
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
import {
  fetchProviderAppointments,
  fetchAvailableSlots,
  fetchProviderServices,
  fetchProviderEmployees,
  createProviderAppointment,
} from "@/services/api";
import Svg, { Path } from "react-native-svg";
import { Toast } from "toastify-react-native";

type ServiceItem = { id: number; name: string; price: string; minutes_duration: number };
type EmployeeItem = { id: number; name: string; surname: string };
type SlotItem = { start_time: string; end_time: string; available: boolean };

export default function AddVisitScreen() {
  const router = useRouter();
  const goBack = useSafeBack();
  const { date: dateParam } = useLocalSearchParams<{ date?: string }>();
  const { token } = useAuth();

  const initialDate = dateParam ? new Date(dateParam) : null;
  const hasPreselectedDate = initialDate && !isNaN(initialDate.getTime());

  const [month, setMonth] = useState(hasPreselectedDate ? initialDate.getMonth() : new Date().getMonth());
  const [year, setYear] = useState(hasPreselectedDate ? initialDate.getFullYear() : new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(hasPreselectedDate ? initialDate.getDate() : null);
  const [step, setStep] = useState<"calendar" | "details">(hasPreselectedDate ? "details" : "calendar");
  const [clientEmail, setClientEmail] = useState("");
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [highlightedDays, setHighlightedDays] = useState<number[]>([]);
  const [availableSlots, setAvailableSlots] = useState<SlotItem[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<SlotItem | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    const loadAppointments = async () => {
      try {
        const appointments = await fetchProviderAppointments(token, {
          month: month + 1,
          year,
        });
        const days = new Set<number>();
        appointments.forEach((a) => {
          const dateStr = String(a.date ?? "");
          if (dateStr) {
            const d = new Date(dateStr);
            if (!isNaN(d.getTime())) days.add(d.getDate());
          }
        });
        setHighlightedDays(Array.from(days));
      } catch { /* silent */ }
    };
    loadAppointments();
  }, [token, month, year]);

  useEffect(() => {
    if (!token) return;
    const loadData = async () => {
      try {
        const [svcData, empData] = await Promise.all([
          fetchProviderServices(token),
          fetchProviderEmployees(token),
        ]);
        setServices(svcData);
        if (svcData.length > 0) setSelectedServiceId(svcData[0].id);
        setEmployees(empData);
        if (empData.length > 0) setSelectedEmployeeId(empData[0].id);
      } catch { /* silent */ }
    };
    loadData();
  }, [token]);

  useEffect(() => {
    if (!token || !selectedDay || !selectedServiceId) return;
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
    const loadSlots = async () => {
      try {
        const slots = await fetchAvailableSlots(
          dateStr,
          selectedServiceId,
          token,
          selectedEmployeeId ?? undefined
        );
        setAvailableSlots(slots);
        setSelectedSlot(null);
      } catch {
        setAvailableSlots([]);
      }
    };
    loadSlots();
  }, [token, selectedDay, selectedServiceId, selectedEmployeeId, month, year]);

  const handlePrevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); } else { setMonth(month - 1); }
  };

  const handleNextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); } else { setMonth(month + 1); }
  };

  const selectedDateStr = selectedDay
    ? `${String(selectedDay).padStart(2, "0")}.${String(month + 1).padStart(2, "0")}.${year}`
    : "";

  const selectedService = services.find((s) => s.id === selectedServiceId);
  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);
  const onlyAvailableSlots = availableSlots.filter((s) => s.available);

  const handleCreateVisit = async () => {
    if (!token || !selectedDay || !selectedSlot || !selectedServiceId || !selectedEmployeeId) {
      Toast.error("Wypełnij wszystkie wymagane pola");
      return;
    }
    const email = clientEmail || newEmail;
    if (!email) {
      Toast.error("Podaj adres email klienta");
      return;
    }
    setSaving(true);
    try {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}T${selectedSlot.start_time}`;
      await createProviderAppointment(
        { client_email: email, service_id: selectedServiceId, employee_id: selectedEmployeeId, date: dateStr },
        token
      );
      Toast.success("Wizyta została dodana");
      goBack();
    } catch {
      Toast.error("Nie udało się dodać wizyty");
    } finally {
      setSaving(false);
    }
  };

  if (step === "details") {
    return (
      <View style={styles.root}>
        <Header />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text style={styles.title}>Dodaj wizytę</Text>
            <Text style={styles.subtitle}>
              Wybrany termin wizyty: {selectedDateStr}
            </Text>

            {/* Service dropdown */}
            <Text style={styles.sectionTitle}>Usługa</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => { setShowServiceDropdown(!showServiceDropdown); setShowEmployeeDropdown(false); }}
            >
              <Text style={styles.dropdownText}>
                {selectedService
                  ? `${selectedService.name} (${selectedService.minutes_duration} min, ${selectedService.price} zł)`
                  : "Wybierz usługę"}
              </Text>
              <Text style={styles.dropdownArrow}>{showServiceDropdown ? "\u25B2" : "\u25BC"}</Text>
            </TouchableOpacity>
            {showServiceDropdown && (
              <View style={styles.dropdownList}>
                {services.map((svc) => (
                  <TouchableOpacity
                    key={svc.id}
                    style={[
                      styles.dropdownItem,
                      svc.id === selectedServiceId && styles.dropdownItemActive,
                    ]}
                    onPress={() => {
                      setSelectedServiceId(svc.id);
                      setShowServiceDropdown(false);
                      setSelectedSlot(null);
                    }}
                  >
                    <Text style={[
                      styles.dropdownItemText,
                      svc.id === selectedServiceId && styles.dropdownItemTextActive,
                    ]}>
                      {svc.name} ({svc.minutes_duration} min, {svc.price} zł)
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Employee dropdown */}
            <Text style={styles.sectionTitle}>Pracownik</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => { setShowEmployeeDropdown(!showEmployeeDropdown); setShowServiceDropdown(false); }}
            >
              <Text style={styles.dropdownText}>
                {selectedEmployee
                  ? `${selectedEmployee.name} ${selectedEmployee.surname}`
                  : "Wybierz pracownika"}
              </Text>
              <Text style={styles.dropdownArrow}>{showEmployeeDropdown ? "\u25B2" : "\u25BC"}</Text>
            </TouchableOpacity>
            {showEmployeeDropdown && (
              <View style={styles.dropdownList}>
                {employees.map((emp) => (
                  <TouchableOpacity
                    key={emp.id}
                    style={[
                      styles.dropdownItem,
                      emp.id === selectedEmployeeId && styles.dropdownItemActive,
                    ]}
                    onPress={() => {
                      setSelectedEmployeeId(emp.id);
                      setShowEmployeeDropdown(false);
                      setSelectedSlot(null);
                    }}
                  >
                    <Text style={[
                      styles.dropdownItemText,
                      emp.id === selectedEmployeeId && styles.dropdownItemTextActive,
                    ]}>
                      {emp.name} {emp.surname}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Available slots */}
            <Text style={styles.sectionTitle}>Dostępne sloty</Text>
            <View style={styles.timeRow}>
              {onlyAvailableSlots.length === 0 ? (
                <Text style={styles.timeText}>Brak dostępnych slotów</Text>
              ) : (
                onlyAvailableSlots.map((slot, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.timeBox,
                      selectedSlot?.start_time === slot.start_time && {
                        borderColor: primaryColor,
                        backgroundColor: primaryColor + "10",
                      },
                    ]}
                    onPress={() => setSelectedSlot(slot)}
                  >
                    <Text style={styles.timeText}>
                      {slot.start_time} - {slot.end_time}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>

            <Text style={styles.sectionTitle}>Przypisz klienta</Text>
            <TextInputComponent
              text={clientEmail}
              setText={setClientEmail}
              placeholderText="Wprowadź adres email"
              style={styles.input}
            />
            <TouchableOpacity onPress={() => setShowNewClientForm(!showNewClientForm)}>
              <Text style={styles.linkText}>Stwórz nowego klienta</Text>
            </TouchableOpacity>

            {showNewClientForm && (
              <>
                <Text style={styles.sectionLabel}>Imię i Nazwisko</Text>
                <TextInputComponent
                  text={newFirstName}
                  setText={setNewFirstName}
                  placeholderText="Imię"
                  style={styles.input}
                />
                <TextInputComponent
                  text={newLastName}
                  setText={setNewLastName}
                  placeholderText="Nazwisko"
                  style={styles.input}
                />
                <Text style={styles.sectionLabel}>Adres e-mail</Text>
                <View style={styles.inputWithIcon}>
                  <Svg
                    width={20}
                    height={16}
                    viewBox="0 0 20 16"
                    fill="none"
                    style={{ marginRight: 8 }}
                  >
                    <Path
                      d="M18 0H2C0.9 0 0 0.9 0 2V14C0 15.1 0.9 16 2 16H18C19.1 16 20 15.1 20 14V2C20 0.9 19.1 0 18 0ZM18 4L10 9L2 4V2L10 7L18 2V4Z"
                      fill={greyedOutFont}
                    />
                  </Svg>
                  <TextInputComponent
                    text={newEmail}
                    setText={setNewEmail}
                    placeholderText="email@example.com"
                    style={styles.inputNoBorder}
                  />
                </View>
              </>
            )}
          </View>

          <View style={styles.bottomButtons}>
            <Button
              text={saving ? "Dodawanie..." : "Dodaj wizytę"}
              onClick={handleCreateVisit}
              style={styles.primaryButton}
              textStyle={styles.primaryButtonText}
              disabled={saving}
            />
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setStep("calendar")}
            >
              <Text style={styles.backButtonText}>Wróć</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Dodaj wizytę</Text>
          <Text style={styles.subtitle}>Wybierz termin wizyty.</Text>

          <View style={styles.dateFilters}>
            <TouchableOpacity style={styles.dateButton}>
              <Svg width={16} height={12} viewBox="0 0 20 16" fill="none" style={{ marginRight: 6 }}>
                <Path
                  d="M18 0H2C0.9 0 0 0.9 0 2V14C0 15.1 0.9 16 2 16H18C19.1 16 20 15.1 20 14V2C20 0.9 19.1 0 18 0ZM18 4L10 9L2 4V2L10 7L18 2V4Z"
                  fill={greyedOutFont}
                />
              </Svg>
              <Text style={styles.dateButtonText}>
                01.{String(month + 1).padStart(2, "0")}.{year}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateButton}>
              <Svg width={16} height={12} viewBox="0 0 20 16" fill="none" style={{ marginRight: 6 }}>
                <Path
                  d="M18 0H2C0.9 0 0 0.9 0 2V14C0 15.1 0.9 16 2 16H18C19.1 16 20 15.1 20 14V2C20 0.9 19.1 0 18 0ZM18 4L10 9L2 4V2L10 7L18 2V4Z"
                  fill={greyedOutFont}
                />
              </Svg>
              <Text style={styles.dateButtonText}>
                31.{String(month + 1).padStart(2, "0")}.{year}
              </Text>
            </TouchableOpacity>
          </View>

          <CalendarGrid
            month={month}
            year={year}
            selectedDay={selectedDay}
            highlightedDays={highlightedDays}
            minDate={new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())}
            onDayPress={setSelectedDay}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />
        </View>

        <View style={styles.bottomButtons}>
          <Button
            text="Przejdź dalej"
            onClick={() => {
              if (selectedDay) setStep("details");
            }}
            style={styles.primaryButton}
            textStyle={styles.primaryButtonText}
            disabled={!selectedDay}
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
  sectionTitle: {
    fontSize: standardFontSize,
    fontFamily: Fonts.bold,
    color: blackFont,
    marginBottom: 12,
    marginTop: 8,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: lightGrey,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  dropdownText: {
    fontSize: smallFontSize,
    fontFamily: Fonts.regular,
    color: blackFont,
    flex: 1,
  },
  dropdownArrow: {
    fontSize: smallFontSize,
    color: greyedOutFont,
    marginLeft: 8,
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: lightGrey,
    borderRadius: 8,
    marginBottom: 8,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: baseGrey,
  },
  dropdownItemActive: {
    backgroundColor: primaryColor + "10",
  },
  dropdownItemText: {
    fontSize: smallFontSize,
    fontFamily: Fonts.regular,
    color: blackFont,
  },
  dropdownItemTextActive: {
    color: primaryColor,
    fontFamily: Fonts.semiBold,
  },
  timeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  timeBox: {
    borderWidth: 1,
    borderColor: lightGrey,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  timeText: {
    fontSize: smallFontSize,
    fontFamily: Fonts.regular,
    color: blackFont,
  },
  input: {
    marginBottom: 8,
    borderColor: lightGrey,
  },
  linkText: {
    fontSize: smallFontSize,
    fontFamily: Fonts.regular,
    color: greyedOutFont,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: smallFontSize,
    fontFamily: Fonts.semiBold,
    color: blackFont,
    marginBottom: 8,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: lightGrey,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  inputNoBorder: {
    flex: 1,
    borderWidth: 0,
    paddingHorizontal: 0,
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
});
