import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './Header.css';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-toggle" onClick={onMenuClick} aria-label="Toggle menu">
          <span className="menu-icon">☰</span>
        </button>
        <h1 className="header-title">{title}</h1>
      </div>
      <div className="header-right">
        <button 
          className="theme-btn" 
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
};

export default Header;
