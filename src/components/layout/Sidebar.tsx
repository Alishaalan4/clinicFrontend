import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { role, logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    switch (role) {
      case 'user':
        return [
          { path: '/patient/dashboard', label: 'Dashboard', icon: '🏠' },
          { path: '/patient/doctors', label: 'Find Doctors', icon: '👨‍⚕️' },
          { path: '/patient/appointments', label: 'My Appointments', icon: '📅' },
          { path: '/patient/profile', label: 'My Profile', icon: '👤' },
        ];
      case 'doctor':
        return [
          { path: '/doctor/dashboard', label: 'Dashboard', icon: '🏠' },
          { path: '/doctor/appointments', label: 'Appointments', icon: '📅' },
          { path: '/doctor/availability', label: 'Availability', icon: '🕐' },
          { path: '/doctor/profile', label: 'My Profile', icon: '👤' },
        ];
      case 'admin':
        return [
          { path: '/admin/dashboard', label: 'Dashboard', icon: '🏠' },
          { path: '/admin/users', label: 'Manage Users', icon: '👥' },
          { path: '/admin/doctors', label: 'Manage Doctors', icon: '👨‍⚕️' },
          { path: '/admin/appointments', label: 'Appointments', icon: '📅' },
          { path: '/admin/admins', label: 'Admins', icon: '🔐' },
        ];
      default:
        return [];
    }
  };

  const getRoleLabel = () => {
    switch (role) {
      case 'user': return 'Patient';
      case 'doctor': return 'Doctor';
      case 'admin': return 'Administrator';
      default: return '';
    }
  };

  const navItems = getNavItems();

  return (
    <>
      <div 
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`} 
        onClick={onClose}
      />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon">🏥</span>
            <span className="logo-text">ClinicMS</span>
          </div>
          <button className="sidebar-close" onClick={onClose}>×</button>
        </div>

        <div className="sidebar-user">
          <div className="avatar">
            {user && 'name' in user ? user.name.charAt(0).toUpperCase() : '?'}
          </div>
          <div className="user-info">
            <span className="user-name">{user && 'name' in user ? user.name : 'User'}</span>
            <span className="user-role">{getRoleLabel()}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="theme-toggle" onClick={toggleTheme}>
            <span className="nav-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
            <span className="nav-label">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
