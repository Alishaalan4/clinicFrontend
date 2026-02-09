import React, { useEffect, useState } from 'react';
import { getAppointments, createAppointment, getUsers, getDoctors } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import type { Appointment, User, Doctor, AppointmentStatus } from '../../types';
import './AdminPages.css';

type FilterStatus = 'all' | AppointmentStatus;

const AdminAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Create appointment modal
  const [createModal, setCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createData, setCreateData] = useState({
    user_id: '',
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
  });

  const fetchData = async () => {
    try {
      const [appointmentsData, usersData, doctorsData] = await Promise.all([
        getAppointments(),
        getUsers(),
        getDoctors(),
      ]);
      setAppointments(appointmentsData);
      setUsers(usersData);
      setDoctors(doctorsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await createAppointment({
        user_id: parseInt(createData.user_id),
        doctor_id: parseInt(createData.doctor_id),
        appointment_date: createData.appointment_date,
        appointment_time: createData.appointment_time + ':00',
      });
      setMessage({ type: 'success', text: 'Appointment created successfully!' });
      setCreateModal(false);
      setCreateData({
        user_id: '',
        doctor_id: '',
        appointment_date: '',
        appointment_time: '',
      });
      fetchData();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to create appointment',
      });
    } finally {
      setCreateLoading(false);
    }
  };

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

  const today = new Date().toISOString().split('T')[0];

  if (isLoading) {
    return <LoadingSpinner text="Loading appointments..." />;
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">All Appointments</h1>
          <p className="page-subtitle">View and manage all clinic appointments</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setCreateModal(true)}>
            ➕ Create Appointment
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} mb-4`}>
          {message.text}
        </div>
      )}

      <div className="appointments-filters" style={{ marginBottom: '1.5rem' }}>
        {filters.map((f) => (
          <button
            key={f.value}
            className={`filter-btn ${filter === f.value ? 'active' : ''}`}
            onClick={() => setFilter(f.value)}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid var(--border-default)',
              background: filter === f.value ? 'var(--primary-blue)' : 'var(--bg-primary)',
              borderRadius: 'var(--border-radius-full)',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: filter === f.value ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer',
            }}
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
        <div className="data-table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date & Time</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((apt) => (
                <tr key={apt.id}>
                  <td>#{apt.id}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>
                      {new Date(apt.appointment_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    <div style={{ color: 'var(--primary-blue)', fontSize: '0.875rem' }}>
                      {apt.appointment_time.slice(0, 5)}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>
                      {apt.user?.name || `Patient #${apt.user_id}`}
                    </div>
                    {apt.user?.email && (
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                        {apt.user.email}
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>
                      {apt.doctor?.name ? `Dr. ${apt.doctor.name}` : `Doctor #${apt.doctor_id}`}
                    </div>
                    {apt.doctor?.specialization && (
                      <div style={{ fontSize: '0.8125rem', color: 'var(--primary-blue)' }}>
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
                      <span style={{ color: 'var(--danger-red)', fontSize: '0.8125rem' }}>
                        {apt.cancel_reason}
                      </span>
                    )}
                    {apt.file_upload && (
                      <span style={{ color: 'var(--success-green)', fontSize: '0.8125rem' }}>
                        📎 Attached
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
        </div>
      )}

      {/* Create Appointment Modal */}
      <Modal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        title="Create Appointment"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setCreateModal(false)}>
              Cancel
            </button>
            <button
              form="create-appointment-form"
              type="submit"
              className="btn btn-primary"
              disabled={createLoading}
            >
              {createLoading ? 'Creating...' : 'Create Appointment'}
            </button>
          </>
        }
      >
        <form id="create-appointment-form" onSubmit={handleCreate}>
          <div className="form-group">
            <label className="form-label">Patient *</label>
            <select
              className="form-input"
              value={createData.user_id}
              onChange={(e) => setCreateData((prev) => ({ ...prev, user_id: e.target.value }))}
              required
            >
              <option value="">Select a patient</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Doctor *</label>
            <select
              className="form-input"
              value={createData.doctor_id}
              onChange={(e) => setCreateData((prev) => ({ ...prev, doctor_id: e.target.value }))}
              required
            >
              <option value="">Select a doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.name} - {doctor.specialization}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date *</label>
            <input
              type="date"
              className="form-input"
              value={createData.appointment_date}
              onChange={(e) => setCreateData((prev) => ({ ...prev, appointment_date: e.target.value }))}
              min={today}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Time *</label>
            <input
              type="time"
              className="form-input"
              value={createData.appointment_time}
              onChange={(e) => setCreateData((prev) => ({ ...prev, appointment_time: e.target.value }))}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminAppointments;
