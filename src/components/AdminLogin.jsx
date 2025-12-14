import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // For demo/testing without API, use hardcoded credentials
      if (email === 'admin@abcclinics.ph' && password === 'admin123') {
        const adminData = {
          admin_id: 'admin-001',
          full_name: 'System Administrator',
          email: 'admin@abcclinics.ph',
          role: 'SuperAdmin',
          permissions: {
            canManageAdmins: true,
            canManageAllClinics: true,
            canViewRevenue: true,
            canExportData: true,
            canManageStaff: true,
            canManageAppointments: true,
            canManageSettings: true,
            canViewDashboard: true,
            canGenerateReports: true
          },
          is_active: true,
          contact_no: '+63-900-000-0000',
          last_login: new Date().toISOString()
        };
        
        const token = btoa(JSON.stringify({
          id: 'admin-001',
          role: 'SuperAdmin',
          email: 'admin@abcclinics.ph',
          timestamp: Date.now()
        }));
        
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminData', JSON.stringify(adminData));
        navigate('/admin/dashboard');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* PURPLE HEADER - using .header class from reference */}
        <div className="header">
          <div className="header-content">
            <h1 className="header-title">ABC Clinics</h1>
            <p className="header-subtitle">Admin Portal</p>
          </div>
        </div>
       
        <div className="card-body">
          <form className="login-form" onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}
           
            <div className="form-group">
              <label htmlFor="email" className="label">Email Address</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
           
            <div className="form-group">
              <label htmlFor="password" className="label">Password</label>
              <input
                id="password"
                type="password"
                className="input"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
           
            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>
         
          <div className="login-info">
            <p>Contact admin if having trouble logging in.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;