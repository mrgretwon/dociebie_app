import Constants from "expo-constants";
import { Platform } from "react-native";

// For physical devices, use your machine's local network IP.
// Find it via `ipconfig` (Windows) or `ifconfig`/`ip addr` (Linux/Mac).
const LOCAL_NETWORK_IP = "192.168.1.14"; // ← replace with your actual LAN IP

const getDevBaseUrl = () => {
  if (Platform.OS === "android") {
    // expo-constants hostUri is set when running via Expo dev server
    // e.g. "192.168.0.100:8081" — if present, the device can reach that IP
    const hostUri = Constants.expoConfig?.hostUri ?? Constants.experienceUrl;
    const debuggerHost =
      hostUri?.split(":")[0] ?? LOCAL_NETWORK_IP;
    return `http://${debuggerHost}:8000`;
  }
  return "http://localhost:8000";
};

const DEV_BASE_URL = getDevBaseUrl();

const PROD_BASE_URL = "https://dociebie.pl";

export const BASE_URL = __DEV__ ? DEV_BASE_URL : PROD_BASE_URL;
export const API_URL = `${BASE_URL}/api`;
