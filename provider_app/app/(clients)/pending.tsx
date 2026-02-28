import React, { useCallback, useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Header from "@/components/Header";
import Spinner from "@/components/Spinner";
import {
  baseGrey,
  blackFont,
  greenFont,
  greyedOutFont,
  lightGreen,
  lightRed,
  primaryColor,
  redFont,
  smallFontSize,
  smallerFontSize,
  standardFontSize,
  largestFontSize,
} from "@/constants/style-vars";
import { Fonts } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchProviderAppointments,
  updateAppointmentStatus,
} from "@/services/api";
import { Toast } from "toastify-react-native";

type PendingAppointment = {
  id: number;
  date: string;
  client_name: string;
  client_email: string;
  service_name: string;
  service_price: string;
  service_duration: number;
  employee_name: string;
};

export default function PendingAppointmentsScreen() {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<PendingAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  const loadPending = useCallback(async () => {
    if (!token) return;
    try {
      const data = await fetchProviderAppointments(token, { status: "pending" });
      setAppointments(
        data.map((d) => ({
          id: d.id as number,
          date: d.date as string,
          client_name: d.client_name as string,
          client_email: d.client_email as string,
          service_name: d.service_name as string,
          service_price: d.service_price as string,
          service_duration: d.service_duration as number,
          employee_name: d.employee_name as string,
        }))
      );
    } catch {
      Toast.error("Nie udało się pobrać wizyt");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    if (!token) return;
    setUpdating(id);
    try {
      await updateAppointmentStatus(id, newStatus, token);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      Toast.success(
        newStatus === "confirmed" ? "Wizyta potwierdzona" : "Wizyta odrzucona"
      );
    } catch {
      Toast.error("Nie udało się zaktualizować statusu");
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("pl-PL", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View style={styles.root}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Do potwierdzenia</Text>

        {loading ? (
          <Spinner />
        ) : appointments.length === 0 ? (
          <Text style={styles.emptyText}>
            Brak wizyt oczekujących na potwierdzenie
          </Text>
        ) : (
          appointments.map((appt) => (
            <View key={appt.id} style={styles.card}>
              <Text style={styles.dateText}>{formatDate(appt.date)}</Text>
              <Text style={styles.clientName}>{appt.client_name}</Text>
              <Text style={styles.detailText}>
                {appt.service_name} • {appt.service_duration} min •{" "}
                {Number(appt.service_price).toFixed(2).replace(".", ",")} zł
              </Text>
              <Text style={styles.detailText}>
                Pracownik: {appt.employee_name}
              </Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={() => handleStatusChange(appt.id, "confirmed")}
                  disabled={updating === appt.id}
                >
                  <Text style={styles.confirmButtonText}>Potwierdź</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.declineButton}
                  onPress={() => handleStatusChange(appt.id, "cancelled")}
                  disabled={updating === appt.id}
                >
                  <Text style={styles.declineButtonText}>Odrzuć</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
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
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: largestFontSize,
    fontFamily: Fonts.bold,
    color: primaryColor,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: standardFontSize,
    fontFamily: Fonts.regular,
    color: greyedOutFont,
    textAlign: "center",
    marginTop: 40,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  dateText: {
    fontSize: smallerFontSize,
    fontFamily: Fonts.regular,
    color: greyedOutFont,
    marginBottom: 4,
  },
  clientName: {
    fontSize: standardFontSize,
    fontFamily: Fonts.bold,
    color: blackFont,
    marginBottom: 4,
  },
  detailText: {
    fontSize: smallFontSize,
    fontFamily: Fonts.regular,
    color: greyedOutFont,
    marginBottom: 2,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: lightGreen,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: smallFontSize,
    fontFamily: Fonts.semiBold,
    color: greenFont,
  },
  declineButton: {
    flex: 1,
    backgroundColor: lightRed,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  declineButtonText: {
    fontSize: smallFontSize,
    fontFamily: Fonts.semiBold,
    color: redFont,
  },
});
