import React, { useState, useEffect } from 'react';
import api from '../services/api';

const StaffForm = ({ onSubmit, initialData, clinicId, onCancel, isCombinedView = false }) => {
  const [formData, setFormData] = useState({
    role: 'Doctor',
    full_name: '',
    email: '',
    contact_no: '',
    specialization: '',
    license_no: '',
    assigned_doctor_id: '',
    department: '',
    clinic_id: clinicId || 'MNL' // NEW: Default to clinicId prop or MNL
  });
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        role: initialData.role || 'Doctor',
        full_name: initialData.full_name || '',
        email: initialData.email || '',
        contact_no: initialData.contact_no || '',
        specialization: initialData.specialization || '',
        license_no: initialData.license_no || '',
        assigned_doctor_id: initialData.assigned_doctor_id || '',
        department: initialData.department || '',
        clinic_id: initialData.clinic_id || clinicId || 'MNL' // NEW: Include clinic_id from initial data
      });
    }
  }, [initialData, clinicId]);

  useEffect(() => {
    if (formData.role === 'Secretary') {
      fetchDoctors();
    }
  }, [formData.role, formData.clinic_id]); // UPDATED: Use formData.clinic_id instead of clinicId prop

  const fetchDoctors = async () => {
    try {
      // Use the clinic_id from formData if in combined view, otherwise use the clinicId prop
      const selectedClinicId = isCombinedView ? formData.clinic_id : clinicId;
      const data = await api.getDoctors(selectedClinicId);
      setDoctors(data.staff || []);
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.contact_no.trim()) {
      newErrors.contact_no = 'Contact number is required';
    }

    if (formData.role === 'Doctor') {
      if (!formData.specialization.trim()) {
        newErrors.specialization = 'Specialization is required for doctors';
      }
      if (!formData.license_no.trim()) {
        newErrors.license_no = 'License number is required for doctors';
      }
    }

    // NEW: Validate clinic selection for combined view
    if (isCombinedView && !formData.clinic_id) {
      newErrors.clinic_id = 'Please select a clinic';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // If clinic changes and user is secretary, refresh doctors list
    if (name === 'clinic_id' && formData.role === 'Secretary') {
      // This will trigger the useEffect to refetch doctors
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Prepare data for submission
      const submitData = { ...formData };
      
      // If not in combined view, use the clinicId prop
      if (!isCombinedView) {
        submitData.clinic_id = clinicId;
      }
      
      // Clean up empty fields
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '') {
          submitData[key] = undefined;
        }
      });

      await onSubmit(submitData);
    } catch (err) {
      // Error is handled by parent component
    } finally {
      setLoading(false);
    }
  };

  const isDoctor = formData.role === 'Doctor';
  const isEditing = !!initialData;

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      {/* NEW: Clinic Selection Field (only shown in combined view) */}
      {isCombinedView && (
        <div className="form-group">
          <label className="form-label required">Clinic</label>
          <select
            name="clinic_id"
            value={formData.clinic_id}
            onChange={handleChange}
            className={`form-select ${errors.clinic_id ? 'error' : ''}`}
            disabled={loading || isEditing} // Usually can't change clinic after creation
          >
            <option value="">Select a clinic</option>
            <option value="MNL">Manila Clinic (MNL)</option>
            <option value="CDO">Cagayan de Oro Clinic (CDO)</option>
          </select>
          {errors.clinic_id && <span className="form-error">{errors.clinic_id}</span>}
          {isEditing && (
            <small className="form-hint">Clinic cannot be changed after creation</small>
          )}
        </div>
      )}

      <div className="form-group">
        <label className="form-label required">Role</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="form-select"
          disabled={isEditing}
        >
          <option value="Doctor">Doctor</option>
          <option value="Secretary">Secretary</option>
        </select>
        <small className="form-hint">
          {isDoctor 
            ? 'Doctors require specialization and license number' 
            : 'Secretaries can be assigned to doctors'}
        </small>
      </div>

      <div className="form-group">
        <label className="form-label required">Full Name</label>
        <input
          type="text"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          className={`form-input ${errors.full_name ? 'error' : ''}`}
          placeholder="Enter full name"
          disabled={loading}
        />
        {errors.full_name && <span className="form-error">{errors.full_name}</span>}
      </div>

      <div className="form-group">
        <label className="form-label required">Email Address</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`form-input ${errors.email ? 'error' : ''}`}
          placeholder="staff@abcclinics.ph"
          disabled={loading}
        />
        {errors.email && <span className="form-error">{errors.email}</span>}
      </div>

      <div className="form-group">
        <label className="form-label required">Contact Number</label>
        <input
          type="tel"
          name="contact_no"
          value={formData.contact_no}
          onChange={handleChange}
          className={`form-input ${errors.contact_no ? 'error' : ''}`}
          placeholder="+63-XXX-XXX-XXXX"
          disabled={loading}
        />
        {errors.contact_no && <span className="form-error">{errors.contact_no}</span>}
        <small className="form-hint">Philippines format: +63-XXX-XXX-XXXX</small>
      </div>

      {isDoctor ? (
        <>
          <div className="form-group">
            <label className="form-label required">Specialization</label>
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              className={`form-input ${errors.specialization ? 'error' : ''}`}
              placeholder="e.g., Cardiology, Pediatrics"
              disabled={loading}
            />
            {errors.specialization && <span className="form-error">{errors.specialization}</span>}
          </div>

          <div className="form-group">
            <label className="form-label required">License Number</label>
            <input
              type="text"
              name="license_no"
              value={formData.license_no}
              onChange={handleChange}
              className={`form-input ${errors.license_no ? 'error' : ''}`}
              placeholder="e.g., PH-CRD-2024-001"
              disabled={loading}
            />
            {errors.license_no && <span className="form-error">{errors.license_no}</span>}
          </div>
        </>
      ) : (
        <div className="form-group">
          <label className="form-label">Assigned Doctor</label>
          <select
            name="assigned_doctor_id"
            value={formData.assigned_doctor_id}
            onChange={handleChange}
            className="form-select"
            disabled={loading || doctors.length === 0}
          >
            <option value="">Select a doctor (optional)</option>
            {doctors.map(doctor => (
              <option key={doctor.staff_id} value={doctor.staff_id}>
                {doctor.full_name} ({doctor.specialization})
              </option>
            ))}
          </select>
          <small className="form-hint">
            {doctors.length === 0 
              ? `No doctors available in ${formData.clinic_id === 'MNL' ? 'Manila' : 'CDO'} clinic`
              : 'Optional: Assign secretary to specific doctor'}
          </small>
        </div>
      )}

      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
        <label className="form-label">Department</label>
        <input
          type="text"
          name="department"
          value={formData.department}
          onChange={handleChange}
          className="form-input"
          placeholder={isDoctor ? "e.g., Cardiology Department" : "e.g., Administration"}
          disabled={loading}
        />
        <small className="form-hint">Optional department or unit assignment</small>
      </div>

      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
          <button
            type="button"
            className="action-button secondary-button"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="action-button primary-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {isEditing ? (
                    <g>
                      <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path>
                      <polygon points="18 2 22 6 12 16 8 16 8 12 18 2"></polygon>
                    </g>
                  ) : (
                    <>
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </>
                  )}
                </svg>
                {isEditing ? 'Update Staff' : 'Create Staff'}
              </>
            )}
          </button>
        </div>
        {!isEditing && (
          <small style={{ display: 'block', marginTop: '1rem', color: '#7f8c8d', fontStyle: 'italic' }}>
          </small>
        )}
      </div>
    </form>
  );
};

export default StaffForm;