import React, { useEffect, useState } from 'react';
import { getUserAppointments } from '../../services/userService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import type { Appointment, AppointmentStatus } from '../../types';
import './PatientPages.css';

type FilterStatus = 'all' | AppointmentStatus;

const PatientAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('all');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await getUserAppointments();
        if ('data' in response) {
          setAppointments(response.data);
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter(
    (apt) => filter === 'all' || apt.status === filter
  );

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'booked': return 'status-booked';
      case 'completed': return 'status-completed';
      case 'canceleld': return 'status-cancelled';
      default: return '';
    }
  };

  const getStatusLabel = (status: string) => {
    if (status === 'canceleld') return 'Cancelled';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const filters: { value: FilterStatus; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'booked', label: 'Booked' },
    { value: 'completed', label: 'Completed' },
    { value: 'canceleld', label: 'Cancelled' },
  ];

  if (isLoading) {
    return <LoadingSpinner text="Loading appointments..." />;
  }

  return (
    <div className="appointments-page">
      <div className="page-header">
        <h1 className="page-title">My Appointments</h1>
        <p className="page-subtitle">View and manage your appointments</p>
      </div>

      <div className="appointments-filters">
        {filters.map((f) => (
          <button
            key={f.value}
            className={`filter-btn ${filter === f.value ? 'active' : ''}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
            {f.value !== 'all' && (
              <span style={{ marginLeft: '0.5rem', opacity: 0.7 }}>
                ({appointments.filter((a) => a.status === f.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {filteredAppointments.length > 0 ? (
        <div className="appointments-table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Doctor</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((apt) => (
                <tr key={apt.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>
                      {new Date(apt.appointment_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </td>
                  <td>
                    <span style={{ color: 'var(--primary-blue)', fontWeight: 500 }}>
                      {apt.appointment_time.slice(0, 5)}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 500 }}>
                      {apt.doctor?.name || `Doctor #${apt.doctor_id}`}
                    </span>
                    {apt.doctor?.specialization && (
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                        {apt.doctor.specialization}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${getStatusClass(apt.status)}`}>
                      {getStatusLabel(apt.status)}
                    </span>
                  </td>
                  <td>
                    {apt.cancel_reason && (
                      <span style={{ color: 'var(--danger-red)', fontSize: '0.875rem' }}>
                        {apt.cancel_reason}
                      </span>
                    )}
                    {apt.file_upload && (
                      <span style={{ color: 'var(--success-green)', fontSize: '0.875rem' }}>
                        📎 File attached
                      </span>
                    )}
                    {!apt.cancel_reason && !apt.file_upload && '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <p className="empty-state-title">
            {filter === 'all' ? 'No appointments yet' : `No ${filter} appointments`}
          </p>
          <p className="empty-state-description">
            {filter === 'all'
              ? 'Book an appointment with one of our doctors to get started'
              : 'Try selecting a different filter'}
          </p>
        </div>
      )}
    </div>
  );
};

export default PatientAppointments;
