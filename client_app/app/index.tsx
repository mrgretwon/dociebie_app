import splashLogo from "@/assets/images/splash-icon.png";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

export default function SplashScreen() {
  const router = useRouter();
  const opacity = useSharedValue(1);

  useEffect(() => {
    // Start fading out after 0.5s, fade takes 1s → total 1.5s
    opacity.value = withDelay(500, withTiming(0, { duration: 1000 }));

    const timeout = setTimeout(() => {
      router.replace("/(home)");
    }, 1500);

    return () => clearTimeout(timeout);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={animatedStyle}>
        <Image
          source={splashLogo}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 200,
    maxWidth: "90%",
    alignSelf: "center",
    aspectRatio: 1190 / 1246,
  },
});
