import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { breakingNewsService } from '../services/breakingNewsService';

const BreakingNews = () => {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '', priority: 'MEDIUM', isActive: true });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const data = await breakingNewsService.getAll();
      setItems(data);
    } catch (error) { toast.error('Erreur lors du chargement'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await breakingNewsService.update(editingItem.id, formData);
        toast.success('Flash info mis à jour');
      } else {
        await breakingNewsService.create(formData);
        toast.success('Flash info créé');
      }
      setShowModal(false);
      setFormData({ title: '', content: '', priority: 'MEDIUM', isActive: true });
      setEditingItem(null);
      loadData();
    } catch (error) { toast.error('Erreur'); }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ title: item.title, content: item.content, priority: item.priority, isActive: item.isActive });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce flash info?')) return;
    try {
      await breakingNewsService.delete(id);
      toast.success('Flash info supprimé');
      loadData();
    } catch (error) { toast.error('Erreur'); }
  };

  const getPriorityBadge = (priority) => {
    const badges = { HIGH: 'badge-danger', MEDIUM: 'badge-warning', LOW: 'badge-info' };
    return <span className={`badge ${badges[priority]}`}>{priority}</span>;
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>⚡ Flash Info / Breaking News</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">+ Nouveau Flash</button>
      </div>
      <div className="card">
        <table className="table">
          <thead><tr><th>Titre</th><th>Priorité</th><th>Statut</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td><strong>{item.title}</strong></td>
                <td>{getPriorityBadge(item.priority)}</td>
                <td>{item.isActive ? <span className="badge badge-success">Actif</span> : <span className="badge badge-secondary">Inactif</span>}</td>
                <td>{new Date(item.createdAt).toLocaleDateString('fr-FR')}</td>
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
            <h2>{editingItem ? 'Modifier' : 'Nouveau'} Flash Info</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Titre *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Contenu *</label>
                <textarea rows="3" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Priorité</label>
                <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                  <option value="LOW">Basse</option>
                  <option value="MEDIUM">Moyenne</option>
                  <option value="HIGH">Haute</option>
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

export default BreakingNews;
