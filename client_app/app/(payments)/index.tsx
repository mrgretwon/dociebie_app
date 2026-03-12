import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import Button from "@/components/Button";
import {
  baseGrey,
  darkGreyFont,
  greyFont,
  greyedOutFont,
  smallFontSize,
} from "@/constants/style-vars";
import { useTranslations } from "@/hooks/use-translations";
import { SafeAreaView } from "react-native-safe-area-context";

const CardBrandIcon = () => {
  return (
    <View style={styles.cardBrandIcon}>
      <View style={[styles.cardBrandCircle, styles.cardBrandCircleLeft]} />
      <View style={[styles.cardBrandCircle, styles.cardBrandCircleRight]} />
    </View>
  );
};

const PaymentBadge = ({ text }: { text: string }) => (
  <View style={styles.paymentBadge}>
    <Text style={styles.paymentBadgeText}>{text}</Text>
  </View>
);

const PaymentsScreen = () => {
  const translate = useTranslations();

  const [fullName, setFullName] = useState(translate("PAYMENT_SAMPLE_NAME"));
  const [cardNumber, setCardNumber] = useState(translate("PAYMENT_SAMPLE_CARD_NUMBER"));
  const [cvv, setCvv] = useState(translate("PAYMENT_SAMPLE_CVV"));
  const [expiry, setExpiry] = useState(translate("PAYMENT_SAMPLE_EXPIRY"));

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>{translate("PAYMENT_ADD_PAYMENT")}</Text>
          <Text style={styles.subtitle}>{translate("PAYMENT_ADD_CARD_SUBTITLE")}</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{translate("NAME_AND_SURNAME")}</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder={translate("PAYMENT_NAME_PLACEHOLDER")}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{translate("PAYMENT_CARD_NUMBER_LABEL")}</Text>
            <View style={styles.inputWithIcon}>
              <CardBrandIcon />
              <TextInput
                style={[styles.input, styles.inputNoBorder]}
                value={cardNumber}
                onChangeText={setCardNumber}
                keyboardType="number-pad"
                placeholder={translate("PAYMENT_CARD_NUMBER_PLACEHOLDER")}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.fieldGroup, styles.rowItem]}>
              <Text style={styles.label}>{translate("PAYMENT_CVV_LABEL")}</Text>
              <TextInput
                style={styles.input}
                value={cvv}
                onChangeText={setCvv}
                secureTextEntry
                keyboardType="number-pad"
                placeholder="•••"
              />
            </View>
            <View style={[styles.fieldGroup, styles.rowItem]}>
              <Text style={styles.label}>{translate("PAYMENT_EXPIRY_LABEL")}</Text>
              <TextInput
                style={styles.input}
                value={expiry}
                onChangeText={setExpiry}
                keyboardType="number-pad"
                placeholder="MM / YYYY"
              />
            </View>
          </View>

          <Button
            text={translate("PAYMENT_ADD_BUTTON")}
            onClick={() => {}}
            style={styles.addButton}
          />

          <TouchableOpacity style={styles.bankTransferButton}>
            <Text style={styles.bankTransferText}>{translate("PAYMENT_TRANSFER_BUTTON")}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.securityContainer}>
          <Text style={styles.securityText}>{translate("PAYMENT_SECURITY_NOTE")}</Text>
          <View style={styles.badgesRow}>
            <PaymentBadge text="VISA" />
            <PaymentBadge text="Apple Pay" />
            <PaymentBadge text="Google Pay" />
          </View>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: baseGrey,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
    marginTop: 16,
  },
  title: {
    color: darkGreyFont,
    fontWeight: "700",
    fontSize: 18,
  },
  subtitle: {
    marginTop: 4,
    color: greyedOutFont,
    fontSize: smallFontSize,
  },
  fieldGroup: {
    marginTop: 16,
  },
  label: {
    color: greyFont,
    fontSize: smallFontSize,
    marginBottom: 8,
  },
  input: {
    width: "100%",
    backgroundColor: "white",
    borderColor: "#D0D5DD",
    borderWidth: 1,
    borderRadius: 8,
    color: darkGreyFont,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  inputWithIcon: {
    width: "100%",
    backgroundColor: "white",
    borderColor: "#D0D5DD",
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  inputNoBorder: {
    borderWidth: 0,
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  rowItem: {
    flex: 1,
  },
  addButton: {
    marginTop: 20,
  },
  bankTransferButton: {
    marginTop: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "white",
  },
  bankTransferText: {
    color: darkGreyFont,
    fontSize: smallFontSize,
    fontWeight: "700",
  },
  securityContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  securityText: {
    marginTop: 12,
    color: greyedOutFont,
    fontSize: smallFontSize,
  },
  badgesRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  paymentBadge: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E4E7EC",
    minWidth: 70,
    alignItems: "center",
    marginHorizontal: 6,
  },
  paymentBadgeText: {
    color: darkGreyFont,
    fontWeight: "700",
  },
  cardBrandIcon: {
    width: 32,
    height: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  cardBrandCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    opacity: 0.9,
  },
  cardBrandCircleLeft: {
    backgroundColor: "#EB001B",
    marginRight: -6,
  },
  cardBrandCircleRight: {
    backgroundColor: "#F79E1B",
  },
});

export default PaymentsScreen;
