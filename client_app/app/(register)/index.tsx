import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import logoCyanImage from "@/assets/images/logo-dociebie.png";
import Button from "@/components/Button";
import LoginRegisterBottomText from "@/components/LoginRegisterBottomText";
import TextInHorizontalLine from "@/components/TextInHorizontalLine";
import TextInputComponent from "@/components/TextInputComponent";
import {
  baseGrey,
  blackFont,
  greyedOutFont,
  greyFont,
  largestFontSize,
} from "@/constants/style-vars";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "@/hooks/use-translations";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RegisterScreen() {
  const router = useRouter();
  const translate = useTranslations();
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
    if (isAuthenticating) {
      return;
    }

    if (password !== confirmationPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setErrorMessage(null);

    try {
      await registerUser(
        { email, password, name, surname, street, city, postalCode },
        { persist: true },
      );
      router.replace("/(home)");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to register.");
    }
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentWrapper}>
        <Image source={logoCyanImage} style={styles.logo} />
        <Text style={styles.headerText}>{translate("REGISTER")}</Text>
        <Text style={styles.registerInfoText}>{translate("REGISTRATION_INFO")}</Text>

        <Text style={styles.sectionText}>{translate("NAME_AND_SURNAME")}</Text>
        <TextInputComponent
          text={name}
          setText={setName}
          placeholderText={translate("NAME")}
          style={{ marginBottom: 8 }}
        />
        <TextInputComponent
          text={surname}
          setText={setSurname}
          placeholderText={translate("SURNAME")}
          style={{ marginBottom: 16 }}
        />

        <Text style={styles.sectionText}>{translate("ADDRESS_DATA")}</Text>
        <TextInputComponent
          text={street}
          setText={setStreet}
          placeholderText={translate("STREET")}
          style={{ marginBottom: 8 }}
        />
        <View style={styles.codeAndCityWrapper}>
          <TextInputComponent
            text={postalCode}
            setText={setPostalCode}
            placeholderText={"11-111"}
            style={styles.code}
          />
          <TextInputComponent
            text={city}
            setText={setCity}
            placeholderText={translate("CITY")}
            style={styles.city}
          />
        </View>

        <Text style={styles.sectionText}>{translate("EMAIL_ADDRESS")}</Text>
        <TextInputComponent
          text={email}
          setText={setEmail}
          placeholderText={translate("EMAIL_ADDRESS")}
          style={{ marginBottom: 16 }}
        />

        <Text style={styles.sectionText}>{translate("PASSWORD")}</Text>
        <TextInputComponent
          text={password}
          setText={setPassword}
          placeholderText={translate("PASSWORD")}
          secureTextEntry
          style={{ marginBottom: 8 }}
        />
        <TextInputComponent
          text={confirmationPassword}
          setText={setConfirmationPassword}
          placeholderText={translate("REPEAT_PASSWORD")}
          secureTextEntry
          style={{ marginBottom: 32 }}
        />
        {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
        <Button text={translate("REGISTER")} onClick={onRegisterButtonPressed} />
        <View style={styles.textWithLineWrapper}>
          <TextInHorizontalLine text={translate("OR")} />
        </View>
        <Button
          // type={PlainButtonType.White}
          text={translate("REGISTER_VIA_GOOGLE")}
          onClick={() => null}
          style={styles.googleButton}
          textStyle={{ color: blackFont }}
        />
        {/* <Button
					// type={PlainButtonType.White}
					text="Zaloguj się przy użyciu Facebooka"
					onClick={() => null}
					style={{ marginBottom: spacing * 1.5 }}
				/>

				<Button
					// type={PlainButtonType.White}
					text="Zaloguj się przy użyciu Apple"
					onClick={() => null}
					style={{ marginBottom: spacing * 4 }}
				/> */}
        <LoginRegisterBottomText
          firstText={translate("DO_YOU_HAVE_ACCOUNT")}
          secondText={translate("LOG_IN")}
          onClick={() => router.navigate("/(login)")}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    padding: 16,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    backgroundColor: baseGrey,
  },
  contentWrapper: {
    width: "100%",
  },
  headerText: {
    fontSize: largestFontSize,
    color: blackFont,
    fontWeight: "600",
  },
  textWithLineWrapper: {
    marginVertical: 16,
  },
  logo: {
    width: 260,
    aspectRatio: 1582 / 310,
    alignSelf: "center",
    marginBottom: 24,
  },
  googleButton: {
    marginBottom: 12,
    backgroundColor: "white",
  },
  registerInfoText: {
    color: greyedOutFont,
    marginTop: 8,
    marginBottom: 24,
  },
  sectionText: {
    color: greyFont,
    marginBottom: 6,
  },
  codeAndCityWrapper: {
    maxWidth: "100%",
    display: "flex",
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  code: {
    width: 100,
  },
  city: {
    flexGrow: 1,
    width: "auto",
  },
  errorMessage: {
    color: "#b42318",
    marginBottom: 12,
  },
});
