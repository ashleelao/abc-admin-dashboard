import React from 'react';

const StatisticsDashboard = ({ combinedStats, individualStats, onRefresh }) => {
  // Calculate percentages for charts
  const calculatePercentages = () => {
    const total = combinedStats.total || 1; // Avoid division by zero
    return {
      activePercent: (combinedStats.totalActive / total) * 100,
      doctorsPercent: (combinedStats.doctors / combinedStats.totalActive) * 100 || 0,
      secretariesPercent: (combinedStats.secretaries / combinedStats.totalActive) * 100 || 0,
      inactivePercent: (combinedStats.inactive / total) * 100
    };
  };

  // Bar chart component for staff distribution
  const StaffDistributionChart = () => {
    const percentages = calculatePercentages();
    const maxValue = Math.max(
      combinedStats.totalActive,
      combinedStats.doctors,
      combinedStats.secretaries,
      combinedStats.inactive,
      combinedStats.total
    );
    
    return (
      <div className="chart-container">
        <div className="chart-bar-group">
          <div className="chart-bar-item">
            <div className="chart-bar-label">Active Staff</div>
            <div className="chart-bar-container">
              <div 
                className="chart-bar active-bar" 
                style={{ width: `${(combinedStats.totalActive / maxValue) * 100}%` }}
              >
                <span className="chart-bar-value">{combinedStats.totalActive}</span>
              </div>
            </div>
            <div className="chart-bar-percentage">{percentages.activePercent.toFixed(1)}%</div>
          </div>
          
          <div className="chart-bar-item">
            <div className="chart-bar-label">Doctors</div>
            <div className="chart-bar-container">
              <div 
                className="chart-bar doctor-bar" 
                style={{ width: `${(combinedStats.doctors / maxValue) * 100}%` }}
              >
                <span className="chart-bar-value">{combinedStats.doctors}</span>
              </div>
            </div>
            <div className="chart-bar-percentage">{percentages.doctorsPercent.toFixed(1)}% of active</div>
          </div>
          
          <div className="chart-bar-item">
            <div className="chart-bar-label">Secretaries</div>
            <div className="chart-bar-container">
              <div 
                className="chart-bar secretary-bar" 
                style={{ width: `${(combinedStats.secretaries / maxValue) * 100}%` }}
              >
                <span className="chart-bar-value">{combinedStats.secretaries}</span>
              </div>
            </div>
            <div className="chart-bar-percentage">{percentages.secretariesPercent.toFixed(1)}% of active</div>
          </div>
          
          <div className="chart-bar-item">
            <div className="chart-bar-label">Inactive</div>
            <div className="chart-bar-container">
              <div 
                className="chart-bar inactive-bar" 
                style={{ width: `${(combinedStats.inactive / maxValue) * 100}%` }}
              >
                <span className="chart-bar-value">{combinedStats.inactive}</span>
              </div>
            </div>
            <div className="chart-bar-percentage">{percentages.inactivePercent.toFixed(1)}%</div>
          </div>
          
          <div className="chart-bar-item">
            <div className="chart-bar-label">Total Staff</div>
            <div className="chart-bar-container">
              <div 
                className="chart-bar total-bar" 
                style={{ width: `${(combinedStats.total / maxValue) * 100}%` }}
              >
                <span className="chart-bar-value">{combinedStats.total}</span>
              </div>
            </div>
            <div className="chart-bar-percentage">100%</div>
          </div>
        </div>
      </div>
    );
  };

  // Pie chart component for clinic comparison - FIXED SHAPE ONLY
  const ClinicComparisonChart = () => {
    const manilaTotal = individualStats.MNL.totalActive;
    const cdoTotal = individualStats.CDO.totalActive;
    const total = manilaTotal + cdoTotal;
    
    const manilaPercentage = total > 0 ? (manilaTotal / total) * 100 : 0;
    const cdoPercentage = total > 0 ? (cdoTotal / total) * 100 : 0;
    
    return (
      <div className="pie-chart-container">
        <div className="pie-chart">
          <div className="pie-chart-visual">
            {/* FIXED: Use conic-gradient for perfect circle shape */}
            <div 
              className="pie-chart-circle" 
              style={{
                background: `conic-gradient(
                  #3498db 0deg ${(manilaPercentage / 100) * 360}deg,
                  #9b59b6 ${(manilaPercentage / 100) * 360}deg 360deg
                )`
              }}
            >
              <div className="pie-chart-center">
                <div className="pie-center-value">{total}</div>
                <div className="pie-center-label">Total Active</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pie-chart-legend">
          <div className="legend-item">
            <div className="legend-color manila-color" style={{ background: '#3498db' }}></div>
            <div className="legend-text">
              <span className="legend-label">Manila Clinic</span>
              <span className="legend-value">{manilaTotal} ({manilaPercentage.toFixed(1)}%)</span>
            </div>
          </div>
          <div className="legend-item">
            <div className="legend-color cdo-color" style={{ background: '#9b59b6' }}></div>
            <div className="legend-text">
              <span className="legend-label">CDO Clinic</span>
              <span className="legend-value">{cdoTotal} ({cdoPercentage.toFixed(1)}%)</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="statistics-dashboard">
      {/* Both Clinics Overview - Now as Graphs */}
      <div className="stats-section combined-stats">
        <div className="graph-header">
          <h3 className="section-title">Clinics Overview</h3>
          <p className="graph-subtitle">Staff distribution across Manila and CDO clinics</p>
        </div>
        
        <div className="graphs-grid">
          <div className="graph-card bar-chart-card">
            <div className="graph-card-header">
              <h4 className="graph-title">Staff Distribution</h4>
              <p className="graph-description">Number of staff members by category</p>
            </div>
            <StaffDistributionChart />
          </div>
          
          <div className="graph-card pie-chart-card">
            <div className="graph-card-header">
              <h4 className="graph-title">Active Staff by Clinic</h4>
              <p className="graph-description">Comparison between Manila and CDO clinics</p>
            </div>
            <ClinicComparisonChart />
          </div>
        </div>
        
        <div className="stats-summary">
          <div className="summary-item">
            <div className="summary-label">Total Active Staff</div>
            <div className="summary-value">{combinedStats.totalActive}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Active Doctors</div>
            <div className="summary-value">{combinedStats.doctors}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Active Secretaries</div>
            <div className="summary-value">{combinedStats.secretaries}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Inactive Staff</div>
            <div className="summary-value">{combinedStats.inactive}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Total All Staff</div>
            <div className="summary-value">{combinedStats.total}</div>
          </div>
        </div>
      </div>

      {/* Individual Clinic Statistics */}
      <div className="clinic-stats-grid">
        {/* Manila Clinic */}
        <div className="clinic-section manila">
          <div className="clinic-header">
            <h3 className="clinic-title">
              <span className="clinic-badge">MNL</span>
              Manila Clinic
            </h3>
          </div>
          <div className="clinic-cards">
            <div className="clinic-card">
              <div className="card-number">{individualStats.MNL.totalActive}</div>
              <div className="card-label">Active Staff</div>
            </div>
            <div className="clinic-card">
              <div className="card-number">{individualStats.MNL.doctors}</div>
              <div className="card-label">Doctors</div>
            </div>
            <div className="clinic-card">
              <div className="card-number">{individualStats.MNL.secretaries}</div>
              <div className="card-label">Secretaries</div>
            </div>
            <div className="clinic-card">
              <div className="card-number">{individualStats.MNL.inactive}</div>
              <div className="card-label">Inactive</div>
            </div>
          </div>
        </div>

        {/* CDO Clinic */}
        <div className="clinic-section cdo">
          <div className="clinic-header">
            <h3 className="clinic-title">
              <span className="clinic-badge">CDO</span>
              Cagayan de Oro Clinic
            </h3>
          </div>
          <div className="clinic-cards">
            <div className="clinic-card">
              <div className="card-number">{individualStats.CDO.totalActive}</div>
              <div className="card-label">Active Staff</div>
            </div>
            <div className="clinic-card">
              <div className="card-number">{individualStats.CDO.doctors}</div>
              <div className="card-label">Doctors</div>
            </div>
            <div className="clinic-card">
              <div className="card-number">{individualStats.CDO.secretaries}</div>
              <div className="card-label">Secretaries</div>
            </div>
            <div className="clinic-card">
              <div className="card-number">{individualStats.CDO.inactive}</div>
              <div className="card-label">Inactive</div>
            </div>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="statistics-actions">
        <button
          className="action-button primary-button"
          onClick={onRefresh}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6"></path>
            <path d="M1 20v-6h6"></path>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
            <path d="M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
          Refresh Statistics
        </button>
      </div>
    </div>
  );
};

export default StatisticsDashboard;