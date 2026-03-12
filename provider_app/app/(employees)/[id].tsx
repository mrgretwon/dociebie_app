import { useSafeBack } from "@/hooks/use-safe-back";
import React, { useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
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
  smallerFontSize,
} from "@/constants/style-vars";
import { Fonts } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchProviderEmployee,
  createProviderEmployee,
  updateProviderEmployee,
  uploadProviderEmployeeImage,
  deleteProviderEmployee,
} from "@/services/api";
import { Toast } from "toastify-react-native";

export default function EditEmployeeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const goBack = useSafeBack();
  const { token } = useAuth();
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    if (isNew || !token) { setLoading(false); return; }
    const loadData = async () => {
      try {
        const employee = await fetchProviderEmployee(Number(id), token);
        setName(employee.name);
        setSurname(employee.surname);
        setImageUri(employee.image);
      } catch {
        Toast.error("Nie udało się pobrać danych pracownika");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token, id, isNew]);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      if (isNew) {
        if (!name) {
          Toast.error("Wypełnij imię pracownika");
          setSaving(false);
          return;
        }
        await createProviderEmployee({ name, surname }, token);
        Toast.success("Pracownik został dodany");
      } else {
        await updateProviderEmployee(Number(id), { name, surname }, token);
        Toast.success("Dane pracownika zostały zaktualizowane");
      }
      goBack();
    } catch {
      Toast.error("Nie udało się zapisać danych pracownika");
    } finally {
      setSaving(false);
    }
  };

  const handlePickImage = async () => {
    if (isNew || !token) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const pickedUri = result.assets[0].uri;
    try {
      const updated = await uploadProviderEmployeeImage(Number(id), pickedUri, token);
      setImageUri(updated.image ?? pickedUri);
      Toast.success("Zdjęcie zostało zaktualizowane");
    } catch {
      Toast.error("Nie udało się przesłać zdjęcia");
    }
  };

  const handleDelete = async () => {
    if (!token || isNew) return;
    try {
      await deleteProviderEmployee(Number(id), token);
      Toast.success("Pracownik został usunięty");
      goBack();
    } catch {
      Toast.error("Nie udało się usunąć pracownika");
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Text style={styles.title}>
            {isNew ? "Dodaj pracownika" : "Edytuj pracownika"}
          </Text>
          <Text style={styles.subtitle}>
            {isNew
              ? "Dodaj nowego pracownika do swojego salonu."
              : "Edytuj dane pracownika."}
          </Text>

          {!isNew && (
            <TouchableOpacity onPress={handlePickImage} style={styles.imageSection}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.placeholderText}>
                    {(name[0] ?? "").toUpperCase()}
                    {(surname[0] ?? "").toUpperCase()}
                  </Text>
                </View>
              )}
              <Text style={styles.changeImageText}>Zmień zdjęcie</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.fieldLabel}>Imię</Text>
          <TextInputComponent
            text={name}
            setText={setName}
            placeholderText="Imię pracownika"
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>Nazwisko</Text>
          <TextInputComponent
            text={surname}
            setText={setSurname}
            placeholderText="Nazwisko pracownika"
            style={styles.input}
          />
        </View>

        <View style={styles.bottomButtons}>
          <Button
            text={saving ? "Zapisywanie..." : "Zapisz"}
            onClick={handleSave}
            style={styles.saveButton}
            textStyle={styles.saveButtonText}
            disabled={saving}
          />
          {!isNew && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Text style={styles.deleteButtonText}>Usuń pracownika</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => goBack()}
          >
            <Text style={styles.backButtonText}>Wróć</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
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
  imageSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: baseGrey,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: largestFontSize,
    fontFamily: Fonts.bold,
    color: greyedOutFont,
  },
  changeImageText: {
    fontSize: smallerFontSize,
    fontFamily: Fonts.regular,
    color: primaryColor,
    marginTop: 8,
  },
  fieldLabel: {
    fontSize: standardFontSize,
    fontFamily: Fonts.bold,
    color: primaryColor,
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    marginBottom: 12,
    borderColor: lightGrey,
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
  deleteButton: {
    borderWidth: 1,
    borderColor: "#e74c3c",
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: "center",
  },
  deleteButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: standardFontSize,
    color: "#e74c3c",
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
