import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { updateDoctorProfile } from '../../services/doctorService';
import { AxiosError } from 'axios';
import type { Doctor, ApiError } from '../../types';
import './DoctorPages.css';

const DoctorProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const doctor = user as Doctor;

  const [formData, setFormData] = useState({
    name: doctor?.name || '',
    email: doctor?.email || '',
    height: doctor?.height?.toString() || '',
    weight: doctor?.weight?.toString() || '',
    blood_type: doctor?.blood_type || 'A+',
    gender: doctor?.gender || 'male',
    specialization: doctor?.specialization || '',
    password: '',
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage({ type: '', text: '' });

    try {
      const updateData: Partial<Doctor> & { password?: string } = {
        name: formData.name,
        email: formData.email,
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        blood_type: formData.blood_type,
        gender: formData.gender as 'male' | 'female',
        specialization: formData.specialization,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      const result = await updateDoctorProfile(updateData);
      
      if (result.doctor && result.doctor.id) {
        updateUser(result.doctor);
      }
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setFormData((prev) => ({ ...prev, password: '' }));
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

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  return (
    <div className="doctor-profile" style={{ maxWidth: '800px' }}>
      <div className="profile-header">
        <div className="avatar avatar-xl">
          {doctor?.name?.charAt(0).toUpperCase() || '?'}
        </div>
        <div className="profile-header-info">
          <h2>Dr. {doctor?.name || 'Doctor'}</h2>
          <p>{doctor?.specialization}</p>
        </div>
      </div>

      <div className="profile-section">
        <h3>👨‍⚕️ Professional Information</h3>
        
        {message.text && (
          <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} mb-4`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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

            <div className="form-group full-width">
              <label className="form-label">Specialization</label>
              <input
                type="text"
                name="specialization"
                className="form-input"
                value={formData.specialization}
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
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label className="form-label">New Password (leave blank to keep current)</label>
              <input
                type="password"
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter new password to change"
                minLength={6}
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
    </div>
  );
};

export default DoctorProfile;
