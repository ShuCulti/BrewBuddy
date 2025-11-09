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
                {debts.map(debt => (
                  <div key={debt.user_id} className="debt-item">
                    <div className="debt-header">
                      <span className={`debt-name ${debt.user_id === user.id ? 'current-user' : ''}`}>
                        {debt.user_name}
                        {debt.user_id === user.id && ' (You)'}
                      </span>
                      <span className="debt-amount">€{debt.total_owed.toFixed(2)}</span>
                    </div>
                    {debt.drink_breakdown.length > 0 && (
                      <div className="drink-breakdown">
                        {debt.drink_breakdown.map((item, idx) => (
                          <div key={idx} className="breakdown-item">
                            <span>{item.drink_type__name}</span>
                            <span>{item.quantity}× (€{item.total_cost.toFixed(2)})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="sidebar-section">
              <h3>Members</h3>
              <div className="members-list">
                {selectedHouse.members.map(member => (
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
