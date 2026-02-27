import moment from "moment";
import "moment/locale/pl";

moment.locale("pl");

export const formatDateWithoutYear = (date: Date): string => {
  return moment(date).format("dd. DD MMM");
};

export const formatDateTimeWithoutYear = (date: Date): string => {
  return `${moment(date).format("D MMMM")} godz ${moment(date).format("HH:mm")}`;
};

export const modulo = (num: number, basis: number): number => {
  return ((num % basis) + basis) % basis;
};

export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};
