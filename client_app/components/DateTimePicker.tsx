import { greyedOutFont, greyFont } from "@/constants/style-vars";
import { formatDateWithoutYear } from "@/services/utils";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
// import DateTimePickerProps from '../../../models/props/dateTimePickerProps'
// import { Feather } from '@expo/vector-icons';
// import { greyedOutFont } from '../../../globalStyles';
// import styles from './DateTimePicker.style';
// import { formatDateWithoutYear } from '../../../services/utils';

interface DateTimePickerProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  date: Date;
  setDate: React.Dispatch<React.SetStateAction<Date>>;
  mode: "date" | "time" | "datetime";
}

const DateTimePicker = ({ isOpen, setIsOpen, date, setDate, mode }: DateTimePickerProps) => {
  return (
    <>
      <TouchableOpacity style={styles.dateTimeButton} onPress={() => setIsOpen(true)}>
        <Feather name="mail" size={30} color={greyedOutFont} />
        <Text style={styles.dateTimeText}>{formatDateWithoutYear(date)}</Text>
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
    borderColor: greyFont,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
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
