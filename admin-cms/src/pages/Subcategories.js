import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { subcategoryService } from '../services/subcategoryService';
import { categoryService } from '../services/categoryService';

const Subcategories = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', slug: '', parentId: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [subCats, cats] = await Promise.all([
        subcategoryService.getAll(),
        categoryService.getAll()
      ]);
      setSubcategories(subCats);
      setCategories(cats);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData, parentId: parseInt(formData.parentId) };
      if (editingItem) {
        await subcategoryService.update(editingItem.id, data);
        toast.success('Sous-catégorie mise à jour');
      } else {
        await subcategoryService.create(data);
        toast.success('Sous-catégorie créée');
      }
      setShowModal(false);
      setFormData({ name: '', slug: '', parentId: '' });
      setEditingItem(null);
      loadData();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ name: item.name, slug: item.slug, parentId: item.parentId || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette sous-catégorie?')) return;
    try {
      await subcategoryService.delete(id);
      toast.success('Sous-catégorie supprimée');
      loadData();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const getCategoryName = (id) => {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : '-';
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>🏷️ Sous-catégories</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          + Nouvelle Sous-catégorie
        </button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Slug</th>
              <th>Catégorie Parente</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subcategories.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.slug}</td>
                <td>{getCategoryName(item.parentId)}</td>
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
            <h2>{editingItem ? 'Modifier' : 'Nouvelle'} Sous-catégorie</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Catégorie Parente *</label>
                <select value={formData.parentId} onChange={(e) => setFormData({ ...formData, parentId: e.target.value })} required>
                  <option value="">Sélectionner...</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
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

export default Subcategories;
