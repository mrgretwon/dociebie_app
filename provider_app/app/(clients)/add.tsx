import { useSafeBack } from "@/hooks/use-safe-back";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

import Header from "@/components/Header";
import TextInputComponent from "@/components/TextInputComponent";
import Button from "@/components/Button";
import {
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
import { createProviderClient } from "@/services/api";
import Svg, { Path } from "react-native-svg";
import { Toast } from "toastify-react-native";

export default function AddClientScreen() {
  const router = useRouter();
  const goBack = useSafeBack();
  const { token } = useAuth();
  const { short } = useLocalSearchParams<{ short?: string }>();
  const isShortForm = short === "1";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [cityPostal, setCityPostal] = useState("");
  const [street, setStreet] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!token) return;
    if (!firstName || !lastName || !email) {
      Toast.error("Wypełnij wymagane pola");
      return;
    }
    setSaving(true);
    try {
      await createProviderClient(
        { name: firstName, surname: lastName, email },
        token
      );
      Toast.success("Klient został dodany");
      goBack();
    } catch {
      Toast.error("Nie udało się dodać klienta");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.root}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Dodawanie klienta</Text>
          <Text style={styles.subtitle}>
            Wprowadź dane nowego użytkownika, hasło zostanie wysłane na wskazany
            adres e-mail.
          </Text>

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

          {!isShortForm && (
            <>
              <Text style={styles.sectionLabel}>Dane Adresowe</Text>
              <TextInputComponent
                text={cityPostal}
                setText={setCityPostal}
                placeholderText="71-621, Szczecin"
                style={styles.input}
              />
              <TextInputComponent
                text={street}
                setText={setStreet}
                placeholderText="ul. Śląska 12C/3"
                style={styles.input}
              />
            </>
          )}

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
              placeholderText="akowalski@mail.com"
              style={styles.inputNoBorder}
            />
          </View>
        </View>

        <View style={styles.bottomButtons}>
          <Button
            text={saving ? "Tworzenie..." : "Stwórz"}
            onClick={handleCreate}
            style={styles.createButton}
            textStyle={styles.createButtonText}
            disabled={saving}
          />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => goBack()}
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
    flexGrow: 1,
  },
  content: {
    padding: 20,
    flex: 1,
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
  bottomButtons: {
    padding: 20,
    gap: 12,
  },
  createButton: {
    backgroundColor: primaryColor,
    borderColor: primaryColor,
    borderRadius: 24,
  },
  createButtonText: {
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
