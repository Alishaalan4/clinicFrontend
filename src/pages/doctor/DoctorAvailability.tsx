import React, { useEffect, useState } from 'react';
import { getDoctorAvailability, addDoctorAvailability } from '../../services/doctorService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import type { DoctorAvailability } from '../../types';
import { AxiosError } from 'axios';
import type { ApiError } from '../../types';
import './DoctorPages.css';

const DoctorAvailabilityPage: React.FC = () => {
  const [availability, setAvailability] = useState<DoctorAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    date: '',
    start_time: '',
    end_time: '',
  });

  const fetchAvailability = async () => {
    try {
      const data = await getDoctorAvailability();
      setAvailability(data);
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setIsSubmitting(true);

    try {
      await addDoctorAvailability({
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
      });

      setMessage({ type: 'success', text: 'Availability added successfully!' });
      setFormData({ date: '', start_time: '', end_time: '' });
      fetchAvailability();
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setMessage({
        type: 'error',
        text: axiosError.response?.data?.message || 'Failed to add availability',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get min date (today) for date picker
  const today = new Date().toISOString().split('T')[0];

  // Group availability by date
  const groupedAvailability = availability.reduce((acc, slot) => {
    const date = slot.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, DoctorAvailability[]>);

  const upcomingDates = Object.keys(groupedAvailability)
    .filter((date) => date >= today)
    .sort();

  if (isLoading) {
    return <LoadingSpinner text="Loading availability..." />;
  }

  return (
    <div className="availability-page">
      <div className="page-header">
        <h1 className="page-title">Manage Availability</h1>
        <p className="page-subtitle">Set your available time slots for appointments</p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} mb-4`}>
          {message.text}
        </div>
      )}

      <div className="availability-content">
        {/* Add Availability Form */}
        <div className="availability-form-card">
          <h3>➕ Add Availability</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                name="date"
                className="form-input"
                value={formData.date}
                onChange={handleChange}
                min={today}
                required
              />
              <span className="form-hint">Only weekdays (Mon-Fri) are allowed</span>
            </div>

            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input
                type="time"
                name="start_time"
                className="form-input"
                value={formData.start_time}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Time</label>
              <input
                type="time"
                name="end_time"
                className="form-input"
                value={formData.end_time}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner spinner-sm"></span>
                  Adding...
                </>
              ) : (
                'Add Time Slot'
              )}
            </button>
          </form>
        </div>

        {/* Availability List */}
        <div className="availability-list-card">
          <h3>📅 Your Availability</h3>
          
          {upcomingDates.length > 0 ? (
            <div className="availability-slots">
              {upcomingDates.map((date) => (
                <div key={date} className="availability-date-group">
                  <div className="date-header">
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                  {groupedAvailability[date].map((slot) => (
                    <div key={slot.id} className="availability-slot">
                      <div className="slot-info">
                        <span className="slot-time">
                          {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                        </span>
                        <span className="slot-day">{slot.day_of_week}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state-small">
              <p>No upcoming availability set</p>
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                Add time slots to allow patients to book appointments
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorAvailabilityPage;
