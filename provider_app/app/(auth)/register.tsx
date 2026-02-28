import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import logoCyanImage from "@/assets/images/logo-dociebie.png";
import Button from "@/components/Button";
import LoginRegisterBottomText from "@/components/LoginRegisterBottomText";
import TextInputComponent from "@/components/TextInputComponent";
import {
  baseGrey,
  blackFont,
  greyedOutFont,
  greyFont,
  lightGrey,
  primaryColor,
  smallFontSize,
  standardFontSize,
} from "@/constants/style-vars";
import { Fonts } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";

export default function RegisterScreen() {
  const router = useRouter();
  const { register: registerUser, isAuthenticating } = useAuth();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmationPassword, setConfirmationPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onRegisterButtonPressed = async () => {
    if (isAuthenticating) return;

    if (password !== confirmationPassword) {
      setErrorMessage("Hasła nie są takie same.");
      return;
    }

    setErrorMessage(null);

    try {
      await registerUser(
        { email, password, name, surname, street, city, postalCode },
        { persist: true },
      );
      router.replace("/(dashboard)");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Nie udało się zarejestrować."
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Image
            source={logoCyanImage}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.formCard}>
            <Text style={styles.headerText}>Zarejestruj się</Text>
            <Text style={styles.subheaderText}>
              Wypełnij poniższe dane, aby utworzyć konto usługodawcy.
            </Text>

            <Text style={styles.label}>Imię</Text>
            <View style={styles.inputWrapper}>
              <TextInputComponent
                text={name}
                setText={setName}
                placeholderText="Jan"
                style={styles.inputField}
              />
            </View>

            <Text style={styles.label}>Nazwisko</Text>
            <View style={styles.inputWrapper}>
              <TextInputComponent
                text={surname}
                setText={setSurname}
                placeholderText="Kowalski"
                style={styles.inputField}
              />
            </View>

            <Text style={styles.label}>Ulica</Text>
            <View style={styles.inputWrapper}>
              <TextInputComponent
                text={street}
                setText={setStreet}
                placeholderText="ul. Przykładowa 1"
                style={styles.inputField}
              />
            </View>

            <View style={styles.codeAndCityWrapper}>
              <View style={styles.codeColumn}>
                <Text style={styles.label}>Kod pocztowy</Text>
                <View style={styles.inputWrapper}>
                  <TextInputComponent
                    text={postalCode}
                    setText={setPostalCode}
                    placeholderText="00-000"
                    style={styles.inputField}
                  />
                </View>
              </View>
              <View style={styles.cityColumn}>
                <Text style={styles.label}>Miasto</Text>
                <View style={styles.inputWrapper}>
                  <TextInputComponent
                    text={city}
                    setText={setCity}
                    placeholderText="Warszawa"
                    style={styles.inputField}
                  />
                </View>
              </View>
            </View>

            <Text style={styles.label}>Adres e-mail</Text>
            <View style={styles.inputWrapper}>
              <TextInputComponent
                text={email}
                setText={setEmail}
                placeholderText="akowalski@mail.com"
                style={styles.inputField}
              />
            </View>

            <Text style={styles.label}>Hasło</Text>
            <View style={styles.inputWrapper}>
              <TextInputComponent
                text={password}
                setText={setPassword}
                placeholderText="********"
                secureTextEntry
                style={styles.inputField}
              />
            </View>

            <Text style={styles.label}>Powtórz hasło</Text>
            <View style={styles.inputWrapper}>
              <TextInputComponent
                text={confirmationPassword}
                setText={setConfirmationPassword}
                placeholderText="********"
                secureTextEntry
                style={styles.inputField}
              />
            </View>

            {errorMessage ? (
              <Text style={styles.errorMessage}>{errorMessage}</Text>
            ) : null}

            <Button
              text="Zarejestruj się"
              onClick={onRegisterButtonPressed}
              disabled={isAuthenticating}
              style={styles.registerButton}
              textStyle={styles.registerButtonText}
            />
          </View>

          <View style={styles.bottomTextWrapper}>
            <LoginRegisterBottomText
              firstText="Masz już konto?"
              secondText="Zaloguj się"
              onClick={() => router.navigate("/(auth)/login")}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: baseGrey,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  container: {
    alignItems: "center",
  },
  logo: {
    width: 220,
    height: 60,
    alignSelf: "center",
    marginBottom: 32,
  },
  formCard: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
  },
  headerText: {
    fontSize: standardFontSize,
    fontFamily: Fonts.bold,
    color: blackFont,
    marginBottom: 4,
  },
  subheaderText: {
    color: greyedOutFont,
    fontSize: smallFontSize,
    fontFamily: Fonts.regular,
    marginBottom: 20,
  },
  label: {
    fontSize: smallFontSize,
    fontFamily: Fonts.semiBold,
    color: blackFont,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: lightGrey,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: "white",
  },
  inputField: {
    flex: 1,
    borderWidth: 0,
    paddingHorizontal: 0,
  },
  codeAndCityWrapper: {
    flexDirection: "row",
    gap: 8,
  },
  codeColumn: {
    width: 120,
  },
  cityColumn: {
    flex: 1,
  },
  registerButton: {
    backgroundColor: primaryColor,
    borderColor: primaryColor,
    borderRadius: 24,
  },
  registerButtonText: {
    fontFamily: Fonts.bold,
    fontSize: standardFontSize,
    color: "white",
  },
  bottomTextWrapper: {
    marginTop: 20,
  },
  errorMessage: {
    color: "#b42318",
    fontFamily: Fonts.regular,
    fontSize: smallFontSize,
    marginBottom: 12,
  },
});
