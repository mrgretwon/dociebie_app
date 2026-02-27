import Spinner from "@/components/Spinner";
import { baseGrey } from "@/constants/style-vars";
import { useAuth } from "@/contexts/AuthContext";
import AppointmentModel from "@/models/data-models/appointmentModel";
import { fetchClientAppointmentHistory } from "@/services/api";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import ClientAppointment from "./ClientAppointment";
import HistoryInfo from "./HistoryInfo";

export default function HistoryScreen() {
  const { token } = useAuth();
  const [userAppointments, setUserAppointments] = useState<AppointmentModel[] | null>(null);

  useEffect(() => {
    async function fetchAppointments(token: string) {
      if (token) {
        const appointments = await fetchClientAppointmentHistory(token);
        setUserAppointments(appointments);
      }
    }

    if (token) {
      fetchAppointments(token);
    }
  }, [token]);

  if (!userAppointments) {
    return <Spinner />;
  }

  return (
    <ScrollView style={styles.container}>
      <HistoryInfo />
      {userAppointments.map((appointment, i) => (
        <ClientAppointment key={appointment.id} appointment={appointment} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: baseGrey,
    paddingHorizontal: 16,
  },
  loaderWrapper: {
    flex: 1,
    backgroundColor: baseGrey,
    alignItems: "center",
    justifyContent: "center",
  },
});
