import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import CheckmarkIconSvg from "@/assets/svg/checkmark-icon-svg";
import ConfirmationIconSvg from "@/assets/svg/confirmation-icon-svg";
import Button from "@/components/Button";
import {
  baseGrey,
  darkGreyFont,
  darkerGreyFont,
  greyedOutFont,
  lightGrey,
  smallFontSize,
} from "@/constants/style-vars";
import { useTranslations } from "@/hooks/use-translations";

type BookingConfirmationModalProps = {
  visible: boolean;
  onClose: () => void;
  onPay?: () => void;
};

export default function BookingConfirmationModal({
  visible,
  onClose,
  onPay = onClose,
}: BookingConfirmationModalProps) {
  const translate = useTranslations();

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{translate("CONFIRM_APPOINTMENT_TITLE")}</Text>
          <Text style={styles.modalDate}>25 marca 2022, 11:45</Text>

          <View style={styles.modalServiceContainer}>
            <View style={styles.modalServiceHeader}>
              <View style={styles.modalServiceTitle}>
                <View style={styles.modalIconWrapper}>
                  <ConfirmationIconSvg />
                </View>
                <Text style={styles.modalServiceName}>
                  {translate("CONFIRM_APPOINTMENT_SERVICE_NAME")}
                </Text>
              </View>
              <CheckmarkIconSvg />
            </View>

            <View style={styles.modalPriceContainer}>
              <Text style={styles.modalPriceText}>135zł</Text>
              <Text style={styles.modalNoteText}>
                {translate("CONFIRM_APPOINTMENT_PUNCTUALITY_NOTE")}
              </Text>
            </View>
          </View>

          <Button text={translate("PAY")} onClick={onPay} style={styles.modalPayButton} />

          <Button
            text={translate("CANCEL")}
            onClick={onPay}
            style={styles.modalCancelButton}
            textStyle={styles.modalCancelText}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(16, 24, 40, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#101828",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
  modalTitle: {
    color: darkerGreyFont,
    fontSize: 18,
    fontWeight: "700",
  },
  modalDate: {
    marginTop: 6,
    color: greyedOutFont,
    fontSize: smallFontSize,
  },
  modalServiceContainer: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: lightGrey,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "white",
  },
  modalServiceHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: lightGrey,
  },
  modalServiceTitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: baseGrey,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  modalServiceName: {
    color: darkGreyFont,
    fontSize: smallFontSize,
    fontWeight: "700",
  },
  modalPriceContainer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  modalPriceText: {
    color: darkerGreyFont,
    fontSize: 28,
    fontWeight: "800",
  },
  modalNoteText: {
    marginTop: 4,
    color: greyedOutFont,
    fontSize: smallFontSize,
  },
  modalPayButton: {
    marginTop: 20,
    width: "100%",
    borderWidth: 0,
  },
  modalCancelButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: lightGrey,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "white",
  },
  modalCancelText: {
    color: darkGreyFont,
    fontSize: smallFontSize,
    fontWeight: "700",
  },
});
