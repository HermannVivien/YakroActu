import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const FeaturedSections = () => {
  const [sections, setSections] = useState([]);
  const [articles, setArticles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ title: '', displayOrder: 0, isActive: true, articleIds: [] });

  useEffect(() => { 
    loadData();
    loadArticles();
  }, []);

  const loadData = async () => {
    try {
      const response = await api.get('/featured-sections');
      setSections(response.data.data);
    } catch (error) { toast.error('Erreur lors du chargement'); }
  };

  const loadArticles = async () => {
    try {
      const response = await api.get('/articles');
      setArticles(response.data.data);
    } catch (error) { console.error('Erreur articles'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/featured-sections/${editingItem.id}`, formData);
        toast.success('Section mise à jour');
      } else {
        await api.post('/featured-sections', formData);
        toast.success('Section créée');
      }
      setShowModal(false);
      setFormData({ title: '', displayOrder: 0, isActive: true, articleIds: [] });
      setEditingItem(null);
      loadData();
    } catch (error) { toast.error('Erreur'); }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ 
      title: item.title, 
      displayOrder: item.displayOrder, 
      isActive: item.isActive,
      articleIds: item.articles?.map(a => a.id) || []
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette section?')) return;
    try {
      await api.delete(`/featured-sections/${id}`);
      toast.success('Section supprimée');
      loadData();
    } catch (error) { toast.error('Erreur'); }
  };

  const handleArticleToggle = (articleId) => {
    setFormData(prev => ({
      ...prev,
      articleIds: prev.articleIds.includes(articleId)
        ? prev.articleIds.filter(id => id !== articleId)
        : [...prev.articleIds, articleId]
    }));
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>⭐ Sections en Vedette</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">+ Nouvelle Section</button>
      </div>
      <div className="card">
        <table className="table">
          <thead><tr><th>Titre</th><th>Ordre</th><th>Articles</th><th>Statut</th><th>Actions</th></tr></thead>
          <tbody>
            {sections.map((item) => (
              <tr key={item.id}>
                <td><strong>{item.title}</strong></td>
                <td>{item.displayOrder}</td>
                <td>{item.articles?.length || 0} articles</td>
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
          <div className="modal-content" style={{maxWidth: '700px'}} onClick={(e) => e.stopPropagation()}>
            <h2>{editingItem ? 'Modifier' : 'Nouvelle'} Section en Vedette</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Titre *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Ordre d'affichage</label>
                <input type="number" value={formData.displayOrder} onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })} />
              </div>
              <div className="form-group">
                <label>Sélectionner les articles ({formData.articleIds.length} sélectionnés)</label>
                <div style={{maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px', borderRadius: '4px'}}>
                  {articles.map(article => (
                    <div key={article.id} style={{marginBottom: '8px'}}>
                      <label className="checkbox-label">
                        <input 
                          type="checkbox" 
                          checked={formData.articleIds.includes(article.id)}
                          onChange={() => handleArticleToggle(article.id)}
                        />
                        <span>{article.title}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
                  <span>Section active</span>
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

export default FeaturedSections;
