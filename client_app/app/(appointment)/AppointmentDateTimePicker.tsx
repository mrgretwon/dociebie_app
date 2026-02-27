import { greyFont, smallFontSize } from "@/constants/style-vars";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Calendar from "./Calendar";

const AppointmentDateTimePicker = () => {
  const [date, setDate] = useState(new Date());

  return (
    <View style={styles.container}>
      <Calendar date={date} setDate={setDate} />
      <ScrollView
        showsHorizontalScrollIndicator={false}
        horizontal
        style={styles.hoursScrollContainer}
      >
        <TouchableOpacity style={styles.hourTextWrapper}>
          <Text style={styles.hourText}>11:00</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.hourTextWrapper}>
          <Text style={styles.hourText}>12:00</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.hourTextWrapper}>
          <Text style={styles.hourText}>12:30</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.hourTextWrapper}>
          <Text style={styles.hourText}>13:00</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.hourTextWrapper}>
          <Text style={styles.hourText}>15:00</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.hourTextWrapper}>
          <Text style={styles.hourText}>16:30</Text>
        </TouchableOpacity>
      </ScrollView>
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
  hoursScrollContainer: {
    marginTop: 24,
  },
  hourTextWrapper: {
    marginRight: 16,
    borderRadius: 8,
    borderColor: greyFont,
    borderWidth: 1,
  },
  hourText: {
    fontSize: smallFontSize,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
});

export default AppointmentDateTimePicker;
