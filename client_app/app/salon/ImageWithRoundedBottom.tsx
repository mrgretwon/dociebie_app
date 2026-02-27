import salon from "@/assets/images/salon.png";
import { Image } from "expo-image";
import { StyleSheet } from "react-native";

const ImageWithRoundedBottom = () => {
  return <Image style={styles.image} contentFit="cover" source={salon as any} />;
};

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: 300,
    borderBottomLeftRadius: 125,
    borderBottomRightRadius: 125,
  },
});

export default ImageWithRoundedBottom;
