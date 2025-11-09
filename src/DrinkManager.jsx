import { useState, useEffect } from 'react';
import { api } from './api';
import './DrinkManager.css';

function DrinkManager({ houseId, onDrinkAdded, onClose }) {
  const [drinks, setDrinks] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    price_per_unit: '',
    current_stock: '',
    low_stock_threshold: '6',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadDrinks();
  }, [houseId]);

  const loadDrinks = async () => {
    try {
      const allDrinks = await api.getDrinks();
      const houseDrinks = allDrinks.filter(d => d.house === houseId);
      setDrinks(houseDrinks);
    } catch (err) {
      console.error('Failed to load drinks:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const drinkData = {
        ...formData,
        house: houseId,
        price_per_unit: parseFloat(formData.price_per_unit),
        current_stock: parseInt(formData.current_stock),
        low_stock_threshold: parseInt(formData.low_stock_threshold),
      };

      if (editingId) {
        await api.updateDrink(editingId, drinkData);
      } else {
        await api.createDrink(drinkData);
      }

      setFormData({
        name: '',
        price_per_unit: '',
        current_stock: '',
        low_stock_threshold: '6',
      });
      setEditingId(null);
      loadDrinks();
      onDrinkAdded();
    } catch (err) {
      setError(err.message || 'Failed to save drink');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (drink) => {
    setFormData({
      name: drink.name,
      price_per_unit: drink.price_per_unit.toString(),
      current_stock: drink.current_stock.toString(),
      low_stock_threshold: drink.low_stock_threshold.toString(),
    });
    setEditingId(drink.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (drinkId) => {
    if (!confirm('Are you sure you want to delete this drink?')) return;

    try {
      await api.deleteDrink(drinkId);
      loadDrinks();
      onDrinkAdded();
    } catch (err) {
      alert('Failed to delete drink: ' + err.message);
    }
  };

  const cancelEdit = () => {
    setFormData({
      name: '',
      price_per_unit: '',
      current_stock: '',
      low_stock_threshold: '6',
    });
    setEditingId(null);
    setError('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🍺 Manage Drinks</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit} className="drink-form">
            <h3>{editingId ? 'Edit Drink' : 'Add New Drink'}</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Drink Name *</label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Heineken, Coca-Cola"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="price">Price per Unit (€) *</label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price_per_unit}
                  onChange={(e) => setFormData({ ...formData, price_per_unit: e.target.value })}
                  placeholder="2.50"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="stock">Initial Stock *</label>
                <input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.current_stock}
                  onChange={(e) => setFormData({ ...formData, current_stock: e.target.value })}
                  placeholder="24"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="threshold">Low Stock Alert</label>
                <input
                  id="threshold"
                  type="number"
                  min="0"
                  value={formData.low_stock_threshold}
                  onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
                  placeholder="6"
                  disabled={loading}
                />
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-actions">
              {editingId && (
                <button type="button" onClick={cancelEdit} className="btn-secondary">
                  Cancel Edit
                </button>
              )}
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Saving...' : editingId ? 'Update Drink' : 'Add Drink'}
              </button>
            </div>
          </form>

          <div className="drinks-list">
            <h3>Current Drinks</h3>
            {drinks.length === 0 ? (
              <div className="no-drinks">
                <p>No drinks added yet. Add your first drink above!</p>
              </div>
            ) : (
              <div className="drink-items">
                {drinks.map(drink => (
                  <div key={drink.id} className="drink-item">
                    <div className="drink-item-info">
                      <h4>{drink.name}</h4>
                      <div className="drink-item-details">
                        <span>€{drink.price_per_unit}</span>
                        <span>•</span>
                        <span>Stock: {drink.current_stock}</span>
                        <span>•</span>
                        <span>Alert at: {drink.low_stock_threshold}</span>
                      </div>
                    </div>
                    <div className="drink-item-actions">
                      <button
                        onClick={() => handleEdit(drink)}
                        className="btn-edit"
                        title="Edit drink"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(drink.id)}
                        className="btn-delete"
                        title="Delete drink"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DrinkManager;
