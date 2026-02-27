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
  servicesImage: string;
  opinionsImage: string;
  detailsImage: string;
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
  main_image: string;
  services_image: string;
  reviews_image: string;
  details_image: string;
}

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
  employees: salonDto.employees,
  openingHours: salonDto.opening_hours,
  mainImage: serverUrl + salonDto.main_image,
  servicesImage: serverUrl + salonDto.services_image,
  opinionsImage: serverUrl + salonDto.reviews_image,
  detailsImage: serverUrl + salonDto.details_image,
});
