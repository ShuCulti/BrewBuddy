import { useState, useEffect, useCallback } from 'react';
import { api } from './api';
import Sidebar from './SideBar';
import DrinkGrid from './DrinkGrid';
import ShoppingList from './ShoppingList';
import './Dashboard.css';

function Dashboard({ user, onLogout }) {
  const [houses, setHouses] = useState([]);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [drinks, setDrinks] = useState([]);
  const [debts, setDebts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadHouses = useCallback(async () => {
    try {
      const data = await api.getHouses();
      setHouses(data);
      if (data.length > 0 && !selectedHouse) {
        setSelectedHouse(data[0]);
      }
    } catch (error) {
      console.error('Failed to load houses:', error);
    }
  }, [selectedHouse]);

  const loadDrinks = useCallback(async () => {
    if (!selectedHouse) return;
    try {
      const data = await api.getDrinks();
      const houseDrinks = data.filter(d => d.house === selectedHouse.id);
      setDrinks(houseDrinks);
    } catch (error) {
      console.error('Failed to load drinks:', error);
    }
  }, [selectedHouse]);

  const loadDebts = useCallback(async () => {
    if (!selectedHouse) return;
    try {
      const data = await api.getHouseDebts(selectedHouse.id);
      setDebts(data);
    } catch (error) {
      console.error('Failed to load debts:', error);
    }
  }, [selectedHouse]);

  useEffect(() => {
    loadHouses();
  }, [loadHouses]);

  useEffect(() => {
    if (selectedHouse) {
      loadDrinks();
      loadDebts();
    }
  }, [selectedHouse, refreshKey, loadDrinks, loadDebts]);

  const handleDrinkClick = async (drink) => {
    try {
      await api.logConsumption({
        drink_type: drink.id,
        house: selectedHouse.id,
        quantity: 1,
      });
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Failed to log consumption:', error);
      alert('Failed to log drink');
    }
  };

  const handleRestock = async (drinkId, quantity) => {
    try {
      await api.restockDrink(drinkId, quantity);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Failed to restock:', error);
      alert('Failed to restock');
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
          ☰
        </button>
        <h1>🍺 Brew Buddy</h1>
        <div className="header-right">
          <span className="user-name">{user.username}</span>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        houses={houses}
        selectedHouse={selectedHouse}
        onSelectHouse={setSelectedHouse}
        debts={debts}
        user={user}
      />

      <main className="dashboard-main">
        {selectedHouse ? (
          <>
            <div className="house-info">
              <h2>{selectedHouse.name}</h2>
              <p>{selectedHouse.members.length} members</p>
            </div>

            <DrinkGrid 
              drinks={drinks}
              onDrinkClick={handleDrinkClick}
              onRestock={handleRestock}
            />

            <ShoppingList houseId={selectedHouse.id} refreshKey={refreshKey} />
          </>
        ) : (
          <div className="no-house">
            <p>No houses found. Create one to get started!</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;