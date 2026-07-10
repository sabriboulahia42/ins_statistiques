import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import '../../styles/AdminPanels.css';

export default function UsersPanel() {
  const API_BASE_URL = window.APP_CONFIG?.backendUrl || import.meta.env.VITE_API_URL || 'https://ins-statistiques-api.onrender.com';
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, [token]);

  const loadUsers = async () => {
    if (!token) {
      setUsers([]);
      setLoading(false);
      setError('');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/auth/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to load users');
      
      const data = await res.json();
      setUsers(data.data || []);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to delete user');
      
      setUsers(users.filter(u => u.id !== userId));
      setSelectedUser(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateUser = async (userId, updates) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!res.ok) throw new Error('Failed to update user');
      
      const updatedUser = await res.json();
      setUsers(users.map(u => u.id === userId ? updatedUser.data : u));
      setEditingUser(null);
      setSelectedUser(null);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="panel-loading">Loading users...</div>;

  return (
    <div className="admin-panel users-panel">
      <div className="panel-header">
        <h2>👥 User Management</h2>
        <div className="panel-stats">
          Total: {users.length} | Admins: {users.filter(u => u.role === 'admin').length}
        </div>
      </div>

      {error && <div className="error-alert">{error}</div>}

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Provider</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className={selectedUser?.id === user.id ? 'selected' : ''}>
                <td className="user-name">{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge role-${user.role}`}>
                    {user.role}
                  </span>
                </td>
                <td>{user.provider}</td>
                <td>
                  <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="text-muted">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                </td>
                <td className="actions">
                  <button 
                    className="btn-small btn-edit"
                    onClick={() => {
                      setSelectedUser(user);
                      setEditingUser(user);
                    }}
                  >
                    ✏️
                  </button>
                  <button 
                    className="btn-small btn-delete"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && editingUser && (
        <UserEditModal 
          user={editingUser}
          onSave={(updates) => handleUpdateUser(selectedUser.id, updates)}
          onCancel={() => {
            setEditingUser(null);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}

function UserEditModal({ user, onSave, onCancel }) {
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState(user.role);
  const [isActive, setIsActive] = useState(user.isActive);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name, role, isActive });
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>Edit User</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input 
              value={name} 
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Role</label>
            <select value={role} onChange={e => setRole(e.target.value)}>
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="form-group checkbox">
            <label>
              <input 
                type="checkbox"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
              />
              Active
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
