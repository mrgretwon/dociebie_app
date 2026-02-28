import React, { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import Header from "@/components/Header";
import Spinner from "@/components/Spinner";
import TextInputComponent from "@/components/TextInputComponent";
import Button from "@/components/Button";
import {
  baseGrey,
  blackFont,
  greyedOutFont,
  lightGrey,
  primaryColor,
  smallFontSize,
  standardFontSize,
  largestFontSize,
} from "@/constants/style-vars";
import { Fonts } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchProviderSalon,
  fetchProviderOpeningHours,
  fetchCategories,
  updateProviderSalon,
  updateProviderOpeningHours,
  uploadProviderSalonImage,
  CategoryItem,
} from "@/services/api";
import Svg, { Path } from "react-native-svg";
import { Toast } from "toastify-react-native";

export default function BusinessCardScreen() {
  const router = useRouter();
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openingHours, setOpeningHours] = useState<
    { id?: number; day_of_week: number; open_time: string; close_time: string }[]
  >([]);
  const [emailAddress, setEmailAddress] = useState("");
  const [salonName, setSalonName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [salonImageUri, setSalonImageUri] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const [salon, hours, cats] = await Promise.all([
          fetchProviderSalon(token),
          fetchProviderOpeningHours(token),
          fetchCategories(),
        ]);
        setCategories(cats);
        setSalonName(String(salon.name ?? ""));
        setEmailAddress(String(salon.mail ?? ""));
        if (salon.category_id) setSelectedCategoryId(Number(salon.category_id));
        setAddress(String(salon.location_name ?? ""));
        setPhone(String(salon.phone_number ?? ""));
        if (salon.main_image) setSalonImageUri(String(salon.main_image));
        setOpeningHours(hours);
      } catch {
        Toast.error("Nie udało się pobrać danych wizytówki");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token]);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const pickedUri = result.assets[0].uri;
    if (!token) return;
    try {
      const updated = await uploadProviderSalonImage(pickedUri, token);
      setSalonImageUri(String(updated.main_image ?? pickedUri));
      Toast.success("Zdjęcie zostało zaktualizowane");
    } catch {
      Toast.error("Nie udało się przesłać zdjęcia");
    }
  };

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      await Promise.all([
        updateProviderSalon(
          {
            name: salonName,
            mail: emailAddress,
            location_name: address,
            phone_number: phone,
            ...(selectedCategoryId ? { category_id: selectedCategoryId } : {}),
          },
          token
        ),
        updateProviderOpeningHours(
          openingHours.map((h) => ({
            day_of_week: h.day_of_week,
            open_time: h.open_time,
            close_time: h.close_time,
          })),
          token
        ),
      ]);
      Toast.success("Wizytówka została zapisana");
      router.back();
    } catch {
      Toast.error("Nie udało się zapisać wizytówki");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.root}>
        <Header />
        <Spinner />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Twoja wizytówka</Text>
          <Text style={styles.subtitle}>
            Aktualizuj swoje dane i zdjęcia by klienci mieli dostęp do
            najnowszych informacji.
          </Text>

          <Text style={styles.editingLabel}>Edytujesz</Text>

          <View style={styles.salonRow}>
            <TouchableOpacity onPress={handlePickImage} style={styles.salonAvatarWrapper}>
              <View style={styles.salonAvatar}>
                {salonImageUri ? (
                  <Image source={{ uri: salonImageUri }} style={styles.salonAvatarImage} />
                ) : (
                  <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
                    <Path
                      d="M16 0C7.16 0 0 7.16 0 16C0 24.84 7.16 32 16 32C24.84 32 32 24.84 32 16C32 7.16 24.84 0 16 0Z"
                      fill={lightGrey}
                    />
                  </Svg>
                )}
              </View>
              <View style={styles.cameraIconBadge}>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 15.2C13.7673 15.2 15.2 13.7673 15.2 12C15.2 10.2327 13.7673 8.8 12 8.8C10.2327 8.8 8.8 10.2327 8.8 12C8.8 13.7673 10.2327 15.2 12 15.2Z"
                    fill="white"
                  />
                  <Path
                    d="M9 2L7.17 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4H16.83L15 2H9ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17Z"
                    fill="white"
                  />
                </Svg>
              </View>
            </TouchableOpacity>
            <Text style={styles.salonName}>{salonName}</Text>
          </View>

          <TouchableOpacity onPress={handlePickImage}>
            <Text style={styles.removePhotoText}>Zmień zdjęcie</Text>
          </TouchableOpacity>

          {/* Opening hours */}
          <Text style={styles.sectionLabel}>Godziny otwarcia</Text>
          {openingHours.map((item, index) => {
            const dayNames = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Ndz"];
            return (
              <View key={item.id ?? index} style={styles.hoursEditRow}>
                <TouchableOpacity
                  style={styles.dayPicker}
                  onPress={() => {
                    const updated = [...openingHours];
                    updated[index] = {
                      ...updated[index],
                      day_of_week: (updated[index].day_of_week + 1) % 7,
                    };
                    setOpeningHours(updated);
                  }}
                >
                  <Text style={styles.dayPickerText}>{dayNames[item.day_of_week]}</Text>
                </TouchableOpacity>
                <TextInputComponent
                  text={item.open_time}
                  setText={(val) => {
                    const updated = [...openingHours];
                    updated[index] = { ...updated[index], open_time: val };
                    setOpeningHours(updated);
                  }}
                  placeholderText="09:00"
                  style={styles.timeInput}
                />
                <Text style={styles.timeSeparator}>–</Text>
                <TextInputComponent
                  text={item.close_time}
                  setText={(val) => {
                    const updated = [...openingHours];
                    updated[index] = { ...updated[index], close_time: val };
                    setOpeningHours(updated);
                  }}
                  placeholderText="17:00"
                  style={styles.timeInput}
                />
                <TouchableOpacity
                  onPress={() => {
                    setOpeningHours(openingHours.filter((_, i) => i !== index));
                  }}
                  style={styles.hoursRemoveButton}
                >
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41Z"
                      fill={greyedOutFont}
                    />
                  </Svg>
                </TouchableOpacity>
              </View>
            );
          })}
          <TouchableOpacity
            style={styles.addHoursButton}
            onPress={() => {
              // Find the next day not yet added
              const usedDays = new Set(openingHours.map((h) => h.day_of_week));
              let nextDay = 0;
              while (usedDays.has(nextDay) && nextDay < 7) nextDay++;
              if (nextDay >= 7) nextDay = 0;
              setOpeningHours([
                ...openingHours,
                { day_of_week: nextDay, open_time: "09:00", close_time: "17:00" },
              ]);
            }}
          >
            <Text style={styles.addHoursButtonText}>+ Dodaj godziny</Text>
          </TouchableOpacity>

          {/* Email */}
          <Text style={[styles.sectionLabel, { marginTop: 20 }]}>
            Adres e-mail
          </Text>
          <View style={styles.inputWithIcon}>
            <Svg
              width={20}
              height={16}
              viewBox="0 0 20 16"
              fill="none"
              style={{ marginRight: 8 }}
            >
              <Path
                d="M18 0H2C0.9 0 0 0.9 0 2V14C0 15.1 0.9 16 2 16H18C19.1 16 20 15.1 20 14V2C20 0.9 19.1 0 18 0ZM18 4L10 9L2 4V2L10 7L18 2V4Z"
                fill={greyedOutFont}
              />
            </Svg>
            <TextInputComponent
              text={emailAddress}
              setText={setEmailAddress}
              placeholderText="Adres e-mail"
              style={styles.inputNoBorder}
            />
          </View>

          {/* Salon name */}
          <Text style={styles.sectionLabel}>Nazwa</Text>
          <TextInputComponent
            text={salonName}
            setText={setSalonName}
            placeholderText="Nazwa salonu"
            style={styles.input}
          />

          {/* Category */}
          <Text style={styles.sectionLabel}>Kategoria</Text>
          <TouchableOpacity
            style={styles.categorySelect}
            onPress={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
          >
            <Text style={[
              styles.categorySelectText,
              !selectedCategoryId && styles.categorySelectPlaceholder,
            ]}>
              {selectedCategoryId
                ? categories.find((c) => c.id === selectedCategoryId)?.name ?? "Wybierz kategorię"
                : "Wybierz kategorię"}
            </Text>
            <Text style={styles.categorySelectArrow}>{categoryDropdownOpen ? "▲" : "▼"}</Text>
          </TouchableOpacity>
          {categoryDropdownOpen && (
            <View style={styles.categoryDropdown}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryDropdownItem,
                    cat.id === selectedCategoryId && styles.categoryDropdownItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedCategoryId(cat.id);
                    setCategoryDropdownOpen(false);
                  }}
                >
                  <Text style={[
                    styles.categoryDropdownItemText,
                    cat.id === selectedCategoryId && styles.categoryDropdownItemTextSelected,
                  ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Address */}
          <Text style={styles.sectionLabel}>Adres</Text>
          <TextInputComponent
            text={address}
            setText={setAddress}
            placeholderText="Adres"
            style={styles.input}
          />

          <Button
            text="Podgląd"
            onClick={() => router.push("/(preview)")}
            style={styles.previewButton}
            textStyle={styles.previewButtonText}
          />

          <Button
            text={saving ? "Zapisywanie..." : "Zapisz"}
            onClick={handleSave}
            style={styles.saveButton}
            textStyle={styles.saveButtonText}
            disabled={saving}
          />

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Wróć</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: largestFontSize,
    fontFamily: Fonts.bold,
    color: blackFont,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: smallFontSize,
    fontFamily: Fonts.regular,
    color: greyedOutFont,
    marginBottom: 16,
  },
  editingLabel: {
    fontSize: standardFontSize,
    fontFamily: Fonts.bold,
    color: primaryColor,
    marginBottom: 12,
  },
  salonRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  salonAvatarWrapper: {
    position: "relative",
    marginRight: 12,
  },
  salonAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: baseGrey,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  salonAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  cameraIconBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: primaryColor,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  salonName: {
    fontSize: standardFontSize,
    fontFamily: Fonts.bold,
    color: blackFont,
  },
  removePhotoText: {
    fontSize: smallFontSize,
    fontFamily: Fonts.regular,
    color: primaryColor,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: smallFontSize,
    fontFamily: Fonts.semiBold,
    color: blackFont,
    marginBottom: 8,
  },
  hoursEditRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  dayPicker: {
    backgroundColor: baseGrey,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minWidth: 48,
    alignItems: "center",
  },
  dayPickerText: {
    fontSize: smallFontSize,
    fontFamily: Fonts.semiBold,
    color: blackFont,
  },
  timeInput: {
    flex: 1,
    borderColor: lightGrey,
    marginBottom: 0,
    textAlign: "center",
  },
  timeSeparator: {
    fontSize: standardFontSize,
    color: greyedOutFont,
    paddingHorizontal: 4,
  },
  hoursRemoveButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: baseGrey,
    alignItems: "center",
    justifyContent: "center",
  },
  addHoursButton: {
    paddingVertical: 10,
    marginBottom: 12,
  },
  addHoursButtonText: {
    fontSize: smallFontSize,
    fontFamily: Fonts.semiBold,
    color: primaryColor,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: lightGrey,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  inputNoBorder: {
    flex: 1,
    borderWidth: 0,
    paddingHorizontal: 0,
  },
  input: {
    marginBottom: 12,
    borderColor: lightGrey,
  },
  categorySelect: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: lightGrey,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginBottom: 12,
  },
  categorySelectText: {
    fontSize: standardFontSize,
    fontFamily: Fonts.regular,
    color: blackFont,
  },
  categorySelectPlaceholder: {
    color: greyedOutFont,
  },
  categorySelectArrow: {
    fontSize: smallFontSize,
    color: greyedOutFont,
  },
  categoryDropdown: {
    borderWidth: 1,
    borderColor: lightGrey,
    borderRadius: 8,
    marginTop: -8,
    marginBottom: 12,
    overflow: "hidden",
  },
  categoryDropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: baseGrey,
  },
  categoryDropdownItemSelected: {
    backgroundColor: primaryColor,
  },
  categoryDropdownItemText: {
    fontSize: standardFontSize,
    fontFamily: Fonts.regular,
    color: blackFont,
  },
  categoryDropdownItemTextSelected: {
    color: "white",
    fontFamily: Fonts.semiBold,
  },
  previewButton: {
    backgroundColor: primaryColor,
    borderColor: primaryColor,
    borderRadius: 24,
    marginTop: 24,
    marginBottom: 12,
  },
  previewButtonText: {
    fontFamily: Fonts.bold,
    fontSize: standardFontSize,
    color: "white",
  },
  saveButton: {
    backgroundColor: primaryColor,
    borderColor: primaryColor,
    borderRadius: 24,
    marginBottom: 12,
  },
  saveButtonText: {
    fontFamily: Fonts.bold,
    fontSize: standardFontSize,
    color: "white",
  },
  backButton: {
    borderWidth: 1,
    borderColor: lightGrey,
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: "center",
  },
  backButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: standardFontSize,
    color: blackFont,
  },
});
