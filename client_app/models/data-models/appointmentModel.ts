import AppointmentStatusModel from './appointmentStatusModel';

export default interface AppointmentModel {
	id: number;
	salonName: string;
	salonAddress: string;
	serviceName: string;
	employeeName: string;
	date: string;
	status: AppointmentStatusModel;
}

export interface AppointmentResponseDto {
	id: number;
	salon: {
		id: number;
		name: string;
		location_name: string;
		[key: string]: unknown;
	};
	worker: {
		id: number;
		name: string;
		surname: string;
		image: string | null;
	};
	service: {
		id: number;
		name: string;
		price: string;
		minutes_duration: number;
	};
	date: string;
	status: {
		id: number;
		text: string;
		is_status_alright: boolean;
	};
}

const POLISH_MONTHS = [
	'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
	'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia',
];

function formatPolishDate(isoDate: string): string {
	const d = new Date(isoDate);
	if (isNaN(d.getTime())) return isoDate;
	const day = d.getDate();
	const month = POLISH_MONTHS[d.getMonth()];
	const hours = String(d.getHours()).padStart(2, '0');
	const minutes = String(d.getMinutes()).padStart(2, '0');
	return `${day} ${month} godz ${hours}:${minutes}`;
}

export const appointmentModelFromResponseDto = (
	dto: AppointmentResponseDto
): AppointmentModel => ({
	id: dto.id,
	salonName: dto.salon.name,
	salonAddress: dto.salon.location_name,
	serviceName: dto.service.name,
	employeeName: dto.worker.name,
	date: formatPolishDate(dto.date),
	status: {
		id: dto.status.id,
		text: dto.status.text,
		isStatusAlright: dto.status.is_status_alright,
	},
});
