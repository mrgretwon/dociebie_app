import GoBackButton from "@/components/GoBackButton";
import {
  baseGrey,
  darkerGreyFont,
  greyedOutFont,
  greyFont,
  largeFontSize,
  primaryColor,
  smallFontSize,
} from "@/constants/style-vars";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "@/hooks/use-translations";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const UserProfileInfo = () => {
  const { logout, user } = useAuth();
  const translate = useTranslations();
  const router = useRouter();

  const handleLoginOrLogoutPressed = async () => {
    if (user) {
      await logout();
    }
    router.navigate("/(login)");
  };

  return (
    <View style={styles.container}>
      <View style={styles.rowContainer}>
        <MaterialCommunityIcons name="account-outline" size={40} color={darkerGreyFont} />
        <View style={styles.userInfoTextContainer}>
          {user ? (
            <>
              <Text style={styles.userNameText}>
                {user?.name} {user?.surname}
              </Text>
              <Text style={styles.userEmailText}>{user?.email}</Text>
            </>
          ) : (
            <Text style={styles.userNameText}>Użytkownik niezalogowany</Text>
          )}
        </View>
      </View>
      <View style={[styles.rowContainer, styles.buttonsContainer]}>
        <TouchableOpacity onPress={() => handleLoginOrLogoutPressed()}>
          <Text style={styles.logoutButton}>
            {user ? translate("LOG_OUT") : translate("LOG_IN")}
          </Text>
        </TouchableOpacity>
        <GoBackButton />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    backgroundColor: baseGrey,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  rowContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  userInfoTextContainer: {
    display: "flex",
    flexDirection: "column",
    marginLeft: 16,
  },
  userNameText: {
    fontSize: largeFontSize,
  },
  userEmailText: {
    color: greyedOutFont,
    fontSize: smallFontSize,
  },
  buttonsContainer: {
    marginTop: 16,
    gap: 16,
  },
  logoutButton: {
    alignSelf: "flex-start",
    color: greyFont,
    borderWidth: 1,
    borderColor: greyFont,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  goBackButton: {
    alignSelf: "flex-start",
    marginLeft: 16,
    backgroundColor: primaryColor,
    color: "white",
    borderWidth: 1,
    borderColor: greyFont,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});

export default UserProfileInfo;
