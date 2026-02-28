import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "@/components/Button";
import TextInputComponent from "@/components/TextInputComponent";
import {
  blackFont,
  greyedOutFont,
  greyFont,
  largeFontSize,
  smallerFontSize,
  smallFontSize,
} from "@/constants/style-vars";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "@/hooks/use-translations";
import { ProfileUpdateDto } from "@/models/data-models/profile";
import { updateUserProfileData } from "@/services/api";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function UserDataScreen() {
  const router = useRouter();
  const translate = useTranslations();
  const { user, token, refreshProfile } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [surname, setSurname] = useState(user?.surname ?? "");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateUserProfile = async () => {
    setErrorMessage(null);

    if (password && password !== passwordConfirm) {
      setErrorMessage(translate("PASSWORDS_DO_NOT_MATCH") ?? "Hasła nie są takie same.");
      return;
    }

    if (!token) return;

    const changedData: ProfileUpdateDto = {
      name: name !== user?.name ? name : undefined,
      surname: surname !== user?.surname ? surname : undefined,
      email: email !== user?.email ? email : undefined,
      newPassword: password || undefined,
    };

    const success = await updateUserProfileData(changedData, token);
    if (success) {
      await refreshProfile();
      router.back();
    }
  };

  return (
    <SafeAreaView edges={["top"]}>
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <AntDesign name="close" size={32} color="black" onPress={() => router.back()} />

          <View style={styles.panelContainer}>
            <Text style={styles.headerText}>{translate("EDIT_ACCOUNT")}</Text>
            <Text style={styles.subheaderText}>{translate("EDIT_ACCOUNT_INFO")}</Text>

            <Text style={styles.sectionText}>{translate("NAME_AND_SURNAME")}</Text>
            <TextInputComponent
              text={name}
              setText={setName}
              placeholderText="Imię"
              style={styles.marginTopSpacing}
            />
            <TextInputComponent
              text={surname}
              setText={setSurname}
              placeholderText="Nazwisko"
              style={styles.marginTopSpacing}
            />

            <Text style={styles.sectionText}>{translate("EMAIL_ADDRESS")}</Text>
            <TextInputComponent
              text={email}
              setText={setEmail}
              placeholderText="E-mail"
              style={styles.marginTopSpacing}
            />

            <Text style={styles.sectionText}>{translate("PASSWORD")}</Text>
            <TextInputComponent
              text={password}
              setText={setPassword}
              placeholderText="***"
              style={styles.marginTopSpacing}
              secureTextEntry
            />
            <TextInputComponent
              text={passwordConfirm}
              setText={setPasswordConfirm}
              placeholderText="Potwierdź hasło"
              style={styles.marginTopSpacing}
              secureTextEntry
            />

            {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}

            <Button
              text={translate("SAVE")}
              onClick={updateUserProfile}
              style={{ marginTop: 32 }}
            />
            <Button
              text={translate("BACK")}
              onClick={() => router.back()}
              style={{ marginTop: 16, backgroundColor: "white" }}
              textStyle={{ color: blackFont }}
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    display: "flex",
  },
  scrollWrapper: {
    flexGrow: 1,
    width: "100%",
    margin: 16,
  },
  scrollContainer: {
    flexGrow: 1,
    margin: 16,
  },
  panelContainer: {
    flexGrow: 1,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "white",
    borderRadius: 12,
    marginTop: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  headerText: {
    color: blackFont,
    fontSize: largeFontSize,
  },
  subheaderText: {
    color: greyedOutFont,
    fontSize: smallerFontSize,
  },
  sectionText: {
    color: greyFont,
    fontSize: smallFontSize,
    marginTop: 32,
  },
  marginTopSpacing: {
    marginTop: 8,
  },
  errorMessage: {
    color: "#b42318",
    marginTop: 16,
  },
});
