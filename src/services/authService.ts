import api from './api';
import type {
  User,
  Doctor,
  Admin,
  LoginCredentials,
  UserRegisterData,
  DoctorRegisterData,
  AdminRegisterData,
  UserRole,
} from '../types';

interface LoginResponse {
  message: string;
  token: string;
  user?: User;
  doctor?: Doctor;
  admin?: Admin;
}

interface RegisterResponse {
  msg: string;
  user?: User;
  Doctor?: Doctor;
  admin?: Admin;
}

// User Auth
export const userLogin = async (credentials: LoginCredentials): Promise<{ token: string; user: User }> => {
  const response = await api.post<LoginResponse>('/auth/user/login', credentials);
  return {
    token: response.data.token,
    user: response.data.user!,
  };
};

export const userRegister = async (data: UserRegisterData): Promise<User> => {
  const response = await api.post<RegisterResponse>('/auth/user/register', data);
  return response.data.user!;
};

// Doctor Auth
export const doctorLogin = async (credentials: LoginCredentials): Promise<{ token: string; doctor: Doctor }> => {
  const response = await api.post<LoginResponse>('/auth/doctor/login', credentials);
  return {
    token: response.data.token,
    doctor: response.data.doctor!,
  };
};

export const doctorRegister = async (data: DoctorRegisterData): Promise<Doctor> => {
  const response = await api.post<RegisterResponse>('/auth/doctor/register', data);
  return response.data.Doctor!;
};

// Admin Auth
export const adminLogin = async (credentials: LoginCredentials): Promise<{ token: string; admin: Admin }> => {
  const response = await api.post<LoginResponse>('/auth/admin/login', credentials);
  return {
    token: response.data.token,
    admin: response.data.admin!,
  };
};

export const adminRegister = async (data: AdminRegisterData): Promise<Admin> => {
  const response = await api.post<RegisterResponse>('/auth/admin/register', data);
  return response.data.admin!;
};

// Helper functions
export const saveAuthData = (token: string, user: User | Doctor | Admin, role: UserRole) => {
  localStorage.setItem('auth_token', token);
  localStorage.setItem('auth_user', JSON.stringify(user));
  localStorage.setItem('auth_role', role);
};

export const getAuthData = (): { token: string | null; user: User | Doctor | Admin | null; role: UserRole | null } => {
  const token = localStorage.getItem('auth_token');
  const userStr = localStorage.getItem('auth_user');
  const role = localStorage.getItem('auth_role') as UserRole | null;
  
  return {
    token,
    user: userStr ? JSON.parse(userStr) : null,
    role,
  };
};

export const clearAuthData = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  localStorage.removeItem('auth_role');
};
