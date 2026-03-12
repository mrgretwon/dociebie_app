import { OpinionModel } from "./opinionModel";
import SalonEmployeeModel from "./salonEmployeeModel";

export interface OpeningHoursEntry {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  display: string;
}

export interface SalonModel {
  id: number;
  name: string;
  type: string;
  address: string;
  phoneNumber: string;
  mail: string;
  rating: number;
  opinions: OpinionModel[];
  openingHours: OpeningHoursEntry[];
  employees: SalonEmployeeModel[];
  mainImage: string;
  latitude: number | null;
  longitude: number | null;
}

export interface SalonsSearchRequestParams {
  searchText: string;
  locationText: string;
  date: Date;
  startHour: string;
  endHour: string;
  distance: number;
  latitude?: number;
  longitude?: number;
  subcategoryId?: number | null;
}

export interface SalonModelResponseDto {
  id: number;
  name: string;
  type: string;
  location_name: string;
  phone_number: string;
  mail: string;
  rating: number;
  opening_hours: { day_of_week: number; open_time: string; close_time: string; display: string }[];
  employees: SalonEmployeeModel[];
  main_image: string | null;
  latitude: number | null;
  longitude: number | null;
}

/** Prefix relative URLs with serverUrl; leave absolute URLs as-is. */
const toFullUrl = (url: string | null, serverUrl: string): string => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return serverUrl + url;
};

export const salonModelFromResponseDto = (
  salonDto: SalonModelResponseDto,
  serverUrl: string
): SalonModel => ({
  id: salonDto.id,
  name: salonDto.name,
  type: salonDto.type,
  address: salonDto.location_name,
  phoneNumber: salonDto.phone_number,
  mail: salonDto.mail,
  rating: salonDto.rating,
  opinions: [],
  employees: salonDto.employees.map((emp) => ({
    ...emp,
    image: emp.image ? toFullUrl(emp.image, serverUrl) : undefined,
  })),
  openingHours: salonDto.opening_hours.map((h) => ({
    dayOfWeek: h.day_of_week,
    openTime: h.open_time,
    closeTime: h.close_time,
    display: h.display,
  })),
  mainImage: toFullUrl(salonDto.main_image, serverUrl),
  latitude: salonDto.latitude,
  longitude: salonDto.longitude,
});
