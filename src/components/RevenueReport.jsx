// src/components/RevenueReport.jsx
import React from 'react';


const RevenueReport = ({ data }) => {
  if (!data || !data.clinics) return null;


  // Prepare CSV download
  const downloadCSV = () => {
    let csv = 'Clinic,Doctor,Date,Revenue,Appointments\n';


    Object.values(data.clinics).forEach(clinic => {
      clinic.doctors.forEach(doc => {
        doc.dailyRevenue.forEach(record => {
          csv += `${clinic.clinicId},${doc.doctorName},${record.date},${record.revenue},${record.appointmentCount}\n`;
        });
      });
    });


    // Add total row
    csv += `Total,,,"${data.totals.overallRevenue}","${data.totals.totalAppointments}"\n`;


    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'RevenueReport.csv';
    link.click();
  };


  return (
    <div className="report-container">
      <h2>ABC Clinics Revenue Report</h2>
      <p>
        This document summarizes revenue from {data.dateRange.startDate} to {data.dateRange.endDate}.
      </p>


      {Object.values(data.clinics).map(clinic => (
        <div key={clinic.clinicId} className="clinic-table">
          <h3>Clinic {clinic.clinicId}</h3>
          <table>
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Date</th>
                <th>Revenue</th>
                <th>Appointments</th>
              </tr>
            </thead>
            <tbody>
              {clinic.doctors.map(doc =>
                doc.dailyRevenue.map((record, i) => (
                  <tr key={`${doc.doctorId}-${i}`}>
                    <td>{doc.doctorName}</td>
                    <td>{record.date}</td>
                    <td>{record.revenue}</td>
                    <td>{record.appointmentCount}</td>
                  </tr>
                ))
              )}
              <tr className="clinic-total">
                <td colSpan="2">Total</td>
                <td>{clinic.totalRevenue}</td>
                <td>{clinic.totalAppointments}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}


      <div className="overall-total">
        <h3>All Clinics Total</h3>
        <table>
          <thead>
            <tr>
              <th>Total Revenue</th>
              <th>Total Appointments</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{data.totals.overallRevenue}</td>
              <td>{data.totals.totalAppointments}</td>
            </tr>
          </tbody>
        </table>
      </div>


      <button onClick={downloadCSV} className="download-btn">
        Download CSV
      </button>
    </div>
  );
};


export default RevenueReport;