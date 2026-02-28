import { useSafeBack } from "@/hooks/use-safe-back";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import Header from "@/components/Header";
import Spinner from "@/components/Spinner";
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
import { fetchProviderBankAccount, updateProviderBankAccount } from "@/services/api";
import { Toast } from "toastify-react-native";

export default function BankAccountScreen() {
  const router = useRouter();
  const goBack = useSafeBack();
  const { token } = useAuth();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const isAssignMode = tab === "assign";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Current bank info from API
  const [currentBankName, setCurrentBankName] = useState("");
  const [currentAccountNumber, setCurrentAccountNumber] = useState("");
  const [currentHolder, setCurrentHolder] = useState("");

  // Bank account update state
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [assignedPerson, setAssignedPerson] = useState("");

  // Assign to service state
  const [serviceName, setServiceName] = useState("");
  const [serviceAccountNumber, setServiceAccountNumber] = useState("");

  useEffect(() => {
    const loadData = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const data = await fetchProviderBankAccount(token);
        setCurrentBankName(String(data.bank_name ?? ""));
        setCurrentAccountNumber(String(data.bank_account_number ?? ""));
        setCurrentHolder(String(data.bank_holder_name ?? ""));
        setBankName(String(data.bank_name ?? ""));
        setAccountNumber(String(data.bank_account_number ?? ""));
        setAssignedPerson(String(data.bank_holder_name ?? ""));
      } catch {
        Toast.error("Nie udało się pobrać danych rachunku");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token]);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      await updateProviderBankAccount(
        {
          bank_name: bankName,
          bank_account_number: accountNumber,
          bank_holder_name: assignedPerson,
        },
        token
      );
      Toast.success("Dane rachunku zostały zapisane");
      goBack();
    } catch {
      Toast.error("Nie udało się zapisać danych rachunku");
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

  if (isAssignMode) {
    return (
      <View style={styles.root}>
        <Header />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text style={styles.title}>
              Przypisywanie rachunku do usługi
            </Text>
            <Text style={styles.subtitle}>
              Przypisz usługi do numeru rachunku, powiązanie usługi z kontem,
              pomoże separować płatności.
            </Text>

            <Text style={styles.sectionTitle}>Przypisz do usługi</Text>

            <Text style={styles.fieldLabel}>Nazwa usługi</Text>
            <TextInputComponent
              text={serviceName}
              setText={setServiceName}
              placeholderText="Nazwa usługi"
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>Numer konta</Text>
            <TextInputComponent
              text={serviceAccountNumber}
              setText={setServiceAccountNumber}
              placeholderText="Numer konta"
              style={styles.input}
            />
          </View>

          <View style={styles.bottomButtons}>
            <Button
              text="Zapisz"
              onClick={() => goBack()}
              style={styles.saveButton}
              textStyle={styles.saveButtonText}
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

  return (
    <View style={styles.root}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Aktualny rachunek bankowy</Text>
          <Text style={styles.infoText}>Nazwa banku: {currentBankName || "Brak"}</Text>
          <Text style={styles.infoText}>
            Numer konta: {currentAccountNumber || "Brak"}
          </Text>
          <Text style={styles.infoText}>
            Przypisana osoba: {currentHolder || "Brak"}
          </Text>

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
            Wprowadź nowy rachunek bankowy
          </Text>

          <Text style={styles.fieldLabel}>Nazwa banku</Text>
          <TextInputComponent
            text={bankName}
            setText={setBankName}
            placeholderText="Nazwa banku"
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>Numer konta</Text>
          <TextInputComponent
            text={accountNumber}
            setText={setAccountNumber}
            placeholderText="Numer konta"
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>Przypisana osoba</Text>
          <TextInputComponent
            text={assignedPerson}
            setText={setAssignedPerson}
            placeholderText="Imię i nazwisko"
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
    fontSize: largestFontSize,
    fontFamily: Fonts.bold,
    color: blackFont,
    marginBottom: 8,
  },
  infoText: {
    fontSize: smallFontSize,
    fontFamily: Fonts.regular,
    color: greyedOutFont,
    marginBottom: 2,
  },
  fieldLabel: {
    fontSize: smallFontSize,
    fontFamily: Fonts.semiBold,
    color: blackFont,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    marginBottom: 8,
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
