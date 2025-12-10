import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import forumService from '../services/forumService';
import './ForumCategories.css';

const ForumCategories = () => {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '💬',
    order: 0,
    isActive: true
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await forumService.getAllCategories();
      setCategories(response.data.data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await forumService.updateCategory(editingCategory.id, formData);
        toast.success('Catégorie mise à jour');
      } else {
        await forumService.createCategory(formData);
        toast.success('Catégorie créée');
      }
      closeModal();
      loadCategories();
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || '💬',
      order: category.order || 0,
      isActive: category.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette catégorie ? Tous les topics seront également supprimés.')) {
      try {
        await forumService.deleteCategory(id);
        toast.success('Catégorie supprimée');
        loadCategories();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: '💬',
      order: 0,
      isActive: true
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="forum-categories-container">
      <div className="page-header">
        <h1>💬 Catégories du Forum</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Nouvelle Catégorie
        </button>
      </div>

      <div className="categories-grid">
        {categories.map((category) => (
          <div key={category.id} className="category-card">
            <div className="category-icon">{category.icon}</div>
            <div className="category-info">
              <h3>{category.name}</h3>
              <p>{category.description}</p>
              <div className="category-meta">
                <span>📊 Ordre: {category.order}</span>
                <span>
                  {category._count?.topics || 0} topic{category._count?.topics !== 1 ? 's' : ''}
                </span>
                <span className={`badge ${category.isActive ? 'badge-success' : 'badge-secondary'}`}>
                  {category.isActive ? 'Actif' : 'Inactif'}
                </span>
              </div>
            </div>
            <div className="category-actions">
              <button className="btn-edit" onClick={() => handleEdit(category)}>
                ✏️
              </button>
              <button className="btn-delete" onClick={() => handleDelete(category.id)}>
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="empty-state">
          <p>Aucune catégorie</p>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCategory ? 'Modifier' : 'Nouvelle'} Catégorie</h2>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nom *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Slug *</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Icône (emoji)</label>
                  <input
                    type="text"
                    name="icon"
                    value={formData.icon}
                    onChange={handleChange}
                    placeholder="💬"
                  />
                </div>

                <div className="form-group">
                  <label>Ordre d'affichage</label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                  Catégorie active
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  {editingCategory ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForumCategories;
