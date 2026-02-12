import api from './api';
import type {
  User,
  Doctor,
  Admin,
  Appointment,
  AdminStats,
  AdminChangePasswordData,
  DoctorRegisterData,
} from '../types';

// Stats
export const getAdminStats = async (): Promise<AdminStats> => {
  const response = await api.get<AdminStats>('/admin/stats');
  return response.data;
};

// Admins
export const getAdmins = async (): Promise<Admin[]> => {
  const response = await api.get<Admin[]>('/admin/admins');
  return response.data;
};

export const getAdminById = async (id: number): Promise<Admin> => {
  const response = await api.get<Admin>(`/admin/admins/${id}`);
  return response.data;
};

export const createAdmin = async (data: { name: string; email: string; password: string }): Promise<Admin> => {
  const response = await api.post<{ msg: string; admin: Admin }>('/admin/admins', data);
  return response.data.admin;
};

export const changeAdminPassword = async (id: number, data: AdminChangePasswordData): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>(`/admin/admins/${id}/changePassword`, data);
  return response.data;
};

export const deleteAdmin = async (id: number): Promise<{ msg: string }> => {
  const response = await api.delete<{ msg: string }>(`/admin/admins/${id}`);
  return response.data;
};

// Users
export const getUsers = async (): Promise<User[]> => {
  const response = await api.get<User[]>('/admin/users');
  return response.data;
};

export const getUserById = async (id: number): Promise<User> => {
  const response = await api.get<User>(`/admin/users/${id}`);
  return response.data;
};

export const changeUserPassword = async (id: number, data: AdminChangePasswordData): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>(`/admin/users/${id}/changePassword`, data);
  return response.data;
};

export const deleteUser = async (id: number): Promise<{ msg: string }> => {
  const response = await api.delete<{ msg: string }>(`/admin/users/${id}`);
  return response.data;
};

// Doctors
export const getDoctors = async (): Promise<Doctor[]> => {
  const response = await api.get<Doctor[]>('/admin/doctors');
  return response.data;
};

export const getDoctorById = async (id: number): Promise<Doctor> => {
  const response = await api.get<Doctor>(`/admin/doctors/${id}`);
  return response.data;
};

export const createDoctor = async (data: DoctorRegisterData): Promise<Doctor> => {
  const response = await api.post<{ message: string; doctor: Doctor }>('/admin/doctors', data);
  return response.data.doctor;
};

export const deleteDoctor = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/admin/doctors/${id}`);
  return response.data;
};

export const changeDoctorPassword = async (id: number, data: AdminChangePasswordData): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>(`/admin/doctors/${id}/changePassword`, data);
  return response.data;
};

// Appointments
export const getAppointments = async (): Promise<Appointment[]> => {
  const response = await api.get<Appointment[]>('/admin/appointments');
  return response.data;
};

export const getAppointmentById = async (id: number): Promise<Appointment> => {
  const response = await api.get<Appointment>(`/admin/appointments/${id}`);
  return response.data;
};

export const createAppointment = async (data: {
  user_id: number;
  doctor_id: number;
  appointment_date: string;
  appointment_time: string;
}): Promise<Appointment> => {
  const response = await api.post<{ message: string; appointment: Appointment }>('/admin/appointments', data);
  return response.data.appointment;
};
