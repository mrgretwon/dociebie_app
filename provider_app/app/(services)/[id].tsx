import { useSafeBack } from "@/hooks/use-safe-back";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

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
  fetchProviderService,
  createProviderService,
  updateProviderService,
  deleteProviderService,
} from "@/services/api";
import Svg, { Path } from "react-native-svg";
import { Toast } from "toastify-react-native";

export default function EditServiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const goBack = useSafeBack();
  const { token } = useAuth();
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [serviceName, setServiceName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [originalService, setOriginalService] = useState<{
    name: string;
    price: string;
    minutes_duration: number;
  } | null>(null);

  useEffect(() => {
    if (isNew || !token) { setLoading(false); return; }
    const loadData = async () => {
      try {
        const service = await fetchProviderService(Number(id), token);
        setOriginalService(service);
        setServiceName(service.name);
        setPrice(String(service.price));
        setDuration(String(service.minutes_duration));
      } catch {
        Toast.error("Nie udało się pobrać danych usługi");
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
        if (!serviceName || !price || !duration) {
          Toast.error("Wypełnij wszystkie pola");
          setSaving(false);
          return;
        }
        await createProviderService(
          { name: serviceName, price, minutes_duration: Number(duration) },
          token
        );
        Toast.success("Usługa została utworzona");
      } else {
        await updateProviderService(
          Number(id),
          { name: serviceName, price, minutes_duration: Number(duration) },
          token
        );
        Toast.success("Usługa została zaktualizowana");
      }
      goBack();
    } catch {
      Toast.error("Nie udało się zapisać usługi");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!token || isNew) return;
    try {
      await deleteProviderService(Number(id), token);
      Toast.success("Usługa została usunięta");
      goBack();
    } catch {
      Toast.error("Nie udało się usunąć usługi");
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

  const formatPrice = (p: string | number) => {
    const num = Number(p);
    return isNaN(num) ? p : `${num.toFixed(2).replace(".", ",")} zł`;
  };

  return (
    <View style={styles.root}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>
            {isNew ? "Stwórz nową usługę" : "Edytuj usługę"}
          </Text>
          <Text style={styles.subtitle}>
            {isNew
              ? "Stwórz nową usługę z odpowiednimi parametrami."
              : "Edytuj dostępne parametry usług."}
          </Text>

          <Text style={styles.sectionTitle}>
            {isNew ? "Podsumowanie" : "Edytujesz"}
          </Text>

          {originalService && (
            <View style={styles.serviceRow}>
              <View style={styles.serviceAvatar}>
                <Svg width={32} height={32} viewBox="0 0 40 40" fill="none">
                  <Path
                    d="M20 0C8.96 0 0 8.96 0 20C0 31.04 8.96 40 20 40C31.04 40 40 31.04 40 20C40 8.96 31.04 0 20 0Z"
                    fill={lightGrey}
                  />
                </Svg>
              </View>
              <View>
                <Text style={styles.serviceName}>{originalService.name}</Text>
                <Text style={styles.serviceDetail}>
                  Cena domyślna: {formatPrice(originalService.price)}
                </Text>
                <Text style={styles.serviceDetail}>
                  Slot czasowy: {originalService.minutes_duration} min
                </Text>
              </View>
            </View>
          )}

          <Text style={styles.fieldLabel}>Nazwa usługi</Text>
          <TextInputComponent
            text={serviceName}
            setText={setServiceName}
            placeholderText="Nazwa usługi"
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>Cena domyślna</Text>
          <TextInputComponent
            text={price}
            setText={setPrice}
            placeholderText="np. 60.00"
            style={styles.smallInput}
          />

          <Text style={styles.fieldLabel}>Czas trwania (minuty)</Text>
          <TextInputComponent
            text={duration}
            setText={setDuration}
            placeholderText="np. 45"
            style={styles.smallInput}
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
              <Text style={styles.deleteButtonText}>Usuń usługę</Text>
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
  sectionTitle: {
    fontSize: standardFontSize,
    fontFamily: Fonts.bold,
    color: primaryColor,
    marginBottom: 12,
  },
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  serviceAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: baseGrey,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  serviceName: {
    fontSize: standardFontSize,
    fontFamily: Fonts.bold,
    color: blackFont,
  },
  serviceDetail: {
    fontSize: smallerFontSize,
    fontFamily: Fonts.regular,
    color: greyedOutFont,
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
  smallInput: {
    width: 150,
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
