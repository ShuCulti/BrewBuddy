import { useState } from 'react';
import './DrinkGrid.css';

function DrinkGrid({ drinks, onDrinkClick, onRestock }) {
  const [restockMode, setRestockMode] = useState(false);
  const [restockQuantity, setRestockQuantity] = useState({});

  const handleRestockClick = (drinkId) => {
    const quantity = parseInt(restockQuantity[drinkId] || 6);
    if (quantity > 0) {
      onRestock(drinkId, quantity);
      setRestockQuantity({ ...restockQuantity, [drinkId]: '' });
    }
  };

  return (
    <div className="drink-section">
      <div className="section-header">
        <h3>Drinks</h3>
        <button 
          className={`restock-toggle ${restockMode ? 'active' : ''}`}
          onClick={() => setRestockMode(!restockMode)}
        >
          {restockMode ? 'Done Restocking' : 'Restock Mode'}
        </button>
      </div>

      <div className="drink-grid">
        {(drinks || []).map(drink => (
          <div key={drink.id} className={`drink-card ${drink.is_low_stock ? 'low-stock' : ''}`}>
            <div className="drink-icon">🍺</div>
            <h4>{drink.name}</h4>
            <div className="drink-info">
              <span className="stock">Stock: {drink.current_stock}</span>
              <span className="price">€{drink.price_per_unit}</span>
            </div>
            
            {drink.is_low_stock && (
              <div className="low-stock-badge">Low Stock!</div>
            )}

            {!restockMode ? (
              <button 
                className="drink-action-btn consume"
                onClick={() => onDrinkClick(drink)}
                disabled={drink.current_stock === 0}
              >
                {drink.current_stock === 0 ? 'Out of Stock' : 'Take One'}
              </button>
            ) : (
              <div className="restock-controls">
                <input
                  type="number"
                  min="1"
                  placeholder="6"
                  value={restockQuantity[drink.id] || ''}
                  onChange={(e) => setRestockQuantity({
                    ...restockQuantity,
                    [drink.id]: e.target.value
                  })}
                  className="restock-input"
                />
                <button 
                  className="drink-action-btn restock"
                  onClick={() => handleRestockClick(drink.id)}
                >
                  Add
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {(!drinks || drinks.length === 0) && (
        <div className="no-drinks">
          <p>No drinks added yet. Add some drinks to get started!</p>
        </div>
      )}
    </div>
  );
}

export default DrinkGrid;
