import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import Button from "@/components/Button";
import { darkGreyFont, greyedOutFont, greyFont, smallFontSize } from "@/constants/style-vars";
import { useTranslations } from "@/hooks/use-translations";
import SalonEmployeeModel from "@/models/data-models/salonEmployeeModel";
import { fetchSalon } from "@/services/api";
import { AntDesign } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import AppointmentDateTimePicker from "./AppointmentDateTimePicker";
import BookingConfirmationModal from "./BookingConfirmationModal";
import EmployeeDropdown from "./EmployeeDropdown";

export default function UserDataScreen() {
  const translate = useTranslations();
  const router = useRouter();
  const { salonId } = useLocalSearchParams<{ salonId?: string }>();

  const [selectedEmployee, setSelectedEmployee] = useState<SalonEmployeeModel | null>(null);
  const [employeeList, setEmployeeList] = useState<SalonEmployeeModel[]>([]);
  const [isConfirmationModalVisible, setIsConfirmationModalVisible] = useState(false);

  useEffect(() => {
    if (salonId) {
      fetchSalon(+salonId)
        .then((salon) => setEmployeeList(salon.employees))
        .catch((err) => console.warn("Failed to fetch salon employees:", err));
    }
  }, [salonId]);

  const handleConfirmationModalPay = () => {
    setIsConfirmationModalVisible(false);
    router.navigate("/(appointment-confirmed)");
  };

  const handleConfirmationModalClosed = () => {
    setIsConfirmationModalVisible(false);
    router.back();
  };

  return (
    <SafeAreaView edges={["top"]}>
      <View style={styles.container}>
        <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.contentWrappper}>
            <AppointmentDateTimePicker />

            <Text style={styles.employeeInfoText}>{translate("EMPLOYEE_DOING_SERVICE")}</Text>

            <EmployeeDropdown
              employeeList={employeeList}
              selectedEmployee={selectedEmployee}
              setSelectedEmployee={setSelectedEmployee}
            />

            <View style={styles.iconsContainer}>
              <TouchableOpacity style={styles.iconWithTextContainer}>
                <AntDesign name="plus-circle" size={28} color={darkGreyFont} />
                <Text style={styles.addIconText}>{translate("ADD_ANOTHER_SERVICE")}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.iconWithTextContainer, { marginTop: 16 }]}>
                <AntDesign name="message" size={28} color={greyedOutFont} />
                <Text style={styles.messageIconText}>{translate("LEAVE_MESSAGE")}</Text>
              </TouchableOpacity>
            </View>

            <Button
              text={translate("BOOK")}
              onClick={() => setIsConfirmationModalVisible(true)}
              style={styles.bookButton}
            />
          </View>
        </ScrollView>

        <BookingConfirmationModal
          visible={isConfirmationModalVisible}
          onPay={() => handleConfirmationModalPay()}
          onClose={() => handleConfirmationModalClosed()}
        />
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
  addIconText: {
    color: darkGreyFont,
    fontWeight: "600",

    fontSize: smallFontSize,
    marginLeft: 16,
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
