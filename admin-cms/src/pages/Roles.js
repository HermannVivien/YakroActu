import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', permissions: [] });

  const availablePermissions = [
    'articles.create', 'articles.edit', 'articles.delete', 'articles.publish',
    'users.view', 'users.edit', 'users.delete',
    'comments.moderate', 'comments.delete',
    'categories.manage', 'tags.manage',
    'media.upload', 'media.delete',
    'settings.manage', 'analytics.view',
    'notifications.send', 'banners.manage'
  ];

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const response = await api.get('/roles');
      setRoles(response.data.data);
    } catch (error) { toast.error('Erreur lors du chargement'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/roles/${editingItem.id}`, formData);
        toast.success('Rôle mis à jour');
      } else {
        await api.post('/roles', formData);
        toast.success('Rôle créé');
      }
      setShowModal(false);
      setFormData({ name: '', description: '', permissions: [] });
      setEditingItem(null);
      loadData();
    } catch (error) { toast.error('Erreur'); }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ name: item.name, description: item.description || '', permissions: item.permissions || [] });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce rôle?')) return;
    try {
      await api.delete(`/roles/${id}`);
      toast.success('Rôle supprimé');
      loadData();
    } catch (error) { toast.error('Erreur'); }
  };

  const handlePermissionToggle = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>🔐 Rôles et Permissions</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">+ Nouveau Rôle</button>
      </div>
      <div className="card">
        <table className="table">
          <thead><tr><th>Nom</th><th>Description</th><th>Permissions</th><th>Actions</th></tr></thead>
          <tbody>
            {roles.map((item) => (
              <tr key={item.id}>
                <td><strong>{item.name}</strong></td>
                <td>{item.description}</td>
                <td>{item.permissions?.length || 0} permissions</td>
                <td>
                  <button onClick={() => handleEdit(item)} className="btn btn-sm btn-primary">✏️</button>
                  <button onClick={() => handleDelete(item.id)} className="btn btn-sm btn-danger">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" style={{maxWidth: '700px'}} onClick={(e) => e.stopPropagation()}>
            <h2>{editingItem ? 'Modifier' : 'Nouveau'} Rôle</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nom *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows="2" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Permissions ({formData.permissions.length} sélectionnées)</label>
                <div style={{maxHeight: '250px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px', borderRadius: '4px'}}>
                  {availablePermissions.map(permission => (
                    <div key={permission} style={{marginBottom: '8px'}}>
                      <label className="checkbox-label">
                        <input 
                          type="checkbox" 
                          checked={formData.permissions.includes(permission)}
                          onChange={() => handlePermissionToggle(permission)}
                        />
                        <span>{permission}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Annuler</button>
                <button type="submit" className="btn btn-primary">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roles;
