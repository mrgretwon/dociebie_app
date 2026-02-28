import salonPlaceholder from "@/assets/images/salon.png";
import { Image } from "expo-image";
import { StyleSheet } from "react-native";

interface ImageWithRoundedBottomProps {
  imageUri?: string;
}

const ImageWithRoundedBottom = ({ imageUri }: ImageWithRoundedBottomProps) => {
  return (
    <Image
      style={styles.image}
      contentFit="cover"
      source={imageUri || salonPlaceholder}
    />
  );
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
