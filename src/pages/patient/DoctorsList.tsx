import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDoctors, searchDoctors } from '../../services/userService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import type { Doctor } from '../../types';
import './PatientPages.css';

const DoctorsList: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
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

    fetchDoctors();
  }, []);

  useEffect(() => {
    const debounceSearch = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        try {
          const results = await searchDoctors(searchQuery);
          setFilteredDoctors(results);
        } catch (error) {
          console.error('Error searching doctors:', error);
          // Fallback to local filtering
          const filtered = doctors.filter(
            (d) =>
              d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              d.specialization.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setFilteredDoctors(filtered);
        } finally {
          setIsSearching(false);
        }
      } else {
        setFilteredDoctors(doctors);
      }
    }, 300);

    return () => clearTimeout(debounceSearch);
  }, [searchQuery, doctors]);

  if (isLoading) {
    return <LoadingSpinner text="Loading doctors..." />;
  }

  return (
    <div className="doctors-page">
      <div className="page-header">
        <h1 className="page-title">Find a Doctor</h1>
        <p className="page-subtitle">
          Browse our qualified doctors and book an appointment
        </p>
      </div>

      <div className="doctors-toolbar">
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by name or specialization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isSearching ? (
        <LoadingSpinner text="Searching..." />
      ) : filteredDoctors.length > 0 ? (
        <div className="doctors-grid">
          {filteredDoctors.map((doctor) => (
            <div key={doctor.id} className="doctor-card">
              <div className="doctor-card-header">
                <div className="avatar avatar-lg">
                  {doctor.name.charAt(0).toUpperCase()}
                </div>
                <div className="doctor-card-info">
                  <h3>{doctor.name}</h3>
                  <span className="doctor-card-specialization">
                    {doctor.specialization}
                  </span>
                </div>
              </div>
              <div className="doctor-card-details">
                <div className="doctor-card-detail">
                  <span>👤</span>
                  <span style={{ textTransform: 'capitalize' }}>{doctor.gender}</span>
                </div>
                {doctor.blood_type && (
                  <div className="doctor-card-detail">
                    <span>🩸</span>
                    <span>{doctor.blood_type}</span>
                  </div>
                )}
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <Link
                  to={`/patient/doctors/${doctor.id}`}
                  className="btn btn-outline"
                  style={{ flex: 1, textAlign: 'center' }}
                >
                  View Profile
                </Link>
                <Link
                  to={`/patient/doctors/${doctor.id}/book`}
                  className="btn btn-primary"
                  style={{ flex: 1, textAlign: 'center' }}
                >
                  Book
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">👨‍⚕️</div>
          <p className="empty-state-title">
            {searchQuery ? 'No doctors found' : 'No doctors available'}
          </p>
          <p className="empty-state-description">
            {searchQuery
              ? 'Try a different search term'
              : 'Please check back later'}
          </p>
        </div>
      )}
    </div>
  );
};

export default DoctorsList;
