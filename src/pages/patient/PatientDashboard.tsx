import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserAppointments, getDoctors } from '../../services/userService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import type { Appointment, Doctor, User } from '../../types';
import './PatientPages.css';

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const patientUser = user as User;
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appointmentsRes, doctorsRes] = await Promise.all([
          getUserAppointments(),
          getDoctors(),
        ]);

        if ('data' in appointmentsRes) {
          setAppointments(appointmentsRes.data);
        }
        setDoctors(doctorsRes);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  const upcomingAppointments = appointments.filter(
    (apt) => apt.status === 'pending' || apt.status === 'booked'
  ).slice(0, 5);

  const stats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === 'pending').length,
    booked: appointments.filter((a) => a.status === 'booked').length,
    completed: appointments.filter((a) => a.status === 'completed').length,
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'booked': return 'status-booked';
      case 'completed': return 'status-completed';
      case 'canceleld': return 'status-cancelled';
      default: return '';
    }
  };

  return (
    <div className="patient-dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Welcome back, {patientUser?.name?.split(' ')[0] || 'Patient'}! 👋
          </h1>
          <p className="page-subtitle">
            Here's an overview of your health appointments
          </p>
        </div>
        <Link to="/patient/doctors" className="btn btn-primary">
          📅 Book Appointment
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon blue">📋</div>
          <div className="stat-card-value">{stats.total}</div>
          <div className="stat-card-label">Total Appointments</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon orange">⏳</div>
          <div className="stat-card-value">{stats.pending}</div>
          <div className="stat-card-label">Pending Approval</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon blue">✓</div>
          <div className="stat-card-value">{stats.booked}</div>
          <div className="stat-card-label">Upcoming</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon green">✓✓</div>
          <div className="stat-card-value">{stats.completed}</div>
          <div className="stat-card-label">Completed</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Upcoming Appointments */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Upcoming Appointments</h2>
            <Link to="/patient/appointments" className="btn btn-secondary btn-sm">
              View All
            </Link>
          </div>
          
          {upcomingAppointments.length > 0 ? (
            <div className="appointments-list">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="appointment-item">
                  <div className="appointment-info">
                    <div className="appointment-date-box">
                      <span className="date-day">
                        {new Date(appointment.appointment_date).getDate()}
                      </span>
                      <span className="date-month">
                        {new Date(appointment.appointment_date).toLocaleString('default', { month: 'short' })}
                      </span>
                    </div>
                    <div className="appointment-details">
                      <span className="appointment-time">
                        🕐 {appointment.appointment_time.slice(0, 5)}
                      </span>
                      <span className="appointment-doctor-name">
                        Dr. {appointment.doctor?.name || `ID: ${appointment.doctor_id}`}
                      </span>
                    </div>
                  </div>
                  <span className={`badge ${getStatusClass(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <p className="empty-state-title">No upcoming appointments</p>
              <p className="empty-state-description">
                Book an appointment with one of our doctors
              </p>
              <Link to="/patient/doctors" className="btn btn-primary">
                Find a Doctor
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions & Available Doctors */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Available Doctors</h2>
            <Link to="/patient/doctors" className="btn btn-secondary btn-sm">
              View All
            </Link>
          </div>
          
          {doctors.length > 0 ? (
            <div className="doctors-preview-list">
              {doctors.slice(0, 4).map((doctor) => (
                <Link 
                  key={doctor.id} 
                  to={`/patient/doctors/${doctor.id}`}
                  className="doctor-preview-item"
                >
                  <div className="avatar">
                    {doctor.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="doctor-preview-info">
                    <span className="doctor-name">{doctor.name}</span>
                    <span className="doctor-spec">{doctor.specialization}</span>
                  </div>
                  <span className="arrow">→</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">👨‍⚕️</div>
              <p className="empty-state-title">No doctors available</p>
            </div>
          )}
        </div>
      </div>

      {/* Health Profile Summary */}
      <div className="health-profile-summary">
        <div className="section-header">
          <h2>Your Health Profile</h2>
          <Link to="/patient/profile" className="btn btn-secondary btn-sm">
            Edit Profile
          </Link>
        </div>
        <div className="profile-stats">
          <div className="profile-stat">
            <span className="stat-icon">📏</span>
            <span className="stat-value">{patientUser?.height || '-'} cm</span>
            <span className="stat-label">Height</span>
          </div>
          <div className="profile-stat">
            <span className="stat-icon">⚖️</span>
            <span className="stat-value">{patientUser?.weight || '-'} kg</span>
            <span className="stat-label">Weight</span>
          </div>
          <div className="profile-stat">
            <span className="stat-icon">🩸</span>
            <span className="stat-value">{patientUser?.blood_type || '-'}</span>
            <span className="stat-label">Blood Type</span>
          </div>
          <div className="profile-stat">
            <span className="stat-icon">👤</span>
            <span className="stat-value" style={{ textTransform: 'capitalize' }}>
              {patientUser?.gender || '-'}
            </span>
            <span className="stat-label">Gender</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
