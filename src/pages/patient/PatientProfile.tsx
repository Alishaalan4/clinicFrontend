import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile, updateUserPassword } from '../../services/userService';
import { AxiosError } from 'axios';
import type { User, ApiError } from '../../types';
import './PatientPages.css';

const PatientProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const patientUser = user as User;

  const [formData, setFormData] = useState({
    name: patientUser?.name || '',
    email: patientUser?.email || '',
    height: patientUser?.height?.toString() || '',
    weight: patientUser?.weight?.toString() || '',
    blood_type: patientUser?.blood_type || 'A+',
    gender: patientUser?.gender || 'male',
    medical_conditions: patientUser?.medical_conditions || '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage({ type: '', text: '' });

    try {
      const updatedUser = await updateUserProfile({
        name: formData.name,
        email: formData.email,
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        blood_type: formData.blood_type,
        gender: formData.gender as 'male' | 'female',
        medical_conditions: formData.medical_conditions || null,
      });

      updateUser(updatedUser);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setMessage({
        type: 'error',
        text: axiosError.response?.data?.message || 'Failed to update profile',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordMessage({ type: '', text: '' });

    try {
      await updateUserPassword(passwordData);
      setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });
      setPasswordData({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setPasswordMessage({
        type: 'error',
        text: axiosError.response?.data?.msg || 'Failed to update password',
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="avatar avatar-xl">
          {patientUser?.name?.charAt(0).toUpperCase() || '?'}
        </div>
        <div className="profile-header-info">
          <h2>{patientUser?.name || 'Patient'}</h2>
          <p>{patientUser?.email}</p>
        </div>
      </div>

      {/* Profile Information */}
      <div className="profile-section">
        <h3>👤 Personal Information</h3>
        
        {message.text && (
          <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} mb-4`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleProfileSubmit}>
          <div className="profile-form-grid">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                required
                minLength={3}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Height (cm)</label>
              <input
                type="number"
                name="height"
                className="form-input"
                value={formData.height}
                onChange={handleChange}
                required
                min={0}
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Weight (kg)</label>
              <input
                type="number"
                name="weight"
                className="form-input"
                value={formData.weight}
                onChange={handleChange}
                required
                min={0}
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Blood Type</label>
              <select
                name="blood_type"
                className="form-input"
                value={formData.blood_type}
                onChange={handleChange}
                required
              >
                {bloodTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Gender</label>
              <select
                name="gender"
                className="form-input"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label className="form-label">Medical Conditions</label>
              <textarea
                name="medical_conditions"
                className="form-input"
                value={formData.medical_conditions}
                onChange={handleChange}
                rows={3}
                placeholder="Any known medical conditions, allergies, etc."
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isUpdating}
            style={{ marginTop: '1rem' }}
          >
            {isUpdating ? (
              <>
                <span className="spinner spinner-sm"></span>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="profile-section">
        <h3>🔐 Change Password</h3>
        
        {passwordMessage.text && (
          <div className={`alert alert-${passwordMessage.type === 'success' ? 'success' : 'danger'} mb-4`}>
            {passwordMessage.text}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit}>
          <div className="profile-form-grid">
            <div className="form-group full-width">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                name="current_password"
                className="form-input"
                value={passwordData.current_password}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                name="new_password"
                className="form-input"
                value={passwordData.new_password}
                onChange={handlePasswordChange}
                required
                minLength={6}
                maxLength={15}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                name="new_password_confirmation"
                className="form-input"
                value={passwordData.new_password_confirmation}
                onChange={handlePasswordChange}
                required
                minLength={6}
                maxLength={15}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isUpdatingPassword}
            style={{ marginTop: '1rem' }}
          >
            {isUpdatingPassword ? (
              <>
                <span className="spinner spinner-sm"></span>
                Updating...
              </>
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PatientProfile;
