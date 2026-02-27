import AppointmentStatusModel from './appointmentStatusModel';

export default interface AppointmentModel {
	id: number;
	salonName: string;
	serviceName: string;
	employeeName: string;
	date: string;
	status: AppointmentStatusModel;
}

export interface AppointmentResponseDto {
	id: number;
	salon_name: string;
	service_name: string;
	employee_name: string;
	date: string;
	status: {
		id: number;
		text: string;
		is_status_alright: boolean;
	};
}

export const appointmentModelFromResponseDto = (
	dto: AppointmentResponseDto
): AppointmentModel => ({
	id: dto.id,
	salonName: dto.salon_name,
	serviceName: dto.service_name,
	employeeName: dto.employee_name,
	date: dto.date,
	status: {
		id: dto.status.id,
		text: dto.status.text,
		isStatusAlright: dto.status.is_status_alright,
	},
});
