import AppointmentModel from "@/models/data-models/appointmentModel";
import { ProfileUpdateDto } from "@/models/data-models/profile";
import { SalonModel, SalonsSearchRequestParams } from "@/models/data-models/salonModel";
import { Toast } from "toastify-react-native";
import { dummyUserProfile, salon, sampleAppointments, sampleSalons } from "../constants/dummy-data";
import {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  UserProfile,
} from "../models/data-models/auth";

export async function fetchCategories(): Promise<string[]> {
  return [
    "Ogrodnictwo",
    "Filmowanie",
    "Sprzątanie",
    "Usługi kurierskie",
    "Naprawa",
    "Przeprowadzka",
  ];
  // const res = await fetch('https://example.com/api/categories');
  // if (!res.ok) {
  //   throw new Error(`Fetch categories request failed: ${res.status}`);
  // }
  // const data = await res.json();
  // return data as string[];
}
export async function fetchProfile(token: string): Promise<UserProfile> {
  await delay(400);

  return {
    ...dummyUserProfile,
  };
}

export async function registerRequest(payload: RegisterPayload): Promise<AuthResponse> {
  const { email, password, name, surname, street, city, postalCode } = payload;

  if (!email || !password || !name || !surname || !street || !city || !postalCode) {
    throw new Error("Fill in the required fields.");
  }

  await delay(700);

  return {
    token: "sample-token",
    user: {
      id: "1",
      email,
      name,
      surname,
      street,
      city,
      postalCode,
    },
  };
}
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function loginRequest(credentials: LoginPayload): Promise<AuthResponse> {
  // login
  // Toast.error("Nieprawidłowe hasło bądź email")

  const { email, password } = credentials;

  await delay(500);

  return {
    token: "sample-token",
    user: {
      ...dummyUserProfile,
      email: email.toLowerCase(),
    },
  };
}

export async function fetchClientAppointmentHistory(token: string): Promise<AppointmentModel[]> {
  // get
  // Toast.error("Nie udało się pobrać historii usług. Spróbuj ponownie później")
  await delay(1000);
  return sampleAppointments;
}

export async function updateUserProfileData(
  profileUpdateData: ProfileUpdateDto,
  token: string
): Promise<boolean> {
  // patch
  // Toast.error("Zapis danych nie powiódł się. Spróbuj ponownie później")
  await delay(500);
  Toast.success("Pomyślnie zapisano dane użytkownika");
  return true;
}

// add some caching or persistance on it, so only the first call fetches the data
export async function fetchSalon(salonId: number): Promise<SalonModel> {
  // get
  // Toast.error("Nie udało się pobrać danych. Spróbuj ponownie później")
  return salon;
}

export async function fetchAllSalons(params: SalonsSearchRequestParams): Promise<SalonModel[]> {
  // get
  // Toast.error("Nie udało się pobrać usługodawców. Spróbuj ponownie później")
  return sampleSalons;
}
