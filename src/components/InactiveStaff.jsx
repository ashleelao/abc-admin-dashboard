import React, { useState, useEffect } from 'react';
import api from '../services/api';

const InactiveStaff = ({ clinicId, onStaffUpdated }) => {
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [restoringStaff, setRestoringStaff] = useState(null);
  
  // Search and filter states - ADDED ROLE FILTER
  const [searchTerm, setSearchTerm] = useState('');
  const [clinicFilter, setClinicFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all'); // ADDED THIS

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
        
        // Sort alphabetically by full_name
        const sortedData = combinedData.sort((a, b) => 
          (a.full_name || '').localeCompare(b.full_name || '')
        );
        
        setStaff(sortedData);
        setFilteredStaff(sortedData);
      } else {
        const data = await api.getInactiveStaff(clinicId);
        const staffData = Array.isArray(data) ? data : (data?.staff || []);
        const staffWithClinic = staffData.map(staffMember => ({ ...staffMember, clinic: clinicId }));
        
        // Sort alphabetically by full_name
        const sortedData = staffWithClinic.sort((a, b) => 
          (a.full_name || '').localeCompare(b.full_name || '')
        );
        
        setStaff(sortedData);
        setFilteredStaff(sortedData);
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

  // Apply filters whenever search term or clinic filter or role filter changes - UPDATED
  useEffect(() => {
    let result = staff;
    
    // Apply search filter
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(staffMember =>
        staffMember.full_name?.toLowerCase().includes(lowercasedSearch) ||
        staffMember.email?.toLowerCase().includes(lowercasedSearch) ||
        staffMember.staff_id?.toLowerCase().includes(lowercasedSearch) ||
        staffMember.department?.toLowerCase().includes(lowercasedSearch) ||
        staffMember.specialization?.toLowerCase().includes(lowercasedSearch) ||
        staffMember.deactivation_reason?.toLowerCase().includes(lowercasedSearch)
      );
    }
    
    // Apply clinic filter
    if (clinicFilter !== 'all') {
      result = result.filter(staffMember => staffMember.clinic === clinicFilter);
    }
    
    // Apply role filter - ADDED THIS
    if (roleFilter !== 'all') {
      result = result.filter(staffMember => staffMember.role === roleFilter);
    }
    
    // Sort alphabetically
    result = result.sort((a, b) => 
      (a.full_name || '').localeCompare(b.full_name || '')
    );
    
    setFilteredStaff(result);
  }, [searchTerm, clinicFilter, roleFilter, staff]); // ADDED roleFilter

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

  // Clear all filters - UPDATED
  const clearFilters = () => {
    setSearchTerm('');
    setClinicFilter('all');
    setRoleFilter('all'); // ADDED THIS
  };

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
        <div style={{ flex: 1 }}>
          <p className="section-description">
            {clinicId === 'combined'
              ? 'View and restore deactivated staff members from both Manila and CDO clinics.'
              : `View and restore deactivated staff members in ${clinicId === 'MNL' ? 'Manila' : 'CDO'} clinic.`
            }
            Restored staff will regain system access.
          </p>
          <p style={{ fontSize: '0.9rem', color: '#e74c3c', marginTop: '0.5rem', fontWeight: '500' }}>
            {filteredStaff.length} inactive staff member{filteredStaff.length !== 1 ? 's' : ''} found
            {clinicId === 'combined' && ' across both clinics'}
            {(searchTerm || clinicFilter !== 'all' || roleFilter !== 'all') && ' (filtered)'} {/* UPDATED */}
          </p>
        </div>
      </div>

      {/* Search and Filter Bar - UPDATED WITH ROLE FILTER */}
      <div className="filter-bar" style={{ 
        background: 'white', 
        padding: '1rem', 
        borderRadius: '8px', 
        marginBottom: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search by name, email, ID, department, specialization, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                fontSize: '0.95rem',
                transition: 'all 0.3s ease'
              }}
            />
          </div>
        </div>
        
        {clinicId === 'combined' && (
          <div style={{ minWidth: '150px' }}>
            <select
              value={clinicFilter}
              onChange={(e) => setClinicFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                fontSize: '0.95rem',
                background: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Clinics</option>
              <option value="MNL">Manila Only</option>
              <option value="CDO">CDO Only</option>
            </select>
          </div>
        )}
        
        {/* ADDED ROLE FILTER */}
        <div style={{ minWidth: '150px' }}>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              border: '2px solid #e9ecef',
              borderRadius: '8px',
              fontSize: '0.95rem',
              background: 'white',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Roles</option>
            <option value="Doctor">Doctors Only</option>
            <option value="Secretary">Secretaries Only</option>
          </select>
        </div>
        
        {(searchTerm || clinicFilter !== 'all' || roleFilter !== 'all') && ( // UPDATED
          <button
            onClick={clearFilters}
            style={{
              padding: '0.75rem 1rem',
              background: '#f8f9fa',
              border: '2px solid #e9ecef',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: '500',
              color: '#7f8c8d',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            Clear Filters
          </button>
        )}
      </div>

      {/* Staff List - Grid Layout */}
      {filteredStaff.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✅</div>
          <p className="empty-state-text">
            {searchTerm || clinicFilter !== 'all' || roleFilter !== 'all' // UPDATED
              ? 'No inactive staff members match your search criteria' 
              : 'No inactive staff members'}
          </p>
          <p className="empty-state-subtext">
            {searchTerm || clinicFilter !== 'all' || roleFilter !== 'all' // UPDATED
              ? 'Try adjusting your search or filters' 
              : 'All staff are currently active'}
          </p>
          {(searchTerm || clinicFilter !== 'all' || roleFilter !== 'all') && ( // UPDATED
            <button
              onClick={clearFilters}
              className="action-button secondary-button"
              style={{ marginTop: '1rem' }}
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="staff-grid">
          {filteredStaff.map((staffMember) => (
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
                <br />
                <strong>Role: {restoringStaff.role}</strong>
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