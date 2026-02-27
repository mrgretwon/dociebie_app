import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import logoCyanImage from "@/assets/images/logo-cyan.png";
import Button from "@/components/Button";
import TextInputComponent from "@/components/TextInputComponent";
import {
  baseGrey,
  blackFont,
  greyedOutFont,
  greyFont,
  largestFontSize,
  smallFontSize,
} from "@/constants/style-vars";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "@/hooks/use-translations";
import { Checkbox } from "expo-checkbox";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import LoginRegisterBottomText from "../../components/LoginRegisterBottomText";

export default function LoginScreen() {
  const router = useRouter();
  const translate = useTranslations();
  const { login, isAuthenticating } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [shouldRememberUser, setShouldRememberUser] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onLoginButtonPressed = async () => {
    if (isAuthenticating) {
      return;
    }

    setErrorMessage(null);

    try {
      await login({ email, password }, { persist: shouldRememberUser });
      router.replace("/(home)");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to log in.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <Image source={logoCyanImage} style={styles.logo} contentFit="cover" />

        <TextInputComponent
          text={email}
          setText={setEmail}
          placeholderText={translate("EMAIL_ADDRESS")}
          style={{ marginBottom: 16 }}
        />

        <TextInputComponent
          text={password}
          setText={setPassword}
          placeholderText={translate("PASSWORD")}
          secureTextEntry
          style={{ marginBottom: 32 }}
        />

        <View style={styles.actionsBelowInputsContainer}>
          <View style={styles.rememberMeWrapper}>
            <Checkbox
              value={shouldRememberUser}
              onValueChange={setShouldRememberUser}
              color={greyFont}
              style={styles.checkbox}
            />
            <Text style={styles.actionsText}>{translate("REMEMBER_ME")}</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.actionsText}>{translate("FORGOT_PASSWORD")}</Text>
          </TouchableOpacity>
        </View>

        {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}

        <Button
          text={translate("LOG_IN")}
          onClick={onLoginButtonPressed}
          style={{ marginBottom: 16 }}
        />

        <Button
          // type={PlainButtonType.White}
          text={translate("LOGIN_VIA_GOOGLE")}
          onClick={() => null}
          style={styles.googleButton}
          textStyle={{ color: blackFont }}
        />

        <LoginRegisterBottomText
          firstText={translate("NO_ACCOUNT_YET")}
          secondText={translate("REGISTER")}
          onClick={() => router.navigate("/(register)")}
        />
      </View>
    </View>
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
    display: "flex",
    width: "100%",
  },
  headerText: {
    fontSize: largestFontSize,
    color: blackFont,
    marginBottom: 4,
    fontWeight: "600",
  },
  subheaderText: {
    color: greyedOutFont,
    marginBottom: 32,
  },
  actionsBelowInputsContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  rememberMeWrapper: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  actionsText: {
    fontSize: smallFontSize,
    color: greyFont,
  },
  checkbox: {
    marginRight: 8,
  },
  logo: {
    width: 200,
    aspectRatio: 3,
    alignSelf: "center",
    marginBottom: 24,
  },
  googleButton: {
    marginBottom: 32,
    backgroundColor: "white",
  },
  errorMessage: {
    color: "#b42318",
    marginBottom: 12,
  },
});
