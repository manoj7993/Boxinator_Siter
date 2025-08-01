import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const ShipmentForm = ({ user }) => {
  const [formData, setFormData] = useState({
    receiverName: '',
    weight: '',
    boxTypeId: '',
    destinationCountryId: '',
    destinationCity: '',
    destinationAddress: '',
    destinationZipCode: ''
  });
  const [countries, setCountries] = useState([]);
  const [boxTypes, setBoxTypes] = useState([]);
  const [costEstimate, setCostEstimate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCountries();
    fetchBoxTypes();
  }, []);

  useEffect(() => {
    if (formData.weight && formData.destinationCountryId && formData.boxTypeId) {
      calculateCost();
    }
  }, [formData.weight, formData.destinationCountryId, formData.boxTypeId]);

  const fetchCountries = async () => {
    try {
      const token = localStorage.getItem('boxinator_token');
      const response = await axios.get(`${API_BASE_URL}/settings/countries`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setCountries(response.data.countries);
      }
    } catch (err) {
      console.error('Failed to fetch countries:', err);
    }
  };

  const fetchBoxTypes = async () => {
    try {
      const token = localStorage.getItem('boxinator_token');
      const response = await axios.get(`${API_BASE_URL}/settings/box-types`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setBoxTypes(response.data.boxTypes);
      }
    } catch (err) {
      console.error('Failed to fetch box types:', err);
    }
  };

  const calculateCost = async () => {
    if (!formData.weight || !formData.destinationCountryId || !formData.boxTypeId) return;

    setCalculating(true);
    try {
      const payload = {
        boxTypeId: parseInt(formData.boxTypeId, 10),
        countryId: parseInt(formData.destinationCountryId, 10),
        weight: parseFloat(formData.weight)
      };
      console.log('Payload for cost calculation:', payload);

      const token = localStorage.getItem('boxinator_token');
      const response = await axios.post(`${API_BASE_URL}/shipments/calculate-cost`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setCostEstimate(response.data.data);
      } else {
        console.error('Cost calculation failed:', response.data.message);
        setError(response.data.message || 'Failed to calculate cost');
      }
    } catch (err) {
      console.error('Cost calculation error:', err);
      setError(
        err.response?.data?.message || 'An error occurred while calculating the cost. Please try again.'
      );
    } finally {
      setCalculating(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('boxinator_token');
      const shipmentData = {
        ...formData,
        weight: parseFloat(formData.weight)
      };

      const response = await axios.post(`${API_BASE_URL}/shipments`, shipmentData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setSuccess(`Shipment created successfully! Tracking ID: ${response.data.data.trackingId || response.data.data.id}`);
        
        // Reset form
        setFormData({
          receiverName: '',
          weight: '',
          boxTypeId: '',
          destinationCountryId: '',
          destinationCity: '',
          destinationAddress: '',
          destinationZipCode: ''
        });
        setCostEstimate(null);
      } else {
        setError(response.data.message || 'Failed to create shipment');
      }
    } catch (err) {
      console.error('Shipment creation error:', err);
      setError(
        err.response?.data?.message || 
        'An error occurred while creating the shipment. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  return (
    <div className="form-container fade-in" style={{ maxWidth: '600px' }}>
      <h2>Create New Shipment</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {success && (
        <div className="success-message">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="receiverName">Receiver Name</label>
          <input
            type="text"
            id="receiverName"
            name="receiverName"
            value={formData.receiverName}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="weight">Weight (kg)</label>
          <input
            type="number"
            id="weight"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            min="0.1"
            step="0.1"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="boxTypeId">Box Type</label>
          <select
            id="boxTypeId"
            name="boxTypeId"
            value={formData.boxTypeId}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="">Select a box type</option>
            {boxTypes.map((boxType) => (
              <option key={boxType.id} value={boxType.id}>
                {boxType.name} ({boxType.size}) - ${boxType.base_cost}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="destinationCountryId">Destination Country</label>
          <select
            id="destinationCountryId"
            name="destinationCountryId"
            value={formData.destinationCountryId}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="">Select a country</option>
            {countries.map((country) => (
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="destinationCity">Destination City</label>
          <input
            type="text"
            id="destinationCity"
            name="destinationCity"
            value={formData.destinationCity}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="destinationAddress">Destination Address</label>
          <textarea
            id="destinationAddress"
            name="destinationAddress"
            value={formData.destinationAddress}
            onChange={handleChange}
            rows="3"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="destinationZipCode">Destination Zip Code</label>
          <input
            type="text"
            id="destinationZipCode"
            name="destinationZipCode"
            value={formData.destinationZipCode}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        {/* Cost Estimate */}
        {(calculating || costEstimate) && (
          <div className="card" style={{ margin: '1rem 0', background: '#f8f9fa' }}>
            <h4>Cost Estimate</h4>
            {calculating ? (
              <p>Calculating cost...</p>
            ) : costEstimate ? (
              <div>
                <p><strong>Estimated Cost: {formatCurrency(costEstimate.cost)}</strong></p>
                {costEstimate.breakdown && (
                  <div style={{ fontSize: '0.9em', color: '#666' }}>
                    <p>Base Cost: {formatCurrency(costEstimate.baseCost)}</p>
                    <p>Country Multiplier: {costEstimate.multiplier}x</p>
                    {costEstimate.breakdown.additionalFees > 0 && (
                      <p>Additional Fees: {formatCurrency(costEstimate.breakdown.additionalFees)}</p>
                    )}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        <button 
          type="submit" 
          className="btn"
          disabled={loading || !costEstimate}
        >
          {loading ? 'Creating Shipment...' : `Create Shipment ${costEstimate ? `(${formatCurrency(costEstimate.cost)})` : ''}`}
        </button>
      </form>
    </div>
  );
};

export default ShipmentForm;
