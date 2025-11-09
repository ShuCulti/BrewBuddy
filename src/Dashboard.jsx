import { useState, useEffect, useCallback } from 'react';
import { api } from './api';
import Sidebar from './SideBar';
import DrinkGrid from './DrinkGrid';
import ShoppingList from './ShoppingList';
import HouseManager from './HouseManager';
import DrinkManager from './DrinkManager';
import MemberInvite from './MemberInvite';
import ConsumptionHistory from './ConsumptionHistory';
import './Dashboard.css';

function Dashboard({ user, onLogout }) {
  const [houses, setHouses] = useState([]);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [drinks, setDrinks] = useState([]);
  const [debts, setDebts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showHouseManager, setShowHouseManager] = useState(false);
  const [showDrinkManager, setShowDrinkManager] = useState(false);
  const [showMemberInvite, setShowMemberInvite] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const loadHouses = useCallback(async () => {
    try {
      const data = await api.getHouses();
      setHouses(data);

      // Auto-select first house only on initial load
      if (data.length > 0 && !selectedHouse) {
        setSelectedHouse(data[0]);
      }
    } catch (error) {
      console.error('Failed to load houses:', error);
    }
  }, []); // Remove selectedHouse dependency to prevent infinite loop

  const loadDrinks = useCallback(async () => {
    if (!selectedHouse) return;
    try {
      const data = await api.getDrinks();
      const houseDrinks = data.filter(d => d.house === selectedHouse.id);
      setDrinks(houseDrinks || []);
    } catch (error) {
      console.error('Failed to load drinks:', error);
      setDrinks([]); // Set empty array on error
    }
  }, [selectedHouse]);

  const loadDebts = useCallback(async () => {
    if (!selectedHouse) return;
    try {
      const data = await api.getHouseDebts(selectedHouse.id);
      setDebts(data || []);
    } catch (error) {
      console.error('Failed to load debts:', error);
      setDebts([]); // Set empty array on error
    }
  }, [selectedHouse]);

  useEffect(() => {
    loadHouses();
  }, []); // Only run once on mount

  useEffect(() => {
    if (selectedHouse) {
      loadDrinks();
      loadDebts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHouse, refreshKey]); // Only depend on selectedHouse and refreshKey, NOT the functions

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

  const handleHouseCreated = async () => {
    setShowHouseManager(false);
    // Reload houses and select the first one
    try {
      const data = await api.getHouses();
      setHouses(data);
      if (data.length > 0) {
        setSelectedHouse(data[data.length - 1]); // Select the newest house
      }
    } catch (error) {
      console.error('Failed to reload houses:', error);
    }
  };

  const handleDrinkAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleMembersUpdated = () => {
    loadHouses();
    setRefreshKey(prev => prev + 1);
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
              <div className="house-info-text">
                <h2>{selectedHouse.name}</h2>
                <p>{selectedHouse.members?.length || 0} / 4 members</p>
              </div>
              <div className="house-actions">
                <button
                  className="action-btn"
                  onClick={() => setShowDrinkManager(true)}
                  title="Manage Drinks"
                >
                  ➕ Drinks
                </button>
                <button
                  className="action-btn"
                  onClick={() => setShowMemberInvite(true)}
                  title="Manage Members"
                >
                  👥 Members
                </button>
                <button
                  className="action-btn"
                  onClick={() => setShowHistory(true)}
                  title="View History"
                >
                  📊 History
                </button>
              </div>
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
            <button
              className="create-house-btn"
              onClick={() => setShowHouseManager(true)}
            >
              Create Your First House
            </button>
          </div>
        )}
      </main>

      {showHouseManager && (
        <HouseManager
          houses={houses}
          onHouseCreated={handleHouseCreated}
          onClose={() => setShowHouseManager(false)}
        />
      )}

      {showDrinkManager && selectedHouse && (
        <DrinkManager
          houseId={selectedHouse.id}
          onDrinkAdded={handleDrinkAdded}
          onClose={() => setShowDrinkManager(false)}
        />
      )}

      {showMemberInvite && selectedHouse && (
        <MemberInvite
          house={selectedHouse}
          onMembersUpdated={handleMembersUpdated}
          onClose={() => setShowMemberInvite(false)}
        />
      )}

      {showHistory && selectedHouse && (
        <ConsumptionHistory
          houseId={selectedHouse.id}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}

export default Dashboard;