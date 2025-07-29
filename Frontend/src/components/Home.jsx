import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Boxinator</h1>
          <p>Your reliable shipping partner for international packages</p>
          <div className="hero-actions">
            {user ? (
              <>
                <Link to="/shipments/create" className="cta-button primary">
                  Create Shipment
                </Link>
                <Link to="/shipments" className="cta-button secondary">
                  My Shipments
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="cta-button primary">
                  Get Started
                </Link>
                <Link to="/shipments/calculate" className="cta-button secondary">
                  Calculate Cost
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="container">
          <h2>Why Choose Boxinator?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📦</div>
              <h3>Secure Packaging</h3>
              <p>Multiple box types to ensure your items are safely delivered</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌍</div>
              <h3>Global Reach</h3>
              <p>Ship to multiple countries with competitive pricing</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Real-time Tracking</h3>
              <p>Track your shipments from pickup to delivery</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Transparent Pricing</h3>
              <p>Calculate costs upfront with no hidden fees</p>
            </div>
          </div>
        </div>
      </div>

      <div className="how-it-works-section">
        <div className="container">
          <h2>How It Works</h2>
          <div className="steps-grid">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Create Shipment</h3>
              <p>Fill in sender and receiver details along with package information</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Calculate Cost</h3>
              <p>Get instant pricing based on destination, weight, and box type</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Track Progress</h3>
              <p>Monitor your shipment status from pickup to delivery</p>
            </div>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <div className="container">
          <h2>Ready to Ship?</h2>
          <p>Join thousands of satisfied customers who trust Boxinator for their shipping needs</p>
          <div className="cta-actions">
            <Link to="/shipments/calculate" className="cta-button primary">
              Calculate Shipping Cost
            </Link>
            {!user && (
              <Link to="/register" className="cta-button secondary">
                Create Account
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
