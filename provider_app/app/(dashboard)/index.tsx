import React, { useEffect, useState } from "react";
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import Header from "@/components/Header";
import HorizontalLine from "@/components/HorizontalLine";
import Spinner from "@/components/Spinner";
import {
  baseGrey,
  blackFont,
  greyedOutFont,
  greyFont,
  lightGrey,
  primaryColor,
  smallerFontSize,
  smallFontSize,
  standardFontSize,
  largeFontSize,
} from "@/constants/style-vars";
import { Fonts } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { fetchFinancialSummary } from "@/services/api";
import Svg, { Path } from "react-native-svg";
import { Toast } from "toastify-react-native";
import FacebookIconSvg from "@/assets/svg/facebook-icon-svg";
import LinkedinIconSvg from "@/assets/svg/linkedin-icon-svg";
import TwitterIconSvg from "@/assets/svg/twitter-icon-svg";

export default function DashboardScreen() {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const [financialData, setFinancialData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  const displayName = user
    ? `${user.name} ${user.surname}`
    : "Albert Kowalski";
  const displayEmail = user?.email ?? "akowalski@mail.com";

  useEffect(() => {
    const loadData = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const summary = await fetchFinancialSummary(token);
        setFinancialData(summary);
      } catch {
        Toast.error("Nie udało się pobrać danych finansowych");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token]);

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  const totalRevenue = financialData?.total_revenue != null
    ? Number(financialData.total_revenue).toFixed(2).replace(".", ",")
    : "0,00";
  const totalBookings = financialData?.bookings_revenue != null
    ? Number(financialData.bookings_revenue).toFixed(2).replace(".", ",")
    : "0,00";

  return (
    <View style={styles.root}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User info section */}
        <View style={styles.section}>
          <Text style={styles.greeting}>Witaj,</Text>
          <View style={styles.userRow}>
            <View style={styles.avatarContainer}>
              <Svg width={40} height={40} viewBox="0 0 40 40" fill="none">
                <Path
                  d="M20 0C8.96 0 0 8.96 0 20C0 31.04 8.96 40 20 40C31.04 40 40 31.04 40 20C40 8.96 31.04 0 20 0ZM20 6C23.32 6 26 8.68 26 12C26 15.32 23.32 18 20 18C16.68 18 14 15.32 14 12C14 8.68 16.68 6 20 6ZM20 34.4C15 34.4 10.58 31.84 8 27.92C8.06 23.96 16 21.8 20 21.8C23.98 21.8 31.94 23.96 32 27.92C29.42 31.84 25 34.4 20 34.4Z"
                  fill={lightGrey}
                />
              </Svg>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{displayName}</Text>
              <Text style={styles.userEmail}>{displayEmail}</Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.outlineButton}
              onPress={handleLogout}
            >
              <Text style={styles.outlineButtonText}>Wyloguj</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.filledButton}
              onPress={() => router.push("/(account)/edit")}
            >
              <Text style={styles.filledButtonText}>Edytuj konto</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.filledButton}
              onPress={() => router.push("/(account)/subscription")}
            >
              <Text style={styles.filledButtonText}>Subskrypcja</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Financial data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dane finansowe</Text>
          <HorizontalLine style={styles.sectionLine} />
          {loading ? (
            <Spinner />
          ) : (
            <>
              <Text style={styles.financialRow}>Obrót: {totalRevenue} zł</Text>
              <Text style={styles.financialRow}>Rezerwacje: {totalBookings} zł</Text>
            </>
          )}
        </View>

        {/* Provider panel */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Panel usługodawcy</Text>
          <HorizontalLine style={styles.sectionLine} />
          <MenuRow
            label="Kalendarz rezerwacji"
            onPress={() => router.push("/(calendar)")}
          />
          <MenuRow
            label="Lista klientów"
            onPress={() => router.push("/(clients)")}
          />
          <MenuRow
            label="Dane finansowe"
            onPress={() => router.push("/(finance)")}
          />
          <MenuRow
            label="Pracownicy"
            onPress={() => router.push("/(employees)")}
          />
          <MenuRow
            label="Edytuj usługi"
            onPress={() => router.push("/(services)")}
          />
          <MenuRow
            label="Edytuj wizytówkę"
            onPress={() => router.push("/(account)/business-card")}
          />
        </View>

        {/* Shortcuts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Na skróty</Text>
          <HorizontalLine style={styles.sectionLine} />
          <MenuRow
            label="Dodaj wizytę"
            onPress={() => router.push("/(calendar)/add-visit")}
          />
          <MenuRow
            label="Dodaj nowego klienta"
            onPress={() => router.push("/(clients)/add")}
          />
          <MenuRow
            label="Grupy klientów"
            onPress={() => router.push("/(clients)/groups")}
          />
          <MenuRow
            label="Ostatnie płatności"
            onPress={() => router.push("/(finance)/payment-history")}
          />
        </View>

        {/* Footer */}
        <DashboardFooter />
      </ScrollView>
    </View>
  );
}

function MenuRow({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress}>
      <Text style={styles.menuRowText}>{label}</Text>
      <Svg width={8} height={14} viewBox="0 0 8 14" fill="none">
        <Path
          d="M1 1L7 7L1 13"
          stroke={greyFont}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </TouchableOpacity>
  );
}

const footerLinks = [
  { name: "O nas", href: "https://www.google.com" },
  { name: "Kariera", href: "https://www.google.com" },
  { name: "Korzyści", href: "https://www.google.com" },
  { name: "Pomoc", href: "https://www.google.com" },
  { name: "Płatności", href: "https://www.google.com" },
  { name: "Polityka Prywatności", href: "https://www.google.com" },
];

function DashboardFooter() {
  return (
    <View style={styles.footer}>
      <Image
        source={require("@/assets/images/logo-dociebie_white_new.png")}
        style={styles.footerLogo}
        resizeMode="contain"
      />
      <View style={styles.footerLinksRow}>
        {footerLinks.map((link) => (
          <Text
            key={link.name}
            style={styles.footerLink}
            onPress={() => Linking.openURL(link.href)}
          >
            {link.name}
          </Text>
        ))}
      </View>

      <View style={styles.footerBottom}>
        <Text style={styles.footerCopyright}>
          &copy; {new Date().getFullYear()} dociebie.pl. Wszystkie prawa zastrzeżone
        </Text>
        <View style={styles.footerSocialRow}>
          <TwitterIconSvg />
          <LinkedinIconSvg />
          <FacebookIconSvg />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollContent: {
    paddingBottom: 0,
  },
  section: {
    padding: 20,
    backgroundColor: "white",
  },
  greeting: {
    fontSize: smallFontSize,
    fontFamily: Fonts.regular,
    color: greyedOutFont,
    marginBottom: 4,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: baseGrey,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: standardFontSize,
    fontFamily: Fonts.bold,
    color: blackFont,
  },
  userEmail: {
    fontSize: smallFontSize,
    fontFamily: Fonts.regular,
    color: greyedOutFont,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: lightGrey,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  outlineButtonText: {
    fontSize: smallFontSize,
    fontFamily: Fonts.semiBold,
    color: blackFont,
  },
  filledButton: {
    backgroundColor: primaryColor,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  filledButtonText: {
    fontSize: smallFontSize,
    fontFamily: Fonts.semiBold,
    color: "white",
  },
  sectionTitle: {
    fontSize: largeFontSize,
    fontFamily: Fonts.bold,
    color: primaryColor,
    marginBottom: 8,
  },
  sectionLine: {
    borderBottomColor: lightGrey,
    marginBottom: 12,
  },
  financialRow: {
    fontSize: standardFontSize,
    fontFamily: Fonts.regular,
    color: blackFont,
    marginBottom: 4,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: baseGrey,
  },
  menuRowText: {
    fontSize: standardFontSize,
    fontFamily: Fonts.regular,
    color: blackFont,
  },
  footer: {
    backgroundColor: primaryColor,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  footerLogo: {
    width: 140,
    height: 40,
    resizeMode: "contain",
  },
  footerLinksRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    rowGap: 8,
    borderBottomColor: "white",
    borderBottomWidth: 2,
    paddingVertical: 12,
  },
  footerLink: {
    width: "50%",
    color: "white",
    fontSize: smallFontSize,
    fontFamily: Fonts.regular,
    paddingVertical: 2,
  },
  footerBottom: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    columnGap: 16,
  },
  footerSocialRow: {
    flexDirection: "row",
    gap: 24,
    alignItems: "center",
  },
  footerCopyright: {
    flex: 1,
    color: "#fff",
    fontFamily: Fonts.regular,
  },
});
