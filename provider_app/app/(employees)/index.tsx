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

import Header from "@/components/Header";
import Spinner from "@/components/Spinner";
import Button from "@/components/Button";
import {
  baseGrey,
  blackFont,
  greyedOutFont,
  lightGrey,
  primaryColor,
  standardFontSize,
  largestFontSize,
  smallerFontSize,
} from "@/constants/style-vars";
import { Fonts } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { fetchProviderEmployees } from "@/services/api";
import { Toast } from "toastify-react-native";

type Employee = {
  id: number;
  name: string;
  surname: string;
  image: string | null;
};

export default function EmployeesListScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const data = await fetchProviderEmployees(token);
        setEmployees(data);
      } catch {
        Toast.error("Nie udało się pobrać listy pracowników");
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
          <Text style={styles.title}>Lista Twoich pracowników</Text>

          {employees.length === 0 ? (
            <Text style={styles.employeeDetail}>Brak pracowników</Text>
          ) : (
            employees.map((employee) => (
              <TouchableOpacity
                key={employee.id}
                style={styles.employeeRow}
                onPress={() => router.push(`/(employees)/${employee.id}`)}
              >
                {employee.image ? (
                  <Image
                    source={{ uri: employee.image }}
                    style={styles.employeeAvatar}
                  />
                ) : (
                  <View style={styles.employeePlaceholder}>
                    <Text style={styles.placeholderText}>
                      {(employee.name[0] ?? "").toUpperCase()}
                      {(employee.surname[0] ?? "").toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.employeeInfo}>
                  <Text style={styles.employeeName}>
                    {employee.name} {employee.surname}
                  </Text>
                  <Text style={styles.editLink}>Edytuj</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.bottomButtons}>
          <Button
            text="Dodaj pracownika"
            onClick={() => router.push("/(employees)/new")}
            style={styles.addButton}
            textStyle={styles.addButtonText}
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
    marginBottom: 16,
  },
  employeeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: baseGrey,
  },
  employeeAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  employeePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: baseGrey,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  placeholderText: {
    fontSize: standardFontSize,
    fontFamily: Fonts.bold,
    color: greyedOutFont,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: standardFontSize,
    fontFamily: Fonts.bold,
    color: blackFont,
    marginBottom: 2,
  },
  employeeDetail: {
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
