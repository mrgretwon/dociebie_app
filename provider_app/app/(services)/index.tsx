import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import Header from "@/components/Header";
import Spinner from "@/components/Spinner";
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
import { fetchProviderServices } from "@/services/api";
import Svg, { Path } from "react-native-svg";
import { Toast } from "toastify-react-native";

type Service = {
  id: number;
  name: string;
  price: string;
  minutes_duration: number;
};

export default function ServicesListScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const data = await fetchProviderServices(token);
        setServices(data);
      } catch {
        Toast.error("Nie udało się pobrać listy usług");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token]);

  if (loading) {
    return (
      <View style={styles.root}>
        <Header />
        <Spinner />
      </View>
    );
  }

  const formatPrice = (price: string | number) => {
    const num = Number(price);
    return isNaN(num) ? price : `${num.toFixed(2).replace(".", ",")} zł`;
  };

  return (
    <View style={styles.root}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Lista Twoich usług</Text>

          {services.length === 0 ? (
            <Text style={styles.serviceDetail}>Brak usług</Text>
          ) : (
            services.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.serviceRow}
                onPress={() => router.push(`/(services)/${service.id}`)}
              >
                <View style={styles.serviceAvatar}>
                  <Svg width={36} height={36} viewBox="0 0 40 40" fill="none">
                    <Path
                      d="M20 0C8.96 0 0 8.96 0 20C0 31.04 8.96 40 20 40C31.04 40 40 31.04 40 20C40 8.96 31.04 0 20 0Z"
                      fill={lightGrey}
                    />
                  </Svg>
                </View>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceDetail}>
                    Cena domyślna: {formatPrice(service.price)}
                  </Text>
                  <Text style={styles.serviceDetail}>
                    Slot czasowy: {service.minutes_duration} min
                  </Text>
                  <Text style={styles.editLink}>Edytuj usługę</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.bottomButtons}>
          <Button
            text="Dodaj nową usługę"
            onClick={() => router.push("/(services)/new")}
            style={styles.addButton}
            textStyle={styles.addButtonText}
          />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.navigate("/(dashboard)")}
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
    marginBottom: 16,
  },
  serviceRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: baseGrey,
  },
  serviceAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: baseGrey,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: standardFontSize,
    fontFamily: Fonts.bold,
    color: blackFont,
    marginBottom: 2,
  },
  serviceDetail: {
    fontSize: smallerFontSize,
    fontFamily: Fonts.regular,
    color: greyedOutFont,
  },
  editLink: {
    fontSize: smallerFontSize,
    fontFamily: Fonts.regular,
    color: primaryColor,
    marginTop: 2,
  },
  bottomButtons: {
    padding: 20,
    gap: 12,
  },
  addButton: {
    backgroundColor: primaryColor,
    borderColor: primaryColor,
    borderRadius: 24,
  },
  addButtonText: {
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
