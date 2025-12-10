import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [roles, setRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ 
    firstName: '', 
    lastName: '', 
    email: '', 
    roleId: '', 
    isActive: true,
    phone: ''
  });

  useEffect(() => { 
    loadData();
    loadRoles();
  }, []);

  const loadData = async () => {
    try {
      const response = await api.get('/staff');
      setStaff(response.data.data);
    } catch (error) { toast.error('Erreur lors du chargement'); }
  };

  const loadRoles = async () => {
    try {
      const response = await api.get('/roles');
      setRoles(response.data.data);
    } catch (error) { console.error('Erreur roles'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        roleId: formData.roleId ? parseInt(formData.roleId) : null
      };
      if (editingItem) {
        await api.put(`/staff/${editingItem.id}`, payload);
        toast.success('Personnel mis à jour');
      } else {
        await api.post('/staff', payload);
        toast.success('Personnel créé');
      }
      setShowModal(false);
      setFormData({ firstName: '', lastName: '', email: '', roleId: '', isActive: true, phone: '' });
      setEditingItem(null);
      loadData();
    } catch (error) { toast.error('Erreur'); }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ 
      firstName: item.firstName, 
      lastName: item.lastName, 
      email: item.email, 
      roleId: item.roleId || '', 
      isActive: item.isActive,
      phone: item.phone || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce membre du personnel?')) return;
    try {
      await api.delete(`/staff/${id}`);
      toast.success('Personnel supprimé');
      loadData();
    } catch (error) { toast.error('Erreur'); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>👥 Gestion du Personnel</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">+ Nouveau Membre</button>
      </div>
      <div className="card">
        <table className="table">
          <thead><tr><th>Nom</th><th>Email</th><th>Téléphone</th><th>Rôle</th><th>Statut</th><th>Actions</th></tr></thead>
          <tbody>
            {staff.map((item) => (
              <tr key={item.id}>
                <td><strong>{item.firstName} {item.lastName}</strong></td>
                <td>{item.email}</td>
                <td>{item.phone || '-'}</td>
                <td>{item.role?.name ? <span className="badge badge-primary">{item.role.name}</span> : '-'}</td>
                <td>{item.isActive ? <span className="badge badge-success">Actif</span> : <span className="badge badge-secondary">Inactif</span>}</td>
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingItem ? 'Modifier' : 'Nouveau'} Membre du Personnel</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Prénom *</label>
                <input type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Nom *</label>
                <input type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Téléphone</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Rôle</label>
                <select value={formData.roleId} onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}>
                  <option value="">-- Sélectionner un rôle --</option>
                  {roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
                  <span>Actif</span>
                </label>
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

export default Staff;
