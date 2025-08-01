import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ShipmentForm from './components/ShipmentForm';
import ShipmentList from './components/ShipmentList';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('boxinator_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('boxinator_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('boxinator_user');
    localStorage.removeItem('boxinator_token');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading Boxinator...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Header user={user} onLogout={handleLogout} />
        
        <main className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/register" 
              element={!user ? <Register onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
            />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/ship" 
              element={user ? <ShipmentForm user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/shipments" 
              element={user ? <ShipmentList user={user} /> : <Navigate to="/login" />} 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={user && user.role === 'admin' ? <AdminDashboard user={user} /> : <Navigate to="/dashboard" />} 
            />
            
            {/* Default Route */}
            <Route 
              path="/" 
              element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
