import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import Button from "@/components/Button";
import { greyedOutFont, greyFont, smallFontSize } from "@/constants/style-vars";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "@/hooks/use-translations";
import SalonEmployeeModel from "@/models/data-models/salonEmployeeModel";
import { createAppointment, fetchSalon } from "@/services/api";
import { AntDesign } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";
import AppointmentDateTimePicker from "./AppointmentDateTimePicker";
import EmployeeDropdown from "./EmployeeDropdown";

export default function AppointmentScreen() {
  const translate = useTranslations();
  const router = useRouter();
  const { token } = useAuth();
  const { salonId, serviceId } = useLocalSearchParams<{
    salonId?: string;
    serviceId?: string;
  }>();

  const [selectedEmployee, setSelectedEmployee] = useState<SalonEmployeeModel | null>(null);
  const [employeeList, setEmployeeList] = useState<SalonEmployeeModel[]>([]);
  const [date, setDate] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (salonId) {
      fetchSalon(+salonId)
        .then((salon) => setEmployeeList(salon.employees))
        .catch((err) => console.warn("Failed to fetch salon employees:", err));
    }
  }, [salonId]);

  const handleBook = async () => {
    if (!selectedHour) {
      Toast.error("Wybierz godzinę wizyty");
      return;
    }
    if (!selectedEmployee) {
      Toast.error("Wybierz pracownika");
      return;
    }
    if (!salonId || !serviceId) {
      Toast.error("Brak danych salonu lub usługi");
      return;
    }
    if (!token) {
      Toast.error("Musisz być zalogowany");
      return;
    }

    const [hours, minutes] = selectedHour.split(":");
    const appointmentDate = new Date(date);
    appointmentDate.setHours(+hours, +minutes, 0, 0);

    const year = appointmentDate.getFullYear();
    const month = String(appointmentDate.getMonth() + 1).padStart(2, "0");
    const day = String(appointmentDate.getDate()).padStart(2, "0");
    const isoDateTime = `${year}-${month}-${day}T${selectedHour}:00`;

    setIsSubmitting(true);
    try {
      await createAppointment(
        {
          salon: +salonId,
          service: +serviceId,
          employee: selectedEmployee.id,
          date: isoDateTime,
        },
        token
      );
      router.navigate("/(appointment-confirmed)");
    } catch (err) {
      console.warn("Failed to create appointment:", err);
      Toast.error("Nie udało się umówić wizyty. Spróbuj ponownie.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={["top"]}>
      <View style={styles.container}>
        <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.contentWrappper}>
            <AppointmentDateTimePicker
              date={date}
              setDate={setDate}
              selectedHour={selectedHour}
              setSelectedHour={setSelectedHour}
              salonId={salonId ? +salonId : 0}
              serviceId={serviceId ? +serviceId : 0}
            />

            <Text style={styles.employeeInfoText}>{translate("EMPLOYEE_DOING_SERVICE")}</Text>

            <EmployeeDropdown
              employeeList={employeeList}
              selectedEmployee={selectedEmployee}
              setSelectedEmployee={setSelectedEmployee}
            />

            <View style={styles.iconsContainer}>
              <TouchableOpacity style={styles.iconWithTextContainer}>
                <AntDesign name="message" size={28} color={greyedOutFont} />
                <Text style={styles.messageIconText}>{translate("LEAVE_MESSAGE")}</Text>
              </TouchableOpacity>
            </View>

            <Button
              text={translate("BOOK")}
              onClick={handleBook}
              style={styles.bookButton}
              disabled={isSubmitting}
            />
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
  },
  contentScroll: {
    width: "100%",
  },
  contentWrappper: {
    flexGrow: 1,
    display: "flex",
    padding: 16,
  },
  employeeInfoText: {
    color: greyFont,
    fontSize: smallFontSize,
    marginTop: 32,
    marginBottom: 8,
  },
  iconsContainer: {
    marginVertical: 32,
    flexShrink: 1,
    alignSelf: "center",
  },
  iconWithTextContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  messageIconText: {
    color: greyedOutFont,
    fontWeight: "600",
    fontSize: smallFontSize,
    marginLeft: 16,
  },
  bookButton: {
    marginTop: 12,
  },
});
