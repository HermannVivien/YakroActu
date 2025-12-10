import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const AdSpaces = () => {
  const [adSpaces, setAdSpaces] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', location: 'HOME_TOP', width: 300, height: 250, isActive: true });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const response = await api.get('/ad-spaces');
      setAdSpaces(response.data.data);
    } catch (error) { toast.error('Erreur lors du chargement'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/ad-spaces/${editingItem.id}`, formData);
        toast.success('Espace publicitaire mis à jour');
      } else {
        await api.post('/ad-spaces', formData);
        toast.success('Espace publicitaire créé');
      }
      setShowModal(false);
      setFormData({ name: '', location: 'HOME_TOP', width: 300, height: 250, isActive: true });
      setEditingItem(null);
      loadData();
    } catch (error) { toast.error('Erreur'); }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ name: item.name, location: item.location, width: item.width, height: item.height, isActive: item.isActive });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet espace?')) return;
    try {
      await api.delete(`/ad-spaces/${id}`);
      toast.success('Espace supprimé');
      loadData();
    } catch (error) { toast.error('Erreur'); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>🎯 Espaces Publicitaires</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">+ Nouvel Espace</button>
      </div>
      <div className="card">
        <table className="table">
          <thead><tr><th>Nom</th><th>Emplacement</th><th>Dimensions</th><th>Statut</th><th>Actions</th></tr></thead>
          <tbody>
            {adSpaces.map((item) => (
              <tr key={item.id}>
                <td><strong>{item.name}</strong></td>
                <td><span className="badge badge-info">{item.location}</span></td>
                <td>{item.width} x {item.height}</td>
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
            <h2>{editingItem ? 'Modifier' : 'Nouvel'} Espace Publicitaire</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nom *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Emplacement</label>
                <select value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })}>
                  <option value="HOME_TOP">Page d'accueil - Haut</option>
                  <option value="HOME_MIDDLE">Page d'accueil - Milieu</option>
                  <option value="HOME_BOTTOM">Page d'accueil - Bas</option>
                  <option value="ARTICLE_TOP">Article - Haut</option>
                  <option value="ARTICLE_MIDDLE">Article - Milieu</option>
                  <option value="ARTICLE_BOTTOM">Article - Bas</option>
                  <option value="SIDEBAR">Barre latérale</option>
                  <option value="FOOTER">Pied de page</option>
                </select>
              </div>
              <div className="form-group">
                <label>Largeur (px)</label>
                <input type="number" value={formData.width} onChange={(e) => setFormData({ ...formData, width: parseInt(e.target.value) })} required />
              </div>
              <div className="form-group">
                <label>Hauteur (px)</label>
                <input type="number" value={formData.height} onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) })} required />
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

export default AdSpaces;
