import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const ShipmentList = ({ user }) => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    country: '',
    search: ''
  });

  useEffect(() => {
    fetchShipments();
  }, [currentPage, filters]);

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('boxinator_token');
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...filters
      });

      const response = await axios.get(`${API_BASE_URL}/shipments?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setShipments(response.data.data.shipments || []);
        setTotalPages(response.data.data.pagination?.totalPages || 1);
      } else {
        setError('Failed to fetch shipments');
      }
    } catch (err) {
      console.error('Shipments fetch error:', err);
      setError('Failed to load shipments');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleStatusUpdate = async (shipmentId, newStatus) => {
    try {
      const token = localStorage.getItem('boxinator_token');
      const response = await axios.patch(
        `${API_BASE_URL}/shipments/${shipmentId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Refresh shipments list
        fetchShipments();
      } else {
        alert('Failed to update shipment status');
      }
    } catch (err) {
      console.error('Status update error:', err);
      alert('Failed to update shipment status');
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canUpdateStatus = (currentStatus) => {
    return user.role === 'admin' || currentStatus === 'pending';
  };

  if (loading && shipments.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading shipments...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <h1>My Shipments</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>Filter Shipments</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label htmlFor="search">Search (Tracking ID, Receiver)</label>
            <input
              type="text"
              id="search"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Enter tracking ID or receiver name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="country">Destination Country</label>
            <input
              type="text"
              id="country"
              name="country"
              value={filters.country}
              onChange={handleFilterChange}
              placeholder="Enter country name"
            />
          </div>
        </div>
      </div>

      {/* Shipments Table */}
      {shipments.length > 0 ? (
        <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Tracking ID</th>
                  <th>Receiver</th>
                  <th>Destination</th>
                  <th>Weight</th>
                  <th>Status</th>
                  <th>Cost</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((shipment) => (
                  <tr key={shipment.id}>
                    <td>
                      <strong>{shipment.trackingId || `#${shipment.id}`}</strong>
                    </td>
                    <td>{shipment.receiverName}</td>
                    <td>
                      <div>
                        <div>{shipment.destinationCountry}</div>
                        <small style={{ color: '#666' }}>
                          {shipment.destinationCity}
                        </small>
                      </div>
                    </td>
                    <td>{shipment.weight} kg</td>
                    <td>
                      <span className={getStatusBadgeClass(shipment.currentStatus)}>
                        {shipment.currentStatus?.replace('_', ' ') || 'Pending'}
                      </span>
                    </td>
                    <td>{formatCurrency(shipment.totalCost)}</td>
                    <td>{formatDate(shipment.createdAt)}</td>
                    <td>
                      {canUpdateStatus(shipment.currentStatus) && (
                        <select
                          value={shipment.currentStatus || 'pending'}
                          onChange={(e) => handleStatusUpdate(shipment.id, e.target.value)}
                          style={{ fontSize: '0.8rem', padding: '0.25rem' }}
                        >
                          <option value="pending">Pending</option>
                          <option value="in_transit">In Transit</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              
              <span style={{ alignSelf: 'center' }}>
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                className="btn btn-secondary"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="card" style={{ textAlign: 'center' }}>
          <h3>No Shipments Found</h3>
          <p>You haven't created any shipments yet, or no shipments match your current filters.</p>
          <a href="/ship" className="btn" style={{ textDecoration: 'none' }}>
            Create Your First Shipment
          </a>
        </div>
      )}
    </div>
  );
};

export default ShipmentList;
