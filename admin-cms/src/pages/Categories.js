import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { categoryService } from '../services/categoryService';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '', color: '' });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoryService.update(editingCategory.id, formData);
        toast.success('Catégorie mise à jour');
      } else {
        await categoryService.create(formData);
        toast.success('Catégorie créée');
      }
      setShowModal(false);
      setFormData({ name: '', slug: '', description: '', color: '' });
      setEditingCategory(null);
      loadCategories();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      color: category.color || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette catégorie?')) return;
    try {
      await categoryService.delete(id);
      toast.success('Catégorie supprimée');
      loadCategories();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  return (
    <div className="categories-page">
      <div className="page-header">
        <h1>Catégories</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          + Nouvelle Catégorie
        </button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Slug</th>
              <th>Couleur</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td>{cat.name}</td>
                <td>{cat.slug}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '4px',
                        backgroundColor: cat.color || '#FF8C00',
                        border: '1px solid #ddd'
                      }}
                    />
                    <span style={{ fontSize: '12px', color: '#666' }}>
                      {cat.color || '#FF8C00'}
                    </span>
                  </div>
                </td>
                <td>{cat.description || '-'}</td>
                <td>
                  <div className="action-buttons">
                    <button onClick={() => handleEdit(cat)} className="btn btn-sm btn-primary">
                      Éditer
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className="btn btn-sm btn-danger">
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingCategory ? 'Éditer' : 'Nouvelle'} Catégorie</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nom *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Slug *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="form-control"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Couleur (hex)</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="#1E88E5"
                    pattern="^#?[0-9A-Fa-f]{6}$"
                  />
                  <input
                    type="color"
                    value={formData.color && formData.color.startsWith('#') ? formData.color : '#FF8C00'}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    style={{ width: '50px', height: '38px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <small style={{ color: '#666', fontSize: '12px' }}>
                  Laissez vide pour utiliser la couleur du thème (#FF8C00)
                </small>
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
