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

export type CategoryItem = {
  id: number;
  name: string;
  icon: string | null;
};

export async function fetchCategories(): Promise<CategoryItem[]> {
  const data = await request<CategoryItem[] | { results: CategoryItem[] }>(
    `${API_URL}/categories/`
  );
  const list = unwrapList(data);
  return list.map((c) => ({
    ...c,
    icon: c.icon ? `${BASE_URL}${c.icon}` : null,
  }));
}

// ---------------------------------------------------------------------------
// Salons
// ---------------------------------------------------------------------------

export async function fetchAllSalons(params: SalonsSearchRequestParams): Promise<SalonModel[]> {
  const queryParts: string[] = [];

  if (params.searchText) queryParts.push(`search=${encodeURIComponent(params.searchText)}`);
  if (params.locationText) queryParts.push(`location=${encodeURIComponent(params.locationText)}`);
  if (params.startDate) queryParts.push(`start_date=${formatDate(params.startDate)}`);
  if (params.endDate) queryParts.push(`end_date=${formatDate(params.endDate)}`);

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
// Provider — Salon
// ---------------------------------------------------------------------------

export async function fetchProviderSalon(token: string): Promise<Record<string, unknown>> {
  return authenticatedRequest<Record<string, unknown>>(
    `${API_URL}/provider/salon/`,
    token
  );
}

export async function updateProviderSalon(
  data: Record<string, unknown>,
  token: string
): Promise<Record<string, unknown>> {
  return authenticatedRequest<Record<string, unknown>>(
    `${API_URL}/provider/salon/`,
    token,
    { method: "PATCH", body: JSON.stringify(data) }
  );
}

export async function uploadProviderSalonImage(
  imageUri: string,
  token: string
): Promise<Record<string, unknown>> {
  const formData = new FormData();
  const filename = imageUri.split("/").pop() ?? "photo.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : "image/jpeg";
  formData.append("main_image", { uri: imageUri, name: filename, type } as unknown as Blob);

  const res = await fetch(`${API_URL}/provider/salon/`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `Upload failed: ${res.status}`);
  }

  return res.json();
}

export type OpeningHoursItem = {
  id?: number;
  day_of_week: number;
  open_time: string;
  close_time: string;
};

export async function fetchProviderOpeningHours(
  token: string
): Promise<OpeningHoursItem[]> {
  const data = await authenticatedRequest<
    OpeningHoursItem[] | { results: OpeningHoursItem[] }
  >(`${API_URL}/provider/salon/opening-hours/`, token);
  return unwrapList(data);
}

export async function updateProviderOpeningHours(
  hours: { day_of_week: number; open_time: string; close_time: string }[],
  token: string
): Promise<unknown> {
  return authenticatedRequest<unknown>(
    `${API_URL}/provider/salon/opening-hours/`,
    token,
    { method: "PUT", body: JSON.stringify({ opening_hours: hours }) }
  );
}

export async function updateProviderSubscription(
  data: Record<string, unknown>,
  token: string
): Promise<Record<string, unknown>> {
  return authenticatedRequest<Record<string, unknown>>(
    `${API_URL}/provider/salon/subscription/`,
    token,
    { method: "PATCH", body: JSON.stringify(data) }
  );
}

export async function fetchProviderBankAccount(
  token: string
): Promise<Record<string, unknown>> {
  return authenticatedRequest<Record<string, unknown>>(
    `${API_URL}/provider/salon/bank-account/`,
    token
  );
}

export async function updateProviderBankAccount(
  data: Record<string, unknown>,
  token: string
): Promise<Record<string, unknown>> {
  return authenticatedRequest<Record<string, unknown>>(
    `${API_URL}/provider/salon/bank-account/`,
    token,
    { method: "PATCH", body: JSON.stringify(data) }
  );
}

// ---------------------------------------------------------------------------
// Provider — Employees
// ---------------------------------------------------------------------------

export async function fetchProviderEmployees(
  token: string
): Promise<{ id: number; name: string; surname: string; image: string | null }[]> {
  const data = await authenticatedRequest<
    { id: number; name: string; surname: string; image: string | null }[]
    | { results: { id: number; name: string; surname: string; image: string | null }[] }
  >(`${API_URL}/provider/employees/`, token);
  return unwrapList(data);
}

export async function fetchProviderEmployee(
  id: number,
  token: string
): Promise<{ id: number; name: string; surname: string; image: string | null }> {
  return authenticatedRequest<{ id: number; name: string; surname: string; image: string | null }>(
    `${API_URL}/provider/employees/${id}/`,
    token
  );
}

export async function createProviderEmployee(
  data: { name: string; surname: string },
  token: string
): Promise<unknown> {
  return authenticatedRequest<unknown>(
    `${API_URL}/provider/employees/`,
    token,
    { method: "POST", body: JSON.stringify(data) }
  );
}

export async function updateProviderEmployee(
  id: number,
  data: Record<string, unknown>,
  token: string
): Promise<unknown> {
  return authenticatedRequest<unknown>(
    `${API_URL}/provider/employees/${id}/`,
    token,
    { method: "PATCH", body: JSON.stringify(data) }
  );
}

export async function uploadProviderEmployeeImage(
  id: number,
  imageUri: string,
  token: string
): Promise<{ id: number; name: string; surname: string; image: string | null }> {
  const formData = new FormData();
  const filename = imageUri.split("/").pop() ?? "photo.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : "image/jpeg";
  formData.append("image", { uri: imageUri, name: filename, type } as unknown as Blob);

  const res = await fetch(`${API_URL}/provider/employees/${id}/`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `Upload failed: ${res.status}`);
  }

  return res.json();
}

export async function deleteProviderEmployee(
  id: number,
  token: string
): Promise<void> {
  return authenticatedRequest<void>(
    `${API_URL}/provider/employees/${id}/`,
    token,
    { method: "DELETE" }
  );
}

// ---------------------------------------------------------------------------
// Provider — Services
// ---------------------------------------------------------------------------

export async function fetchProviderServices(
  token: string
): Promise<{ id: number; name: string; price: string; minutes_duration: number }[]> {
  const data = await authenticatedRequest<
    { id: number; name: string; price: string; minutes_duration: number }[]
    | { results: { id: number; name: string; price: string; minutes_duration: number }[] }
  >(`${API_URL}/provider/services/`, token);
  return unwrapList(data);
}

export async function fetchProviderService(
  id: number,
  token: string
): Promise<{ id: number; name: string; price: string; minutes_duration: number }> {
  return authenticatedRequest<{ id: number; name: string; price: string; minutes_duration: number }>(
    `${API_URL}/provider/services/${id}/`,
    token
  );
}

export async function createProviderService(
  data: { name: string; price: string; minutes_duration: number },
  token: string
): Promise<unknown> {
  return authenticatedRequest<unknown>(
    `${API_URL}/provider/services/`,
    token,
    { method: "POST", body: JSON.stringify(data) }
  );
}

export async function updateProviderService(
  id: number,
  data: Record<string, unknown>,
  token: string
): Promise<unknown> {
  return authenticatedRequest<unknown>(
    `${API_URL}/provider/services/${id}/`,
    token,
    { method: "PATCH", body: JSON.stringify(data) }
  );
}

export async function deleteProviderService(
  id: number,
  token: string
): Promise<void> {
  return authenticatedRequest<void>(
    `${API_URL}/provider/services/${id}/`,
    token,
    { method: "DELETE" }
  );
}

// ---------------------------------------------------------------------------
// Provider — Clients
// ---------------------------------------------------------------------------

export async function fetchProviderClients(
  token: string,
  filters?: { start_date?: string; end_date?: string }
): Promise<Record<string, unknown>[]> {
  const params: string[] = [];
  if (filters?.start_date) params.push(`start_date=${filters.start_date}`);
  if (filters?.end_date) params.push(`end_date=${filters.end_date}`);
  const qs = params.length ? `?${params.join("&")}` : "";
  const data = await authenticatedRequest<
    Record<string, unknown>[] | { results: Record<string, unknown>[] }
  >(`${API_URL}/provider/clients/${qs}`, token);
  return unwrapList(data);
}

export async function createProviderClient(
  data: { name: string; surname: string; email: string; phone?: string; notes?: string },
  token: string
): Promise<unknown> {
  return authenticatedRequest<unknown>(
    `${API_URL}/provider/clients/`,
    token,
    { method: "POST", body: JSON.stringify(data) }
  );
}

export async function fetchProviderClient(
  id: number,
  token: string
): Promise<Record<string, unknown>> {
  return authenticatedRequest<Record<string, unknown>>(
    `${API_URL}/provider/clients/${id}/`,
    token
  );
}

export async function updateProviderClient(
  id: number,
  data: Record<string, unknown>,
  token: string
): Promise<unknown> {
  return authenticatedRequest<unknown>(
    `${API_URL}/provider/clients/${id}/`,
    token,
    { method: "PATCH", body: JSON.stringify(data) }
  );
}

export async function fetchProviderClientVisits(
  clientId: number,
  token: string,
  filters?: { start_date?: string; end_date?: string }
): Promise<Record<string, unknown>[]> {
  const params: string[] = [];
  if (filters?.start_date) params.push(`start_date=${filters.start_date}`);
  if (filters?.end_date) params.push(`end_date=${filters.end_date}`);
  const qs = params.length ? `?${params.join("&")}` : "";
  const data = await authenticatedRequest<
    Record<string, unknown>[] | { results: Record<string, unknown>[] }
  >(`${API_URL}/provider/clients/${clientId}/visits/${qs}`, token);
  return unwrapList(data);
}

// ---------------------------------------------------------------------------
// Provider — Client Groups
// ---------------------------------------------------------------------------

export async function fetchProviderClientGroups(
  token: string
): Promise<Record<string, unknown>[]> {
  const data = await authenticatedRequest<
    Record<string, unknown>[] | { results: Record<string, unknown>[] }
  >(`${API_URL}/provider/client-groups/`, token);
  return unwrapList(data);
}

export async function createProviderClientGroup(
  data: { name: string },
  token: string
): Promise<unknown> {
  return authenticatedRequest<unknown>(
    `${API_URL}/provider/client-groups/`,
    token,
    { method: "POST", body: JSON.stringify(data) }
  );
}

export async function fetchProviderClientGroup(
  id: number,
  token: string
): Promise<Record<string, unknown>> {
  return authenticatedRequest<Record<string, unknown>>(
    `${API_URL}/provider/client-groups/${id}/`,
    token
  );
}

export async function updateProviderClientGroup(
  id: number,
  data: Record<string, unknown>,
  token: string
): Promise<unknown> {
  return authenticatedRequest<unknown>(
    `${API_URL}/provider/client-groups/${id}/`,
    token,
    { method: "PATCH", body: JSON.stringify(data) }
  );
}

export async function deleteProviderClientGroup(
  id: number,
  token: string
): Promise<void> {
  return authenticatedRequest<void>(
    `${API_URL}/provider/client-groups/${id}/`,
    token,
    { method: "DELETE" }
  );
}

export async function addClientToGroup(
  groupId: number,
  clientId: number,
  token: string
): Promise<unknown> {
  return authenticatedRequest<unknown>(
    `${API_URL}/provider/client-groups/${groupId}/members/`,
    token,
    { method: "POST", body: JSON.stringify({ client_id: clientId }) }
  );
}

export async function removeClientFromGroup(
  groupId: number,
  clientId: number,
  token: string
): Promise<void> {
  return authenticatedRequest<void>(
    `${API_URL}/provider/client-groups/${groupId}/members/${clientId}/`,
    token,
    { method: "DELETE" }
  );
}

// ---------------------------------------------------------------------------
// Provider — Appointments / Calendar
// ---------------------------------------------------------------------------

export async function fetchProviderAppointments(
  token: string,
  filters?: { date?: string; month?: number; year?: number; status?: string }
): Promise<Record<string, unknown>[]> {
  const params: string[] = [];
  if (filters?.date) params.push(`date=${filters.date}`);
  if (filters?.month !== undefined) params.push(`month=${filters.month}`);
  if (filters?.year !== undefined) params.push(`year=${filters.year}`);
  if (filters?.status) params.push(`status=${filters.status}`);
  const qs = params.length ? `?${params.join("&")}` : "";
  const data = await authenticatedRequest<
    Record<string, unknown>[] | { results: Record<string, unknown>[] }
  >(`${API_URL}/provider/appointments/${qs}`, token);
  return unwrapList(data);
}

export async function updateAppointmentStatus(
  id: number,
  appointmentStatus: string,
  token: string
): Promise<Record<string, unknown>> {
  return authenticatedRequest<Record<string, unknown>>(
    `${API_URL}/provider/appointments/${id}/`,
    token,
    { method: "PATCH", body: JSON.stringify({ status: appointmentStatus }) }
  );
}

export async function fetchPendingCount(
  token: string
): Promise<{ count: number }> {
  return authenticatedRequest<{ count: number }>(
    `${API_URL}/provider/appointments/pending-count/`,
    token
  );
}

export async function createProviderAppointment(
  data: { client_email: string; service_id: number; employee_id: number; date: string },
  token: string
): Promise<unknown> {
  return authenticatedRequest<unknown>(
    `${API_URL}/provider/appointments/`,
    token,
    { method: "POST", body: JSON.stringify(data) }
  );
}

export async function fetchAvailableSlots(
  date: string,
  serviceId: number,
  token: string,
  employeeId?: number
): Promise<{ start_time: string; end_time: string; available: boolean }[]> {
  let url = `${API_URL}/provider/appointments/available-slots/?date=${date}&service_id=${serviceId}`;
  if (employeeId) url += `&employee_id=${employeeId}`;
  const data = await authenticatedRequest<
    { start_time: string; end_time: string; available: boolean }[]
    | { results: { start_time: string; end_time: string; available: boolean }[] }
  >(url, token);
  return unwrapList(data);
}

// ---------------------------------------------------------------------------
// Provider — Financial
// ---------------------------------------------------------------------------

export async function fetchFinancialSummary(
  token: string
): Promise<Record<string, unknown>> {
  return authenticatedRequest<Record<string, unknown>>(
    `${API_URL}/provider/financial-summary/`,
    token
  );
}

export async function fetchPaymentHistory(
  token: string,
  filters?: { start_date?: string; end_date?: string }
): Promise<Record<string, unknown>[]> {
  const params: string[] = [];
  if (filters?.start_date) params.push(`start_date=${filters.start_date}`);
  if (filters?.end_date) params.push(`end_date=${filters.end_date}`);
  const qs = params.length ? `?${params.join("&")}` : "";
  const data = await authenticatedRequest<
    Record<string, unknown>[] | { results: Record<string, unknown>[] }
  >(`${API_URL}/provider/payment-history/${qs}`, token);
  return unwrapList(data);
}

export async function generateReport(
  data: { start_date: string; end_date: string },
  token: string
): Promise<Record<string, unknown>> {
  return authenticatedRequest<Record<string, unknown>>(
    `${API_URL}/provider/reports/`,
    token,
    { method: "POST", body: JSON.stringify(data) }
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
