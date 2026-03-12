import { greyedOutFont, lightGrey } from "@/constants/style-vars";
import { formatDateWithoutYear } from "@/services/utils";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

interface DateTimePickerProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  date: Date;
  setDate: React.Dispatch<React.SetStateAction<Date>>;
  mode: "date" | "time" | "datetime";
}

function formatDisplayText(date: Date, mode: string): string {
  if (mode === "time") {
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  }
  return formatDateWithoutYear(date);
}

const DateTimePicker = ({ isOpen, setIsOpen, date, setDate, mode }: DateTimePickerProps) => {
  return (
    <>
      <TouchableOpacity style={styles.dateTimeButton} onPress={() => setIsOpen(true)}>
        <Feather name={mode === "time" ? "clock" : "calendar"} size={20} color={greyedOutFont} />
        <Text style={styles.dateTimeText}>{formatDisplayText(date, mode)}</Text>
      </TouchableOpacity>

      <DateTimePickerModal
        mode={mode}
        isVisible={isOpen}
        date={date}
        onConfirm={(newDate) => {
          setIsOpen(false);
          setDate(newDate);
        }}
        onCancel={() => {
          setIsOpen(false);
        }}
      />
    </>
  );
};
const styles = StyleSheet.create({
  dateTimeButton: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderColor: lightGrey,
    borderWidth: 1,
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 12,
  },
  dateTimeText: {
    flexGrow: 1,
    color: greyedOutFont,
    textAlign: "center",
    textAlignVertical: "center",
    marginHorizontal: 8,
  },
});

export default DateTimePicker;
