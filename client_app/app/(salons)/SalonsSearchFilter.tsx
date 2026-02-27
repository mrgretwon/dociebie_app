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
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    distance,
    setDistance,
  } = useSalonsSearch();

  const [isStartDatePickerOpened, setIsDatePickerOpened] = useState(false);
  const [isEndDatePickerOpened, setIsEndDatePickerOpened] = useState(false);
  const [isDistanceDropdownOpen, setIsDistanceDropdownOpen] = useState(false);

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
          placeholder="Wpisz lokalizację..."
        />
      </View>

      <View style={styles.datePickersContainer}>
        <View style={styles.startDatePickerWrapper}>
          <DateTimePicker
            mode="date"
            isOpen={isStartDatePickerOpened}
            setIsOpen={setIsDatePickerOpened}
            date={startDate}
            setDate={setStartDate}
          />
        </View>
        <View style={styles.endDatePickerWrapper}>
          <DateTimePicker
            mode="date"
            isOpen={isEndDatePickerOpened}
            setIsOpen={setIsEndDatePickerOpened}
            date={endDate}
            setDate={setEndDate}
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
  datePickersContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    marginTop: 8,
  },
  startDatePickerWrapper: {
    marginLeft: 16,
    flexGrow: 1,
    flexShrink: 1,
  },
  endDatePickerWrapper: {
    marginLeft: 16,
    marginRight: 16,
    flexGrow: 1,
    flexShrink: 1,
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
