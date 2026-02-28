import DateTimePicker from "@/components/DateTimePicker";
import TextInputComponent from "@/components/TextInputComponent";
import { distanceDropdownValues, maxDistance } from "@/constants/constants";
import { blackFont, greyFont } from "@/constants/style-vars";
import { useSalonsSearch } from "@/contexts/SalonsSearchContext";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const SalonsSearchFilter = () => {
  const router = useRouter();
  const {
    searchText,
    setSearchText,
    locationText,
    setLocationText,
    date,
    setDate,
    startHour,
    setStartHour,
    endHour,
    setEndHour,
    distance,
    setDistance,
    setUserLatitude,
    setUserLongitude,
  } = useSalonsSearch();

  const [isDatePickerOpened, setIsDatePickerOpened] = useState(false);
  const [isStartHourPickerOpened, setIsStartHourPickerOpened] = useState(false);
  const [isEndHourPickerOpened, setIsEndHourPickerOpened] = useState(false);
  const [isDistanceDropdownOpen, setIsDistanceDropdownOpen] = useState(false);

  const geocodeLocation = async (text: string) => {
    if (!text.trim()) {
      setUserLatitude(null);
      setUserLongitude(null);
      return;
    }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&limit=1`,
        { headers: { "User-Agent": "DoCiebie/1.0" } }
      );
      const data = await res.json();
      if (data.length > 0) {
        setUserLatitude(parseFloat(data[0].lat));
        setUserLongitude(parseFloat(data[0].lon));
      } else {
        setUserLatitude(null);
        setUserLongitude(null);
      }
    } catch {
      setUserLatitude(null);
      setUserLongitude(null);
    }
  };

  const startHourDate = parseHourToDate(startHour, 9);
  const endHourDate = parseHourToDate(endHour, 17);

  const distanceLabel = (value: number) => (value === maxDistance ? `MAX km` : `+ ${value} km`);

  return (
    <View style={styles.container}>
      <AntDesign name="close" size={32} color="black" onPress={() => router.back()} />

      <TextInputComponent
        placeholderText="Barber, Fryzjer, Trening i Dieta..."
        text={searchText}
        setText={setSearchText}
        style={styles.searchTextContainer}
      />

      <View style={styles.locationContainer}>
        <Pressable style={styles.dropdownButton} onPress={() => setIsDistanceDropdownOpen(true)}>
          <Text style={styles.locationDistance}>{distanceLabel(distance)}</Text>
        </Pressable>

        <TextInput
          style={styles.locationText}
          value={locationText}
          onChangeText={setLocationText}
          onBlur={() => geocodeLocation(locationText)}
          placeholder="Wpisz lokalizację..."
        />
      </View>

      <View style={styles.dateAndHoursRow}>
        <View style={styles.datePickerWrapper}>
          <DateTimePicker
            mode="date"
            isOpen={isDatePickerOpened}
            setIsOpen={setIsDatePickerOpened}
            date={date}
            setDate={setDate}
          />
        </View>
        <View style={styles.hourPickerWrapper}>
          <DateTimePicker
            mode="time"
            isOpen={isStartHourPickerOpened}
            setIsOpen={setIsStartHourPickerOpened}
            date={startHourDate}
            setDate={(d) => {
              if (d instanceof Function) {
                setStartHour((prev) => formatTime(d(parseHourToDate(prev))));
              } else {
                setStartHour(formatTime(d));
              }
            }}
          />
        </View>
        <View style={styles.hourPickerWrapper}>
          <DateTimePicker
            mode="time"
            isOpen={isEndHourPickerOpened}
            setIsOpen={setIsEndHourPickerOpened}
            date={endHourDate}
            setDate={(d) => {
              if (d instanceof Function) {
                setEndHour((prev) => formatTime(d(parseHourToDate(prev))));
              } else {
                setEndHour(formatTime(d));
              }
            }}
          />
        </View>
      </View>

      <Modal
        transparent
        visible={isDistanceDropdownOpen}
        animationType="fade"
        onRequestClose={() => setIsDistanceDropdownOpen(false)}
      >
        <TouchableOpacity
          style={styles.dropdownBackdrop}
          activeOpacity={1}
          onPressOut={() => setIsDistanceDropdownOpen(false)}
        >
          <View style={styles.dropdownSheet}>
            {distanceDropdownValues.map((value) => (
              <TouchableOpacity
                key={value}
                style={styles.dropdownItem}
                onPress={() => {
                  setDistance(Number(value));
                  setIsDistanceDropdownOpen(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{distanceLabel(Number(value))}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

function parseHourToDate(hour: string, fallbackHour = 0): Date {
  const d = new Date();
  if (!hour) {
    d.setHours(fallbackHour, 0, 0, 0);
    return d;
  }
  const [h, m] = hour.split(":").map(Number);
  d.setHours(h, m, 0, 0);
  return d;
}

function formatTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "white",
    borderBottomLeftRadius: 55,
    borderBottomRightRadius: 55,
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  searchTextContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  locationContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "white",
    borderColor: greyFont,
  },
  locationDistance: {
    color: blackFont,
    textAlign: "center",
    textAlignVertical: "center",
    width: 75,
    paddingVertical: 12,
  },
  dropdownButton: {
    justifyContent: "center",
  },
  locationText: {
    color: blackFont,
    flexGrow: 1,
    borderLeftColor: greyFont,
    borderLeftWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dateAndHoursRow: {
    flexDirection: "row",
    marginTop: 8,
    gap: 8,
  },
  datePickerWrapper: {
    flex: 1,
  },
  hourPickerWrapper: {
    flex: 1,
  },
  dropdownBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  dropdownSheet: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 8,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  dropdownItemText: {
    color: blackFont,
  },
});

export default SalonsSearchFilter;
