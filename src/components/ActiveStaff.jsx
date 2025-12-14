import React, { useState, useEffect } from 'react';
import StaffForm from './StaffForm';
import api from '../services/api';

const ActiveStaff = ({ clinicId, onStaffUpdated }) => {
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [deletingStaff, setDeletingStaff] = useState(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [clinicFilter, setClinicFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchStaff = async () => {
    try {
      setLoading(true);
      
      if (clinicId === 'combined') {
        const [mnlData, cdoData] = await Promise.all([
          api.getActiveStaff('MNL'),
          api.getActiveStaff('CDO')
        ]);
        
        const combinedData = [
          ...(mnlData?.staff || []).map(staffMember => ({ ...staffMember, clinic: 'MNL' })),
          ...(cdoData?.staff || []).map(staffMember => ({ ...staffMember, clinic: 'CDO' }))
        ];
        
        setStaff(combinedData);
        setFilteredStaff(combinedData);
      } else {
        const data = await api.getActiveStaff(clinicId);
        const staffData = Array.isArray(data) ? data : (data?.staff || []);
        const staffWithClinic = staffData.map(staffMember => ({ ...staffMember, clinic: clinicId }));
        setStaff(staffWithClinic);
        setFilteredStaff(staffWithClinic);
      }
      
      setError('');
    } catch (err) {
      setError('Failed to load staff data: ' + (err.message || 'Unknown error'));
      console.error('Error fetching staff:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [clinicId]);

  // Apply filters whenever search term, clinic filter, or role filter changes
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
        staffMember.specialization?.toLowerCase().includes(lowercasedSearch)
      );
    }
    
    // Apply clinic filter
    if (clinicFilter !== 'all') {
      result = result.filter(staffMember => staffMember.clinic === clinicFilter);
    }
    
    // Apply role filter
    if (roleFilter !== 'all') {
      result = result.filter(staffMember => staffMember.role === roleFilter);
    }
    
    setFilteredStaff(result);
  }, [searchTerm, clinicFilter, roleFilter, staff]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleCreateStaff = async (staffData) => {
    try {
      // For combined view, use the clinic_id from the form data
      const targetClinic = clinicId === 'combined' ? staffData.clinic_id : clinicId;
      
      console.log('Creating staff with data:', { ...staffData, clinic_id: targetClinic });
      
      const result = await api.createStaff({
        ...staffData,
        clinic_id: targetClinic
      });
      
      setSuccess(`Staff created successfully in ${targetClinic === 'MNL' ? 'Manila' : 'CDO'} clinic. Initial password: ${result.initial_password || 'generated'}`);
      setShowForm(false);
      fetchStaff();
      onStaffUpdated?.();
    } catch (err) {
      setError(err.message || 'Failed to create staff');
      console.error('Error creating staff:', err);
    }
  };

  const handleUpdateStaff = async (staffData) => {
    try {
      const targetClinic = editingStaff?.clinic || (clinicId === 'combined' ? 'MNL' : clinicId);
      
      console.log('Updating staff:', { targetClinic, staffId: editingStaff?.staff_id, data: staffData });
      
      await api.updateStaff(targetClinic, editingStaff.staff_id, staffData);
      setSuccess('Staff updated successfully');
      setShowForm(false);
      setEditingStaff(null);
      fetchStaff();
      onStaffUpdated?.();
    } catch (err) {
      setError(err.message || 'Failed to update staff');
      console.error('Error updating staff:', err);
    }
  };

  const handleDeactivate = async () => {
    try {
      const targetClinic = deletingStaff?.clinic || (clinicId === 'combined' ? 'MNL' : clinicId);
      
      console.log('Deactivating staff:', { targetClinic, staffId: deletingStaff?.staff_id });
      
      await api.deactivateStaff(targetClinic, deletingStaff.staff_id);
      setSuccess(`${deletingStaff.full_name} deactivated successfully from ${targetClinic === 'MNL' ? 'Manila' : 'CDO'} clinic`);
      setDeletingStaff(null);
      fetchStaff();
      onStaffUpdated?.();
    } catch (err) {
      setError(err.message || 'Failed to deactivate staff');
      console.error('Error deactivating staff:', err);
    }
  };

  const handleEdit = (staffMember) => {
    console.log('Editing staff:', staffMember);
    setEditingStaff(staffMember);
    setShowForm(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
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

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setClinicFilter('all');
    setRoleFilter('all');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading active staff...</p>
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

      {/* Action Bar with Search and Filters */}
      <div className="section-header" style={{ borderBottom: 'none', marginBottom: '1rem', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <p className="section-description">
            {clinicId === 'combined' 
              ? 'Manage active staff members from both Manila and CDO clinics.' 
              : `Manage active staff members in ${clinicId === 'MNL' ? 'Manila' : 'CDO'} clinic.`
            }
            Click edit to modify details or deactivate to remove access.
          </p>
          <p style={{ fontSize: '0.9rem', color: '#3498db', marginTop: '0.5rem', fontWeight: '500' }}>
            {filteredStaff.length} active staff member{filteredStaff.length !== 1 ? 's' : ''} found
            {clinicId === 'combined' && ' across both clinics'}
            {(searchTerm || clinicFilter !== 'all' || roleFilter !== 'all') && ' (filtered)'}
          </p>
        </div>
        
        <button
          className="action-button primary-button"
          onClick={() => {
            console.log('Opening form for new staff');
            setEditingStaff(null);
            setShowForm(true);
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add New Staff
        </button>
      </div>

      {/* Search and Filter Bar */}
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
              placeholder="Search by name, email, ID, department, or specialization..."
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
        
        {(searchTerm || clinicFilter !== 'all' || roleFilter !== 'all') && (
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

      {/* Staff Form Popup Card */}
      {showForm && (
        <div className="form-popup-overlay">
          <div className="form-popup-card">
            <div className="form-popup-header">
              <h3 className="form-popup-title">
                {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
              </h3>
              <button 
                className="form-popup-close"
                onClick={() => {
                  console.log('Closing form');
                  setShowForm(false);
                  setEditingStaff(null);
                }}
              >
                ×
              </button>
            </div>
            
            <div className="form-popup-content">
              <StaffForm
                onSubmit={editingStaff ? handleUpdateStaff : handleCreateStaff}
                initialData={editingStaff}
                clinicId={editingStaff?.clinic || (clinicId === 'combined' ? 'MNL' : clinicId)}
                onCancel={() => {
                  setShowForm(false);
                  setEditingStaff(null);
                }}
                isCombinedView={clinicId === "combined"}
              />
            </div>
          </div>
        </div>
      )}

      {/* Staff List - Grid Layout */}
      {filteredStaff.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👤</div>
          <p className="empty-state-text">
            {searchTerm || clinicFilter !== 'all' || roleFilter !== 'all' 
              ? 'No staff members match your search criteria' 
              : 'No active staff members found'}
          </p>
          <p className="empty-state-subtext">
            {searchTerm || clinicFilter !== 'all' || roleFilter !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Click "Add New Staff" to create your first staff member'}
          </p>
          {(searchTerm || clinicFilter !== 'all' || roleFilter !== 'all') && (
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
            <div key={`${staffMember.clinic}-${staffMember.staff_id}`} className="staff-card">
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
                </div>
              </div>

              <div className="staff-info-grid">
                <div className="info-item">
                  <span className="info-label">Email</span>
                  <span className="info-value">{staffMember.email || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Contact</span>
                  <span className="info-value">{staffMember.contact_no || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Department</span>
                  <span className="info-value">{staffMember.department || 'Not specified'}</span>
                </div>
                {staffMember.specialization && (
                  <div className="info-item">
                    <span className="info-label">Specialization</span>
                    <span className="info-value">{staffMember.specialization}</span>
                  </div>
                )}
                {staffMember.license_no && (
                  <div className="info-item">
                    <span className="info-label">License No.</span>
                    <span className="info-value">{staffMember.license_no}</span>
                  </div>
                )}
                {staffMember.assigned_doctor_id && (
                  <div className="info-item">
                    <span className="info-label">Assigned Doctor</span>
                    <span className="info-value">{staffMember.assigned_doctor_id}</span>
                  </div>
                )}
                <div className="info-item">
                  <span className="info-label">Hired On</span>
                  <span className="info-value">{formatDate(staffMember.created_at)}</span>
                </div>
              </div>

              <div className="staff-actions">
                <button
                  className="action-button edit-button"
                  onClick={() => handleEdit(staffMember)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Edit
                </button>
                <button
                  className="action-button deactivate-button"
                  onClick={() => setDeletingStaff(staffMember)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  Deactivate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Deactivation Confirmation Popup */}
      {deletingStaff && (
        <div className="confirmation-popup-overlay">
          <div className="confirmation-popup-card">
            <div className="confirmation-popup-header">
              <h3 className="confirmation-popup-title">Confirm Deactivation</h3>
              <button className="confirmation-popup-close" onClick={() => setDeletingStaff(null)}>×</button>
            </div>
            
            <div className="confirmation-popup-content">
              <p>Are you sure you want to deactivate <strong>{deletingStaff.full_name}</strong>?</p>
              <p style={{ marginTop: '0.5rem', color: '#7f8c8d' }}>
                This will prevent them from accessing the system but keep their records.
                <br />
                <strong>Clinic: {deletingStaff.clinic === 'MNL' ? 'Manila' : 'CDO'}</strong>
                <br />
                <strong>Role: {deletingStaff.role}</strong>
              </p>
            </div>
            
            <div className="confirmation-popup-actions">
              <button className="action-button secondary-button" onClick={() => setDeletingStaff(null)}>
                Cancel
              </button>
              <button className="action-button danger-button" onClick={handleDeactivate}>
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ActiveStaff;