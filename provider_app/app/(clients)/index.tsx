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
import { fetchProviderClients } from "@/services/api";
import Svg, { Path } from "react-native-svg";
import { Toast } from "toastify-react-native";

type Client = {
  id: number;
  name: string;
  surname: string;
  email: string;
  created_at: string;
};

export default function ClientListScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFullList, setShowFullList] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const data = await fetchProviderClients(token);
        setClients(data.map((c) => ({
          id: Number(c.id),
          name: String(c.name ?? ""),
          surname: String(c.surname ?? ""),
          email: String(c.email ?? ""),
          created_at: String(c.created_at ?? ""),
        })));
      } catch {
        Toast.error("Nie udało się pobrać listy klientów");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token]);

  const displayedClients = showFullList ? clients : clients.slice(0, 5);

  if (loading) {
    return (
      <View style={styles.root}>
        <Header />
        <Spinner />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>
            {showFullList ? "Klienci" : "Ostatni klienci"}
          </Text>

          {displayedClients.length === 0 ? (
            <Text style={styles.emptyText}>Brak wyników do wyświetlenia</Text>
          ) : (
            displayedClients.map((client) => (
              <TouchableOpacity
                key={client.id}
                style={styles.clientRow}
                onPress={() => router.push(`/(clients)/${client.id}`)}
              >
                <View style={styles.clientAvatar}>
                  <Svg width={36} height={36} viewBox="0 0 40 40" fill="none">
                    <Path
                      d="M20 0C8.96 0 0 8.96 0 20C0 31.04 8.96 40 20 40C31.04 40 40 31.04 40 20C40 8.96 31.04 0 20 0ZM20 6C23.32 6 26 8.68 26 12C26 15.32 23.32 18 20 18C16.68 18 14 15.32 14 12C14 8.68 16.68 6 20 6ZM20 34.4C15 34.4 10.58 31.84 8 27.92C8.06 23.96 16 21.8 20 21.8C23.98 21.8 31.94 23.96 32 27.92C29.42 31.84 25 34.4 20 34.4Z"
                      fill={lightGrey}
                    />
                  </Svg>
                </View>
                <View style={styles.clientInfo}>
                  <Text style={styles.clientName}>{client.name} {client.surname}</Text>
                  <Text style={styles.clientDetail}>
                    Email: {client.email}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.bottomButtons}>
          {!showFullList && clients.length > 5 && (
            <Button
              text="Przejdź do pełnej listy"
              onClick={() => setShowFullList(true)}
              style={styles.primaryButton}
              textStyle={styles.primaryButtonText}
            />
          )}

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (showFullList) {
                setShowFullList(false);
              } else {
                router.navigate("/(dashboard)");
              }
            }}
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
    marginBottom: 8,
  },
  emptyText: {
    fontSize: standardFontSize,
    fontFamily: Fonts.semiBold,
    color: blackFont,
    textAlign: "center",
    marginTop: 40,
  },
  clientRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: baseGrey,
  },
  clientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: baseGrey,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: standardFontSize,
    fontFamily: Fonts.bold,
    color: blackFont,
    marginBottom: 2,
  },
  clientDetail: {
    fontSize: smallerFontSize,
    fontFamily: Fonts.regular,
    color: greyedOutFont,
  },
  bottomButtons: {
    padding: 20,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: primaryColor,
    borderColor: primaryColor,
    borderRadius: 24,
  },
  primaryButtonText: {
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
