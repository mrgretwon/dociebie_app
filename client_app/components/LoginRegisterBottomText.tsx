import { greyedOutFont, greyFont, smallFontSize } from "@/constants/style-vars";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface LoginRegisterBottomTextProps {
  firstText: string;
  secondText: string;
  onClick: () => void;
}

const LoginRegisterBottomText = ({
  firstText,
  secondText,
  onClick,
}: LoginRegisterBottomTextProps) => {
  return (
    <TouchableOpacity onPress={onClick}>
      <Text style={styles.bottomText}>
        {firstText} <Text style={styles.bottomTextRegister}>{secondText}</Text>
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  bottomText: {
    color: greyedOutFont,
    fontSize: smallFontSize,
    textAlign: "center",
  },
  bottomTextRegister: {
    color: greyFont,
  },
});

export default LoginRegisterBottomText;
