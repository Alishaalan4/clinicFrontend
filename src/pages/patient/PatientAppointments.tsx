import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUserAppointments, searchAppointments } from '../../services/userService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import type { Appointment, AppointmentStatus } from '../../types';
import './PatientPages.css';

type FilterStatus = 'all' | AppointmentStatus;

const PatientAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  
  // Filter state
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    doctor_name: '',
    date: '',
    time: ''
  });
  const [activeFilters, setActiveFilters] = useState({
    doctor_name: '',
    date: '',
    time: ''
  });

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      let response;
      // Check if any filter is active
      const hasFilters = activeFilters.doctor_name || activeFilters.date || activeFilters.time;
      
      if (hasFilters) {
        response = await searchAppointments(activeFilters);
      } else {
        response = await getUserAppointments();
      }

      if (response && 'data' in response) {
        setAppointments(response.data);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
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
    const reset = { doctor_name: '', date: '', time: '' };
    setFilters(reset);
    setActiveFilters(reset);
  };

  const filteredAppointments = appointments.filter(
    (apt) => statusFilter === 'all' || apt.status === statusFilter
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
    <div className="appointments-page">
      <div className="page-header">
        <h1 className="page-title">My Appointments</h1>
        <p className="page-subtitle">View and manage your appointments</p>
      </div>

      <div className="appointments-toolbar">
        <div className="filters-section">
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
                        <label>Doctor Name</label>
                        <input
                            type="text"
                            name="doctor_name"
                            placeholder="Dr. Name"
                            value={filters.doctor_name}
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

        <div className="appointments-filters">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              className={`filter-btn ${statusFilter === f.value ? 'active' : ''}`}
              onClick={() => setStatusFilter(f.value)}
            >
              {f.label}
              {f.value !== 'all' && (
                <span className="filter-count">
                  ({appointments.filter((a) => a.status === f.value).length})
                </span>
              )}
            </button>
          ))}
        </div>
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
                    <Link to={`/patient/doctors/${apt.doctor_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <span style={{ fontWeight: 500 }} className="hover-underline">
                        {apt.doctor?.name || `Doctor #${apt.doctor_id}`}
                      </span>
                    </Link>
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
            {statusFilter === 'all' ? 'No appointments yet' : `No ${statusFilter} appointments`}
          </p>
          <p className="empty-state-description">
            {statusFilter === 'all'
              ? 'Book an appointment with one of our doctors to get started'
              : 'Try selecting a different filter'}
          </p>
        </div>
      )}
    </div>
  );
};

export default PatientAppointments;
