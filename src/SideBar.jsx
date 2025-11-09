import './Sidebar.css';

function Sidebar({ isOpen, onClose, houses, selectedHouse, onSelectHouse, debts, user }) {
  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Houses</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="house-selector">
          {houses.map(house => (
            <button
              key={house.id}
              className={`house-option ${selectedHouse?.id === house.id ? 'active' : ''}`}
              onClick={() => {
                onSelectHouse(house);
                onClose();
              }}
            >
              {house.name}
            </button>
          ))}
        </div>

        {selectedHouse && (
          <>
            <div className="sidebar-section">
              <h3>Member Debts</h3>
              <div className="debts-list">
                {(debts || []).map(debt => {
                  const totalOwed = Number(debt.total_owed ?? 0);
                  const breakdown = debt.drink_breakdown || [];
                  return (
                    <div key={debt.user_id} className="debt-item">
                      <div className="debt-header">
                        <span className={`debt-name ${debt.user_id === user.id ? 'current-user' : ''}`}>
                          {debt.user_name}
                          {debt.user_id === user.id && ' (You)'}
                        </span>
                        <span className="debt-amount">€{totalOwed.toFixed(2)}</span>
                      </div>
                      {breakdown.length > 0 && (
                        <div className="drink-breakdown">
                          {breakdown.map((item, idx) => {
                            const totalCost = Number(item.total_cost ?? 0);
                            return (
                              <div key={idx} className="breakdown-item">
                                <span>{item.drink_type__name}</span>
                                <span>{item.quantity}× (€{totalCost.toFixed(2)})</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="sidebar-section">
              <h3>Members</h3>
              <div className="members-list">
                {(selectedHouse.members || []).map(member => (
                  <div key={member.id} className="member-item">
                    <span className="member-avatar">{member.username[0].toUpperCase()}</span>
                    <span className="member-name">
                      {member.username}
                      {member.id === user.id && ' (You)'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Sidebar;
