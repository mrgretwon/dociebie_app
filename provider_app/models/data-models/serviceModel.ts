export interface ServiceModel {
    id: number;
    name: string;
    price: number;
    minutesDuration: number;
}

export interface ServiceResponseDto {
    id: number;
    name: string;
    price: number;
    minutes_duration: number;
}

export const serviceModelFromResponseDto = (
    dto: ServiceResponseDto
): ServiceModel => ({
    id: dto.id,
    name: dto.name,
    price: dto.price,
    minutesDuration: dto.minutes_duration,
});
