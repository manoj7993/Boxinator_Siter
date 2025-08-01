import { useState, useEffect } from 'react';
import { shipmentAPI, settingsAPI } from '../services/api';
import './Shipment.css';

const CostCalculator = () => {
  const [formData, setFormData] = useState({
    receiverCountry: '',
    boxType: '',
    weight: ''
  });
  const [countries, setCountries] = useState([]);
  const [boxTypes, setBoxTypes] = useState([]);
  const [cost, setCost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setCost(null); // Reset cost when form changes
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await shipmentAPI.calculateCost(formData);
      setCost(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to calculate cost');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="calculator-container">
      <div className="calculator-form">
        <h2>Calculate Shipping Cost</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleCalculate}>
          <div className="form-group">
            <label htmlFor="receiverCountry">Destination Country</label>
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
          
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Calculating...' : 'Calculate Cost'}
          </button>
        </form>
        
        {cost && (
          <div className="cost-result">
            <h3>Shipping Cost Breakdown</h3>
            <div className="cost-details">
              <div className="cost-item">
                <span>Base Cost:</span>
                <span>${cost.baseCost}</span>
              </div>
              <div className="cost-item">
                <span>Weight Cost:</span>
                <span>${cost.weightCost}</span>
              </div>
              <div className="cost-item">
                <span>Country Multiplier:</span>
                <span>{cost.countryMultiplier}x</span>
              </div>
              <div className="cost-item total">
                <span>Total Cost:</span>
                <span>${cost.totalCost}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CostCalculator;
