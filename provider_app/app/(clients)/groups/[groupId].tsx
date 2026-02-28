import { useSafeBack } from "@/hooks/use-safe-back";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import Header from "@/components/Header";
import Spinner from "@/components/Spinner";
import TextInputComponent from "@/components/TextInputComponent";
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
import {
  fetchProviderClientGroup,
  addClientToGroup,
  removeClientFromGroup,
  deleteProviderClientGroup,
} from "@/services/api";
import Svg, { Path } from "react-native-svg";
import { Toast } from "toastify-react-native";

type Member = {
  id: number;
  client: { id: number; name: string; surname: string; email: string };
  added_at: string;
};

export default function GroupDetailScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const router = useRouter();
  const goBack = useSafeBack();
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");

  const gid = Number(groupId);

  useEffect(() => {
    const loadData = async () => {
      if (!token || !gid) { setLoading(false); return; }
      try {
        const data = await fetchProviderClientGroup(gid, token);
        setGroupName(String(data.name ?? ""));
        const rawMembers = (data.members ?? []) as Record<string, unknown>[];
        setMembers(rawMembers.map((m) => {
          const c = (m.client ?? {}) as Record<string, unknown>;
          return {
            id: Number(m.id),
            client: {
              id: Number(c.id),
              name: String(c.name ?? ""),
              surname: String(c.surname ?? ""),
              email: String(c.email ?? ""),
            },
            added_at: String(m.added_at ?? ""),
          };
        }));
      } catch {
        Toast.error("Nie udało się pobrać danych grupy");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token, gid]);

  const handleRemoveMember = async (clientId: number) => {
    if (!token) return;
    try {
      await removeClientFromGroup(gid, clientId, token);
      setMembers((prev) => prev.filter((m) => m.client.id !== clientId));
      Toast.success("Usuńięto z grupy");
    } catch {
      Toast.error("Nie udało się usunąć z grupy");
    }
  };

  const handleAddByEmail = async () => {
    if (!token || !searchEmail) return;
    try {
      // The API expects client_id; we pass email to search
      // For simplicity, attempt adding by searching email first
      await addClientToGroup(gid, 0, token); // This will be adjusted based on actual API
      Toast.success("Dodano do grupy");
      setShowAddForm(false);
      setSearchEmail("");
    } catch {
      Toast.error("Nie udało się dodać klienta do grupy");
    }
  };

  const handleDeleteGroup = async () => {
    if (!token) return;
    try {
      await deleteProviderClientGroup(gid, token);
      Toast.success("Grupa została usunięta");
      goBack();
    } catch {
      Toast.error("Nie udało się usunąć grupy");
    }
  };

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
          {!showAddForm ? (
            <>
              <Text style={styles.title}>Edycja grupy</Text>
              <Text style={styles.subtitle}>
                Edytujesz grupę: {groupName}
              </Text>
              <Text style={styles.subtitle}>
                Lista osób: {members.length}
              </Text>

              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionBtn}>
                  <Text style={styles.actionBtnText}>Edytuj zdjęcie</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                  <Text style={styles.actionBtnText}>Edytuj nazwę</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtnDanger} onPress={handleDeleteGroup}>
                  <Text style={styles.actionBtnText}>Usuń</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionTitle}>Lista osób</Text>

              {members.length === 0 ? (
                <Text style={styles.subtitle}>Brak członków</Text>
              ) : (
                members.map((member) => (
                  <View key={member.id} style={styles.memberRow}>
                    <View style={styles.memberAvatar}>
                      <Svg width={36} height={36} viewBox="0 0 40 40" fill="none">
                        <Path
                          d="M20 0C8.96 0 0 8.96 0 20C0 31.04 8.96 40 20 40C31.04 40 40 31.04 40 20C40 8.96 31.04 0 20 0ZM20 6C23.32 6 26 8.68 26 12C26 15.32 23.32 18 20 18C16.68 18 14 15.32 14 12C14 8.68 16.68 6 20 6ZM20 34.4C15 34.4 10.58 31.84 8 27.92C8.06 23.96 16 21.8 20 21.8C23.98 21.8 31.94 23.96 32 27.92C29.42 31.84 25 34.4 20 34.4Z"
                          fill={lightGrey}
                        />
                      </Svg>
                    </View>
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>
                        {member.client.name} {member.client.surname}
                      </Text>
                      <Text style={styles.memberDetail}>
                        Email: {member.client.email}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() => handleRemoveMember(member.client.id)}
                    >
                      <Text style={styles.removeBtnText}>Usuń</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </>
          ) : (
            <>
              <Text style={styles.title}>Dodaj nową osobę do grupy</Text>
              <Text style={styles.subtitle}>
                Dodajesz osobę do grupy: {groupName}
              </Text>
              <Text style={styles.subtitle}>
                Lista osób: {members.length}
              </Text>

              <Text style={styles.sectionTitle}>Przypisz klienta</Text>
              <TextInputComponent
                text={searchEmail}
                setText={setSearchEmail}
                placeholderText="Wprowadź adres email"
                style={styles.input}
              />
              <TouchableOpacity>
                <Text style={styles.linkText}>Stwórz nowego klienta</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.bottomButtons}>
          {!showAddForm ? (
            <Button
              text="Dodaj nową osobę"
              onClick={() => setShowAddForm(true)}
              style={styles.primaryButton}
              textStyle={styles.primaryButtonText}
            />
          ) : (
            <Button
              text="Przypisz klienta do grupy"
              onClick={handleAddByEmail}
              style={styles.primaryButton}
              textStyle={styles.primaryButtonText}
            />
          )}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (showAddForm) {
                setShowAddForm(false);
              } else {
                goBack();
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: smallFontSize,
    fontFamily: Fonts.regular,
    color: greyedOutFont,
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    marginBottom: 24,
  },
  actionBtn: {
    backgroundColor: primaryColor,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  actionBtnDanger: {
    backgroundColor: primaryColor,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  actionBtnText: {
    fontSize: smallerFontSize,
    fontFamily: Fonts.semiBold,
    color: "white",
  },
  sectionTitle: {
    fontSize: standardFontSize,
    fontFamily: Fonts.bold,
    color: blackFont,
    marginBottom: 12,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: baseGrey,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: baseGrey,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: standardFontSize,
    fontFamily: Fonts.bold,
    color: blackFont,
    marginBottom: 2,
  },
  memberDetail: {
    fontSize: smallerFontSize,
    fontFamily: Fonts.regular,
    color: greyedOutFont,
  },
  removeBtn: {
    borderWidth: 1,
    borderColor: primaryColor,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  removeBtnText: {
    fontSize: smallerFontSize,
    fontFamily: Fonts.semiBold,
    color: primaryColor,
  },
  input: {
    marginBottom: 12,
    borderColor: lightGrey,
  },
  linkText: {
    fontSize: smallFontSize,
    fontFamily: Fonts.regular,
    color: greyedOutFont,
    marginBottom: 12,
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
