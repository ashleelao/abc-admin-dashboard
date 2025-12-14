import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

// Admin Route Guard - Protects admin dashboard
const ProtectedAdminRoute = ({ children }) => {
  const adminToken = localStorage.getItem('adminToken');
  const adminData = localStorage.getItem('adminData');
  
  // Check if admin is logged in
  if (!adminToken || !adminData) {
    return <Navigate to="/admin/login" replace />;
  }
  
  try {
    const admin = JSON.parse(adminData);
    
    // Check if user has admin role
    if (!admin.role || (!admin.role.includes('Admin') && admin.role !== 'SuperAdmin')) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      return <Navigate to="/admin/login" replace />;
    }
    
    return children;
  } catch (err) {
    // Clear invalid data
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    return <Navigate to="/admin/login" replace />;
  }
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Protected Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            } 
          />
          
          {/* Redirects */}
          <Route path="/" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          
          {/* Catch-all route for 404 */}
          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;