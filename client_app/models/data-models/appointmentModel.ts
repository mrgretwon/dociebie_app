import AppointmentStatusModel from './appointmentStatusModel';
import SalonEmployeeModel from './salonEmployeeModel';
import { SalonModel } from './salonModel';
import { ServiceModel } from './serviceModel';

export default interface AppointmentModel {
	id: number;
	salon: SalonModel;
	worker: SalonEmployeeModel;
	service: ServiceModel;
	date: Date;
	status: AppointmentStatusModel;
}
