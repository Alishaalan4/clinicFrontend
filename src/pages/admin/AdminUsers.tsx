import React, { useEffect, useState } from 'react';
import { getUsers, deleteUser, changeUserPassword } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import type { User } from '../../types';
import './AdminPages.css';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Delete confirmation modal
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; user: User | null }>({
    isOpen: false,
    user: null,
  });

  // Password change modal
  const [passwordModal, setPasswordModal] = useState<{ isOpen: boolean; user: User | null }>({
    isOpen: false,
    user: null,
  });
  const [passwordData, setPasswordData] = useState({
    new_password: '',
    confirm_password: '',
  });

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(
        (u) =>
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const handleDelete = async () => {
    if (!deleteModal.user) return;

    setActionLoading(deleteModal.user.id);
    setMessage({ type: '', text: '' });

    try {
      await deleteUser(deleteModal.user.id);
      setMessage({ type: 'success', text: 'User deleted successfully!' });
      setDeleteModal({ isOpen: false, user: null });
      fetchUsers();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.msg || 'Failed to delete user',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordModal.user) return;
    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    setActionLoading(passwordModal.user.id);
    setMessage({ type: '', text: '' });

    try {
      await changeUserPassword(passwordModal.user.id, passwordData);
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordModal({ isOpen: false, user: null });
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
    return <LoadingSpinner text="Loading users..." />;
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Users</h1>
          <p className="page-subtitle">View and manage patient accounts</p>
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
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredUsers.length > 0 ? (
        <>
          {/* Desktop Table */}
          <div className="data-table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Health Info</th>
                  <th>Blood Type</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="avatar avatar-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{user.name}</div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.875rem' }}>
                        {user.height} cm / {user.weight} kg
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', textTransform: 'capitalize' }}>
                        {user.gender}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-grey">{user.blood_type}</span>
                    </td>
                    <td>
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="action-btn edit"
                          onClick={() => {
                            setPasswordModal({ isOpen: true, user });
                            setPasswordData({ new_password: '', confirm_password: '' });
                          }}
                        >
                          🔑 Password
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => setDeleteModal({ isOpen: true, user })}
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
            {filteredUsers.map((user) => (
              <div key={user.id} className="admin-card">
                <div className="admin-card-header">
                  <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
                  <div className="admin-card-info">
                    <h4>{user.name}</h4>
                    <p>{user.email}</p>
                  </div>
                </div>
                <div className="admin-card-details">
                  <div className="admin-card-detail">
                    <span>📏</span>
                    <span>{user.height} cm</span>
                  </div>
                  <div className="admin-card-detail">
                    <span>⚖️</span>
                    <span>{user.weight} kg</span>
                  </div>
                  <div className="admin-card-detail">
                    <span>🩸</span>
                    <span>{user.blood_type}</span>
                  </div>
                  <div className="admin-card-detail">
                    <span>👤</span>
                    <span style={{ textTransform: 'capitalize' }}>{user.gender}</span>
                  </div>
                </div>
                <div className="admin-card-actions">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setPasswordModal({ isOpen: true, user });
                      setPasswordData({ new_password: '', confirm_password: '' });
                    }}
                  >
                    🔑 Change Password
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => setDeleteModal({ isOpen: true, user })}
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
          <div className="empty-state-icon">👥</div>
          <p className="empty-state-title">
            {searchQuery ? 'No users found' : 'No users yet'}
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, user: null })}
        title="Delete User"
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={() => setDeleteModal({ isOpen: false, user: null })}
            >
              Cancel
            </button>
            <button
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={actionLoading !== null}
            >
              {actionLoading ? 'Deleting...' : 'Delete User'}
            </button>
          </>
        }
      >
        <p>
          Are you sure you want to delete <strong>{deleteModal.user?.name}</strong>?
        </p>
        <p style={{ color: 'var(--danger-red)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
          This action cannot be undone. All appointments for this user will also be deleted.
        </p>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={passwordModal.isOpen}
        onClose={() => setPasswordModal({ isOpen: false, user: null })}
        title="Change User Password"
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={() => setPasswordModal({ isOpen: false, user: null })}
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
          Change password for <strong>{passwordModal.user?.name}</strong>
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

export default AdminUsers;
