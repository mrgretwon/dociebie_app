import { Platform } from "react-native";

const DEV_BASE_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:8000"
    : "http://localhost:8000";

const PROD_BASE_URL = "https://dociebie.pl";

export const BASE_URL = __DEV__ ? DEV_BASE_URL : PROD_BASE_URL;
export const API_URL = `${BASE_URL}/api`;
