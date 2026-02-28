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
import TextInputComponent from "@/components/TextInputComponent";
import Button from "@/components/Button";
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

export default function FreeSlotScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [clientEmail, setClientEmail] = useState("");
  const [showNewClient, setShowNewClient] = useState(false);
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [availableSlots, setAvailableSlots] = useState<SlotItem[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<SlotItem | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [saving, setSaving] = useState(false);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const todayDisplay = `${String(today.getDate()).padStart(2, "0")}.${String(today.getMonth() + 1).padStart(2, "0")}.${today.getFullYear()}`;

  useEffect(() => {
    if (!token) return;
    const load = async () => {
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
    load();
  }, [token]);

  useEffect(() => {
    if (!token || !selectedServiceId) return;
    const loadSlots = async () => {
      try {
        const slots = await fetchAvailableSlots(
          todayStr,
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
  }, [token, selectedServiceId, selectedEmployeeId]);

  const selectedService = services.find((s) => s.id === selectedServiceId);
  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);
  const onlyAvailableSlots = availableSlots.filter((s) => s.available);

  const handleCreate = async () => {
    if (!token || !selectedSlot || !selectedServiceId || !selectedEmployeeId) {
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
      await createProviderAppointment(
        {
          client_email: email,
          service_id: selectedServiceId,
          employee_id: selectedEmployeeId,
          date: `${todayStr}T${selectedSlot.start_time}`,
        },
        token
      );
      Toast.success("Wizyta została dodana");
      router.back();
    } catch {
      Toast.error("Nie udało się dodać wizyty");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.root}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Dodaj wizytę</Text>
          <Text style={styles.subtitle}>
            Wybrany termin wizyty: {todayDisplay}
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
          <TouchableOpacity onPress={() => setShowNewClient(!showNewClient)}>
            <Text style={styles.linkText}>Stwórz nowego klienta</Text>
          </TouchableOpacity>

          {showNewClient && (
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
            onClick={handleCreate}
            style={styles.primaryButton}
            textStyle={styles.primaryButtonText}
            disabled={saving}
          />
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
