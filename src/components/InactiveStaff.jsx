import React, { useState, useEffect } from 'react';
import api from '../services/api';

const InactiveStaff = ({ clinicId, onStaffUpdated }) => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [restoringStaff, setRestoringStaff] = useState(null);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      
      if (clinicId === 'combined') {
        const [mnlData, cdoData] = await Promise.all([
          api.getInactiveStaff('MNL'),
          api.getInactiveStaff('CDO')
        ]);
        
        const combinedData = [
          ...(mnlData?.staff || []).map(staffMember => ({ ...staffMember, clinic: 'MNL' })),
          ...(cdoData?.staff || []).map(staffMember => ({ ...staffMember, clinic: 'CDO' }))
        ];
        
        setStaff(combinedData);
      } else {
        const data = await api.getInactiveStaff(clinicId);
        const staffData = Array.isArray(data) ? data : (data?.staff || []);
        setStaff(staffData.map(staffMember => ({ ...staffMember, clinic: clinicId })));
      }
      
      setError('');
    } catch (err) {
      setError('Failed to load inactive staff: ' + (err.message || 'Unknown error'));
      console.error('Error fetching inactive staff:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [clinicId]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleRestore = async () => {
    try {
      const targetClinic = restoringStaff?.clinic || (clinicId === 'combined' ? 'MNL' : clinicId);
      
      console.log('Restoring staff:', { targetClinic, staffId: restoringStaff?.staff_id });
      
      await api.restoreStaff(targetClinic, restoringStaff.staff_id);
      setSuccess(`${restoringStaff.full_name} restored successfully to ${targetClinic === 'MNL' ? 'Manila' : 'CDO'} clinic`);
      setRestoringStaff(null);
      fetchStaff();
      onStaffUpdated?.();
    } catch (err) {
      setError(err.message || 'Failed to restore staff');
      console.error('Error restoring staff:', err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return 'Invalid date';
    }
  };

  const renderClinicBadge = (clinic) => {
    if (!clinic) return null;
    
    return (
      <span className={`clinic-badge ${clinic === 'MNL' ? 'manila' : 'cdo'}`}>
        {clinic === 'MNL' ? 'Manila' : 'CDO'}
      </span>
    );
  };

  const renderRoleBadge = (role) => (
    <span className={`role-badge ${role === 'Doctor' ? 'role-doctor' : 'role-secretary'}`}>
      {role}
    </span>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading inactive staff...</p>
      </div>
    );
  }

  return (
    <>
      {/* Success/Error Messages */}
      {success && (
        <div className="snackbar success">
          {success}
        </div>
      )}
      
      {error && (
        <div className="snackbar error">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="section-header" style={{ borderBottom: 'none', marginBottom: '1rem', alignItems: 'flex-start' }}>
        <div>
          <p className="section-description">
            {clinicId === 'combined'
              ? 'View and restore deactivated staff members from both Manila and CDO clinics.'
              : `View and restore deactivated staff members in ${clinicId === 'MNL' ? 'Manila' : 'CDO'} clinic.`
            }
            Restored staff will regain system access.
          </p>
          <p style={{ fontSize: '0.9rem', color: '#e74c3c', marginTop: '0.5rem', fontWeight: '500' }}>
            {staff.length} inactive staff member{staff.length !== 1 ? 's' : ''}
            {clinicId === 'combined' && ' across both clinics'}
          </p>
        </div>
      </div>

      {/* Staff List - Grid Layout */}
      {staff.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✅</div>
          <p className="empty-state-text">No inactive staff members</p>
          <p className="empty-state-subtext">All staff are currently active</p>
        </div>
      ) : (
        <div className="staff-grid">
          {staff.map((staffMember) => (
            <div key={`${staffMember.clinic}-${staffMember.staff_id}`} className="staff-card inactive-card">
              <div className="staff-card-header">
                <div className="staff-identity">
                  <div className="staff-name-row">
                    <h3 className="staff-name">{staffMember.full_name}</h3>
                    {renderClinicBadge(staffMember.clinic)}
                  </div>
                  <span className="staff-id">{staffMember.staff_id}</span>
                </div>
                <div className="staff-badges">
                  {renderRoleBadge(staffMember.role)}
                  <span className="inactive-badge">Inactive</span>
                </div>
              </div>

              <div className="staff-info-grid">
                <div className="info-item">
                  <span className="info-label">Email</span>
                  <span className="info-value">{staffMember.email || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Clinic</span>
                  <span className="info-value">
                    {staffMember.clinic === 'MNL' ? 'Manila Clinic' : 'Cagayan de Oro Clinic'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Deactivated On</span>
                  <span className="info-value">{formatDate(staffMember.deactivated_at)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Reason</span>
                  <span className="info-value">{staffMember.deactivation_reason || 'Not specified'}</span>
                </div>
                {staffMember.specialization && (
                  <div className="info-item">
                    <span className="info-label">Specialization</span>
                    <span className="info-value">{staffMember.specialization}</span>
                  </div>
                )}
                <div className="info-item">
                  <span className="info-label">Last Active</span>
                  <span className="info-value">{formatDate(staffMember.updated_at)}</span>
                </div>
              </div>

              <div className="staff-actions">
                <button
                  className="action-button restore-button"
                  onClick={() => setRestoringStaff(staffMember)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 7v6a9 9 0 0 0 9 9 9 9 0 0 0 9-9V7"></path>
                    <path d="M21 10v4H11"></path>
                    <path d="M13 6l3-3 3 3"></path>
                  </svg>
                  Restore
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Restore Confirmation Popup */}
      {restoringStaff && (
        <div className="confirmation-popup-overlay">
          <div className="confirmation-popup-card">
            <div className="confirmation-popup-header">
              <h3 className="confirmation-popup-title">Confirm Restoration</h3>
              <button className="confirmation-popup-close" onClick={() => setRestoringStaff(null)}>×</button>
            </div>
            
            <div className="confirmation-popup-content">
              <p>Are you sure you want to restore <strong>{restoringStaff.full_name}</strong>?</p>
              <p style={{ marginTop: '0.5rem', color: '#7f8c8d' }}>
                This will grant them access to the system again.
                <br />
                <strong>Clinic: {restoringStaff.clinic === 'MNL' ? 'Manila' : 'CDO'}</strong>
              </p>
            </div>
            
            <div className="confirmation-popup-actions">
              <button className="action-button secondary-button" onClick={() => setRestoringStaff(null)}>
                Cancel
              </button>
              <button className="action-button success-button" onClick={handleRestore}>
                Restore
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InactiveStaff;