import React, { useEffect, useState } from 'react';
import { getAdmins, createAdmin, deleteAdmin, changeAdminPassword } from '../../services/adminService';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import type { Admin } from '../../types';
import './AdminPages.css';

const AdminAdmins: React.FC = () => {
  const { user } = useAuth();
  const currentAdmin = user as Admin;

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Create admin modal
  const [createModal, setCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createData, setCreateData] = useState({
    name: '',
    email: '',
    password: '',
  });

  // Delete confirmation modal
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; admin: Admin | null }>({
    isOpen: false,
    admin: null,
  });

  // Password change modal
  const [passwordModal, setPasswordModal] = useState<{ isOpen: boolean; admin: Admin | null }>({
    isOpen: false,
    admin: null,
  });
  const [passwordData, setPasswordData] = useState({
    new_password: '',
    confirm_password: '',
  });

  const fetchAdmins = async () => {
    try {
      const data = await getAdmins();
      setAdmins(data);
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await createAdmin({
        name: createData.name,
        email: createData.email,
        password: createData.password,
      });
      setMessage({ type: 'success', text: 'Admin created successfully!' });
      setCreateModal(false);
      setCreateData({ name: '', email: '', password: '' });
      fetchAdmins();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to create admin',
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.admin) return;

    setActionLoading(deleteModal.admin.id);
    setMessage({ type: '', text: '' });

    try {
      await deleteAdmin(deleteModal.admin.id);
      setMessage({ type: 'success', text: 'Admin deleted successfully!' });
      setDeleteModal({ isOpen: false, admin: null });
      fetchAdmins();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.msg || 'Failed to delete admin',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordModal.admin) return;
    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    setActionLoading(passwordModal.admin.id);
    setMessage({ type: '', text: '' });

    try {
      await changeAdminPassword(passwordModal.admin.id, passwordData);
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordModal({ isOpen: false, admin: null });
      setPasswordData({ new_password: '', confirm_password: '' });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to change password',
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading admins..." />;
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Administrators</h1>
          <p className="page-subtitle">View and manage admin accounts</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setCreateModal(true)}>
            ➕ Add Admin
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} mb-4`}>
          {message.text}
        </div>
      )}

      {admins.length > 0 ? (
        <>
          {/* Desktop Table */}
          <div className="data-table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Administrator</th>
                  <th>Email</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="avatar avatar-sm" style={{ background: 'var(--warning-orange)', color: 'white' }}>
                          {admin.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500 }}>
                            {admin.name}
                            {admin.id === currentAdmin?.id && (
                              <span className="badge badge-primary" style={{ marginLeft: '0.5rem' }}>
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{admin.email}</td>
                    <td>
                      {new Date(admin.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="action-btn edit"
                          onClick={() => {
                            setPasswordModal({ isOpen: true, admin });
                            setPasswordData({ new_password: '', confirm_password: '' });
                          }}
                        >
                          🔑 Password
                        </button>
                        {admin.id !== currentAdmin?.id && (
                          <button
                            className="action-btn delete"
                            onClick={() => setDeleteModal({ isOpen: true, admin })}
                          >
                            🗑️ Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="admin-cards-grid">
            {admins.map((admin) => (
              <div key={admin.id} className="admin-card">
                <div className="admin-card-header">
                  <div className="avatar" style={{ background: 'var(--warning-orange)', color: 'white' }}>
                    {admin.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="admin-card-info">
                    <h4>
                      {admin.name}
                      {admin.id === currentAdmin?.id && (
                        <span className="badge badge-primary" style={{ marginLeft: '0.5rem' }}>
                          You
                        </span>
                      )}
                    </h4>
                    <p>{admin.email}</p>
                  </div>
                </div>
                <div className="admin-card-details">
                  <div className="admin-card-detail">
                    <span>📅</span>
                    <span>Joined {new Date(admin.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="admin-card-actions">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setPasswordModal({ isOpen: true, admin });
                      setPasswordData({ new_password: '', confirm_password: '' });
                    }}
                  >
                    🔑 Change Password
                  </button>
                  {admin.id !== currentAdmin?.id && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => setDeleteModal({ isOpen: true, admin })}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">🔐</div>
          <p className="empty-state-title">No admins found</p>
          <button className="btn btn-primary" onClick={() => setCreateModal(true)}>
            Add First Admin
          </button>
        </div>
      )}

      {/* Create Admin Modal */}
      <Modal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        title="Add New Administrator"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setCreateModal(false)}>
              Cancel
            </button>
            <button
              form="create-admin-form"
              type="submit"
              className="btn btn-primary"
              disabled={createLoading}
            >
              {createLoading ? 'Creating...' : 'Create Admin'}
            </button>
          </>
        }
      >
        <form id="create-admin-form" onSubmit={handleCreate}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-input"
              value={createData.name}
              onChange={(e) => setCreateData((prev) => ({ ...prev, name: e.target.value }))}
              required
              minLength={2}
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
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, admin: null })}
        title="Delete Administrator"
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={() => setDeleteModal({ isOpen: false, admin: null })}
            >
              Cancel
            </button>
            <button
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={actionLoading !== null}
            >
              {actionLoading ? 'Deleting...' : 'Delete Admin'}
            </button>
          </>
        }
      >
        <p>
          Are you sure you want to delete <strong>{deleteModal.admin?.name}</strong>?
        </p>
        <p style={{ color: 'var(--danger-red)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
          This action cannot be undone.
        </p>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={passwordModal.isOpen}
        onClose={() => setPasswordModal({ isOpen: false, admin: null })}
        title="Change Admin Password"
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={() => setPasswordModal({ isOpen: false, admin: null })}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleChangePassword}
              disabled={actionLoading !== null || passwordData.new_password.length < 6}
            >
              {actionLoading ? 'Changing...' : 'Change Password'}
            </button>
          </>
        }
      >
        <p style={{ marginBottom: '1rem' }}>
          Change password for <strong>{passwordModal.admin?.name}</strong>
        </p>
        <div className="form-group">
          <label className="form-label">New Password</label>
          <input
            type="password"
            className="form-input"
            value={passwordData.new_password}
            onChange={(e) => setPasswordData((prev) => ({ ...prev, new_password: e.target.value }))}
            placeholder="Enter new password (min 6 chars)"
            minLength={6}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Confirm Password</label>
          <input
            type="password"
            className="form-input"
            value={passwordData.confirm_password}
            onChange={(e) => setPasswordData((prev) => ({ ...prev, confirm_password: e.target.value }))}
            placeholder="Confirm new password"
            minLength={6}
          />
        </div>
      </Modal>
    </div>
  );
};

export default AdminAdmins;
