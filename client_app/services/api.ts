import { API_URL, BASE_URL } from "@/constants/api-config";
import AppointmentModel, {
  AppointmentResponseDto,
  appointmentModelFromResponseDto,
} from "@/models/data-models/appointmentModel";
import {
  OpinionModel,
  ReviewResponseDto,
  opinionModelFromResponseDto,
} from "@/models/data-models/opinionModel";
import { ProfileUpdateDto } from "@/models/data-models/profile";
import {
  SalonModel,
  SalonModelResponseDto,
  SalonsSearchRequestParams,
  salonModelFromResponseDto,
} from "@/models/data-models/salonModel";
import {
  ServiceModel,
  ServiceResponseDto,
  serviceModelFromResponseDto,
} from "@/models/data-models/serviceModel";
import {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  UserProfile,
} from "../models/data-models/auth";
import { Toast } from "toastify-react-native";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `Request failed: ${res.status}`);
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return undefined as unknown as T;
  }

  return res.json();
}

function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

function authenticatedRequest<T>(
  url: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  return request<T>(url, {
    ...options,
    headers: {
      ...authHeaders(token),
      ...(options.headers as Record<string, string>),
    },
  });
}

/** Unwrap DRF paginated responses ({ results: T[] }) or plain arrays. */
function unwrapList<T>(data: T[] | { results: T[] }): T[] {
  return Array.isArray(data) ? data : data.results;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function loginRequest(credentials: LoginPayload): Promise<AuthResponse> {
  const data = await request<{
    access: string;
    refresh: string;
    user: Record<string, unknown>;
  }>(`${API_URL}/auth/login/`, {
    method: "POST",
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
  });

  return {
    access: data.access,
    refresh: data.refresh,
    user: mapUserProfile(data.user),
  };
}

export async function registerRequest(payload: RegisterPayload): Promise<AuthResponse> {
  const { email, password, name, surname, street, city, postalCode } = payload;

  if (!email || !password || !name || !surname || !street || !city || !postalCode) {
    throw new Error("Fill in the required fields.");
  }

  const data = await request<{
    access: string;
    refresh: string;
    user: Record<string, unknown>;
  }>(`${API_URL}/auth/register/`, {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      name,
      surname,
      street,
      city,
      postal_code: postalCode,
    }),
  });

  return {
    access: data.access,
    refresh: data.refresh,
    user: mapUserProfile(data.user),
  };
}

export async function refreshToken(refreshTokenValue: string): Promise<{ access: string }> {
  return request<{ access: string }>(`${API_URL}/auth/token/refresh/`, {
    method: "POST",
    body: JSON.stringify({ refresh: refreshTokenValue }),
  });
}

export async function fetchProfile(token: string): Promise<UserProfile> {
  const data = await authenticatedRequest<Record<string, unknown>>(
    `${API_URL}/auth/profile/`,
    token
  );
  return mapUserProfile(data);
}

export async function updateUserProfileData(
  profileUpdateData: ProfileUpdateDto,
  token: string
): Promise<boolean> {
  try {
    const body: Record<string, unknown> = {};
    if (profileUpdateData.name !== undefined) body.name = profileUpdateData.name;
    if (profileUpdateData.surname !== undefined) body.surname = profileUpdateData.surname;
    if (profileUpdateData.email !== undefined) body.email = profileUpdateData.email;
    if (profileUpdateData.newPassword !== undefined) body.new_password = profileUpdateData.newPassword;

    await authenticatedRequest<unknown>(`${API_URL}/auth/profile/`, token, {
      method: "PATCH",
      body: JSON.stringify(body),
    });

    Toast.success("Pomyślnie zapisano dane użytkownika");
    return true;
  } catch {
    Toast.error("Zapis danych nie powiódł się. Spróbuj ponownie później");
    return false;
  }
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export type SubCategoryItem = {
  id: number;
  name: string;
};

export type CategoryItem = {
  id: number;
  name: string;
  icon: string | null;
  subcategories: SubCategoryItem[];
};

type CategoryResponseItem = {
  id: number;
  name: string;
  icon: string | null;
  subcategories?: SubCategoryItem[];
};

export async function fetchCategories(): Promise<CategoryItem[]> {
  const data = await request<CategoryResponseItem[] | { results: CategoryResponseItem[] }>(
    `${API_URL}/categories/`
  );
  const list = unwrapList(data);
  return list.map((c) => ({
    ...c,
    icon: c.icon ? `${BASE_URL}${c.icon}` : null,
    subcategories: c.subcategories ?? [],
  }));
}

// ---------------------------------------------------------------------------
// Salons
// ---------------------------------------------------------------------------

export async function fetchAllSalons(params: SalonsSearchRequestParams): Promise<SalonModel[]> {
  const queryParts: string[] = [];

  if (params.searchText) queryParts.push(`search=${encodeURIComponent(params.searchText)}`);
  if (params.locationText) queryParts.push(`location=${encodeURIComponent(params.locationText)}`);
  if (params.date) queryParts.push(`start_date=${formatDate(params.date)}`);
  if (params.startHour) queryParts.push(`start_hour=${encodeURIComponent(params.startHour)}`);
  if (params.endHour) queryParts.push(`end_hour=${encodeURIComponent(params.endHour)}`);
  if (params.latitude != null && params.longitude != null) {
    queryParts.push(`lat=${params.latitude}`);
    queryParts.push(`lng=${params.longitude}`);
    queryParts.push(`distance=${params.distance}`);
  }
  if (params.subcategoryId != null) queryParts.push(`subcategory_id=${params.subcategoryId}`);

  const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";

  const data = await request<SalonModelResponseDto[] | { results: SalonModelResponseDto[] }>(
    `${API_URL}/salons/${queryString}`
  );

  return unwrapList(data).map((dto) => salonModelFromResponseDto(dto, BASE_URL));
}

export async function fetchSalon(salonId: number): Promise<SalonModel> {
  const data = await request<SalonModelResponseDto>(
    `${API_URL}/salons/${salonId}/`
  );

  return salonModelFromResponseDto(data, BASE_URL);
}

export async function fetchSalonServices(salonId: number): Promise<ServiceModel[]> {
  const data = await request<ServiceResponseDto[] | { results: ServiceResponseDto[] }>(
    `${API_URL}/salons/${salonId}/services/`
  );

  return unwrapList(data).map(serviceModelFromResponseDto);
}

export async function fetchSalonReviews(salonId: number): Promise<OpinionModel[]> {
  const data = await request<ReviewResponseDto[] | { results: ReviewResponseDto[] }>(
    `${API_URL}/salons/${salonId}/reviews/`
  );

  return unwrapList(data).map(opinionModelFromResponseDto);
}

// ---------------------------------------------------------------------------
// Available Slots (public)
// ---------------------------------------------------------------------------

export type AvailableSlot = {
  start_time: string;
  end_time: string;
  available: boolean;
};

export async function fetchSalonAvailableSlots(
  salonId: number,
  date: string,
  serviceId: number
): Promise<AvailableSlot[]> {
  return request<AvailableSlot[]>(
    `${API_URL}/salons/${salonId}/available-slots/?date=${date}&service_id=${serviceId}`
  );
}

// ---------------------------------------------------------------------------
// Appointments
// ---------------------------------------------------------------------------

export async function fetchClientAppointmentHistory(
  token: string
): Promise<AppointmentModel[]> {
  const data = await authenticatedRequest<AppointmentResponseDto[] | { results: AppointmentResponseDto[] }>(
    `${API_URL}/appointments/`,
    token
  );

  return unwrapList(data).map(appointmentModelFromResponseDto);
}

export async function createAppointment(
  appointmentData: {
    salon: number;
    service: number;
    employee: number;
    date: string; // ISO datetime: YYYY-MM-DDTHH:MM:SS
  },
  token: string
): Promise<unknown> {
  return authenticatedRequest<unknown>(
    `${API_URL}/appointments/`,
    token,
    {
      method: "POST",
      body: JSON.stringify(appointmentData),
    }
  );
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function mapUserProfile(data: Record<string, unknown>): UserProfile {
  return {
    id: String(data.id ?? ""),
    email: String(data.email ?? ""),
    name: String(data.name ?? ""),
    surname: String(data.surname ?? ""),
    street: String(data.street ?? ""),
    city: String(data.city ?? ""),
    postalCode: String(data.postal_code ?? data.postalCode ?? ""),
  };
}
