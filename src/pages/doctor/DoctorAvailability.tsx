import React, { useEffect, useState } from 'react';
import { getDoctorAvailability, addDoctorAvailability, deleteDoctorAvailability } from '../../services/doctorService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import type { DoctorAvailability } from '../../types';
import { AxiosError } from 'axios';
import type { ApiError } from '../../types';
import './DoctorPages.css';

const DoctorAvailabilityPage: React.FC = () => {
  const [availability, setAvailability] = useState<DoctorAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    start_time: '',
    end_time: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});

  const toggleExpand = (date: string) => {
    setExpandedDates((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  const fetchAvailability = async () => {
    try {
      const data = await getDoctorAvailability();
      setAvailability(data);
      // Expand the first date by default
      if (data.length > 0) {
        const todayStr = new Date().toISOString().split('T')[0];
        const firstUpcoming = data
          .map(s => s.date)
          .filter(d => d >= todayStr)
          .sort()[0];
        if (firstUpcoming) {
          setExpandedDates(prev => ({ ...prev, [firstUpcoming]: true }));
        }
      }
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

  const isSlotOverlapping = (date: string, startTime: string, endTime: string) => {
    if (!date || !startTime || !endTime) return false;
    
    return availability.some(slot => {
      if (slot.date !== date) return false;
      
      const existingStart = slot.start_time.slice(0, 5);
      const existingEnd = slot.end_time.slice(0, 5);
      
      // Overlap logic: (StartA < EndB) and (EndA > StartB)
      return (startTime < existingEnd) && (endTime > existingStart);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSlotOverlapping(formData.date, formData.start_time, formData.end_time)) {
      setMessage({ 
        type: 'error', 
        text: 'This time slot overlaps with an existing availability on this date.' 
      });
      return;
    }

    if (formData.start_time >= formData.end_time) {
      setMessage({ 
        type: 'error', 
        text: 'End time must be after start time.' 
      });
      return;
    }

    setMessage({ type: '', text: '' });
    setIsSubmitting(true);

    try {
      await addDoctorAvailability({
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
      });

      setMessage({ type: 'success', text: 'Availability added successfully!' });
      setFormData({ ...formData, start_time: '', end_time: '' }); // Keep date for convenience
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

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this availability slot?')) return;
    
    try {
      await deleteDoctorAvailability(id);
      setMessage({ type: 'success', text: 'Slot deleted successfully!' });
      fetchAvailability();
    } catch (err: any) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to delete slot' 
      });
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
          <h3 className="card-title">➕ Add Availability</h3>
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

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Start Time</label>
                <input
                  type="time"
                  name="start_time"
                  className={`form-input ${isSlotOverlapping(formData.date, formData.start_time, formData.end_time) ? 'error' : ''}`}
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
                  className={`form-input ${isSlotOverlapping(formData.date, formData.start_time, formData.end_time) ? 'error' : ''}`}
                  value={formData.end_time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {isSlotOverlapping(formData.date, formData.start_time, formData.end_time) && (
              <span className="form-error mb-2">Time slot overlaps with existing availability</span>
            )}

            <button
              type="submit"
              className="btn btn-primary submit-btn"
              disabled={isSubmitting || isSlotOverlapping(formData.date, formData.start_time, formData.end_time)}
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
          <h3 className="card-title">📅 Your Availability</h3>
          
          {upcomingDates.length > 0 ? (
            <div className="availability-groups">
              {upcomingDates.map((date) => {
                const isExpanded = expandedDates[date];
                return (
                  <div key={date} className={`availability-date-group ${isExpanded ? 'expanded' : ''}`}>
                    <div 
                      className="date-header" 
                      onClick={() => toggleExpand(date)}
                    >
                      <span className="date-text">
                        {new Date(date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span className={`arrow-icon ${isExpanded ? 'up' : 'down'}`}>▼</span>
                    </div>
                    
                    {isExpanded && (
                      <div className="slots-container">
                        {groupedAvailability[date].map((slot) => (
                          <div key={slot.id} className="availability-slot">
                            <div className="slot-info">
                              <span className="slot-time-badge">
                                🕒 {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                              </span>
                              <div className="slot-actions">
                                <span className="slot-status">Available</span>
                                <button 
                                  className="delete-slot-btn"
                                  onClick={() => handleDelete(slot.id)}
                                  title="Delete Slot"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
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
