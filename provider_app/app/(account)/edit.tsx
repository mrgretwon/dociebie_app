import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";

import Header from "@/components/Header";
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
import { updateUserProfileData } from "@/services/api";
import Svg, { Path } from "react-native-svg";
import { Toast } from "toastify-react-native";

export default function EditAccountScreen() {
  const router = useRouter();
  const { user, token } = useAuth();

  const [firstName, setFirstName] = useState(user?.name ?? "");
  const [lastName, setLastName] = useState(user?.surname ?? "");
  const [cityPostal, setCityPostal] = useState(
    user ? `${user.postalCode}, ${user.city}` : ""
  );
  const [street, setStreet] = useState(user?.street ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const data: Record<string, string> = {};
      if (firstName !== user?.name) data.name = firstName;
      if (lastName !== user?.surname) data.surname = lastName;
      if (email !== user?.email) data.email = email;
      if (password && password !== "********") data.newPassword = password;

      await updateUserProfileData(data, token);
      router.back();
    } catch {
      Toast.error("Zapis danych nie powiódł się");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.root}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Edycja konta</Text>
          <Text style={styles.subtitle}>
            Aktualizuj swoje dane teleadresowe
          </Text>

          <View style={styles.userRow}>
            <View style={styles.avatarContainer}>
              <Svg width={40} height={40} viewBox="0 0 40 40" fill="none">
                <Path
                  d="M20 0C8.96 0 0 8.96 0 20C0 31.04 8.96 40 20 40C31.04 40 40 31.04 40 20C40 8.96 31.04 0 20 0ZM20 6C23.32 6 26 8.68 26 12C26 15.32 23.32 18 20 18C16.68 18 14 15.32 14 12C14 8.68 16.68 6 20 6ZM20 34.4C15 34.4 10.58 31.84 8 27.92C8.06 23.96 16 21.8 20 21.8C23.98 21.8 31.94 23.96 32 27.92C29.42 31.84 25 34.4 20 34.4Z"
                  fill={lightGrey}
                />
              </Svg>
            </View>
            <View>
              <Text style={styles.userName}>
                {firstName} {lastName}
              </Text>
              <Text style={styles.userEmail}>{email}</Text>
            </View>
          </View>

          <TouchableOpacity>
            <Text style={styles.removePhotoText}>Usuń zdjęcie</Text>
          </TouchableOpacity>

          <Text style={styles.sectionLabel}>Imię i Nazwisko</Text>
          <TextInputComponent
            text={firstName}
            setText={setFirstName}
            placeholderText="Imię"
            style={styles.input}
          />
          <TextInputComponent
            text={lastName}
            setText={setLastName}
            placeholderText="Nazwisko"
            style={styles.input}
          />

          <Text style={styles.sectionLabel}>Dane Adresowe</Text>
          <TextInputComponent
            text={cityPostal}
            setText={setCityPostal}
            placeholderText="Kod pocztowy, Miasto"
            style={styles.input}
          />
          <TextInputComponent
            text={street}
            setText={setStreet}
            placeholderText="Ulica"
            style={styles.input}
          />

          <Text style={styles.sectionLabel}>Adres e-mail</Text>
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
              text={email}
              setText={setEmail}
              placeholderText="Adres e-mail"
              style={styles.inputNoBorder}
            />
          </View>

          <Text style={styles.sectionLabel}>Hasło</Text>
          <TextInputComponent
            text={password}
            setText={setPassword}
            placeholderText="Nowe hasło"
            secureTextEntry
            style={styles.input}
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
            onPress={() => router.navigate("/(dashboard)")}
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
    marginBottom: 20,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: baseGrey,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  userName: {
    fontSize: standardFontSize,
    fontFamily: Fonts.bold,
    color: blackFont,
  },
  userEmail: {
    fontSize: smallFontSize,
    fontFamily: Fonts.regular,
    color: greyedOutFont,
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
    marginTop: 16,
  },
  input: {
    marginBottom: 12,
    borderColor: lightGrey,
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
  saveButton: {
    backgroundColor: primaryColor,
    borderColor: primaryColor,
    borderRadius: 24,
    marginTop: 24,
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
