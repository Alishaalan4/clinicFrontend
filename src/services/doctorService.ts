import api from './api';
import type {
  Doctor,
  Appointment,
  DoctorAvailability,
  DoctorStats,
  AddAvailabilityData,
} from '../types';

// Profile
export const getDoctorProfile = async (): Promise<Doctor> => {
  const response = await api.get<Doctor>('/doctor/profile');
  return response.data;
};

export const updateDoctorProfile = async (data: Partial<Doctor> & { password?: string }): Promise<{ msg: string; doctor: Doctor }> => {
  const response = await api.put<{ msg: string; 0?: Doctor }>('/doctor/profile', data);
  return {
    msg: response.data.msg,
    doctor: response.data[0] || ({} as Doctor),
  };
};

// Availability
export const getDoctorAvailability = async (): Promise<DoctorAvailability[]> => {
  const response = await api.get<DoctorAvailability[]>('/doctor/availability');
  return response.data;
};

export const addDoctorAvailability = async (data: AddAvailabilityData): Promise<DoctorAvailability> => {
  const response = await api.post<{ message: string; availability: DoctorAvailability }>('/doctor/availability', data);
  return response.data.availability;
};

export const deleteDoctorAvailability = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/doctor/availability/${id}`);
  return response.data;
};

// Appointments
export const getDoctorAppointments = async (): Promise<Appointment[]> => {
  const response = await api.get<Appointment[]>('/doctor/appointments');
  return response.data;
};

export const acceptAppointment = async (appointmentId: number): Promise<{ msg: string }> => {
  const response = await api.post<{ msg: string }>(`/doctor/appointments/${appointmentId}/accept`);
  return response.data;
};

export const cancelAppointment = async (appointmentId: number, reason: string): Promise<{ msg: string }> => {
  const response = await api.post<{ msg: string }>(`/doctor/appointments/${appointmentId}/cancel`, { reason });
  return response.data;
};

export const completeAppointment = async (appointmentId: number): Promise<{ msg: string }> => {
  const response = await api.post<{ msg: string }>(`/doctor/appointments/${appointmentId}/complete`);
  return response.data;
};

export const getAppointmentFile = async (appointmentId: number): Promise<Blob> => {
  const response = await api.get(`/doctor/appointments/${appointmentId}/file`, {
    responseType: 'blob',
  });
  return response.data;
};

// Stats
export const getDoctorStats = async (): Promise<DoctorStats> => {
  const response = await api.get<DoctorStats>('/doctor/stats');
  return response.data;
};
