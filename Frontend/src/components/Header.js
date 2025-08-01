import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ user, onLogout }) => {
  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          📦 Boxinator
        </Link>
        
        {user ? (
          <nav className="nav-links">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/ship">New Shipment</Link>
            <Link to="/shipments">My Shipments</Link>
            {user.role === 'admin' && (
              <Link to="/admin">Admin</Link>
            )}
            
            <div className="user-info">
              <span>Welcome, {user.firstName || user.email}</span>
              <button 
                className="logout-btn" 
                onClick={onLogout}
              >
                Logout
              </button>
            </div>
          </nav>
        ) : (
          <nav className="nav-links">
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
