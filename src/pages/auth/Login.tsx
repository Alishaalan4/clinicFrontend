import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { AxiosError } from 'axios';
import type { ApiError } from '../../types';
import './Auth.css';

type LoginRole = 'user' | 'doctor' | 'admin';

const Login: React.FC = () => {
  const [role, setRole] = useState<LoginRole>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { loginUser, loginDoctor, loginAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const credentials = { email, password };
      
      switch (role) {
        case 'user':
          await loginUser(credentials);
          navigate('/patient/dashboard');
          break;
        case 'doctor':
          await loginDoctor(credentials);
          navigate('/doctor/dashboard');
          break;
        case 'admin':
          await loginAdmin(credentials);
          navigate('/admin/dashboard');
          break;
      }
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      if (axiosError.response?.data?.msg) {
        setError(axiosError.response.data.msg);
      } else if (axiosError.response?.data?.message) {
        setError(axiosError.response.data.message);
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleLabel = () => {
    switch (role) {
      case 'user': return 'Patient';
      case 'doctor': return 'Doctor';
      case 'admin': return 'Administrator';
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="logo-icon">🏥</span>
            <span className="logo-text">ClinicMS</span>
          </div>
          <button 
            className="theme-toggle-btn" 
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>

        <div className="auth-content">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your {getRoleLabel().toLowerCase()} account</p>

          <div className="role-tabs">
            <button 
              className={`role-tab ${role === 'user' ? 'active' : ''}`}
              onClick={() => setRole('user')}
            >
              👤 Patient
            </button>
            <button 
              className={`role-tab ${role === 'doctor' ? 'active' : ''}`}
              onClick={() => setRole('doctor')}
            >
              👨‍⚕️ Doctor
            </button>
            <button 
              className={`role-tab ${role === 'admin' ? 'active' : ''}`}
              onClick={() => setRole('admin')}
            >
              🔐 Admin
            </button>
          </div>

          {error && (
            <div className="auth-error">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                className="form-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner spinner-sm"></span>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {role !== 'admin' && (
            <p className="auth-footer">
              Don't have an account?{' '}
              <Link to={`/register?role=${role}`}>Create one</Link>
            </p>
          )}
        </div>
      </div>

      <div className="auth-illustration">
        <div className="illustration-content">
          <h2>Clinic Management System</h2>
          <p>
            {role === 'user' && 'Book appointments with top doctors and manage your health journey.'}
            {role === 'doctor' && 'Manage your schedule, appointments, and patient care efficiently.'}
            {role === 'admin' && 'Oversee the entire clinic operations and manage users.'}
          </p>
          <div className="illustration-features">
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Easy Appointment Booking</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Manage Availability</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Secure & Private</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
