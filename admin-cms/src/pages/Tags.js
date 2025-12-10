import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { tagService } from '../services/tagService';

const Tags = () => {
  const [tags, setTags] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', slug: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const data = await tagService.getAll();
      setTags(data);
    } catch (error) { toast.error('Erreur lors du chargement'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await tagService.update(editingItem.id, formData);
        toast.success('Mot-clé mis à jour');
      } else {
        await tagService.create(formData);
        toast.success('Mot-clé créé');
      }
      setShowModal(false);
      setFormData({ name: '', slug: '' });
      setEditingItem(null);
      loadData();
    } catch (error) { toast.error('Erreur'); }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ name: item.name, slug: item.slug });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce mot-clé?')) return;
    try {
      await tagService.delete(id);
      toast.success('Mot-clé supprimé');
      loadData();
    } catch (error) { toast.error('Erreur'); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>🔖 Mots-clés (Tags)</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">+ Nouveau Mot-clé</button>
      </div>
      <div className="card">
        <table className="table">
          <thead><tr><th>Nom</th><th>Slug</th><th>Actions</th></tr></thead>
          <tbody>
            {tags.map((item) => (
              <tr key={item.id}>
                <td><span className="badge badge-info">{item.name}</span></td>
                <td>{item.slug}</td>
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
            <h2>{editingItem ? 'Modifier' : 'Nouveau'} Mot-clé</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nom *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Slug *</label>
                <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} required />
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

export default Tags;
