import { primaryColor } from "@/constants/style-vars";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface ButtonProps {
  text: string;
  onClick: () => void;
  style?: object;
  textStyle?: object;
  disabled?: boolean;
}

const Button = ({ text, onClick, style, textStyle, disabled }: ButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onClick}
      style={[styles.button, style, disabled && { opacity: 0.5 }]}
      disabled={disabled}
    >
      <Text style={[styles.buttonText, textStyle]}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: primaryColor,
    borderWidth: 1,
    borderColor: primaryColor,
  },
  buttonText: {
    width: "100%",
    marginVertical: 12,
    textAlign: "center",
    color: "white",
  },
});

export default Button;
