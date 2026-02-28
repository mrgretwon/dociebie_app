import splashLogo from "@/assets/images/splash-icon.png";
import { primaryColor } from "@/constants/style-vars";
import { useAuth } from "@/contexts/AuthContext";
import { Redirect, useNavigation } from "expo-router";
import { CommonActions } from "@react-navigation/native";
import { useEffect, useRef } from "react";
import { Image, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

let hasLaunched = false;

export default function SplashScreen() {
  const navigation = useNavigation();
  const { token, isHydrating } = useAuth();
  const opacity = useSharedValue(1);

  // If user somehow navigates back here after the initial launch, redirect immediately
  if (hasLaunched) {
    return <Redirect href={token ? "/(dashboard)" : "/(auth)/login"} />;
  }

  useEffect(() => {
    if (isHydrating) return;

    hasLaunched = true;

    // Start fading out after 0.5s, fade takes 1s → total 1.5s
    opacity.value = withDelay(500, withTiming(0, { duration: 1000 }));

    const timeout = setTimeout(() => {
      const target = token ? "(dashboard)" : "(auth)";
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: target }],
        })
      );
    }, 1500);

    return () => clearTimeout(timeout);
  }, [isHydrating]);

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
    backgroundColor: primaryColor,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 180,
    maxWidth: "90%",
    alignSelf: "center",
    aspectRatio: 1190 / 1246,
  },
});
