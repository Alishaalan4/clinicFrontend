import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { AxiosError } from 'axios';
import type { ApiError, UserRegisterData, DoctorRegisterData } from '../../types';
import './Auth.css';

type RegisterRole = 'user' | 'doctor';

const Register: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'doctor' ? 'doctor' : 'user';
  
  const [role, setRole] = useState<RegisterRole>(initialRole);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    height: '',
    weight: '',
    blood_type: 'A+',
    gender: 'male',
    medical_conditions: '',
    specialization: '',
  });
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { registerUser, registerDoctor } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrors({});
    setSuccess('');
    setIsLoading(true);

    try {
      if (role === 'user') {
        const data: UserRegisterData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          height: parseFloat(formData.height),
          weight: parseFloat(formData.weight),
          blood_type: formData.blood_type,
          gender: formData.gender,
          medical_conditions: formData.medical_conditions || undefined,
        };
        await registerUser(data);
      } else {
        const data: DoctorRegisterData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          height: parseFloat(formData.height),
          weight: parseFloat(formData.weight),
          blood_type: formData.blood_type,
          gender: formData.gender,
          specialization: formData.specialization,
        };
        await registerDoctor(data);
      }

      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      if (axiosError.response?.data?.errors) {
        setErrors(axiosError.response.data.errors);
      } else if (axiosError.response?.data?.message) {
        setError(axiosError.response.data.message);
      } else if (axiosError.response?.data?.msg) {
        setError(axiosError.response.data.msg);
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  return (
    <div className="auth-container register-page">
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
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">
            Register as a {role === 'user' ? 'patient' : 'doctor'}
          </p>

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
          </div>

          {error && (
            <div className="auth-error">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <span>✓</span>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-form-grid">
              <div className="form-group full-width">
                <label className="form-label" htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  minLength={3}
                />
                {errors.name && <span className="form-error">{errors.name[0]}</span>}
              </div>

              <div className="form-group full-width">
                <label className="form-label" htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                {errors.email && <span className="form-error">{errors.email[0]}</span>}
              </div>

              <div className="form-group full-width">
                <label className="form-label" htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Create a password (3-15 characters)"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={3}
                  maxLength={15}
                />
                {errors.password && <span className="form-error">{errors.password[0]}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="height">Height (cm)</label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  className={`form-input ${errors.height ? 'error' : ''}`}
                  placeholder="e.g., 175"
                  value={formData.height}
                  onChange={handleChange}
                  required
                  min={0}
                  step="0.01"
                />
                {errors.height && <span className="form-error">{errors.height[0]}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="weight">Weight (kg)</label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  className={`form-input ${errors.weight ? 'error' : ''}`}
                  placeholder="e.g., 70"
                  value={formData.weight}
                  onChange={handleChange}
                  required
                  min={0}
                  step="0.01"
                />
                {errors.weight && <span className="form-error">{errors.weight[0]}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="blood_type">Blood Type</label>
                <select
                  id="blood_type"
                  name="blood_type"
                  className={`form-input ${errors.blood_type ? 'error' : ''}`}
                  value={formData.blood_type}
                  onChange={handleChange}
                  required
                >
                  {bloodTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.blood_type && <span className="form-error">{errors.blood_type[0]}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  className={`form-input ${errors.gender ? 'error' : ''}`}
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                {errors.gender && <span className="form-error">{errors.gender[0]}</span>}
              </div>

              {role === 'user' && (
                <div className="form-group full-width">
                  <label className="form-label" htmlFor="medical_conditions">
                    Medical Conditions (Optional)
                  </label>
                  <textarea
                    id="medical_conditions"
                    name="medical_conditions"
                    className="form-input"
                    placeholder="Any known medical conditions, allergies, etc."
                    value={formData.medical_conditions}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
              )}

              {role === 'doctor' && (
                <div className="form-group full-width">
                  <label className="form-label" htmlFor="specialization">Specialization</label>
                  <input
                    type="text"
                    id="specialization"
                    name="specialization"
                    className={`form-input ${errors.specialization ? 'error' : ''}`}
                    placeholder="e.g., Cardiology, Neurology, General Medicine"
                    value={formData.specialization}
                    onChange={handleChange}
                    required
                  />
                  {errors.specialization && (
                    <span className="form-error">{errors.specialization[0]}</span>
                  )}
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={isLoading}
              style={{ marginTop: '1.5rem' }}
            >
              {isLoading ? (
                <>
                  <span className="spinner spinner-sm"></span>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>

      <div className="auth-illustration">
        <div className="illustration-content">
          <h2>Join ClinicMS Today</h2>
          <p>
            {role === 'user' 
              ? 'Create your patient account to start booking appointments with qualified doctors.'
              : 'Register as a doctor to manage your practice, schedule, and patient appointments.'}
          </p>
          <div className="illustration-features">
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Quick & Easy Registration</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Secure Health Records</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>24/7 Access to Services</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
