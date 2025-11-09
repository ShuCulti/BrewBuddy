import { useState, useEffect, useCallback } from 'react';
import { api } from './api';
import './ShoppingList.css';

function ShoppingList({ houseId, refreshKey }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadShoppingList = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getShoppingList(houseId);
      setItems(data);
    } catch (error) {
      console.error('Failed to load shopping list:', error);
    } finally {
      setLoading(false);
    }
  }, [houseId]);

  useEffect(() => {
    loadShoppingList();
  }, [houseId, refreshKey, loadShoppingList]);

  if (loading) {
    return <div className="shopping-list loading">Loading shopping list...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="shopping-list">
        <h3>📝 Shopping List</h3>
        <p className="no-items">All stocked up! 🎉</p>
      </div>
    );
  }

  return (
    <div className="shopping-list">
      <h3>📝 Shopping List</h3>
      <div className="shopping-items">
        {items.map(item => {
          const needed = item.low_stock_threshold - item.current_stock + 6;
          return (
            <div key={item.id} className="shopping-item">
              <div className="item-info">
                <span className="item-name">{item.name}</span>
                <span className="item-status">
                  Current: {item.current_stock} | Need: ~{needed}
                </span>
              </div>
              <span className="item-cost">
                €{(item.price_per_unit * needed).toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>
      <div className="shopping-total">
        <strong>Estimated Total:</strong>
        <strong>
          €{items.reduce((sum, item) => {
            const needed = item.low_stock_threshold - item.current_stock + 6;
            return sum + (item.price_per_unit * needed);
          }, 0).toFixed(2)}
        </strong>
      </div>
    </div>
  );
}

export default ShoppingList;