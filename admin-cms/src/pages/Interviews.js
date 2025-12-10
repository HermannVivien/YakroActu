import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import interviewService from '../services/interviewService';
import './Interviews.css';

const Interviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    intervieweeName: '',
    intervieweeRole: '',
    introduction: '',
    highlightQuote: '',
    status: 'DRAFT',
    isPublished: false
  });

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    try {
      const response = await interviewService.getAll();
      setInterviews(response.data.data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingInterview) {
        await interviewService.update(editingInterview.id, formData);
        toast.success('Interview mis à jour');
      } else {
        await interviewService.create(formData);
        toast.success('Interview créé');
      }
      closeModal();
      loadInterviews();
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const handleEdit = (interview) => {
    setEditingInterview(interview);
    setFormData({
      title: interview.title,
      slug: interview.slug,
      intervieweeName: interview.intervieweeName,
      intervieweeRole: interview.intervieweeRole,
      introduction: interview.introduction || '',
      highlightQuote: interview.highlightQuote || '',
      status: interview.status,
      isPublished: interview.isPublished
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette interview ?')) {
      try {
        await interviewService.delete(id);
        toast.success('Interview supprimée');
        loadInterviews();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingInterview(null);
    setFormData({
      title: '',
      slug: '',
      intervieweeName: '',
      intervieweeRole: '',
      introduction: '',
      highlightQuote: '',
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
    <div className="interviews-container">
      <div className="page-header">
        <h1>🎤 Interviews</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Nouvelle Interview
        </button>
      </div>

      <div className="interviews-list">
        {interviews.map((interview) => (
          <div key={interview.id} className="interview-card">
            <div className="interview-header">
              {interview.intervieweePhoto && (
                <img src={interview.intervieweePhoto} alt={interview.intervieweeName} className="interviewee-photo" />
              )}
              <div>
                <h3>{interview.title}</h3>
                <p className="interviewee-info">
                  <strong>{interview.intervieweeName}</strong> - {interview.intervieweeRole}
                </p>
              </div>
            </div>

            {interview.highlightQuote && (
              <blockquote className="highlight-quote">
                "{interview.highlightQuote}"
              </blockquote>
            )}

            <div className="interview-meta">
              <span className={`badge badge-${interview.status.toLowerCase()}`}>
                {interview.status}
              </span>
              <span>👁️ {interview.viewCount || 0}</span>
              {interview.audioUrl && <span>🎵 Audio</span>}
              {interview.videoUrl && <span>🎥 Vidéo</span>}
            </div>

            <div className="interview-actions">
              <button className="btn-edit" onClick={() => handleEdit(interview)}>
                ✏️ Modifier
              </button>
              <button className="btn-delete" onClick={() => handleDelete(interview.id)}>
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {interviews.length === 0 && (
        <div className="empty-state">
          <p>Aucune interview</p>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingInterview ? 'Modifier' : 'Nouvelle'} Interview</h2>
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

              <div className="form-row">
                <div className="form-group">
                  <label>Nom de l'interviewé *</label>
                  <input type="text" name="intervieweeName" value={formData.intervieweeName} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Fonction *</label>
                  <input type="text" name="intervieweeRole" value={formData.intervieweeRole} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-group">
                <label>Introduction</label>
                <textarea name="introduction" value={formData.introduction} onChange={handleChange} rows="4" />
              </div>

              <div className="form-group">
                <label>Citation mise en avant</label>
                <textarea name="highlightQuote" value={formData.highlightQuote} onChange={handleChange} rows="2" />
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
                  {editingInterview ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Interviews;
