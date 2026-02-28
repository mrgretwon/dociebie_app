import { useSafeBack } from "@/hooks/use-safe-back";
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
import { createProviderClientGroup } from "@/services/api";
import Svg, { Path } from "react-native-svg";
import { Toast } from "toastify-react-native";

export default function CreateGroupScreen() {
  const router = useRouter();
  const goBack = useSafeBack();
  const { token } = useAuth();

  const [groupName, setGroupName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!token || !groupName) {
      Toast.error("Wprowadź nazwę grupy");
      return;
    }
    setSaving(true);
    try {
      await createProviderClientGroup({ name: groupName }, token);
      Toast.success("Grupa została utworzona");
      goBack();
    } catch {
      Toast.error("Nie udało się utworzyć grupy");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.root}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Stwórz nową grupę</Text>
          <Text style={styles.subtitle}>
            Grupy pomagają łatwiej zarządzać klientami.
          </Text>

          <Text style={styles.sectionLabel}>Nazwa grupy</Text>
          <TextInputComponent
            text={groupName}
            setText={setGroupName}
            placeholderText="Wprowadź nazwę grupy"
            style={styles.input}
          />

          <Text style={styles.sectionLabel}>Zdjęcie grupy</Text>
          <View style={styles.photoRow}>
            <View style={styles.photoAvatar}>
              <Svg width={32} height={32} viewBox="0 0 40 40" fill="none">
                <Path
                  d="M20 0C8.96 0 0 8.96 0 20C0 31.04 8.96 40 20 40C31.04 40 40 31.04 40 20C40 8.96 31.04 0 20 0ZM20 6C23.32 6 26 8.68 26 12C26 15.32 23.32 18 20 18C16.68 18 14 15.32 14 12C14 8.68 16.68 6 20 6ZM20 34.4C15 34.4 10.58 31.84 8 27.92C8.06 23.96 16 21.8 20 21.8C23.98 21.8 31.94 23.96 32 27.92C29.42 31.84 25 34.4 20 34.4Z"
                  fill={lightGrey}
                />
              </Svg>
            </View>
            <TouchableOpacity style={styles.photoButton}>
              <Text style={styles.photoButtonText}>Zmień zdjęcie</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoButtonOutline}>
              <Text style={styles.photoButtonOutlineText}>Usuń zdjęcie</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionLabel}>
            Przypisz klienta (opcjonalne)
          </Text>
          <TextInputComponent
            text={clientEmail}
            setText={setClientEmail}
            placeholderText="Wprowadz adres email"
            style={styles.input}
          />
          <TouchableOpacity>
            <Text style={styles.linkText}>Stwórz nowego klienta</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomButtons}>
          <Button
            text={saving ? "Tworzenie..." : "Zapisz grupę"}
            onClick={handleSave}
            style={styles.saveButton}
            textStyle={styles.saveButtonText}
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
    fontSize: standardFontSize,
    fontFamily: Fonts.bold,
    color: blackFont,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    marginBottom: 12,
    borderColor: lightGrey,
  },
  photoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  photoAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: baseGrey,
    alignItems: "center",
    justifyContent: "center",
  },
  photoButton: {
    backgroundColor: primaryColor,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  photoButtonText: {
    fontSize: smallFontSize,
    fontFamily: Fonts.semiBold,
    color: "white",
  },
  photoButtonOutline: {
    borderWidth: 1,
    borderColor: primaryColor,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  photoButtonOutlineText: {
    fontSize: smallFontSize,
    fontFamily: Fonts.semiBold,
    color: primaryColor,
  },
  linkText: {
    fontSize: smallFontSize,
    fontFamily: Fonts.regular,
    color: greyedOutFont,
  },
  bottomButtons: {
    padding: 20,
    gap: 12,
  },
  saveButton: {
    backgroundColor: primaryColor,
    borderColor: primaryColor,
    borderRadius: 24,
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
