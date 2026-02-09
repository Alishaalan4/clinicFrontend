import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDoctorById, getDoctorAvailability, bookAppointment } from '../../services/userService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import type { Doctor, AvailableBlock } from '../../types';
import { AxiosError } from 'axios';
import type { ApiError } from '../../types';
import './PatientPages.css';

const BookAppointment: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<AvailableBlock[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Generate next 14 days for date selection
  const getAvailableDates = () => {
    const dates: { date: string; dayName: string; dayNum: number; month: string; isWeekend: boolean }[] = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      dates.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        isWeekend,
      });
    }
    return dates;
  };

  const availableDates = getAvailableDates();

  useEffect(() => {
    const fetchDoctor = async () => {
      if (!doctorId) return;
      
      try {
        const data = await getDoctorById(parseInt(doctorId));
        if (data) {
          setDoctor(data);
        } else {
          setError('Doctor not found');
        }
      } catch (err) {
        setError('Error loading doctor information');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctor();
  }, [doctorId]);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!doctorId || !selectedDate) {
        setAvailableSlots([]);
        return;
      }

      setIsLoadingSlots(true);
      setSelectedTime('');
      
      try {
        const data = await getDoctorAvailability(parseInt(doctorId), selectedDate);
        setAvailableSlots(data.available_blocks || []);
      } catch (err) {
        console.error('Error fetching availability:', err);
        setAvailableSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchAvailability();
  }, [doctorId, selectedDate]);

  const handleBooking = async () => {
    if (!doctorId || !selectedDate || !selectedTime) {
      setError('Please select a date and time');
      return;
    }

    setIsBooking(true);
    setError('');

    try {
      await bookAppointment({
        doctor_id: parseInt(doctorId),
        appointment_date: selectedDate,
        appointment_time: selectedTime,
        file: file || undefined,
      });

      setSuccess('Appointment booked successfully! Waiting for doctor approval.');
      setTimeout(() => {
        navigate('/patient/appointments');
      }, 2000);
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      if (axiosError.response?.data?.message) {
        setError(axiosError.response.data.message);
      } else {
        setError('Failed to book appointment. Please try again.');
      }
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading..." />;
  }

  if (!doctor) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">❌</div>
        <p className="empty-state-title">Doctor not found</p>
        <button className="btn btn-primary" onClick={() => navigate('/patient/doctors')}>
          Back to Doctors
        </button>
      </div>
    );
  }

  const currentStep = !selectedDate ? 1 : !selectedTime ? 2 : 3;

  return (
    <div className="book-appointment-page">
      <div className="page-header">
        <h1 className="page-title">Book Appointment</h1>
        <p className="page-subtitle">Schedule your visit with {doctor.name}</p>
      </div>

      {/* Progress Steps */}
      <div className="booking-steps">
        <div className={`booking-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
          <span className="step-number">{currentStep > 1 ? '✓' : '1'}</span>
          <span className="step-label">Select Date</span>
        </div>
        <div className={`booking-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
          <span className="step-number">{currentStep > 2 ? '✓' : '2'}</span>
          <span className="step-label">Select Time</span>
        </div>
        <div className={`booking-step ${currentStep >= 3 ? 'active' : ''}`}>
          <span className="step-number">3</span>
          <span className="step-label">Confirm</span>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger mb-4">
          <span>⚠️</span> {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success mb-4">
          <span>✓</span> {success}
        </div>
      )}

      <div className="booking-content">
        {/* Doctor Info */}
        <div className="doctor-selection-header">
          <div className="avatar avatar-lg">
            {doctor.name.charAt(0).toUpperCase()}
          </div>
          <div className="doctor-selection-info">
            <h3>{doctor.name}</h3>
            <p>{doctor.specialization}</p>
          </div>
        </div>

        {/* Date Selection */}
        <div className="date-picker-section">
          <h4>📅 Select a Date</h4>
          <div className="calendar-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {availableDates.map((d) => (
              <button
                key={d.date}
                className={`calendar-day ${selectedDate === d.date ? 'selected' : ''} ${d.isWeekend ? 'disabled' : ''}`}
                onClick={() => !d.isWeekend && setSelectedDate(d.date)}
                disabled={d.isWeekend}
                title={d.isWeekend ? 'Not available on weekends' : ''}
              >
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{d.dayName}</span>
                <span style={{ fontWeight: 600 }}>{d.dayNum}</span>
                <span style={{ fontSize: '0.65rem' }}>{d.month}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Time Slots */}
        {selectedDate && (
          <div className="time-slots-section">
            <h4>🕐 Select a Time Slot</h4>
            {isLoadingSlots ? (
              <LoadingSpinner size="sm" text="Loading available slots..." />
            ) : availableSlots.length > 0 ? (
              <div className="time-slots-grid">
                {availableSlots.map((slot, index) => (
                  <button
                    key={index}
                    className={`time-slot ${selectedTime === slot.start_time ? 'selected' : ''}`}
                    onClick={() => setSelectedTime(slot.start_time)}
                  >
                    {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                  </button>
                ))}
              </div>
            ) : (
              <div className="alert alert-warning">
                <span>ℹ️</span> No available slots for this date. Please select another date.
              </div>
            )}
          </div>
        )}

        {/* File Upload (Optional) */}
        {selectedTime && (
          <div className="form-group mt-4">
            <label className="form-label">📎 Attach Medical Documents (Optional)</label>
            <input
              type="file"
              className="form-input"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <span className="form-hint">Accepted: PDF, JPG, PNG (max 2MB)</span>
          </div>
        )}

        {/* Booking Summary */}
        {selectedDate && selectedTime && (
          <div className="booking-summary">
            <h4>📋 Appointment Summary</h4>
            <div className="summary-item">
              <span className="summary-label">Doctor</span>
              <span className="summary-value">{doctor.name}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Specialization</span>
              <span className="summary-value">{doctor.specialization}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Date</span>
              <span className="summary-value">
                {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Time</span>
              <span className="summary-value">{selectedTime}</span>
            </div>
            {file && (
              <div className="summary-item">
                <span className="summary-label">Attachment</span>
                <span className="summary-value">{file.name}</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="booking-actions">
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/patient/doctors')}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleBooking}
            disabled={!selectedDate || !selectedTime || isBooking}
          >
            {isBooking ? (
              <>
                <span className="spinner spinner-sm"></span>
                Booking...
              </>
            ) : (
              'Confirm Booking'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
