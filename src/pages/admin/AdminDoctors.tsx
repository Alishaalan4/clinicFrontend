import React, { useEffect, useState } from 'react';
import { getDoctors, deleteDoctor, createDoctor } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import type { Doctor } from '../../types';
import './AdminPages.css';

const AdminDoctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Create doctor modal
  const [createModal, setCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createData, setCreateData] = useState({
    name: '',
    email: '',
    password: '',
    height: '',
    weight: '',
    blood_type: 'A+',
    gender: 'male',
    specialization: '',
  });

  // Delete confirmation modal
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; doctor: Doctor | null }>({
    isOpen: false,
    doctor: null,
  });

  const fetchDoctors = async () => {
    try {
      const data = await getDoctors();
      setDoctors(data);
      setFilteredDoctors(data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = doctors.filter(
        (d) =>
          d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.specialization.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredDoctors(filtered);
    } else {
      setFilteredDoctors(doctors);
    }
  }, [searchQuery, doctors]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await createDoctor({
        name: createData.name,
        email: createData.email,
        password: createData.password,
        height: parseFloat(createData.height),
        weight: parseFloat(createData.weight),
        blood_type: createData.blood_type,
        gender: createData.gender,
        specialization: createData.specialization,
      });
      setMessage({ type: 'success', text: 'Doctor created successfully!' });
      setCreateModal(false);
      setCreateData({
        name: '',
        email: '',
        password: '',
        height: '',
        weight: '',
        blood_type: 'A+',
        gender: 'male',
        specialization: '',
      });
      fetchDoctors();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to create doctor',
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.doctor) return;

    setActionLoading(deleteModal.doctor.id);
    setMessage({ type: '', text: '' });

    try {
      await deleteDoctor(deleteModal.doctor.id);
      setMessage({ type: 'success', text: 'Doctor deleted successfully!' });
      setDeleteModal({ isOpen: false, doctor: null });
      fetchDoctors();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.msg || 'Failed to delete doctor',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  if (isLoading) {
    return <LoadingSpinner text="Loading doctors..." />;
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Doctors</h1>
          <p className="page-subtitle">View and manage doctor accounts</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setCreateModal(true)}>
            ➕ Add Doctor
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} mb-4`}>
          {message.text}
        </div>
      )}

      <div className="toolbar">
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, email, or specialization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredDoctors.length > 0 ? (
        <>
          {/* Desktop Table */}
          <div className="data-table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Specialization</th>
                  <th>Health Info</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDoctors.map((doctor) => (
                  <tr key={doctor.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="avatar avatar-sm" style={{ background: 'linear-gradient(135deg, var(--primary-blue), var(--success-green))', color: 'white' }}>
                          {doctor.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500 }}>Dr. {doctor.name}</div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
                            {doctor.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-primary">{doctor.specialization}</span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.875rem' }}>
                        {doctor.height} cm / {doctor.weight} kg
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                        {doctor.blood_type} • <span style={{ textTransform: 'capitalize' }}>{doctor.gender}</span>
                      </div>
                    </td>
                    <td>
                      {new Date(doctor.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="action-btn delete"
                          onClick={() => setDeleteModal({ isOpen: true, doctor })}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="admin-cards-grid">
            {filteredDoctors.map((doctor) => (
              <div key={doctor.id} className="admin-card">
                <div className="admin-card-header">
                  <div className="avatar" style={{ background: 'linear-gradient(135deg, var(--primary-blue), var(--success-green))', color: 'white' }}>
                    {doctor.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="admin-card-info">
                    <h4>Dr. {doctor.name}</h4>
                    <p>{doctor.email}</p>
                  </div>
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <span className="badge badge-primary">{doctor.specialization}</span>
                </div>
                <div className="admin-card-details">
                  <div className="admin-card-detail">
                    <span>📏</span>
                    <span>{doctor.height} cm</span>
                  </div>
                  <div className="admin-card-detail">
                    <span>⚖️</span>
                    <span>{doctor.weight} kg</span>
                  </div>
                  <div className="admin-card-detail">
                    <span>🩸</span>
                    <span>{doctor.blood_type}</span>
                  </div>
                </div>
                <div className="admin-card-actions">
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => setDeleteModal({ isOpen: true, doctor })}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">👨‍⚕️</div>
          <p className="empty-state-title">
            {searchQuery ? 'No doctors found' : 'No doctors yet'}
          </p>
          <button className="btn btn-primary" onClick={() => setCreateModal(true)}>
            Add First Doctor
          </button>
        </div>
      )}

      {/* Create Doctor Modal */}
      <Modal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        title="Add New Doctor"
        size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setCreateModal(false)}>
              Cancel
            </button>
            <button
              form="create-doctor-form"
              type="submit"
              className="btn btn-primary"
              disabled={createLoading}
            >
              {createLoading ? 'Creating...' : 'Create Doctor'}
            </button>
          </>
        }
      >
        <form id="create-doctor-form" onSubmit={handleCreate}>
          <div className="create-form-grid">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                value={createData.name}
                onChange={(e) => setCreateData((prev) => ({ ...prev, name: e.target.value }))}
                required
                minLength={3}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                className="form-input"
                value={createData.email}
                onChange={(e) => setCreateData((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                className="form-input"
                value={createData.password}
                onChange={(e) => setCreateData((prev) => ({ ...prev, password: e.target.value }))}
                required
                minLength={6}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Specialization *</label>
              <input
                type="text"
                className="form-input"
                value={createData.specialization}
                onChange={(e) => setCreateData((prev) => ({ ...prev, specialization: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Height (cm)</label>
              <input
                type="number"
                className="form-input"
                value={createData.height}
                onChange={(e) => setCreateData((prev) => ({ ...prev, height: e.target.value }))}
                min={0}
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Weight (kg)</label>
              <input
                type="number"
                className="form-input"
                value={createData.weight}
                onChange={(e) => setCreateData((prev) => ({ ...prev, weight: e.target.value }))}
                min={0}
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Blood Type</label>
              <select
                className="form-input"
                value={createData.blood_type}
                onChange={(e) => setCreateData((prev) => ({ ...prev, blood_type: e.target.value }))}
              >
                {bloodTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select
                className="form-input"
                value={createData.gender}
                onChange={(e) => setCreateData((prev) => ({ ...prev, gender: e.target.value }))}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, doctor: null })}
        title="Delete Doctor"
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={() => setDeleteModal({ isOpen: false, doctor: null })}
            >
              Cancel
            </button>
            <button
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={actionLoading !== null}
            >
              {actionLoading ? 'Deleting...' : 'Delete Doctor'}
            </button>
          </>
        }
      >
        <p>
          Are you sure you want to delete <strong>Dr. {deleteModal.doctor?.name}</strong>?
        </p>
        <p style={{ color: 'var(--danger-red)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
          This action cannot be undone. All appointments with this doctor will also be affected.
        </p>
      </Modal>
    </div>
  );
};

export default AdminDoctors;
