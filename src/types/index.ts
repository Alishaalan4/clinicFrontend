// User/Patient Types
export interface User {
  id: number;
  name: string;
  email: string;
  height: number;
  weight: number;
  blood_type: string;
  gender: 'male' | 'female';
  medical_conditions: string | null;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

// Doctor Types
export interface Doctor {
  id: number;
  name: string;
  email: string;
  height: number;
  weight: number;
  blood_type: string | null;
  gender: 'male' | 'female';
  specialization: string;
  created_at: string;
  updated_at: string;
}

// Admin Types
export interface Admin {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// Appointment Types
export type AppointmentStatus = 'pending' | 'booked' | 'completed' | 'canceleld';

export interface Appointment {
  id: number;
  user_id: number;
  doctor_id: number;
  appointment_date: string;
  appointment_time: string;
  status: AppointmentStatus;
  cancel_reason: string | null;
  file_upload: string | null;
  created_at: string;
  updated_at: string;
  doctor?: Doctor;
  user?: User;
}

// Doctor Availability Types
export interface DoctorAvailability {
  id: number;
  doctor_id: number;
  date: string;
  day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
}

export interface AvailableBlock {
  start_time: string;
  end_time: string;
}

export interface DoctorAvailabilityResponse {
  doctor: {
    id: number;
    name: string;
    specialization: string;
  };
  date: string;
  available_blocks: AvailableBlock[];
}

// Auth Types
export type UserRole = 'user' | 'doctor' | 'admin';

export interface AuthState {
  token: string | null;
  user: User | Doctor | Admin | null;
  role: UserRole | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserRegisterData {
  name: string;
  email: string;
  password: string;
  height: number;
  weight: number;
  blood_type: string;
  gender: string;
  medical_conditions?: string;
}

export interface DoctorRegisterData {
  name: string;
  email: string;
  password: string;
  height: number;
  weight: number;
  blood_type: string;
  gender: string;
  specialization: string;
}

export interface AdminRegisterData {
  name: string;
  email: string;
  password: string;
}

// API Response Types
export interface ApiError {
  message?: string;
  msg?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

// Stats Types
export interface DoctorStats {
  'total Appointments': number;
  pending: number;
  booked: number;
  completed: number;
  cancelled: number;
}

export interface AdminStats {
  Users: number;
  Doctors: number;
  Admins: number;
  'Total Appointments': number;
  'pending Appointments': number;
  'booked Appointments': number;
  'completed Appointments': number;
  'cancelled Appointments': number;
}

// Form Types
export interface BookAppointmentData {
  doctor_id: number;
  appointment_date: string;
  appointment_time: string;
  file?: File;
}

export interface AddAvailabilityData {
  date: string;
  start_time: string;
  end_time: string;
}

export interface UpdatePasswordData {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface AdminChangePasswordData {
  new_password: string;
  confirm_password: string;
}
