import { useState, useEffect } from 'react';
import { shipmentAPI, settingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Shipment.css';

const CreateShipment = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    senderName: '',
    senderEmail: '',
    senderPhone: '',
    senderAddress: '',
    receiverName: '',
    receiverEmail: '',
    receiverPhone: '',
    receiverAddress: '',
    receiverPostalCode: '',
    receiverCity: '',
    receiverCountry: '',
    boxType: '',
    weight: '',
    dimensions: {
      length: '',
      width: '',
      height: ''
    }
  });
  const [countries, setCountries] = useState([]);
  const [boxTypes, setBoxTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countriesRes, boxTypesRes] = await Promise.all([
          settingsAPI.getCountries(),
          settingsAPI.getBoxTypes()
        ]);
        setCountries(countriesRes.data);
        setBoxTypes(boxTypesRes.data);
      } catch (error) {
        setError('Failed to load form data');
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        senderName: `${user.firstName} ${user.lastName}`,
        senderEmail: user.email
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('dimensions.')) {
      const dimension = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        dimensions: {
          ...prev.dimensions,
          [dimension]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const shipmentData = {
        ...formData,
        dimensions: JSON.stringify(formData.dimensions)
      };
      
      const response = await shipmentAPI.createShipment(shipmentData);
      setSuccess(`Shipment created successfully! Tracking ID: ${response.data.trackingNumber}`);
      
      // Reset form
      setFormData({
        senderName: user ? `${user.firstName} ${user.lastName}` : '',
        senderEmail: user ? user.email : '',
        senderPhone: '',
        senderAddress: '',
        receiverName: '',
        receiverEmail: '',
        receiverPhone: '',
        receiverAddress: '',
        receiverPostalCode: '',
        receiverCity: '',
        receiverCountry: '',
        boxType: '',
        weight: '',
        dimensions: {
          length: '',
          width: '',
          height: ''
        }
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create shipment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shipment-container">
      <div className="shipment-form">
        <h2>Create New Shipment</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Sender Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="senderName">Name</label>
                <input
                  type="text"
                  id="senderName"
                  name="senderName"
                  value={formData.senderName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="senderEmail">Email</label>
                <input
                  type="email"
                  id="senderEmail"
                  name="senderEmail"
                  value={formData.senderEmail}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="senderPhone">Phone</label>
                <input
                  type="tel"
                  id="senderPhone"
                  name="senderPhone"
                  value={formData.senderPhone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="senderAddress">Address</label>
                <input
                  type="text"
                  id="senderAddress"
                  name="senderAddress"
                  value={formData.senderAddress}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Receiver Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="receiverName">Name</label>
                <input
                  type="text"
                  id="receiverName"
                  name="receiverName"
                  value={formData.receiverName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="receiverEmail">Email</label>
                <input
                  type="email"
                  id="receiverEmail"
                  name="receiverEmail"
                  value={formData.receiverEmail}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="receiverPhone">Phone</label>
                <input
                  type="tel"
                  id="receiverPhone"
                  name="receiverPhone"
                  value={formData.receiverPhone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="receiverAddress">Address</label>
                <input
                  type="text"
                  id="receiverAddress"
                  name="receiverAddress"
                  value={formData.receiverAddress}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="receiverPostalCode">Postal Code</label>
                <input
                  type="text"
                  id="receiverPostalCode"
                  name="receiverPostalCode"
                  value={formData.receiverPostalCode}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="receiverCity">City</label>
                <input
                  type="text"
                  id="receiverCity"
                  name="receiverCity"
                  value={formData.receiverCity}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="receiverCountry">Country</label>
              <select
                id="receiverCountry"
                name="receiverCountry"
                value={formData.receiverCountry}
                onChange={handleChange}
                required
              >
                <option value="">Select Country</option>
                {countries.map(country => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-section">
            <h3>Package Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="boxType">Box Type</label>
                <select
                  id="boxType"
                  name="boxType"
                  value={formData.boxType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Box Type</option>
                  {boxTypes.map(boxType => (
                    <option key={boxType.id} value={boxType.id}>
                      {boxType.name} - {boxType.description}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="weight">Weight (kg)</label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  step="0.1"
                  min="0.1"
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dimensions.length">Length (cm)</label>
                <input
                  type="number"
                  id="dimensions.length"
                  name="dimensions.length"
                  value={formData.dimensions.length}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="dimensions.width">Width (cm)</label>
                <input
                  type="number"
                  id="dimensions.width"
                  name="dimensions.width"
                  value={formData.dimensions.width}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="dimensions.height">Height (cm)</label>
                <input
                  type="number"
                  id="dimensions.height"
                  name="dimensions.height"
                  value={formData.dimensions.height}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Creating Shipment...' : 'Create Shipment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateShipment;
