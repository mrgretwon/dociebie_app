import AppointmentModel from "@/models/data-models/appointmentModel";
import { UserProfile } from "@/models/data-models/auth";
import { OpinionModel } from "@/models/data-models/opinionModel";
import SalonEmployeeModel from "@/models/data-models/salonEmployeeModel";
import { SalonModel } from "@/models/data-models/salonModel";
import { ServiceModel } from "@/models/data-models/serviceModel";

export const monthNames = [
  "Styczeń",
  "Luty",
  "Marzec",
  "Kwiecień",
  "Maj",
  "Czerwiec",
  "Lipiec",
  "Sierpień",
  "Wrzesień",
  "Październik",
  "Listopad",
  "Grudzień",
];
export const daysShortNames = ["PON", "WT", "ŚR", "CZW", "PT", "SOB", "ND"];

export const sampleServices: ServiceModel[] = [
  {
    id: 1,
    name: "Masaż twarzy",
    price: 50,
    minutesDuration: 35,
  },
  {
    id: 2,
    name: "KOBIDO",
    price: 200,
    minutesDuration: 55,
  },
  {
    id: 3,
    name: "Peeling kawitacyjny",
    price: 45,
    minutesDuration: 45,
  },
  {
    id: 4,
    name: "Oczyszczanie",
    price: 180,
    minutesDuration: 60,
  },
  {
    id: 5,
    name: "Sonofereza",
    price: 140,
    minutesDuration: 15,
  },
];

export const sampleReviews: OpinionModel[] = [
  {
    id: 1,
    rating: 5,
    opinionText:
      "Wizyta bardzo udana. Henna rzęs i brwi oraz regulacja zrobione bardzo starannie i estetycznie, tak samo wosk.",
    customerName: "Marianna Kowalska",
    customerLocation: "Poznań, Polska",
  },
  {
    id: 2,
    rating: 4,
    opinionText: "Polecam",
    customerName: "Janusz Maj",
    customerLocation: "Poznań, Polska",
  },
  {
    id: 3,
    rating: 5,
    opinionText:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur dolor sem, aliquam sed felis in, scelerisque pellentesque risus. Praesent euismod rhoncus justo vel porttitor.",
    customerName: "Jan Kowalski",
    customerLocation: "Poznań, Polska",
  },
  {
    id: 4,
    rating: 1,
    opinionText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    customerName: "Agata Meble",
    customerLocation: "Szczecin, Polska",
  },
];

export const sampleEmployees: SalonEmployeeModel[] = [
  {
    id: 1,
    name: "Marysia",
    surname: "Kowalska",
  },
  {
    id: 2,
    name: "Jan",
    surname: "Pawłowski",
  },
  {
    id: 3,
    name: "Jan",
    surname: "Malinowski",
  },
];

export const salon: SalonModel = {
  id: 1,
  name: "Salon u sąsiada",
  type: "Barber",
  address: "ul. Długa 10a, Szczecin",
  phoneNumber: "+48 726 123 456",
  mail: "kontakt@salon.pl",
  rating: 4.9,
  opinions: sampleReviews,
  openingHours: ["Pon-Pt od 9:00 do 17:00", "Sob od 9:00 do 15:00"],
  employees: sampleEmployees,
  mainImage: "",
  servicesImage: "",
  opinionsImage: "",
  detailsImage: "",
};

export const sampleAppointments: AppointmentModel[] = [
  {
    id: 1,
    salon,
    worker: sampleEmployees[0],
    service: sampleServices[3],
    date: new Date(2022, 9, 1, 15, 30),
    status: {
      id: 1,
      isStatusAlright: true,
      text: "Opłacono",
    },
  },
  {
    id: 2,
    salon,
    worker: sampleEmployees[1],
    service: sampleServices[3],
    date: new Date(2022, 9, 3, 8, 30),
    status: {
      id: 1,
      isStatusAlright: false,
      text: "Nieopłacono",
    },
  },
  {
    id: 3,
    salon,
    worker: sampleEmployees[2],
    service: sampleServices[3],
    date: new Date(2022, 9, 5, 12, 30),
    status: {
      id: 1,
      isStatusAlright: true,
      text: "Opłacono",
    },
  },
  {
    id: 4,
    salon,
    worker: sampleEmployees[0],
    service: sampleServices[3],
    date: new Date(2021, 9, 1, 12, 30),
    status: {
      id: 1,
      isStatusAlright: true,
      text: "Zakończono",
    },
  },
];

export const sampleSalons: SalonModel[] = new Array(5)
  .fill(salon)
  .map((o, i) => ({ ...o, id: i, name: `${o.name} ${i}` }));

export const dummyUserProfile: UserProfile = {
  id: "1",
  email: "demo@example.com",
  name: "Jan",
  surname: "Kowalski",
  street: "Lipowa 1",
  city: "Warszawa",
  postalCode: "00-001",
};
