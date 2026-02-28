import { greyFont, lightGrey, primaryColor, smallFontSize } from "@/constants/style-vars";
import { AvailableSlot, fetchSalonAvailableSlots } from "@/services/api";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Calendar from "./Calendar";

interface AppointmentDateTimePickerProps {
  date: Date;
  setDate: React.Dispatch<React.SetStateAction<Date>>;
  selectedHour: string | null;
  setSelectedHour: (hour: string | null) => void;
  salonId: number;
  serviceId: number;
}

const AppointmentDateTimePicker = ({
  date,
  setDate,
  selectedHour,
  setSelectedHour,
  salonId,
  serviceId,
}: AppointmentDateTimePickerProps) => {
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!salonId || !serviceId) return;

    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    setIsLoading(true);
    setSelectedHour(null);

    fetchSalonAvailableSlots(salonId, dateStr, serviceId)
      .then((data) => setSlots(data))
      .catch(() => setSlots([]))
      .finally(() => setIsLoading(false));
  }, [date, salonId, serviceId]);

  return (
    <View style={styles.container}>
      <Calendar date={date} setDate={setDate} />

      <View style={styles.hoursSection}>
        {isLoading ? (
          <ActivityIndicator size="small" color={primaryColor} style={{ marginTop: 16 }} />
        ) : slots.length === 0 ? (
          <Text style={styles.noSlotsText}>Brak dostępnych godzin w tym dniu</Text>
        ) : (
          <ScrollView
            showsHorizontalScrollIndicator={false}
            horizontal
            style={styles.hoursScrollContainer}
          >
            {slots.map((slot) => {
              const isSelected = selectedHour === slot.start_time;
              const isUnavailable = !slot.available;

              return (
                <TouchableOpacity
                  key={slot.start_time}
                  style={[
                    styles.hourTextWrapper,
                    isSelected && styles.hourTextWrapperSelected,
                    isUnavailable && styles.hourTextWrapperDisabled,
                  ]}
                  onPress={() => !isUnavailable && setSelectedHour(slot.start_time)}
                  disabled={isUnavailable}
                >
                  <Text
                    style={[
                      styles.hourText,
                      isSelected && styles.hourTextSelected,
                      isUnavailable && styles.hourTextDisabled,
                    ]}
                  >
                    {slot.start_time}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 16,
    backgroundColor: "white",
    padding: 16,
  },
  hoursSection: {
    marginTop: 16,
    minHeight: 44,
  },
  hoursScrollContainer: {},
  hourTextWrapper: {
    marginRight: 10,
    borderRadius: 8,
    borderColor: greyFont,
    borderWidth: 1,
  },
  hourTextWrapperSelected: {
    backgroundColor: primaryColor,
    borderColor: primaryColor,
  },
  hourTextWrapperDisabled: {
    borderColor: lightGrey,
    backgroundColor: "#F9FAFB",
  },
  hourText: {
    fontSize: smallFontSize,
    paddingVertical: 10,
    paddingHorizontal: 16,
    color: greyFont,
  },
  hourTextSelected: {
    color: "white",
  },
  hourTextDisabled: {
    color: lightGrey,
  },
  noSlotsText: {
    fontSize: smallFontSize,
    color: greyFont,
    textAlign: "center",
    marginTop: 16,
  },
});

export default AppointmentDateTimePicker;
