import { OpinionModel } from "./opinionModel";
import SalonEmployeeModel from "./salonEmployeeModel";

export interface SalonModel {
  id: number;
  name: string;
  type: string;
  address: string;
  phoneNumber: string;
  mail: string;
  rating: number;
  opinions: OpinionModel[];
  openingHours: string[];
  employees: SalonEmployeeModel[];
  mainImage: string;
}

export interface SalonsSearchRequestParams {
  searchText: string;
  locationText: string;
  startDate: Date;
  endDate: Date;
  distance: number;
}

export interface SalonModelResponseDto {
  id: number;
  name: string;
  type: string;
  location_name: string;
  phone_number: string;
  mail: string;
  rating: number;
  opening_hours: string[];
  employees: SalonEmployeeModel[];
  main_image: string | null;
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
  openingHours: salonDto.opening_hours,
  mainImage: toFullUrl(salonDto.main_image, serverUrl),
});
