import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { rssFeedService } from '../services/rssFeedService';

const RssFeeds = () => {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', url: '', isActive: true, updateFrequency: 30 });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const data = await rssFeedService.getAll();
      setItems(data);
    } catch (error) { toast.error('Erreur lors du chargement'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await rssFeedService.update(editingItem.id, formData);
        toast.success('Flux RSS mis à jour');
      } else {
        await rssFeedService.create(formData);
        toast.success('Flux RSS créé');
      }
      setShowModal(false);
      setFormData({ name: '', url: '', isActive: true, updateFrequency: 30 });
      setEditingItem(null);
      loadData();
    } catch (error) { toast.error('Erreur'); }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ name: item.name, url: item.url, isActive: item.isActive, updateFrequency: item.updateFrequency || 30 });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce flux RSS?')) return;
    try {
      await rssFeedService.delete(id);
      toast.success('Flux RSS supprimé');
      loadData();
    } catch (error) { toast.error('Erreur'); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>📡 Flux RSS</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">+ Nouveau Flux</button>
      </div>
      <div className="card">
        <table className="table">
          <thead><tr><th>Nom</th><th>URL</th><th>Fréquence (min)</th><th>Statut</th><th>Dernière MAJ</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td><strong>{item.name}</strong></td>
                <td><small>{item.url}</small></td>
                <td>{item.updateFrequency || 30} min</td>
                <td>{item.isActive ? <span className="badge badge-success">Actif</span> : <span className="badge badge-secondary">Inactif</span>}</td>
                <td>{item.lastFetchedAt ? new Date(item.lastFetchedAt).toLocaleString('fr-FR') : '-'}</td>
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
            <h2>{editingItem ? 'Modifier' : 'Nouveau'} Flux RSS</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nom *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>URL du Flux *</label>
                <input type="url" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} required placeholder="https://example.com/rss" />
              </div>
              <div className="form-group">
                <label>Fréquence de mise à jour (minutes)</label>
                <input type="number" min="5" value={formData.updateFrequency} onChange={(e) => setFormData({ ...formData, updateFrequency: parseInt(e.target.value) })} />
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

export default RssFeeds;
