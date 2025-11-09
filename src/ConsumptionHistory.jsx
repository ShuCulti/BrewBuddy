import { useState, useEffect } from 'react';
import { api } from './api';
import './ConsumptionHistory.css';

function ConsumptionHistory({ houseId, onClose }) {
  const [consumptions, setConsumptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'today', 'week', 'month'

  useEffect(() => {
    loadConsumptions();
  }, [houseId]);

  const loadConsumptions = async () => {
    try {
      setLoading(true);
      const recent = await api.getRecentConsumptions();
      // Filter by house
      const houseConsumptions = recent.filter(c => c.house === houseId);
      setConsumptions(houseConsumptions);
    } catch (err) {
      console.error('Failed to load consumptions:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterConsumptions = (consumptions) => {
    const now = new Date();

    switch (filter) {
      case 'today':
        return consumptions.filter(c => {
          const date = new Date(c.timestamp);
          return date.toDateString() === now.toDateString();
        });
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return consumptions.filter(c => new Date(c.timestamp) >= weekAgo);
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return consumptions.filter(c => new Date(c.timestamp) >= monthAgo);
      default:
        return consumptions;
    }
  };

  const filteredConsumptions = filterConsumptions(consumptions);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
  };

  const totalCost = filteredConsumptions.reduce((sum, c) => sum + parseFloat(c.cost), 0);
  const totalQuantity = filteredConsumptions.reduce((sum, c) => sum + c.quantity, 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📊 Consumption History</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="history-filters">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Time
            </button>
            <button
              className={`filter-btn ${filter === 'today' ? 'active' : ''}`}
              onClick={() => setFilter('today')}
            >
              Today
            </button>
            <button
              className={`filter-btn ${filter === 'week' ? 'active' : ''}`}
              onClick={() => setFilter('week')}
            >
              This Week
            </button>
            <button
              className={`filter-btn ${filter === 'month' ? 'active' : ''}`}
              onClick={() => setFilter('month')}
            >
              This Month
            </button>
          </div>

          <div className="history-stats">
            <div className="stat-card">
              <div className="stat-value">{filteredConsumptions.length}</div>
              <div className="stat-label">Total Drinks</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{totalQuantity}</div>
              <div className="stat-label">Total Units</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">€{totalCost.toFixed(2)}</div>
              <div className="stat-label">Total Cost</div>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">Loading history...</div>
          ) : filteredConsumptions.length === 0 ? (
            <div className="empty-state">
              <p>No consumption history for this period</p>
            </div>
          ) : (
            <div className="history-list">
              {filteredConsumptions.map(consumption => (
                <div key={consumption.id} className="history-item">
                  <div className="history-icon">🍺</div>
                  <div className="history-details">
                    <div className="history-main">
                      <span className="history-user">{consumption.user_name}</span>
                      <span className="history-action">took</span>
                      <span className="history-drink">
                        {consumption.quantity}× {consumption.drink_name}
                      </span>
                    </div>
                    <div className="history-meta">
                      <span className="history-time">{formatDate(consumption.timestamp)}</span>
                      <span className="history-cost">€{parseFloat(consumption.cost).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConsumptionHistory;
