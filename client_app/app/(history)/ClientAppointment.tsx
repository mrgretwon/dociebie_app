import Button from "@/components/Button";
import {
  greenFont,
  greyedOutFont,
  largerFontSize,
  lightGreen,
  lightRed,
  redFont,
  smallerFontSize,
  smallestFontSize,
  smallFontSize,
} from "@/constants/style-vars";
import { useTranslations } from "@/hooks/use-translations";
import AppointmentModel from "@/models/data-models/appointmentModel";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

interface AppointmentProps {
  appointment: AppointmentModel;
}

const ClientAppointment = ({ appointment }: AppointmentProps) => {
  const translate = useTranslations();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.dateText}>{appointment.date}</Text>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>
          {appointment.employeeName} - {appointment.serviceName}
        </Text>
        <Text
          style={
            appointment.status.isStatusAlright
              ? styles.statusTextCorrect
              : styles.statusTextIncorrect
          }
        >
          {appointment.status.text}
        </Text>
      </View>
      <Text style={styles.infoText}>{appointment.salonName}</Text>
      <Button
        onClick={() => router.push("/(appointment)")}
        style={{ marginTop: 32 }}
        text={translate("BOOK_AGAIN")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  dateText: {
    fontSize: smallestFontSize,
    color: greyedOutFont,
  },
  headerContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 4,
  },
  headerText: {
    flexGrow: 1,
    flexShrink: 1,
    fontSize: largerFontSize,
  },
  statusTextCorrect: {
    backgroundColor: lightGreen,
    color: greenFont,
    fontSize: smallerFontSize,
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  statusTextIncorrect: {
    backgroundColor: lightRed,
    color: redFont,
    fontSize: smallerFontSize,
    borderRadius: 16,
    marginLeft: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  infoText: {
    fontSize: smallFontSize,
    color: greyedOutFont,
    marginTop: 2,
  },
});

export default ClientAppointment;
