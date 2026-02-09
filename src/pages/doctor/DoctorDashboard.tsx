import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getDoctorStats, getDoctorAppointments } from '../../services/doctorService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import type { Doctor, DoctorStats, Appointment } from '../../types';
import './DoctorPages.css';

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const doctor = user as Doctor;

  const [stats, setStats] = useState<DoctorStats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, appointmentsData] = await Promise.all([
          getDoctorStats(),
          getDoctorAppointments(),
        ]);
        setStats(statsData);
        setAppointments(appointmentsData);
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

  const pendingAppointments = appointments.filter((a) => a.status === 'pending');
  const todayAppointments = appointments.filter((a) => {
    const today = new Date().toISOString().split('T')[0];
    return a.appointment_date === today && (a.status === 'booked' || a.status === 'pending');
  });

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
    <div className="doctor-dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Welcome, Dr. {doctor?.name?.split(' ').pop() || 'Doctor'}! 👨‍⚕️
          </h1>
          <p className="page-subtitle">
            Here's your practice overview for today
          </p>
        </div>
        <Link to="/doctor/availability" className="btn btn-primary">
          🕐 Set Availability
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon blue">📋</div>
          <div className="stat-card-value">{stats?.['total Appointments'] || 0}</div>
          <div className="stat-card-label">Total Appointments</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon orange">⏳</div>
          <div className="stat-card-value">{stats?.pending || 0}</div>
          <div className="stat-card-label">Pending Approval</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon blue">✓</div>
          <div className="stat-card-value">{stats?.booked || 0}</div>
          <div className="stat-card-label">Upcoming</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon green">✓✓</div>
          <div className="stat-card-value">{stats?.completed || 0}</div>
          <div className="stat-card-label">Completed</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Pending Appointments */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>⏳ Pending Approval</h2>
            <Link to="/doctor/appointments" className="btn btn-secondary btn-sm">
              View All
            </Link>
          </div>

          {pendingAppointments.length > 0 ? (
            <div className="appointments-list">
              {pendingAppointments.slice(0, 5).map((apt) => (
                <div key={apt.id} className="appointment-item">
                  <div className="appointment-info">
                    <div className="appointment-date-box">
                      <span className="date-day">
                        {new Date(apt.appointment_date).getDate()}
                      </span>
                      <span className="date-month">
                        {new Date(apt.appointment_date).toLocaleString('default', { month: 'short' })}
                      </span>
                    </div>
                    <div className="appointment-details">
                      <span className="appointment-time">
                        🕐 {apt.appointment_time.slice(0, 5)}
                      </span>
                      <span className="appointment-patient">
                        Patient: {apt.user?.name || `#${apt.user_id}`}
                      </span>
                    </div>
                  </div>
                  <span className={`badge ${getStatusClass(apt.status)}`}>
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state-small">
              <p>✓ No pending appointments</p>
            </div>
          )}
        </div>

        {/* Today's Appointments */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>📅 Today's Schedule</h2>
          </div>

          {todayAppointments.length > 0 ? (
            <div className="appointments-list">
              {todayAppointments.map((apt) => (
                <div key={apt.id} className="appointment-item">
                  <div className="appointment-info">
                    <span className="appointment-time" style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                      {apt.appointment_time.slice(0, 5)}
                    </span>
                    <span className="appointment-patient">
                      {apt.user?.name || `Patient #${apt.user_id}`}
                    </span>
                  </div>
                  <span className={`badge ${getStatusClass(apt.status)}`}>
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state-small">
              <p>No appointments scheduled for today</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Info */}
      <div className="doctor-info-card">
        <div className="section-header">
          <h2>Your Profile</h2>
          <Link to="/doctor/profile" className="btn btn-secondary btn-sm">
            Edit Profile
          </Link>
        </div>
        <div className="doctor-info-grid">
          <div className="info-item">
            <span className="info-icon">👨‍⚕️</span>
            <div className="info-content">
              <span className="info-label">Specialization</span>
              <span className="info-value">{doctor?.specialization || '-'}</span>
            </div>
          </div>
          <div className="info-item">
            <span className="info-icon">📧</span>
            <div className="info-content">
              <span className="info-label">Email</span>
              <span className="info-value">{doctor?.email || '-'}</span>
            </div>
          </div>
          <div className="info-item">
            <span className="info-icon">👤</span>
            <div className="info-content">
              <span className="info-label">Gender</span>
              <span className="info-value" style={{ textTransform: 'capitalize' }}>
                {doctor?.gender || '-'}
              </span>
            </div>
          </div>
          <div className="info-item">
            <span className="info-icon">🩸</span>
            <div className="info-content">
              <span className="info-label">Blood Type</span>
              <span className="info-value">{doctor?.blood_type || '-'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
