import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  blackFont,
  greyedOutFont,
  lightGrey,
  primaryColor,
  smallFontSize,
  smallerFontSize,
} from "@/constants/style-vars";
import { Fonts } from "@/constants/theme";

const DAYS_OF_WEEK = ["Mo", "Tu", "We", "Th", "Fr", "Sat", "Su"];

const MONTH_NAMES = [
  "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
  "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień",
];

type CalendarGridProps = {
  month: number; // 0-indexed
  year: number;
  selectedDay: number | null;
  highlightedDays?: number[];
  minDate?: Date;
  onDayPress: (day: number) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
};

export default function CalendarGrid({
  month,
  year,
  selectedDay,
  highlightedDays = [],
  minDate,
  onDayPress,
  onPrevMonth,
  onNextMonth,
}: CalendarGridProps) {
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Convert Sunday=0 to Monday-based (Monday=0)
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: { day: number; isCurrentMonth: boolean }[] = [];

  // Previous month trailing days
  for (let i = startOffset - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, isCurrentMonth: false });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, isCurrentMonth: true });
  }

  // Next month leading days
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      cells.push({ day: d, isCurrentMonth: false });
    }
  }

  const weeks: { day: number; isCurrentMonth: boolean }[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <View style={styles.container}>
      {/* Month navigation */}
      <View style={styles.monthHeader}>
        <TouchableOpacity onPress={onPrevMonth}>
          <Text style={styles.navArrow}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {MONTH_NAMES[month]} {year}
        </Text>
        <TouchableOpacity onPress={onNextMonth}>
          <Text style={styles.navArrow}>{">"}</Text>
        </TouchableOpacity>
      </View>

      {/* Day headers */}
      <View style={styles.weekRow}>
        {DAYS_OF_WEEK.map((d) => (
          <Text key={d} style={styles.dayHeader}>
            {d}
          </Text>
        ))}
      </View>

      {/* Calendar grid */}
      {weeks.map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {week.map((cell, ci) => {
            const isSelected = cell.isCurrentMonth && cell.day === selectedDay;
            const isHighlighted =
              cell.isCurrentMonth && highlightedDays.includes(cell.day);
            const isPast =
              cell.isCurrentMonth &&
              minDate != null &&
              new Date(year, month, cell.day) < minDate;
            const isDisabled = !cell.isCurrentMonth || isPast;

            return (
              <TouchableOpacity
                key={ci}
                style={[
                  styles.dayCell,
                  isSelected && styles.selectedCell,
                  isHighlighted && !isSelected && styles.highlightedCell,
                ]}
                onPress={() => {
                  if (!isDisabled) onDayPress(cell.day);
                }}
                disabled={isDisabled}
              >
                <Text
                  style={[
                    styles.dayText,
                    !cell.isCurrentMonth && styles.otherMonthText,
                    isPast && styles.pastDayText,
                    isSelected && styles.selectedText,
                  ]}
                >
                  {cell.day}
                </Text>
                {isHighlighted && !isSelected && (
                  <View style={styles.dot} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    gap: 20,
  },
  navArrow: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: blackFont,
    paddingHorizontal: 8,
  },
  monthTitle: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: blackFont,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 4,
  },
  dayHeader: {
    width: 40,
    textAlign: "center",
    fontSize: smallerFontSize,
    fontFamily: Fonts.semiBold,
    color: greyedOutFont,
    marginBottom: 8,
  },
  dayCell: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  selectedCell: {
    backgroundColor: primaryColor,
  },
  highlightedCell: {
    backgroundColor: lightGrey,
  },
  dayText: {
    fontSize: smallFontSize,
    fontFamily: Fonts.regular,
    color: blackFont,
  },
  otherMonthText: {
    color: lightGrey,
  },
  pastDayText: {
    color: lightGrey,
  },
  selectedText: {
    color: "white",
    fontFamily: Fonts.bold,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: primaryColor,
    position: "absolute",
    bottom: 4,
  },
});
