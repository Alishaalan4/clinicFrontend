import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getDoctorById } from '../../services/userService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import type { Doctor } from '../../types';
import './PatientPages.css';

const DoctorDetail: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      if (!doctorId) return;
      
      try {
        setIsLoading(true);
        const data = await getDoctorById(parseInt(doctorId));
        if (data) {
          setDoctor(data);
        } else {
          setError('Doctor not found');
        }
      } catch (err) {
        console.error('Error fetching doctor details:', err);
        setError('Failed to load doctor details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctor();
  }, [doctorId]);

  if (isLoading) {
    return <LoadingSpinner text="Loading doctor details..." />;
  }

  if (error || !doctor) {
    return (
      <div className="error-container" style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>{error || 'Doctor not found'}</h2>
        <button onClick={() => navigate('/patient/doctors')} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Doctors List
        </button>
      </div>
    );
  }

  return (
    <div className="doctor-detail-page">
      <div className="page-header">
        <button 
          onClick={() => navigate('/patient/doctors')} 
          className="btn btn-outline" 
          style={{ marginBottom: '1rem' }}
        >
          ← Back to List
        </button>
        <h1 className="page-title">{doctor.name}</h1>
        <p className="page-subtitle">{doctor.specialization}</p>
      </div>

      <div className="doctor-detail-content">
        <div className="doctor-detail-card">
          <div className="doctor-detail-header">
            <div className="avatar avatar-xl">
              {doctor.name.charAt(0).toUpperCase()}
            </div>
            <div className="doctor-info-main">
              <h2>Dr. {doctor.name}</h2>
              <span className="badge badge-primary">{doctor.specialization}</span>
              <div className="doctor-meta">
                <div className="meta-item">
                  <span className="meta-icon">📧</span>
                  <span>{doctor.email}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="doctor-detail-sections">
            <div className="detail-section">
              <h3>About the Doctor</h3>
              <div className="doctor-stats-grid">
                <div className="stat-card">
                  <span className="stat-label">Gender</span>
                  <span className="stat-value" style={{ textTransform: 'capitalize' }}>{doctor.gender}</span>
                </div>
                {doctor.blood_type && (
                  <div className="stat-card">
                    <span className="stat-label">Blood Type</span>
                    <span className="stat-value">{doctor.blood_type}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="detail-section">
              <h3>Practice Information</h3>
              <p>Specializing in <strong>{doctor.specialization}</strong>, Dr. {doctor.name} is dedicated to providing the best healthcare services to our patients.</p>
            </div>
          </div>

          <div className="doctor-detail-actions">
            <Link
              to={`/patient/doctors/${doctor.id}/book`}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', textAlign: 'center' }}
            >
              Book an Appointment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetail;
