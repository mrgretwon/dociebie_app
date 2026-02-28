import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
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
import Svg, { Path } from "react-native-svg";

export default function LoginScreen() {
  const router = useRouter();
  const { login, isAuthenticating } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onLoginButtonPressed = async () => {
    if (isAuthenticating) return;
    setErrorMessage(null);

    try {
      await login({ email, password }, { persist: true });
      router.replace("/(dashboard)");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Nie udało się zalogować."
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
            <Text style={styles.label}>Adres e-mail</Text>
            <View style={styles.inputWrapper}>
              <Svg
                width={20}
                height={16}
                viewBox="0 0 20 16"
                fill="none"
                style={styles.inputIcon}
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
                style={styles.inputField}
              />
            </View>

            <Text style={styles.label}>Hasło</Text>
            <View style={styles.inputWrapper}>
              <Svg
                width={18}
                height={20}
                viewBox="0 0 18 20"
                fill="none"
                style={styles.inputIcon}
              >
                <Path
                  d="M14 7V5C14 2.24 11.76 0 9 0C6.24 0 4 2.24 4 5V7C2.9 7 2 7.9 2 9V17C2 18.1 2.9 19 4 19H14C15.1 19 16 18.1 16 17V9C16 7.9 15.1 7 14 7ZM9 15C7.9 15 7 14.1 7 13C7 11.9 7.9 11 9 11C10.1 11 11 11.9 11 13C11 14.1 10.1 15 9 15ZM12 7H6V5C6 3.34 7.34 2 9 2C10.66 2 12 3.34 12 5V7Z"
                  fill={greyedOutFont}
                />
              </Svg>
              <TextInputComponent
                text={password}
                setText={setPassword}
                placeholderText="********"
                secureTextEntry
                style={styles.inputField}
              />
            </View>

            {errorMessage ? (
              <Text style={styles.errorMessage}>{errorMessage}</Text>
            ) : null}

            <Button
              text="Zaloguj się"
              onClick={onLoginButtonPressed}
              disabled={isAuthenticating}
              style={styles.loginButton}
              textStyle={styles.loginButtonText}
            />

            <TouchableOpacity style={styles.recoverButton}>
              <Text style={styles.recoverButtonText}>Odzyskaj hasło</Text>
            </TouchableOpacity>

            <View style={styles.orContainer}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>LUB</Text>
              <View style={styles.orLine} />
            </View>

            <SocialButton icon="google" label="Zaloguj przy użyciu Google" />
            <SocialButton
              icon="facebook"
              label="Zaloguj przy użyciu Facebooka"
            />
            <SocialButton icon="apple" label="Zaloguj przez Apple" />
          </View>

          <View style={styles.bottomTextWrapper}>
            <LoginRegisterBottomText
              firstText="Nie masz jeszcze konta?"
              secondText="Zarejestruj się"
              onClick={() => router.navigate("/(auth)/register")}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SocialButton({ icon, label }: { icon: string; label: string }) {
  return (
    <TouchableOpacity style={styles.socialButton}>
      <View style={styles.socialIconContainer}>
        {icon === "google" && (
          <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
            <Path
              d="M19.8 10.2C19.8 9.5 19.7 8.8 19.6 8.2H10.2V12H15.6C15.4 13.3 14.6 14.4 13.4 15.1V17.6H16.7C18.7 15.8 19.8 13.2 19.8 10.2Z"
              fill="#4285F4"
            />
            <Path
              d="M10.2 20C12.9 20 15.2 19.1 16.7 17.6L13.4 15.1C12.5 15.7 11.4 16.1 10.2 16.1C7.6 16.1 5.4 14.3 4.6 11.9H1.2V14.5C2.8 17.6 6.2 20 10.2 20Z"
              fill="#34A853"
            />
            <Path
              d="M4.6 11.9C4.4 11.3 4.3 10.7 4.3 10C4.3 9.3 4.4 8.7 4.6 8.1V5.5H1.2C0.4 7 0 8.5 0 10C0 11.5 0.4 13 1.2 14.5L4.6 11.9Z"
              fill="#FBBC05"
            />
            <Path
              d="M10.2 3.9C11.5 3.9 12.7 4.4 13.6 5.3L16.8 2.1C15.2 0.6 12.9 -0.2 10.2 0C6.2 0 2.8 2.4 1.2 5.5L4.6 8.1C5.4 5.7 7.6 3.9 10.2 3.9Z"
              fill="#EA4335"
            />
          </Svg>
        )}
        {icon === "facebook" && (
          <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
            <Path
              d="M20 10C20 4.48 15.52 0 10 0C4.48 0 0 4.48 0 10C0 14.84 3.44 18.87 8 19.8V13H6V10H8V7.5C8 5.57 9.57 4 11.5 4H14V7H12C11.45 7 11 7.45 11 8V10H14V13H11V19.95C16.05 19.45 20 15.19 20 10Z"
              fill="#1877F2"
            />
          </Svg>
        )}
        {icon === "apple" && (
          <Svg width={18} height={20} viewBox="0 0 18 20" fill="none">
            <Path
              d="M14.94 10.56C14.91 7.84 17.18 6.52 17.29 6.46C15.97 4.55 13.94 4.3 13.22 4.28C11.49 4.1 9.81 5.3 8.93 5.3C8.03 5.3 6.68 4.3 5.22 4.33C3.35 4.36 1.61 5.43 0.66 7.12C-1.31 10.55 0.16 15.58 2.04 18.37C2.99 19.73 4.1 21.26 5.56 21.2C6.99 21.14 7.53 20.28 9.22 20.28C10.89 20.28 11.4 21.2 12.89 21.17C14.42 21.14 15.38 19.8 16.29 18.42C17.37 16.84 17.79 15.3 17.81 15.22C17.77 15.21 14.97 14.12 14.94 10.56Z"
              fill="#000000"
            />
          </Svg>
        )}
      </View>
      <Text style={styles.socialButtonText}>{label}</Text>
    </TouchableOpacity>
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
  inputIcon: {
    marginRight: 8,
  },
  inputField: {
    flex: 1,
    borderWidth: 0,
    paddingHorizontal: 0,
  },
  loginButton: {
    backgroundColor: primaryColor,
    borderColor: primaryColor,
    borderRadius: 24,
    marginBottom: 12,
  },
  loginButtonText: {
    fontFamily: Fonts.bold,
    fontSize: standardFontSize,
    color: "white",
  },
  recoverButton: {
    borderWidth: 1,
    borderColor: lightGrey,
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  recoverButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: standardFontSize,
    color: blackFont,
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: lightGrey,
  },
  orText: {
    marginHorizontal: 12,
    fontSize: smallFontSize,
    fontFamily: Fonts.regular,
    color: greyedOutFont,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: lightGrey,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  socialIconContainer: {
    width: 24,
    alignItems: "center",
    marginRight: 12,
  },
  socialButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: smallFontSize,
    color: blackFont,
  },
  errorMessage: {
    color: "#b42318",
    fontFamily: Fonts.regular,
    fontSize: smallFontSize,
    marginBottom: 12,
  },
  bottomTextWrapper: {
    marginTop: 20,
  },
});
