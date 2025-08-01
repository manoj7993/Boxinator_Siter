import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalShipments: 0,
    pendingShipments: 0,
    deliveredShipments: 0,
    totalSpent: 0
  });
  const [recentShipments, setRecentShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('boxinator_token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch user statistics
      const statsResponse = await axios.get(`${API_BASE_URL}/shipments/stats`, { headers });
      
      // Fetch recent shipments
      const shipmentsResponse = await axios.get(`${API_BASE_URL}/shipments?limit=5`, { headers });

      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }

      if (shipmentsResponse.data.success) {
        setRecentShipments(shipmentsResponse.data.data.shipments || []);
      }
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'status-badge status-pending';
      case 'in_transit':
      case 'in-transit':
        return 'status-badge status-in-transit';
      case 'delivered':
        return 'status-badge status-delivered';
      case 'cancelled':
        return 'status-badge status-cancelled';
      default:
        return 'status-badge';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <h1>Welcome back, {user.firstName || user.email}!</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="dashboard-grid">
        <div className="card stats-card">
          <div className="stats-number">{stats.totalShipments}</div>
          <div className="stats-label">Total Shipments</div>
        </div>
        
        <div className="card stats-card">
          <div className="stats-number">{stats.pendingShipments}</div>
          <div className="stats-label">Pending Shipments</div>
        </div>
        
        <div className="card stats-card">
          <div className="stats-number">{stats.deliveredShipments}</div>
          <div className="stats-label">Delivered</div>
        </div>
        
        <div className="card stats-card">
          <div className="stats-number">{formatCurrency(stats.totalSpent)}</div>
          <div className="stats-label">Total Spent</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/ship" className="btn" style={{ textDecoration: 'none', textAlign: 'center' }}>
            📦 New Shipment
          </Link>
          <Link to="/shipments" className="btn btn-secondary" style={{ textDecoration: 'none', textAlign: 'center' }}>
            📋 View All Shipments
          </Link>
        </div>
      </div>

      {/* Recent Shipments */}
      <div className="card">
        <h3>Recent Shipments</h3>
        {recentShipments.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Tracking ID</th>
                  <th>Destination</th>
                  <th>Status</th>
                  <th>Cost</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentShipments.map((shipment) => (
                  <tr key={shipment.id}>
                    <td>{shipment.trackingId || shipment.id}</td>
                    <td>
                      {shipment.destinationCountry}
                      {shipment.destinationCity && `, ${shipment.destinationCity}`}
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(shipment.currentStatus)}>
                        {shipment.currentStatus?.replace('_', ' ') || 'Pending'}
                      </span>
                    </td>
                    <td>{formatCurrency(shipment.totalCost)}</td>
                    <td>{formatDate(shipment.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No shipments found. <Link to="/ship">Create your first shipment</Link></p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
