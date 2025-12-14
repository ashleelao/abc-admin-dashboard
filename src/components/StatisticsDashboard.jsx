import React from 'react';

const StatisticsDashboard = ({ combinedStats, individualStats, onRefresh, revenueData }) => {
  // Calculate percentages for charts
  const calculatePercentages = () => {
    const total = combinedStats.total || 1;
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

  // Revenue comparison chart between clinics
  const RevenueComparisonChart = () => {
    let manilaRevenue = 0;
    let cdoRevenue = 0;
    
    // Check if revenueData exists and has clinics
    if (revenueData && revenueData.clinics) {
      console.log('Revenue Data Available:', revenueData); // Debug log
      
      if (revenueData.clinics.MNL) {
        manilaRevenue = revenueData.clinics.MNL.totalRevenue || 0;
      }
      if (revenueData.clinics.CDO) {
        cdoRevenue = revenueData.clinics.CDO.totalRevenue || 0;
      }
    }

    const totalRevenue = manilaRevenue + cdoRevenue;
    const manilaPercentage = totalRevenue > 0 ? (manilaRevenue / totalRevenue) * 100 : 50;
    const cdoPercentage = totalRevenue > 0 ? (cdoRevenue / totalRevenue) * 100 : 50;
    
    const formatCurrency = (amount) => {
      if (typeof amount === 'string') {
        amount = parseFloat(amount.replace(/[^0-9.-]+/g, ""));
      }
      return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount || 0);
    };
    
    return (
      <div className="pie-chart-container">
        <div className="pie-chart">
          <div className="pie-chart-visual" style={{ position: 'relative', width: '200px', height: '200px' }}>
            <div 
              className="pie-chart-circle" 
              style={{
                background: `conic-gradient(
                  #3498db 0deg ${(manilaPercentage / 100) * 360}deg,
                  #9b59b6 ${(manilaPercentage / 100) * 360}deg 360deg
                )`,
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                position: 'relative'
              }}
            >
              <div className="pie-chart-center" style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '120px',
                height: '120px',
                background: 'white',
                borderRadius: '50%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}>
                <div className="pie-center-value" style={{ fontSize: '1.6rem', fontWeight: '700', color: '#2c3e50', lineHeight: '1' }}>
                  {formatCurrency(totalRevenue)}
                </div>
                <div className="pie-center-label" style={{ fontSize: '0.8rem', color: '#7f8c8d', marginTop: '0.25rem' }}>
                  Total Revenue
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pie-chart-legend">
          <div className="legend-item">
            <div className="legend-color manila-color" style={{ background: '#3498db' }}></div>
            <div className="legend-text">
              <span className="legend-label">Manila Clinic</span>
              <span className="legend-value">{formatCurrency(manilaRevenue)} ({manilaPercentage.toFixed(1)}%)</span>
            </div>
          </div>
          <div className="legend-item">
            <div className="legend-color cdo-color" style={{ background: '#9b59b6' }}></div>
            <div className="legend-text">
              <span className="legend-label">CDO Clinic</span>
              <span className="legend-value">{formatCurrency(cdoRevenue)} ({cdoPercentage.toFixed(1)}%)</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Doctor Ranking Bar Chart Component
  const DoctorRankingChart = ({ clinicId, doctorData }) => {
    if (!doctorData || doctorData.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '1rem', color: '#7f8c8d' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginBottom: '0.5rem' }}>
            <path d="M3 3h18v18H3zM9 9h6M9 15h6"></path>
          </svg>
          <p style={{ fontSize: '0.9rem' }}>No revenue data available</p>
        </div>
      );
    }
    
    const maxRevenue = Math.max(...doctorData.map(doc => doc.revenue));
    
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount || 0);
    };
    
    // Different color gradients for each doctor
    const doctorColors = [
      'linear-gradient(90deg, #3498db, #2980b9)',     // Blue
      'linear-gradient(90deg, #2ecc71, #27ae60)',     // Green
      'linear-gradient(90deg, #9b59b6, #8e44ad)',     // Purple
      'linear-gradient(90deg, #e74c3c, #c0392b)',     // Red
      'linear-gradient(90deg, #f39c12, #d35400)',     // Orange
      'linear-gradient(90deg, #1abc9c, #16a085)',     // Turquoise
      'linear-gradient(90deg, #34495e, #2c3e50)',     // Dark Blue
      'linear-gradient(90deg, #e67e22, #d35400)'      // Dark Orange
    ];
    
    return (
      <div className="chart-container" style={{ marginTop: '1rem' }}>
        <div className="chart-bar-group">
          {doctorData.map((doctor, index) => (
            <div key={index} className="chart-bar-item">
              <div className="chart-bar-label" style={{ width: '150px', textAlign: 'left' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '500' }}>{doctor.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#7f8c8d' }}>Rank #{index + 1}</div>
              </div>
              <div className="chart-bar-container">
                <div 
                  className="chart-bar" 
                  style={{ 
                    width: maxRevenue > 0 ? `${(doctor.revenue / maxRevenue) * 100}%` : '0%',
                    background: doctorColors[index % doctorColors.length]
                  }}
                >
                  <span className="chart-bar-value" style={{ fontSize: '0.75rem' }}>
                    {formatCurrency(doctor.revenue)}
                  </span>
                </div>
              </div>
              <div className="chart-bar-percentage" style={{ width: '80px', textAlign: 'right', fontSize: '0.8rem' }}>
                {formatCurrency(doctor.revenue)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Process revenue data for doctor rankings
  const getDoctorRankings = () => {
    let manilaDoctors = [];
    let cdoDoctors = [];

    if (revenueData && revenueData.clinics) {
      console.log('Processing revenue data:', revenueData); // Debug log
      
      // Manila doctors
      if (revenueData.clinics.MNL && revenueData.clinics.MNL.doctors) {
        revenueData.clinics.MNL.doctors.forEach(doc => {
          const doctorTotal = doc.dailyRevenue.reduce((sum, record) => {
            let revenue = record.revenue;
            if (typeof revenue === 'string') {
              revenue = parseFloat(revenue.replace(/[^0-9.-]+/g, ""));
            }
            return sum + (revenue || 0);
          }, 0);
          
          manilaDoctors.push({
            name: doc.doctorName,
            revenue: doctorTotal
          });
        });
        
        // Sort Manila doctors by revenue (highest to lowest)
        manilaDoctors.sort((a, b) => b.revenue - a.revenue);
      }

      // CDO doctors
      if (revenueData.clinics.CDO && revenueData.clinics.CDO.doctors) {
        revenueData.clinics.CDO.doctors.forEach(doc => {
          const doctorTotal = doc.dailyRevenue.reduce((sum, record) => {
            let revenue = record.revenue;
            if (typeof revenue === 'string') {
              revenue = parseFloat(revenue.replace(/[^0-9.-]+/g, ""));
            }
            return sum + (revenue || 0);
          }, 0);
          
          cdoDoctors.push({
            name: doc.doctorName,
            revenue: doctorTotal
          });
        });
        
        // Sort CDO doctors by revenue (highest to lowest)
        cdoDoctors.sort((a, b) => b.revenue - a.revenue);
      }
    }

    return {
      manilaDoctors: manilaDoctors.slice(0, 5), // Top 5 only
      cdoDoctors: cdoDoctors.slice(0, 5) // Top 5 only
    };
  };

  const { manilaDoctors, cdoDoctors } = getDoctorRankings();

  return (
    <div className="statistics-dashboard">
      {/* Both Clinics Overview */}
      <div className="stats-section combined-stats">
        <div className="graph-header">
          <h3 className="section-title" style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>
            Dashboard Overview
          </h3>
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
              <h4 className="graph-title">Revenue by Clinic</h4>
              <p className="graph-description">Total revenue distribution between clinics</p>
            </div>
            <RevenueComparisonChart />
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
          
          {/* Clinic Cards - ONLY ACTIVE AND INACTIVE (2 cards) */}
          <div className="clinic-cards" style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div className="clinic-card">
              <div className="card-number">{individualStats.MNL.totalActive}</div>
              <div className="card-label">Active Staff</div>
            </div>
            <div className="clinic-card">
              <div className="card-number">{individualStats.MNL.inactive}</div>
              <div className="card-label">Inactive Staff</div>
            </div>
          </div>
          
          {/* Doctor Revenue Ranking for Manila */}
          <div style={{ 
            marginTop: '1rem',
            padding: '1rem',
            background: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <h4 style={{ 
              fontSize: '1rem', 
              fontWeight: '600', 
              color: '#2c3e50', 
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3498db" strokeWidth="2">
                <path d="M12 20v-6M6 20V10M18 20V4"></path>
              </svg>
              Top Doctors by Revenue
            </h4>
            <DoctorRankingChart clinicId="MNL" doctorData={manilaDoctors} />
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
          
          {/* Clinic Cards - ONLY ACTIVE AND INACTIVE (2 cards) */}
          <div className="clinic-cards" style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div className="clinic-card">
              <div className="card-number">{individualStats.CDO.totalActive}</div>
              <div className="card-label">Active Staff</div>
            </div>
            <div className="clinic-card">
              <div className="card-number">{individualStats.CDO.inactive}</div>
              <div className="card-label">Inactive Staff</div>
            </div>
          </div>
          
          {/* Doctor Revenue Ranking for CDO */}
          <div style={{ 
            marginTop: '1rem',
            padding: '1rem',
            background: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <h4 style={{ 
              fontSize: '1rem', 
              fontWeight: '600', 
              color: '#2c3e50', 
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9b59b6" strokeWidth="2">
                <path d="M12 20v-6M6 20V10M18 20V4"></path>
              </svg>
              Top Doctors by Revenue
            </h4>
            <DoctorRankingChart clinicId="CDO" doctorData={cdoDoctors} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsDashboard;