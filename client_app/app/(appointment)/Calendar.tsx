import { daysShortNames, monthNames } from "@/constants/dummy-data";
import {
  darkGreyFont,
  greyedOutFont,
  greyFont,
  largeFontSize,
  smallestFontSize,
  smallFontSize,
} from "@/constants/style-vars";
import { getDaysInMonth, modulo } from "@/services/utils";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CalendarProps {
  date: Date;
  setDate: React.Dispatch<React.SetStateAction<Date>>;
}

const Calendar = ({ date, setDate }: CalendarProps) => {
  const [currentYear] = useState(new Date().getFullYear());
  const [year, setYear] = useState(date.getFullYear());
  const [month, setMonth] = useState(date.getMonth());
  const [day, setDay] = useState<number | null>(date.getDate());
  const [calendarRows, setCalendarRows] = useState<(number | null)[][]>([]);

  const handleDecrementMonth = (): void => {
    if (month === 0) {
      setYear((prev) => prev - 1);
    }
    setMonth((prev) => modulo(prev - 1, 12));
  };

  const handleIncrementMonth = (): void => {
    if (month === 11) {
      setYear((prev) => prev + 1);
    }
    setMonth((prev) => (prev + 1) % 12);
  };

  useEffect(() => {
    const daysInMonth = getDaysInMonth(year, month);
    const dayOffset = modulo(new Date(year, month, 1).getDay() - 1, 7);
    const rowsAmount = Math.ceil((daysInMonth + dayOffset) / 7);
    let daysCount = 0;
    let rows: (number | null)[][] = [];

    for (let i = 0; i < rowsAmount; i++) {
      let row: (number | null)[] = new Array(7).fill(null);

      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < dayOffset) {
          continue;
        }
        if (daysCount < daysInMonth) {
          row[(dayOffset + daysCount) % 7] = daysCount + 1;
          daysCount++;
        }
      }

      rows.push(row);
    }

    setCalendarRows(rows);
  }, [month, year]);

  const generateCalendarRows = useCallback((): React.ReactElement => {
    return (
      <View style={styles.calendarRows}>
        {calendarRows.map((row, i) => (
          <View key={i} style={styles.calendarRow}>
            {row.map((item, j) => (
              <TouchableOpacity
                key={j}
                onPress={() => setDay(item)}
                style={
                  day === item
                    ? styles.selectedCalendarDayItemWrapper
                    : styles.nonselectedCalendarDayItemWrapper
                }
              >
                <Text
                  style={[
                    styles.calendarDayItem,
                    day === item
                      ? styles.selectedCalendarDayItemColor
                      : styles.nonselectedCalendarDayItemColor,
                  ]}
                >
                  {item ?? ""}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    );
  }, [calendarRows, day]);

  return (
    <View style={styles.container}>
      <View style={styles.monthHeader}>
        <MaterialIcons
          name="keyboard-arrow-left"
          size={35}
          style={styles.arrowIcon}
          onPress={() => handleDecrementMonth()}
        />
        <View style={styles.headerText}>
          <Text style={styles.monthText}>{monthNames[month]}</Text>
          {currentYear !== year && <Text style={styles.yearText}>{year}</Text>}
        </View>
        <MaterialIcons
          name="keyboard-arrow-right"
          size={35}
          style={styles.arrowIcon}
          onPress={() => handleIncrementMonth()}
        />
      </View>

      <View style={styles.dayNames}>
        {daysShortNames.map((dayName) => (
          <Text key={dayName} style={styles.dayName}>
            {dayName}
          </Text>
        ))}
      </View>

      {generateCalendarRows()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  monthHeader: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  yearText: {
    fontSize: smallestFontSize,
    color: greyedOutFont,
  },
  monthText: {
    fontSize: largeFontSize,
    color: greyFont,
  },
  arrowIcon: {
    color: greyFont,
    padding: 16,
  },
  dayNames: {
    display: "flex",
    flexDirection: "row",
  },
  dayName: {
    textAlign: "center",
    flexBasis: 0,
    flexGrow: 1,
    color: greyFont,
    fontSize: smallestFontSize,
  },
  calendarRows: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
  },
  calendarRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  selectedCalendarDayItemWrapper: {
    flexBasis: 0,
    flexGrow: 1,
    backgroundColor: darkGreyFont,
    borderRadius: 16,
  },
  nonselectedCalendarDayItemWrapper: {
    flexBasis: 0,
    flexGrow: 1,
  },
  calendarDayItem: {
    textAlign: "center",
    fontSize: smallFontSize,
    padding: 8,
  },
  selectedCalendarDayItemColor: {
    color: "white",
  },
  nonselectedCalendarDayItemColor: {
    color: greyedOutFont,
  },
});

export default Calendar;
