import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getAdminStats, getAppointments } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import type { Admin, AdminStats, Appointment } from '../../types';
import './AdminPages.css';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const admin = user as Admin;

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, appointmentsData] = await Promise.all([
          getAdminStats(),
          getAppointments(),
        ]);
        setStats(statsData);
        setRecentAppointments(appointmentsData.slice(0, 5));
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
    <div className="admin-dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard 🔐</h1>
          <p className="page-subtitle">
            Welcome back, {admin?.name || 'Administrator'}
          </p>
        </div>
      </div>

      {/* Main Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon blue">👥</div>
          <div className="stat-card-value">{stats?.Users || 0}</div>
          <div className="stat-card-label">Total Patients</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon green">👨‍⚕️</div>
          <div className="stat-card-value">{stats?.Doctors || 0}</div>
          <div className="stat-card-label">Total Doctors</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon orange">🔐</div>
          <div className="stat-card-value">{stats?.Admins || 0}</div>
          <div className="stat-card-label">Administrators</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon blue">📋</div>
          <div className="stat-card-value">{stats?.['Total Appointments'] || 0}</div>
          <div className="stat-card-label">Total Appointments</div>
        </div>
      </div>

      {/* Appointment Stats */}
      <div className="appointment-stats-row">
        <div className="appointment-stat pending">
          <span className="stat-value">{stats?.['pending Appointments'] || 0}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="appointment-stat booked">
          <span className="stat-value">{stats?.['booked Appointments'] || 0}</span>
          <span className="stat-label">Booked</span>
        </div>
        <div className="appointment-stat completed">
          <span className="stat-value">{stats?.['completed Appointments'] || 0}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="appointment-stat cancelled">
          <span className="stat-value">{stats?.['cancelled Appointments'] || 0}</span>
          <span className="stat-label">Cancelled</span>
        </div>
      </div>

      {/* Quick Actions & Recent Appointments */}
      <div className="dashboard-grid">
        {/* Quick Actions */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>⚡ Quick Actions</h2>
          </div>
          <div className="quick-actions-grid">
            <Link to="/admin/users" className="quick-action-card">
              <span className="action-icon">👥</span>
              <span className="action-label">Manage Users</span>
            </Link>
            <Link to="/admin/doctors" className="quick-action-card">
              <span className="action-icon">👨‍⚕️</span>
              <span className="action-label">Manage Doctors</span>
            </Link>
            <Link to="/admin/appointments" className="quick-action-card">
              <span className="action-icon">📅</span>
              <span className="action-label">View Appointments</span>
            </Link>
            <Link to="/admin/admins" className="quick-action-card">
              <span className="action-icon">🔐</span>
              <span className="action-label">Manage Admins</span>
            </Link>
          </div>
        </div>

        {/* Recent Appointments */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>📅 Recent Appointments</h2>
            <Link to="/admin/appointments" className="btn btn-secondary btn-sm">
              View All
            </Link>
          </div>

          {recentAppointments.length > 0 ? (
            <div className="appointments-list">
              {recentAppointments.map((apt) => (
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
                      <span className="appointment-participants">
                        {apt.user?.name || `Patient #${apt.user_id}`} → {apt.doctor?.name || `Doctor #${apt.doctor_id}`}
                      </span>
                    </div>
                  </div>
                  <span className={`badge ${getStatusClass(apt.status)}`}>
                    {apt.status === 'canceleld' ? 'Cancelled' : apt.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state-small">
              <p>No recent appointments</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
