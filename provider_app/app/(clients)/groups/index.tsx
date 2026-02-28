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
import { fetchProviderClientGroups } from "@/services/api";
import Svg, { Path } from "react-native-svg";
import { Toast } from "toastify-react-native";

type ClientGroup = {
  id: number;
  name: string;
  member_count: number;
};

export default function ClientGroupsScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [groups, setGroups] = useState<ClientGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const data = await fetchProviderClientGroups(token);
        setGroups(data.map((g) => ({
          id: Number(g.id),
          name: String(g.name ?? ""),
          member_count: Number(g.member_count ?? 0),
        })));
      } catch {
        Toast.error("Nie udało się pobrać grup klientów");
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

  return (
    <View style={styles.root}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Twoje grupy klientów</Text>
          <Text style={styles.subtitle}>
            Przeszukaj Twoje istniejące grupy lub stwórz nową.
          </Text>

          {groups.length === 0 ? (
            <Text style={styles.subtitle}>Brak grup</Text>
          ) : (
            groups.map((group) => (
              <TouchableOpacity
                key={group.id}
                style={styles.groupRow}
                onPress={() =>
                  router.push(`/(clients)/groups/${group.id}`)
                }
              >
                <View style={styles.groupAvatar}>
                  <Svg width={36} height={36} viewBox="0 0 40 40" fill="none">
                    <Path
                      d="M20 0C8.96 0 0 8.96 0 20C0 31.04 8.96 40 20 40C31.04 40 40 31.04 40 20C40 8.96 31.04 0 20 0ZM20 6C23.32 6 26 8.68 26 12C26 15.32 23.32 18 20 18C16.68 18 14 15.32 14 12C14 8.68 16.68 6 20 6ZM20 34.4C15 34.4 10.58 31.84 8 27.92C8.06 23.96 16 21.8 20 21.8C23.98 21.8 31.94 23.96 32 27.92C29.42 31.84 25 34.4 20 34.4Z"
                      fill={lightGrey}
                    />
                  </Svg>
                </View>
                <View>
                  <Text style={styles.groupName}>{group.name}</Text>
                  <Text style={styles.groupDetail}>
                    liczba osób: {group.member_count}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.bottomButtons}>
          <Button
            text="Stwórz nową grupę"
            onClick={() => router.push("/(clients)/groups/create")}
            style={styles.createButton}
            textStyle={styles.createButtonText}
          />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: smallFontSize,
    fontFamily: Fonts.regular,
    color: greyedOutFont,
    marginBottom: 20,
  },
  groupRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: baseGrey,
  },
  groupAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: baseGrey,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  groupName: {
    fontSize: standardFontSize,
    fontFamily: Fonts.bold,
    color: blackFont,
    marginBottom: 2,
  },
  groupDetail: {
    fontSize: smallerFontSize,
    fontFamily: Fonts.regular,
    color: greyedOutFont,
  },
  bottomButtons: {
    padding: 20,
    gap: 12,
  },
  createButton: {
    backgroundColor: primaryColor,
    borderColor: primaryColor,
    borderRadius: 24,
  },
  createButtonText: {
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
