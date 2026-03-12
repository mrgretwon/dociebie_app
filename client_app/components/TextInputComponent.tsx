import { blackFont, greyedOutFont, lightGrey } from "@/constants/style-vars";
import React from "react";
import { StyleSheet, TextInput } from "react-native";

interface TextInputComponentProps {
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
  placeholderText?: string;
  secureTextEntry?: boolean;
  style?: object;
}

const TextInputComponent = ({
  text,
  setText,
  placeholderText = "",
  secureTextEntry = false,
  style,
}: TextInputComponentProps) => {
  return (
    <TextInput
      style={[styles.inputBox, style ?? {}]}
      secureTextEntry={secureTextEntry}
      value={text}
      onChangeText={setText}
      placeholder={placeholderText}
      placeholderTextColor={greyedOutFont}
    />
  );
};
const styles = StyleSheet.create({
  inputBox: {
    width: "100%",
    backgroundColor: "white",
    borderColor: lightGrey,
    borderWidth: 1,
    borderRadius: 8,
    color: blackFont,
    height: 48,
    paddingHorizontal: 16,
  },
});

export default TextInputComponent;
