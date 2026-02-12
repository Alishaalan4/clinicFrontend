import api, { uploadFile } from './api';
import type {
  User,
  Doctor,
  Appointment,
  DoctorAvailabilityResponse,
  PaginatedResponse,
  UpdatePasswordData,
  BookAppointmentData,
} from '../types';

// Profile
export const getUserProfile = async (): Promise<User> => {
  const response = await api.get<User>('/user/profile');
  return response.data;
};

export const updateUserProfile = async (data: Partial<User>): Promise<User> => {
  const response = await api.put<User>('/user/profile', data);
  return response.data;
};

export const updateUserPassword = async (data: UpdatePasswordData): Promise<{ msg: string }> => {
  const response = await api.post<{ msg: string }>('/user/updatePassword', data);
  return response.data;
};

// Doctors
export const getDoctors = async (): Promise<Doctor[]> => {
  const response = await api.get<Doctor[] | { msg: string }>('/user/doctors');
  if ('msg' in response.data) {
    return [];
  }
  return response.data;
};

export const searchDoctors = async (query: string): Promise<Doctor[]> => {
  const response = await api.get<{ doctors: Doctor[] }>('/user/doctors/search', {
    params: { query },
  });
  return response.data.doctors;
};

export const getDoctorById = async (id: number): Promise<Doctor | null> => {
  const response = await api.get<Doctor | { msg: string }>(`/user/doctors/${id}`);
  if ('msg' in response.data) {
    return null;
  }
  return response.data;
};

export const getDoctorAvailability = async (doctorId: number, date: string): Promise<DoctorAvailabilityResponse> => {
  const response = await api.get<DoctorAvailabilityResponse>(`/user/doctors/${doctorId}/availability`, {
    params: { date },
  });
  return response.data;
};

// Appointments
export const getUserAppointments = async (page: number = 1): Promise<PaginatedResponse<Appointment> | { msg: string }> => {
  const response = await api.get<PaginatedResponse<Appointment> | { msg: string }>('/user/appointments', {
    params: { page },
  });
  return response.data;
};

export const searchAppointments = async (
  filters: { doctor_name?: string; date?: string; time?: string },
  page: number = 1
): Promise<PaginatedResponse<Appointment> | { msg: string }> => {
  const response = await api.get<PaginatedResponse<Appointment> | { msg: string }>('/user/appointments/search', {
    params: { ...filters, page },
  });
  return response.data;
};

export const getAppointmentById = async (id: number): Promise<Appointment | null> => {
  const response = await api.get<Appointment | { msg: string }>(`/user/appointment/${id}`);
  if ('msg' in response.data) {
    return null;
  }
  return response.data;
};

export const bookAppointment = async (data: BookAppointmentData): Promise<Appointment> => {
  if (data.file) {
    const formData = new FormData();
    formData.append('doctor_id', data.doctor_id.toString());
    formData.append('appointment_date', data.appointment_date);
    formData.append('appointment_time', data.appointment_time);
    formData.append('file', data.file);
    
    const response = await uploadFile('/user/appointments', formData);
    return response.data.appointment;
  } else {
    const response = await api.post<{ message: string; appointment: Appointment }>('/user/appointments', {
      doctor_id: data.doctor_id,
      appointment_date: data.appointment_date,
      appointment_time: data.appointment_time,
    });
    return response.data.appointment;
  }
};
