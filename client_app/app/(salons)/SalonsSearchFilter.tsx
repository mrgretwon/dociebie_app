import DateTimePicker from "@/components/DateTimePicker";
import TextInputComponent from "@/components/TextInputComponent";
import { distanceDropdownValues, maxDistance } from "@/constants/constants";
import { blackFont, greyFont, lightGrey, primaryColor } from "@/constants/style-vars";
import { Fonts } from "@/constants/theme";
import { useCategories } from "@/contexts/CategoriesContext";
import { useSalonsSearch } from "@/contexts/SalonsSearchContext";
import { useTranslations } from "@/hooks/use-translations";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const SalonsSearchFilter = () => {
  const router = useRouter();
  const translate = useTranslations();
  const { categories } = useCategories();
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
    categoryId,
    setCategoryId,
    subcategoryId,
    setSubcategoryId,
  } = useSalonsSearch();

  const [isDatePickerOpened, setIsDatePickerOpened] = useState(false);
  const [isStartHourPickerOpened, setIsStartHourPickerOpened] = useState(false);
  const [isEndHourPickerOpened, setIsEndHourPickerOpened] = useState(false);
  const [isDistanceDropdownOpen, setIsDistanceDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isSubcategoryDropdownOpen, setIsSubcategoryDropdownOpen] = useState(false);

  const selectedCategory = categories.find((c) => c.id === categoryId) ?? null;
  const selectedSubcategory = selectedCategory?.subcategories.find((s) => s.id === subcategoryId) ?? null;

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

      <Pressable
        style={styles.selectButton}
        onPress={() => setIsCategoryDropdownOpen(true)}
      >
        <Text style={[styles.selectButtonText, !selectedCategory && styles.selectButtonPlaceholder]}>
          {selectedCategory ? selectedCategory.name : translate("SELECT_CATEGORY")}
        </Text>
        <AntDesign name="down" size={14} color={greyFont} />
      </Pressable>

      <Pressable
        style={[styles.selectButton, !selectedCategory && styles.selectButtonDisabled]}
        onPress={() => selectedCategory && setIsSubcategoryDropdownOpen(true)}
      >
        <Text style={[styles.selectButtonText, !selectedSubcategory && styles.selectButtonPlaceholder]}>
          {selectedSubcategory ? selectedSubcategory.name : translate("SELECT_SUBCATEGORY")}
        </Text>
        <AntDesign name="down" size={14} color={greyFont} />
      </Pressable>

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

      <Modal
        transparent
        visible={isCategoryDropdownOpen}
        animationType="fade"
        onRequestClose={() => setIsCategoryDropdownOpen(false)}
      >
        <TouchableOpacity
          style={styles.dropdownBackdrop}
          activeOpacity={1}
          onPressOut={() => setIsCategoryDropdownOpen(false)}
        >
          <View style={styles.dropdownSheet}>
            <ScrollView>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setCategoryId(null);
                  setSubcategoryId(null);
                  setIsCategoryDropdownOpen(false);
                }}
              >
                <Text style={[styles.dropdownItemText, styles.dropdownClearText]}>{translate("CLEAR_SELECTION")}</Text>
              </TouchableOpacity>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.dropdownItem, cat.id === categoryId && styles.dropdownItemSelected]}
                  onPress={() => {
                    setCategoryId(cat.id);
                    setSubcategoryId(null);
                    setIsCategoryDropdownOpen(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, cat.id === categoryId && styles.dropdownItemTextSelected]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        transparent
        visible={isSubcategoryDropdownOpen}
        animationType="fade"
        onRequestClose={() => setIsSubcategoryDropdownOpen(false)}
      >
        <TouchableOpacity
          style={styles.dropdownBackdrop}
          activeOpacity={1}
          onPressOut={() => setIsSubcategoryDropdownOpen(false)}
        >
          <View style={styles.dropdownSheet}>
            <ScrollView>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setSubcategoryId(null);
                  setIsSubcategoryDropdownOpen(false);
                }}
              >
                <Text style={[styles.dropdownItemText, styles.dropdownClearText]}>{translate("CLEAR_SELECTION")}</Text>
              </TouchableOpacity>
              {selectedCategory?.subcategories.map((sub) => (
                <TouchableOpacity
                  key={sub.id}
                  style={[styles.dropdownItem, sub.id === subcategoryId && styles.dropdownItemSelected]}
                  onPress={() => {
                    setSubcategoryId(sub.id);
                    setIsSubcategoryDropdownOpen(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, sub.id === subcategoryId && styles.dropdownItemTextSelected]}>
                    {sub.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
    borderColor: lightGrey,
  },
  locationContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "white",
    borderColor: lightGrey,
    height: 48,
  },
  locationDistance: {
    color: blackFont,
    textAlign: "center",
    textAlignVertical: "center",
    width: 75,
  },
  dropdownButton: {
    justifyContent: "center",
  },
  locationText: {
    color: blackFont,
    flexGrow: 1,
    borderLeftColor: lightGrey,
    borderLeftWidth: 1,
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
  dropdownItemSelected: {
    backgroundColor: "#EEF2FF",
  },
  dropdownItemTextSelected: {
    color: primaryColor,
    fontFamily: Fonts.semiBold,
  },
  dropdownClearText: {
    color: greyFont,
    fontSize: 13,
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: lightGrey,
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 8,
    backgroundColor: "white",
  },
  selectButtonDisabled: {
    backgroundColor: "#F9FAFB",
  },
  selectButtonText: {
    color: blackFont,
    fontSize: 14,
    fontFamily: Fonts.regular,
  },
  selectButtonPlaceholder: {
    color: greyFont,
  },
});

export default SalonsSearchFilter;
