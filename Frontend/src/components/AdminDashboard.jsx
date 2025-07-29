import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import './Admin.css';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardRes, shipmentsRes, usersRes] = await Promise.all([
          adminAPI.getDashboard(),
          adminAPI.getAllShipments(),
          adminAPI.getAllUsers()
        ]);
        
        setDashboardData(dashboardRes.data.dashboard);
        setShipments(shipmentsRes.data.shipments || shipmentsRes.data);
        setUsers(usersRes.data.users || usersRes.data);
      } catch (error) {
        setError('Failed to fetch admin data');
        console.error('Admin data fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleShipmentStatusUpdate = async (shipmentId, newStatus) => {
    try {
      await adminAPI.updateShipmentStatus(shipmentId, newStatus);
      setShipments(shipments.map(shipment =>
        shipment.id === shipmentId
          ? { ...shipment, status: newStatus }
          : shipment
      ));
    } catch (error) {
      setError('Failed to update shipment status');
    }
  };

  const handleUserRoleUpdate = async (userId, newRole) => {
    try {
      await adminAPI.updateUserRole(userId, newRole);
      setUsers(users.map(user =>
        user.id === userId
          ? { ...user, role: newRole }
          : user
      ));
    } catch (error) {
      setError('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminAPI.deleteUser(userId);
        setUsers(users.filter(user => user.id !== userId));
      } catch (error) {
        setError('Failed to delete user');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return '#f39c12';
      case 'IN_TRANSIT': return '#3498db';
      case 'DELIVERED': return '#27ae60';
      case 'CANCELLED': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  if (loading) return <div className="loading">Loading admin dashboard...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="admin-container">
      <h1>Admin Dashboard</h1>
      
      <div className="admin-tabs">
        <button 
          className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={`tab-button ${activeTab === 'shipments' ? 'active' : ''}`}
          onClick={() => setActiveTab('shipments')}
        >
          Shipments
        </button>
        <button 
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
      </div>

      {activeTab === 'dashboard' && dashboardData && (
        <div className="dashboard-content">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Shipments</h3>
              <div className="stat-number">{dashboardData.stats?.totalShipments || 0}</div>
            </div>
            <div className="stat-card">
              <h3>Active Users</h3>
              <div className="stat-number">{dashboardData.stats?.totalUsers || 0}</div>
            </div>
            <div className="stat-card">
              <h3>Active Shipments</h3>
              <div className="stat-number">{dashboardData.stats?.activeShipments || 0}</div>
            </div>
            <div className="stat-card">
              <h3>Completed Shipments</h3>
              <div className="stat-number">{dashboardData.stats?.completedShipments || 0}</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'shipments' && (
        <div className="shipments-content">
          <h2>All Shipments</h2>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tracking #</th>
                  <th>Sender</th>
                  <th>Receiver</th>
                  <th>Destination</th>
                  <th>Status</th>
                  <th>Cost</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map(shipment => (
                  <tr key={shipment.id}>
                    <td>{shipment.trackingNumber}</td>
                    <td>{shipment.senderName}</td>
                    <td>{shipment.receiverName}</td>
                    <td>{shipment.receiverCity}, {shipment.receiverCountry}</td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(shipment.status) }}
                      >
                        {shipment.status}
                      </span>
                    </td>
                    <td>${shipment.totalCost}</td>
                    <td>{new Date(shipment.createdAt).toLocaleDateString()}</td>
                    <td>
                      <select
                        value={shipment.status}
                        onChange={(e) => handleShipmentStatusUpdate(shipment.id, e.target.value)}
                        className="status-select"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="IN_TRANSIT">In Transit</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="users-content">
          <h2>All Users</h2>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Verified</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.firstName} {user.lastName}</td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        value={user.role}
                        onChange={(e) => handleUserRoleUpdate(user.id, e.target.value)}
                        className="role-select"
                      >
                        <option value="USER">User</option>
                        <option value="ADMINISTRATOR">Administrator</option>
                      </select>
                    </td>
                    <td>
                      <span className={`verification-badge ${user.emailVerified ? 'verified' : 'unverified'}`}>
                        {user.emailVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
