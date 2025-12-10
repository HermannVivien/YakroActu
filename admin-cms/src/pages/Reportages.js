import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import reportageService from '../services/reportageService';
import './Reportages.css';

const Reportages = () => {
  const [reportages, setReportages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingReportage, setEditingReportage] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    coverImage: '',
    status: 'DRAFT',
    isPublished: false
  });

  useEffect(() => {
    loadReportages();
  }, []);

  const loadReportages = async () => {
    try {
      const response = await reportageService.getAll();
      setReportages(response.data.data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingReportage) {
        await reportageService.update(editingReportage.id, formData);
        toast.success('Reportage mis à jour');
      } else {
        await reportageService.create(formData);
        toast.success('Reportage créé');
      }
      closeModal();
      loadReportages();
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const handleEdit = (reportage) => {
    setEditingReportage(reportage);
    setFormData({
      title: reportage.title,
      slug: reportage.slug,
      summary: reportage.summary,
      content: reportage.content,
      coverImage: reportage.coverImage,
      status: reportage.status,
      isPublished: reportage.isPublished
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer ce reportage ?')) {
      try {
        await reportageService.delete(id);
        toast.success('Reportage supprimé');
        loadReportages();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingReportage(null);
    setFormData({
      title: '',
      slug: '',
      summary: '',
      content: '',
      coverImage: '',
      status: 'DRAFT',
      isPublished: false
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
    <div className="reportages-container">
      <div className="page-header">
        <h1>📝 Reportages</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Nouveau Reportage
        </button>
      </div>

      <div className="reportages-grid">
        {reportages.map((reportage) => (
          <div key={reportage.id} className="reportage-card">
            {reportage.coverImage && (
              <img src={reportage.coverImage} alt={reportage.title} className="reportage-cover" />
            )}
            <div className="reportage-content">
              <h3>{reportage.title}</h3>
              <p>{reportage.summary}</p>
              <div className="reportage-meta">
                <span className={`badge badge-${reportage.status.toLowerCase()}`}>
                  {reportage.status}
                </span>
                <span>👁️ {reportage.viewCount || 0}</span>
                {reportage.author && (
                  <span>✍️ {reportage.author.firstName} {reportage.author.lastName}</span>
                )}
              </div>
              <div className="reportage-actions">
                <button className="btn-edit" onClick={() => handleEdit(reportage)}>
                  ✏️ Modifier
                </button>
                <button className="btn-delete" onClick={() => handleDelete(reportage.id)}>
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {reportages.length === 0 && (
        <div className="empty-state">
          <p>Aucun reportage</p>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingReportage ? 'Modifier' : 'Nouveau'} Reportage</h2>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Titre *</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Slug *</label>
                <input type="text" name="slug" value={formData.slug} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Résumé *</label>
                <textarea name="summary" value={formData.summary} onChange={handleChange} rows="3" required />
              </div>

              <div className="form-group">
                <label>Contenu *</label>
                <textarea name="content" value={formData.content} onChange={handleChange} rows="15" required />
              </div>

              <div className="form-group">
                <label>Image de couverture (URL)</label>
                <input type="url" name="coverImage" value={formData.coverImage} onChange={handleChange} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Statut</label>
                  <select name="status" value={formData.status} onChange={handleChange}>
                    <option value="DRAFT">Brouillon</option>
                    <option value="PUBLISHED">Publié</option>
                    <option value="ARCHIVED">Archivé</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input type="checkbox" name="isPublished" checked={formData.isPublished} onChange={handleChange} />
                    Publié
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  {editingReportage ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reportages;
