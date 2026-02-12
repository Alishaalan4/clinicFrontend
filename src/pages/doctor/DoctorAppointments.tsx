import React, { useEffect, useState } from 'react';
import {
  getDoctorAppointments,
  acceptAppointment,
  cancelAppointment,
  completeAppointment,
  getAppointmentFile,
} from '../../services/doctorService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import type { Appointment, AppointmentStatus } from '../../types';
import './DoctorPages.css';

type FilterStatus = 'all' | AppointmentStatus;

const DoctorAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Search Filter State
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    patient_name: '',
    date: '',
    time: ''
  });
  const [activeFilters, setActiveFilters] = useState({
    patient_name: '',
    date: '',
    time: ''
  });

  // Cancel modal state
  const [cancelModal, setCancelModal] = useState<{ isOpen: boolean; appointmentId: number | null }>({
    isOpen: false,
    appointmentId: null,
  });
  const [cancelReason, setCancelReason] = useState('');

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const data = await getDoctorAppointments(activeFilters);
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [activeFilters]);

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    setActiveFilters(filters);
  };

  const clearFilters = () => {
    const reset = { patient_name: '', date: '', time: '' };
    setFilters(reset);
    setActiveFilters(reset);
  };

  const handleAccept = async (id: number) => {
    setActionLoading(id);
    setMessage({ type: '', text: '' });
    try {
      await acceptAppointment(id);
      setMessage({ type: 'success', text: 'Appointment accepted successfully!' });
      fetchAppointments();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.msg || 'Failed to accept appointment',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelClick = (id: number) => {
    setCancelModal({ isOpen: true, appointmentId: id });
    setCancelReason('');
  };

  const handleCancelConfirm = async () => {
    if (!cancelModal.appointmentId || cancelReason.length < 3) return;

    setActionLoading(cancelModal.appointmentId);
    setMessage({ type: '', text: '' });
    try {
      await cancelAppointment(cancelModal.appointmentId, cancelReason);
      setMessage({ type: 'success', text: 'Appointment cancelled successfully!' });
      setCancelModal({ isOpen: false, appointmentId: null });
      fetchAppointments();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.msg || 'Failed to cancel appointment',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (id: number) => {
    setActionLoading(id);
    setMessage({ type: '', text: '' });
    try {
      await completeAppointment(id);
      setMessage({ type: 'success', text: 'Appointment marked as completed!' });
      fetchAppointments();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.msg || 'Failed to complete appointment',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleView = async (id: number) => {
    setActionLoading(id);
    try {
      const blob = await getAppointmentFile(id);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      // Revoke the URL after a short delay since it's opened in a new tab
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: 'Failed to view file',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownload = async (id: number, filePath: string) => {
    setActionLoading(id);
    try {
      const blob = await getAppointmentFile(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      // Extract filename from path or use default
      const filename = filePath.split('/').pop() || `appointment-file-${id}`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: 'Failed to download file',
      });
    } finally {
      setActionLoading(null);
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

  const statusFilters: { value: FilterStatus; label: string }[] = [
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
    <div className="doctor-appointments">
      <div className="page-header">
        <h1 className="page-title">Appointments</h1>
        <p className="page-subtitle">Manage your patient appointments</p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} mb-4`}>
          {message.text}
        </div>
      )}

      <div className="appointments-toolbar">
         <div className="filters-section" style={{ minWidth: '200px' }}>
            <button 
                className={`toggle-filters-btn ${isFiltersOpen ? 'active' : ''}`}
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            >
                <span className="icon">🔍</span> 
                {isFiltersOpen ? 'Hide Filters' : 'Search & Filter'}
            </button>

            {isFiltersOpen && (
                <div className="filters-panel">
                    <div className="filter-group">
                        <label>Patient Name</label>
                        <input
                            type="text"
                            name="patient_name"
                            placeholder="Patient Name"
                            value={filters.patient_name}
                            onChange={handleFilterChange}
                            className="filter-input"
                        />
                    </div>
                    <div className="filter-group">
                        <label>Date</label>
                        <input
                            type="date"
                            name="date"
                            value={filters.date}
                            onChange={handleFilterChange}
                            className="filter-input"
                        />
                    </div>
                    <div className="filter-group">
                        <label>Time</label>
                        <input
                            type="time"
                            name="time"
                            value={filters.time}
                            onChange={handleFilterChange}
                            className="filter-input"
                        />
                    </div>
                    <div className="filter-actions">
                        <button className="apply-btn" onClick={applyFilters}>Apply</button>
                        <button className="clear-btn" onClick={clearFilters}>Clear</button>
                    </div>
                </div>
            )}
        </div>

        <div className="filters">
          {statusFilters.map((f) => (
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
      </div>

      {filteredAppointments.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Patient</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Actions</th>
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
                    <div style={{ color: 'var(--primary-blue)', fontSize: '0.875rem' }}>
                      {apt.appointment_time.slice(0, 5)}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>
                      {apt.user?.name || `Patient #${apt.user_id}`}
                    </div>
                    {apt.user?.email && (
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
                        {apt.user.email}
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
                      <div className="file-actions">
                        <button 
                          className="file-btn view"
                          title="View File"
                          onClick={() => handleView(apt.id)}
                          disabled={actionLoading === apt.id}
                        >
                          👁️ {actionLoading === apt.id ? '' : 'View'}
                        </button>
                        <button 
                          className="file-btn download"
                          title="Download File"
                          onClick={() => handleDownload(apt.id, apt.file_upload || '')}
                          disabled={actionLoading === apt.id}
                        >
                          📥 {actionLoading === apt.id ? '' : 'Download'}
                        </button>
                      </div>
                    )}
                    {!apt.cancel_reason && !apt.file_upload && '-'}
                  </td>
                  <td>
                    <div className="appointment-actions">
                      {apt.status === 'pending' && (
                        <>
                          <button
                            className="action-btn accept"
                            onClick={() => handleAccept(apt.id)}
                            disabled={actionLoading === apt.id}
                          >
                            {actionLoading === apt.id ? '...' : '✓ Accept'}
                          </button>
                          <button
                            className="action-btn cancel"
                            onClick={() => handleCancelClick(apt.id)}
                            disabled={actionLoading === apt.id}
                          >
                            ✕ Decline
                          </button>
                        </>
                      )}
                      {apt.status === 'booked' && (
                        <>
                          <button
                            className="action-btn complete"
                            onClick={() => handleComplete(apt.id)}
                            disabled={actionLoading === apt.id}
                          >
                            {actionLoading === apt.id ? '...' : '✓ Complete'}
                          </button>
                          <button
                            className="action-btn cancel"
                            onClick={() => handleCancelClick(apt.id)}
                            disabled={actionLoading === apt.id}
                          >
                            ✕ Cancel
                          </button>
                        </>
                      )}
                      {(apt.status === 'completed' || apt.status === 'canceleld') && (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                          No actions
                        </span>
                      )}
                    </div>
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
              ? 'Patients will appear here once they book with you'
              : 'Try selecting a different filter'}
          </p>
        </div>
      )}

      {/* Cancel Modal */}
      <Modal
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, appointmentId: null })}
        title="Cancel Appointment"
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={() => setCancelModal({ isOpen: false, appointmentId: null })}
            >
              Close
            </button>
            <button
              className="btn btn-danger"
              onClick={handleCancelConfirm}
              disabled={cancelReason.length < 3}
            >
              Cancel Appointment
            </button>
          </>
        }
      >
        <p style={{ marginBottom: '1rem' }}>
          Please provide a reason for cancelling this appointment:
        </p>
        <textarea
          className="form-input"
          rows={3}
          placeholder="Enter cancellation reason (min 3 characters)"
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default DoctorAppointments;
