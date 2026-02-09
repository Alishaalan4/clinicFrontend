import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, Doctor, Admin, UserRole, LoginCredentials, UserRegisterData, DoctorRegisterData } from '../types';
import { 
  userLogin, 
  userRegister, 
  doctorLogin, 
  doctorRegister, 
  adminLogin,
  saveAuthData, 
  getAuthData, 
  clearAuthData 
} from '../services/authService';

interface AuthContextType {
  user: User | Doctor | Admin | null;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // User auth
  loginUser: (credentials: LoginCredentials) => Promise<void>;
  registerUser: (data: UserRegisterData) => Promise<void>;
  
  // Doctor auth
  loginDoctor: (credentials: LoginCredentials) => Promise<void>;
  registerDoctor: (data: DoctorRegisterData) => Promise<void>;
  
  // Admin auth
  loginAdmin: (credentials: LoginCredentials) => Promise<void>;
  
  // General
  logout: () => void;
  updateUser: (user: User | Doctor | Admin) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | Doctor | Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { token: savedToken, user: savedUser, role: savedRole } = getAuthData();
    if (savedToken && savedUser && savedRole) {
      setToken(savedToken);
      setUser(savedUser);
      setRole(savedRole);
    }
    setIsLoading(false);
  }, []);

  const loginUser = async (credentials: LoginCredentials) => {
    const { token, user } = await userLogin(credentials);
    saveAuthData(token, user, 'user');
    setToken(token);
    setUser(user);
    setRole('user');
  };

  const registerUser = async (data: UserRegisterData) => {
    await userRegister(data);
    // After registration, user needs to login
  };

  const loginDoctor = async (credentials: LoginCredentials) => {
    const { token, doctor } = await doctorLogin(credentials);
    saveAuthData(token, doctor, 'doctor');
    setToken(token);
    setUser(doctor);
    setRole('doctor');
  };

  const registerDoctor = async (data: DoctorRegisterData) => {
    await doctorRegister(data);
    // After registration, doctor needs to login
  };

  const loginAdmin = async (credentials: LoginCredentials) => {
    const { token, admin } = await adminLogin(credentials);
    saveAuthData(token, admin, 'admin');
    setToken(token);
    setUser(admin);
    setRole('admin');
  };

  const logout = () => {
    clearAuthData();
    setToken(null);
    setUser(null);
    setRole(null);
  };

  const updateUser = (updatedUser: User | Doctor | Admin) => {
    setUser(updatedUser);
    if (token && role) {
      saveAuthData(token, updatedUser, role);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isAuthenticated: !!token && !!user,
        isLoading,
        loginUser,
        registerUser,
        loginDoctor,
        registerDoctor,
        loginAdmin,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
