import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ActiveStaff from '../components/ActiveStaff';
import InactiveStaff from '../components/InactiveStaff';
import RevenueReport from '../components/RevenueReport';
import StatisticsDashboard from '../components/StatisticsDashboard';
import api from '../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('statistics');
  const [combinedStats, setCombinedStats] = useState({
    totalActive: 0,
    doctors: 0,
    secretaries: 0,
    inactive: 0,
    total: 0
  });
  const [individualStats, setIndividualStats] = useState({
    MNL: { totalActive: 0, doctors: 0, secretaries: 0, inactive: 0, total: 0 },
    CDO: { totalActive: 0, doctors: 0, secretaries: 0, inactive: 0, total: 0 }
  });
  const [revenueData, setRevenueData] = useState(null);
  const [showRevenueReport, setShowRevenueReport] = useState(false);
  const [revenueFilters, setRevenueFilters] = useState({
    startDate: '',
    endDate: '',
    clinicIds: ''
  });
  const [loading, setLoading] = useState(true);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [error, setError] = useState('');
  const [adminInfo, setAdminInfo] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Load admin info on component mount
  useEffect(() => {
    const adminData = localStorage.getItem('adminData');
    const adminToken = localStorage.getItem('adminToken');
    
    if (!adminToken || !adminData) {
      navigate('/admin/login', { replace: true });
      return;
    }
    
    try {
      const parsedData = JSON.parse(adminData);
      if (!parsedData.role || (!parsedData.role.includes('Admin') && parsedData.role !== 'SuperAdmin')) {
        handleLogout();
        return;
      }
      setAdminInfo(parsedData);
    } catch (err) {
      handleLogout();
    }
  }, [navigate]);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin/login', { replace: true });
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch stats for both clinics
      const [mnlData, cdoData] = await Promise.all([
        api.getStaffStats('MNL'),
        api.getStaffStats('CDO')
      ]);

      // Set individual stats
      setIndividualStats({
        MNL: mnlData,
        CDO: cdoData
      });

      // Calculate combined stats
      const combined = {
        totalActive: mnlData.totalActive + cdoData.totalActive,
        doctors: mnlData.doctors + cdoData.doctors,
        secretaries: mnlData.secretaries + cdoData.secretaries,
        inactive: mnlData.inactive + cdoData.inactive,
        total: mnlData.total + cdoData.total
      };

      setCombinedStats(combined);
      setError('');
    } catch (err) {
      setError('Failed to load statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueReport = async () => {
    try {
      setRevenueLoading(true);
      
      const data = await api.fetchRevenue(revenueFilters);
      setRevenueData(data);
      setShowRevenueReport(true);
    } catch (err) {
      setError('Failed to load revenue report');
      console.error(err);
    } finally {
      setRevenueLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Set default date range for revenue (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    setRevenueFilters({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      clinicIds: ''
    });
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const refreshData = () => {
    fetchStats();
  };

  const handleGenerateRevenueReport = () => {
    fetchRevenueReport();
  };

  // If no admin info, show loading
  if (!adminInfo) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      {/* Header with user info and logout */}
      <header className="admin-header">
        <div className="header-left">
          <div>
            <h1 className="admin-header-title">ABC Clinics - Administration Dashboard</h1>
            <p className="admin-header-subtitle">Comprehensive management system for clinics</p>
          </div>
        </div>
        
        {/* Admin info and logout button */}
        <div className="header-right">
          <div className="admin-user-info">
            <div className="admin-user-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className="admin-user-details">
              <span className="admin-user-name">{adminInfo.full_name}</span>
              <span className="admin-user-role">{adminInfo.role}</span>
            </div>
          </div>
          <button 
            className="logout-button"
            onClick={() => setShowLogoutConfirm(true)}
            title="Logout"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </div>
      </header>

      {/* Logout Confirmation Modal - FIXED: Using correct CSS classes */}
      {showLogoutConfirm && (
        <div className="logout-confirm-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="logout-confirm-card" onClick={(e) => e.stopPropagation()}>
            <div className="logout-confirm-header">
              <h3 className="logout-confirm-title">Confirm Logout</h3>
              <button 
                className="logout-confirm-close"
                onClick={() => setShowLogoutConfirm(false)}
              >
                ×
              </button>
            </div>
            
            <div className="logout-confirm-content">
              <div className="logout-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </div>
              <p>Are you sure you want to logout?</p>
              <p className="logout-user-info">
                Logging out as: <strong>{adminInfo.full_name}</strong>
              </p>
            </div>
            
            <div className="logout-confirm-actions">
              <button 
                className="logout-cancel-button"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="logout-confirm-button"
                onClick={handleLogout}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'statistics' ? 'active' : ''}`}
          onClick={() => handleTabChange('statistics')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
          Dashboard
        </button>
        <button
          className={`admin-tab ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => handleTabChange('active')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          Active Staff
        </button>
        <button
          className={`admin-tab ${activeTab === 'inactive' ? 'active' : ''}`}
          onClick={() => handleTabChange('inactive')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
          </svg>
          Inactive Staff
        </button>
        <button
          className={`admin-tab ${activeTab === 'revenue' ? 'active' : ''}`}
          onClick={() => handleTabChange('revenue')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
          Revenue Report
        </button>
      </div>

      {/* Content */}
      <div className="admin-content">
        {/* Error Display */}
        {error && (
          <div className="snackbar error">
            {error}
          </div>
        )}

        {/* Main Content Area */}
        <div className="admin-section">
          <div className="section-header">
            <h2 className="section-title">
              {activeTab === 'statistics' ? 'Dashboard' : 
               activeTab === 'active' ? 'Active Staff Management' : 
               activeTab === 'inactive' ? 'Inactive Staff' : 'Revenue Report'}
              <small style={{ display: 'block', fontSize: '1rem', color: '#7f8c8d', fontWeight: 'normal', marginTop: '0.5rem' }}>
                {activeTab === 'statistics' ? 'Visual overview of clinic data' :
                 activeTab === 'revenue' ? 'Generate and view revenue reports' : 
                 'All Staff - Manila & Cagayan de Oro Clinics'}
              </small>
            </h2>
            {activeTab === 'active' && (
              <button
                className="action-button primary-button"
                onClick={() => refreshData()}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 4v6h-6"></path>
                  <path d="M1 20v-6h6"></path>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
                  <path d="M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
                Refresh All
              </button>
            )}
            {activeTab === 'revenue' && showRevenueReport && (
              <button
                className="action-button secondary-button"
                onClick={() => setShowRevenueReport(false)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                Back to Filters
              </button>
            )}
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Loading all data...</p>
            </div>
          ) : activeTab === 'statistics' ? (
            <StatisticsDashboard 
              combinedStats={combinedStats}
              individualStats={individualStats}
              onRefresh={refreshData}
            />
          ) : activeTab === 'active' ? (
            <ActiveStaff clinicId="combined" onStaffUpdated={refreshData} />
          ) : activeTab === 'inactive' ? (
            <InactiveStaff clinicId="combined" onStaffUpdated={refreshData} />
          ) : activeTab === 'revenue' ? (
            showRevenueReport ? (
              revenueLoading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p className="loading-text">Generating revenue report...</p>
                </div>
              ) : revenueData ? (
                <RevenueReport data={revenueData} />
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">📊</div>
                  <p className="empty-state-text">No revenue data available</p>
                  <p className="empty-state-subtext">Try generating a report with different filters</p>
                </div>
              )
            ) : (
              <div className="revenue-filters-section">
                <div className="revenue-filters-card">
                  <div className="revenue-header">
                    <h3 className="revenue-title">Revenue Report Generator</h3>
                    <p className="revenue-description">
                      Generate detailed revenue reports for selected date range and clinics
                    </p>
                  </div>
                  
                  <div className="revenue-filters-grid">
                    <div className="filter-group">
                      {/* DATE PRESETS ON LEFT SIDE ABOVE START DATE */}
                      <div style={{ 
                        marginBottom: '1.5rem',
                        display: 'flex',
                        gap: '0.75rem',
                        alignItems: 'center'
                      }}>
                        <span style={{ 
                          fontSize: '0.95rem', 
                          fontWeight: '600', 
                          color: '#2c3e50',
                          marginRight: '0.5rem'
                        }}>
                          Quick Filter:
                        </span>
                        <button
                          type="button"
                          className="preset-button"
                          onClick={() => {
                            const endDate = new Date();
                            const startDate = new Date();
                            startDate.setDate(startDate.getDate() - 7);
                            setRevenueFilters({
                              ...revenueFilters,
                              startDate: startDate.toISOString().split('T')[0],
                              endDate: endDate.toISOString().split('T')[0]
                            });
                          }}
                        >
                          Last 7 Days
                        </button>
                        <button
                          type="button"
                          className="preset-button"
                          onClick={() => {
                            const endDate = new Date();
                            const startDate = new Date();
                            startDate.setDate(startDate.getDate() - 30);
                            setRevenueFilters({
                              ...revenueFilters,
                              startDate: startDate.toISOString().split('T')[0],
                              endDate: endDate.toISOString().split('T')[0]
                            });
                          }}
                        >
                          Last 30 Days
                        </button>
                        <button
                          type="button"
                          className="preset-button"
                          onClick={() => {
                            const today = new Date();
                            const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                            setRevenueFilters({
                              ...revenueFilters,
                              startDate: startDate.toISOString().split('T')[0],
                              endDate: today.toISOString().split('T')[0]
                            });
                          }}
                        >
                          This Month
                        </button>
                      </div>
                      
                      <div className="filter-item">
                        <label className="filter-label">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                          Start Date
                        </label>
                        <input
                          type="date"
                          className="filter-input"
                          value={revenueFilters.startDate}
                          onChange={(e) => setRevenueFilters({...revenueFilters, startDate: e.target.value})}
                        />
                      </div>
                      
                      <div className="filter-item">
                        <label className="filter-label">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                          End Date
                        </label>
                        <input
                          type="date"
                          className="filter-input"
                          value={revenueFilters.endDate}
                          onChange={(e) => setRevenueFilters({...revenueFilters, endDate: e.target.value})}
                        />
                      </div>
                      
                      <div className="filter-item">
                        <label className="filter-label">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                          Clinic Selection
                        </label>
                        <select
                          className="filter-select"
                          value={revenueFilters.clinicIds}
                          onChange={(e) => setRevenueFilters({...revenueFilters, clinicIds: e.target.value})}
                        >
                          <option value="">All Clinics (Manila + CDO)</option>
                          <option value="MNL">Manila Clinic Only</option>
                          <option value="CDO">Cagayan de Oro Clinic Only</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="filter-info">
                      <div className="info-card">
                        <div className="info-icon">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                          </svg>
                        </div>
                        <div className="info-content">
                          <h4 className="info-title">Report Details</h4>
                          <p className="info-text">
                            Select a date range to generate revenue report. Reports include:
                          </p>
                          <ul className="info-list">
                            <li>Daily revenue per doctor</li>
                            <li>Total appointments count</li>
                            <li>Clinic-wise breakdown</li>
                            <li>CSV export functionality</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="filter-actions">
                    <button
                      className="filter-button generate-button"
                      onClick={handleGenerateRevenueReport}
                      disabled={revenueLoading}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                      </svg>
                      {revenueLoading ? 'Generating Report...' : 'Generate Revenue Report'}
                    </button>
                  </div>
                </div>
              </div>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;