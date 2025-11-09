import { useState, useEffect } from 'react';
import { api } from './api';
import './MemberInvite.css';

function MemberInvite({ house, onMembersUpdated, onClose }) {
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    searchUsers();
  }, [searchTerm]);

  const searchUsers = async () => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const results = await api.searchUsers(searchTerm);
      setSearchResults(results);
      setError('');
    } catch (err) {
      setError('Failed to search users');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const currentMembers = house.members || [];
  const currentMemberIds = currentMembers.map(m => m.id);
  const canAddMore = currentMemberIds.length < 4;

  const handleInvite = async (userId) => {
    if (!canAddMore) {
      alert('This house already has the maximum of 4 members!');
      return;
    }

    try {
      // Update house with new member
      const updatedMemberIds = [...currentMemberIds, userId];
      await api.updateHouse(house.id, { member_ids: updatedMemberIds });
      onMembersUpdated();
      alert('Member added successfully!');
    } catch (err) {
      alert('Failed to add member: ' + err.message);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (currentMembers.length === 1) {
      alert('Cannot remove the last member!');
      return;
    }

    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      const updatedMemberIds = currentMemberIds.filter(id => id !== userId);
      await api.updateHouse(house.id, { member_ids: updatedMemberIds });
      onMembersUpdated();
    } catch (err) {
      alert('Failed to remove member: ' + err.message);
    }
  };

  const availableUsers = searchResults.filter(user => !currentMemberIds.includes(user.id));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>👥 Manage Members</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="member-capacity">
            <span className="capacity-text">
              {currentMembers.length} / 4 members
            </span>
            {!canAddMore && (
              <span className="capacity-full">Maximum capacity reached</span>
            )}
          </div>

          <div className="current-members-section">
            <h3>Current Members</h3>
            <div className="members-grid">
              {currentMembers.map(member => (
                <div key={member.id} className="member-card">
                  <div className="member-avatar-large">
                    {member.username[0].toUpperCase()}
                  </div>
                  <div className="member-info">
                    <span className="member-name">{member.username}</span>
                    <span className="member-email">{member.email}</span>
                  </div>
                  {currentMembers.length > 1 && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="btn-remove"
                      title="Remove member"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {canAddMore && (
            <div className="invite-section">
              <h3>Add New Members</h3>
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search users by username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              {loading && <div className="loading-message">Searching...</div>}

              {searchTerm.length < 2 && !loading && (
                <p className="search-hint">Type at least 2 characters to search for users</p>
              )}

              {searchTerm.length >= 2 && !loading && availableUsers.length === 0 && (
                <p className="no-results">No users found</p>
              )}

              {availableUsers.length > 0 && (
                <div className="search-results">
                  {availableUsers.map(user => (
                    <div key={user.id} className="user-result">
                      <div className="user-avatar">
                        {user.username[0].toUpperCase()}
                      </div>
                      <div className="user-info">
                        <span className="user-name">{user.username}</span>
                        <span className="user-email">{user.email}</span>
                      </div>
                      <button
                        onClick={() => handleInvite(user.id)}
                        className="btn-invite"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MemberInvite;
