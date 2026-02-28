export interface OpinionModel {
  id: number;
  rating: number;
  opinionText: string;
  customerName: string;
  customerLocation: string;
  date?: string;
}

export interface ReviewResponseDto {
  id: number;
  customer_name: string;
  customer_location: string;
  rating: number;
  date: string;
  text: string;
}

export const opinionModelFromResponseDto = (
  dto: ReviewResponseDto
): OpinionModel => ({
  id: dto.id,
  rating: dto.rating,
  opinionText: dto.text,
  customerName: dto.customer_name,
  customerLocation: dto.customer_location,
  date: dto.date,
});
