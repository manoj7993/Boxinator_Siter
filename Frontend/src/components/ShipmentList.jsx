import { useState, useEffect } from 'react';
import { shipmentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Shipment.css';

const ShipmentList = () => {
  const { user, isAdmin } = useAuth();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const response = await shipmentAPI.getShipments();
        setShipments(response.data);
      } catch (error) {
        setError('Failed to fetch shipments');
      } finally {
        setLoading(false);
      }
    };

    fetchShipments();
  }, []);

  const handleStatusUpdate = async (shipmentId, newStatus) => {
    try {
      await shipmentAPI.updateShipmentStatus(shipmentId, newStatus);
      setShipments(shipments.map(shipment => 
        shipment.id === shipmentId 
          ? { ...shipment, status: newStatus }
          : shipment
      ));
    } catch (error) {
      setError('Failed to update shipment status');
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

  if (loading) return <div className="loading">Loading shipments...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="shipment-list-container">
      <h2>My Shipments</h2>
      
      {shipments.length === 0 ? (
        <div className="no-shipments">
          <p>No shipments found.</p>
        </div>
      ) : (
        <div className="shipments-grid">
          {shipments.map(shipment => (
            <div key={shipment.id} className="shipment-card">
              <div className="shipment-header">
                <h3>#{shipment.trackingNumber}</h3>
                <span 
                  className="status-badge" 
                  style={{ backgroundColor: getStatusColor(shipment.status) }}
                >
                  {shipment.status}
                </span>
              </div>
              
              <div className="shipment-details">
                <div className="detail-row">
                  <span>From:</span>
                  <span>{shipment.senderName}</span>
                </div>
                <div className="detail-row">
                  <span>To:</span>
                  <span>{shipment.receiverName}</span>
                </div>
                <div className="detail-row">
                  <span>Destination:</span>
                  <span>{shipment.receiverCity}, {shipment.receiverCountry}</span>
                </div>
                <div className="detail-row">
                  <span>Weight:</span>
                  <span>{shipment.weight} kg</span>
                </div>
                <div className="detail-row">
                  <span>Cost:</span>
                  <span>${shipment.totalCost}</span>
                </div>
                <div className="detail-row">
                  <span>Created:</span>
                  <span>{new Date(shipment.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              {(isAdmin() || shipment.status === 'PENDING') && (
                <div className="shipment-actions">
                  {shipment.status === 'PENDING' && (
                    <button 
                      onClick={() => handleStatusUpdate(shipment.id, 'CANCELLED')}
                      className="btn-cancel"
                    >
                      Cancel
                    </button>
                  )}
                  {isAdmin() && (
                    <select 
                      value={shipment.status}
                      onChange={(e) => handleStatusUpdate(shipment.id, e.target.value)}
                      className="status-select"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="IN_TRANSIT">In Transit</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShipmentList;
