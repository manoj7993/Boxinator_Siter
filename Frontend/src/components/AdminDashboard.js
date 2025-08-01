import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const AdminDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Overview data
  const [overviewStats, setOverviewStats] = useState({
    totalUsers: 0,
    totalShipments: 0,
    totalRevenue: 0,
    pendingShipments: 0
  });

  // Users data
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState({});

  // Shipments data
  const [allShipments, setAllShipments] = useState([]);
  const [shipmentFilters, setShipmentFilters] = useState({
    status: '',
    userId: '',
    country: ''
  });

  // Countries data
  const [countries, setCountries] = useState([]);
  const [newCountry, setNewCountry] = useState({
    name: '',
    multiplier: 1.0
  });

  useEffect(() => {
    if (user.role === 'admin') {
      fetchOverviewData();
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'shipments') {
      fetchAllShipments();
    } else if (activeTab === 'countries') {
      fetchCountries();
    }
  }, [activeTab]);

  const fetchOverviewData = async () => {
    try {
      const token = localStorage.getItem('boxinator_token');
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.get(`${API_BASE_URL}/admin/overview`, { headers });
      
      if (response.data.success) {
        setOverviewStats(response.data.data);
      }
    } catch (err) {
      console.error('Overview fetch error:', err);
      setError('Failed to load overview data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('boxinator_token');
      const response = await axios.get(`${API_BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setUsers(response.data.data.users || []);
        setUserStats(response.data.data.stats || {});
      }
    } catch (err) {
      console.error('Users fetch error:', err);
      setError('Failed to load users data');
    }
  };

  const fetchAllShipments = async () => {
    try {
      const token = localStorage.getItem('boxinator_token');
      const params = new URLSearchParams(shipmentFilters);
      
      const response = await axios.get(`${API_BASE_URL}/admin/shipments?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setAllShipments(response.data.data.shipments || []);
      }
    } catch (err) {
      console.error('Admin shipments fetch error:', err);
      setError('Failed to load shipments data');
    }
  };

  const fetchCountries = async () => {
    try {
      const token = localStorage.getItem('boxinator_token');
      const response = await axios.get(`${API_BASE_URL}/settings/countries`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setCountries(response.data.countries || []);
      }
    } catch (err) {
      console.error('Countries fetch error:', err);
      setError('Failed to load countries data');
    }
  };

  const handleUserStatusToggle = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('boxinator_token');
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      await axios.patch(`${API_BASE_URL}/admin/users/${userId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh users list
      fetchUsers();
    } catch (err) {
      console.error('User status update error:', err);
      alert('Failed to update user status');
    }
  };

  const handleShipmentStatusUpdate = async (shipmentId, newStatus) => {
    try {
      const token = localStorage.getItem('boxinator_token');
      
      await axios.patch(`${API_BASE_URL}/admin/shipments/${shipmentId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh shipments list
      fetchAllShipments();
    } catch (err) {
      console.error('Shipment status update error:', err);
      alert('Failed to update shipment status');
    }
  };

  const handleCountryAdd = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('boxinator_token');
      
      await axios.post(`${API_BASE_URL}/admin/countries`, newCountry, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNewCountry({ name: '', multiplier: 1.0 });
      fetchCountries();
    } catch (err) {
      console.error('Country add error:', err);
      alert('Failed to add country');
    }
  };

  const handleCountryUpdate = async (countryId, multiplier) => {
    try {
      const token = localStorage.getItem('boxinator_token');
      
      await axios.patch(`${API_BASE_URL}/admin/countries/${countryId}`,
        { multiplier: parseFloat(multiplier) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      fetchCountries();
    } catch (err) {
      console.error('Country update error:', err);
      alert('Failed to update country');
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
      case 'active':
        return 'status-badge status-delivered';
      case 'inactive':
        return 'status-badge status-cancelled';
      default:
        return 'status-badge';
    }
  };

  if (user.role !== 'admin') {
    return (
      <div className="card">
        <h2>Access Denied</h2>
        <p>You don't have permission to access the admin dashboard.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <h1>Admin Dashboard</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="card">
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
          {['overview', 'users', 'shipments', 'countries'].map((tab) => (
            <button
              key={tab}
              className={`btn ${activeTab === tab ? '' : 'btn-secondary'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div style={{ marginTop: '2rem' }}>
            <div className="dashboard-grid">
              <div className="stats-card">
                <div className="stats-number">{overviewStats.totalUsers}</div>
                <div className="stats-label">Total Users</div>
              </div>
              <div className="stats-card">
                <div className="stats-number">{overviewStats.totalShipments}</div>
                <div className="stats-label">Total Shipments</div>
              </div>
              <div className="stats-card">
                <div className="stats-number">{formatCurrency(overviewStats.totalRevenue)}</div>
                <div className="stats-label">Total Revenue</div>
              </div>
              <div className="stats-card">
                <div className="stats-number">{overviewStats.pendingShipments}</div>
                <div className="stats-label">Pending Shipments</div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div style={{ marginTop: '2rem' }}>
            <h3>User Management</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Shipments</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.firstName} {user.lastName}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={getStatusBadgeClass(user.role)}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={getStatusBadgeClass(user.status || 'active')}>
                          {user.status || 'active'}
                        </span>
                      </td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td>{user.shipmentCount || 0}</td>
                      <td>
                        <button
                          className={`btn ${user.status === 'active' ? 'btn-danger' : 'btn-success'}`}
                          style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                          onClick={() => handleUserStatusToggle(user.id, user.status || 'active')}
                        >
                          {user.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Shipments Tab */}
        {activeTab === 'shipments' && (
          <div style={{ marginTop: '2rem' }}>
            <h3>Shipment Management</h3>
            
            {/* Filters */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <select
                value={shipmentFilters.status}
                onChange={(e) => setShipmentFilters({...shipmentFilters, status: e.target.value})}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              
              <input
                type="text"
                placeholder="User ID"
                value={shipmentFilters.userId}
                onChange={(e) => setShipmentFilters({...shipmentFilters, userId: e.target.value})}
              />
              
              <input
                type="text"
                placeholder="Country"
                value={shipmentFilters.country}
                onChange={(e) => setShipmentFilters({...shipmentFilters, country: e.target.value})}
              />
              
              <button className="btn btn-secondary" onClick={fetchAllShipments}>
                Apply Filters
              </button>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Receiver</th>
                    <th>Destination</th>
                    <th>Weight</th>
                    <th>Status</th>
                    <th>Cost</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allShipments.map((shipment) => (
                    <tr key={shipment.id}>
                      <td>{shipment.trackingId || shipment.id}</td>
                      <td>{shipment.User?.email || shipment.userId}</td>
                      <td>{shipment.receiverName}</td>
                      <td>{shipment.destinationCountry}</td>
                      <td>{shipment.weight} kg</td>
                      <td>
                        <select
                          value={shipment.currentStatus || 'pending'}
                          onChange={(e) => handleShipmentStatusUpdate(shipment.id, e.target.value)}
                          style={{ fontSize: '0.8rem', padding: '0.25rem' }}
                        >
                          <option value="pending">Pending</option>
                          <option value="in_transit">In Transit</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>{formatCurrency(shipment.totalCost)}</td>
                      <td>{formatDate(shipment.createdAt)}</td>
                      <td>
                        <button
                          className="btn btn-danger"
                          style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                          onClick={() => handleShipmentStatusUpdate(shipment.id, 'cancelled')}
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Countries Tab */}
        {activeTab === 'countries' && (
          <div style={{ marginTop: '2rem' }}>
            <h3>Country Management</h3>
            
            {/* Add New Country */}
            <div className="card" style={{ marginBottom: '2rem', background: '#f8f9fa' }}>
              <h4>Add New Country</h4>
              <form onSubmit={handleCountryAdd} style={{ display: 'flex', gap: '1rem', alignItems: 'end' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Country Name</label>
                  <input
                    type="text"
                    value={newCountry.name}
                    onChange={(e) => setNewCountry({...newCountry, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Cost Multiplier</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={newCountry.multiplier}
                    onChange={(e) => setNewCountry({...newCountry, multiplier: e.target.value})}
                    required
                  />
                </div>
                <button type="submit" className="btn">Add Country</button>
              </form>
            </div>

            {/* Countries List */}
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Country Name</th>
                    <th>Cost Multiplier</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {countries.map((country) => (
                    <tr key={country.id}>
                      <td>{country.id}</td>
                      <td>{country.name || country.countryName}</td>
                      <td>
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          defaultValue={country.multiplier || country.costMultiplier}
                          onBlur={(e) => handleCountryUpdate(country.id, e.target.value)}
                          style={{ width: '80px' }}
                        />
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary"
                          style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                          onClick={() => handleCountryUpdate(country.id, country.multiplier || country.costMultiplier)}
                        >
                          Update
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
    </div>
  );
};

export default AdminDashboard;
