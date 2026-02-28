import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import Spinner from "@/components/Spinner";
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
  fetchProviderSalon,
  fetchProviderServices,
  fetchProviderOpeningHours,
  OpeningHoursItem,
} from "@/services/api";
import Svg, { Path, Circle } from "react-native-svg";
import { Toast } from "toastify-react-native";

type TabType = "services" | "details";

type Service = {
  id: number;
  name: string;
  price: string;
  minutes_duration: number;
};

export default function PreviewScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("services");
  const [loading, setLoading] = useState(true);
  const [salonName, setSalonName] = useState("");
  const [salonEmail, setSalonEmail] = useState("");
  const [salonPhone, setSalonPhone] = useState("");
  const [salonAddress, setSalonAddress] = useState("");
  const [salonCategory, setSalonCategory] = useState("");
  const [salonImageUri, setSalonImageUri] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [openingHours, setOpeningHours] = useState<OpeningHoursItem[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const [salon, svcData, hoursData] = await Promise.all([
          fetchProviderSalon(token),
          fetchProviderServices(token),
          fetchProviderOpeningHours(token),
        ]);
        setSalonName(String(salon.name ?? ""));
        setSalonEmail(String(salon.mail ?? ""));
        setSalonPhone(String(salon.phone_number ?? ""));
        setSalonAddress(String(salon.location_name ?? ""));
        setSalonCategory(String(salon.category_name ?? salon.category ?? ""));
        if (salon.main_image) setSalonImageUri(String(salon.main_image));
        setServices(svcData);
        setOpeningHours(hoursData);
      } catch {
        Toast.error("Nie udało się pobrać danych podglądu");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token]);

  if (loading) {
    return (
      <View style={styles.root}>
        <Spinner />
      </View>
    );
  }

  const formatPrice = (price: string | number) => {
    const num = Number(price);
    return isNaN(num) ? price : `${num.toFixed(0)} zł`;
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Back to edit button */}
        <TouchableOpacity
          style={styles.backToEditButton}
          onPress={() => router.navigate("/(account)/business-card")}
        >
          <Text style={styles.backToEditText}>Wróć do edycji</Text>
        </TouchableOpacity>

        {/* Salon image */}
        <View style={styles.imageContainer}>
          {salonImageUri ? (
            <Image source={{ uri: salonImageUri }} style={styles.imagePlaceholder} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Svg width={60} height={60} viewBox="0 0 60 60" fill="none">
                <Circle cx={30} cy={30} r={30} fill={lightGrey} />
                <Path
                  d="M30 15C21.72 15 15 21.72 15 30C15 38.28 21.72 45 30 45C38.28 45 45 38.28 45 30C45 21.72 38.28 15 30 15Z"
                  fill={greyedOutFont}
                />
              </Svg>
            </View>
          )}
        </View>

        {/* Salon name */}
        <Text style={styles.salonName}>{salonName}</Text>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "services" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("services")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "services" && styles.activeTabText,
              ]}
            >
              Usługi
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "details" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("details")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "details" && styles.activeTabText,
              ]}
            >
              Szczegóły
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {activeTab === "services" ? (
            <>
              {/* Services table header */}
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>Nazwa</Text>
                <Text style={styles.tableHeaderTextRight}>Cena</Text>
              </View>

              {services.length === 0 ? (
                <Text style={styles.serviceName}>Brak usług</Text>
              ) : (
                services.map((service) => (
                  <View key={service.id} style={styles.serviceRow}>
                    <View>
                      <Text style={styles.serviceName}>{service.name}</Text>
                      <Text style={styles.serviceDuration}>
                        {service.minutes_duration} min
                      </Text>
                    </View>
                    <Text style={styles.servicePrice}>
                      {formatPrice(service.price)}
                    </Text>
                  </View>
                ))
              )}
            </>
          ) : (
            <>
              {/* Details - contact info */}
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"
                      fill={primaryColor}
                    />
                  </Svg>
                </View>
                <View>
                  <Text style={styles.detailTitle}>Zadzwoń</Text>
                  {openingHours.length > 0 ? (
                    openingHours.map((h, i) => {
                      const dayNames = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Ndz"];
                      return (
                        <Text key={i} style={styles.detailSubtitle}>
                          {dayNames[h.day_of_week]} {h.open_time} – {h.close_time}
                        </Text>
                      );
                    })
                  ) : (
                    <Text style={styles.detailSubtitle}>Brak godzin otwarcia</Text>
                  )}
                  <Text style={styles.detailValue}>{salonPhone || "Brak numeru"}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"
                      fill={primaryColor}
                    />
                  </Svg>
                </View>
                <View>
                  <Text style={styles.detailTitle}>{salonCategory || "Salon"}</Text>
                  <Text style={styles.detailSubtitle}>
                    {salonAddress || "Brak adresu"}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"
                      fill={primaryColor}
                    />
                  </Svg>
                </View>
                <View style={styles.emailPill}>
                  <Text style={styles.emailText}>{salonEmail || "Brak email"}</Text>
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: baseGrey,
  },
  scrollContent: {
    flexGrow: 1,
  },
  backToEditButton: {
    borderWidth: 1,
    borderColor: lightGrey,
    borderRadius: 24,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginTop: 50,
    marginBottom: 12,
    alignItems: "center",
    backgroundColor: "white",
    zIndex: 10,
  },
  backToEditText: {
    fontFamily: Fonts.semiBold,
    fontSize: standardFontSize,
    color: blackFont,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: -40,
    zIndex: 1,
  },
  imagePlaceholder: {
    width: "100%",
    height: 200,
    backgroundColor: lightGrey,
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
  },
  salonName: {
    fontSize: largestFontSize,
    fontFamily: Fonts.bold,
    color: blackFont,
    textAlign: "center",
    marginTop: 52,
    marginBottom: 16,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    gap: 0,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: lightGrey,
  },
  activeTab: {
    backgroundColor: primaryColor,
    borderColor: primaryColor,
  },
  tabText: {
    fontSize: smallFontSize,
    fontFamily: Fonts.semiBold,
    color: greyedOutFont,
  },
  activeTabText: {
    color: "white",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: lightGrey,
    marginBottom: 8,
  },
  tableHeaderText: {
    fontSize: smallFontSize,
    fontFamily: Fonts.regular,
    color: greyedOutFont,
  },
  tableHeaderTextRight: {
    fontSize: smallFontSize,
    fontFamily: Fonts.regular,
    color: greyedOutFont,
  },
  serviceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: baseGrey,
  },
  serviceName: {
    fontSize: standardFontSize,
    fontFamily: Fonts.bold,
    color: blackFont,
  },
  serviceDuration: {
    fontSize: smallerFontSize,
    fontFamily: Fonts.regular,
    color: greyedOutFont,
  },
  servicePrice: {
    fontSize: standardFontSize,
    fontFamily: Fonts.bold,
    color: primaryColor,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
    gap: 12,
  },
  detailIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: lightGrey,
  },
  detailTitle: {
    fontSize: standardFontSize,
    fontFamily: Fonts.bold,
    color: blackFont,
  },
  detailSubtitle: {
    fontSize: smallFontSize,
    fontFamily: Fonts.regular,
    color: greyedOutFont,
  },
  detailValue: {
    fontSize: standardFontSize,
    fontFamily: Fonts.semiBold,
    color: blackFont,
    marginTop: 4,
  },
  emailPill: {
    borderWidth: 1,
    borderColor: lightGrey,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: "center",
  },
  emailText: {
    fontSize: smallFontSize,
    fontFamily: Fonts.regular,
    color: blackFont,
  },
});
