import { useState } from 'react';
import { api } from './api';
import './HouseManager.css';

function HouseManager({ houses, onHouseCreated, onClose }) {
  const [houseName, setHouseName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateHouse = async (e) => {
    e.preventDefault();
    if (!houseName.trim()) {
      setError('House name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const newHouse = await api.createHouse({ name: houseName });
      setHouseName('');
      onHouseCreated(newHouse);
      alert(`House "${newHouse.name}" created! You can now add drinks and invite members.`);
    } catch (err) {
      setError(err.message || 'Failed to create house');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🏠 Create New House</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleCreateHouse} className="house-form">
          <div className="form-group">
            <label htmlFor="houseName">House Name</label>
            <input
              id="houseName"
              type="text"
              value={houseName}
              onChange={(e) => setHouseName(e.target.value)}
              placeholder="e.g., Student House, Apartment 5B"
              maxLength={100}
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading || !houseName.trim()} className="btn-primary">
              {loading ? 'Creating...' : 'Create House'}
            </button>
          </div>
        </form>

        <div className="help-text">
          <p>💡 After creating a house, you can:</p>
          <ul>
            <li>Add drinks with prices and quantities</li>
            <li>Invite up to 3 more members (max 4 total)</li>
            <li>Track consumption and costs</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default HouseManager;
