import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import announcementService from '../services/announcementService';
import './Announcements.css';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    type: 'OFFICIAL',
    priority: 'MEDIUM',
    isPublished: false,
    attachments: []
  });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const response = await announcementService.getAll();
      setAnnouncements(response.data.data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAnnouncement) {
        await announcementService.update(editingAnnouncement.id, formData);
        toast.success('Annonce mise à jour');
      } else {
        await announcementService.create(formData);
        toast.success('Annonce créée');
      }
      closeModal();
      loadAnnouncements();
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      slug: announcement.slug,
      content: announcement.content,
      type: announcement.type,
      priority: announcement.priority,
      isPublished: announcement.isPublished,
      attachments: announcement.attachments || []
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette annonce ?')) {
      try {
        await announcementService.delete(id);
        toast.success('Annonce supprimée');
        loadAnnouncements();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAnnouncement(null);
    setFormData({
      title: '',
      slug: '',
      content: '',
      type: 'OFFICIAL',
      priority: 'MEDIUM',
      isPublished: false,
      attachments: []
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      HIGH: 'badge-danger',
      MEDIUM: 'badge-warning',
      LOW: 'badge-info'
    };
    return badges[priority] || 'badge-info';
  };

  return (
    <div className="announcements-container">
      <div className="page-header">
        <h1>📢 Annonces & Communiqués</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Nouvelle Annonce
        </button>
      </div>

      <div className="announcements-list">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="announcement-card">
            <div className="announcement-header">
              <div>
                <h3>{announcement.title}</h3>
                <span className={`type-badge ${announcement.type.toLowerCase()}`}>
                  {announcement.type === 'OFFICIAL' ? '🏛️ Officiel' : 
                   announcement.type === 'PRESS_RELEASE' ? '📰 Communiqué de presse' : '📝 Avis'}
                </span>
                <span className={`badge ${getPriorityBadge(announcement.priority)}`}>
                  {announcement.priority === 'HIGH' ? '🔴 Haute' :
                   announcement.priority === 'MEDIUM' ? '🟠 Moyenne' : '🟢 Basse'}
                </span>
                {announcement.isPublished && <span className="badge badge-success">✓ Publié</span>}
              </div>
              <div className="announcement-actions">
                <button className="btn-edit" onClick={() => handleEdit(announcement)}>
                  ✏️ Modifier
                </button>
                <button className="btn-delete" onClick={() => handleDelete(announcement.id)}>
                  🗑️
                </button>
              </div>
            </div>

            <p className="announcement-content">
              {announcement.content.substring(0, 200)}...
            </p>

            <div className="announcement-meta">
              <span>👁️ {announcement.viewCount || 0} vues</span>
              <span>📅 {new Date(announcement.createdAt).toLocaleDateString('fr-FR')}</span>
              {announcement.expiresAt && (
                <span>⏰ Expire: {new Date(announcement.expiresAt).toLocaleDateString('fr-FR')}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {announcements.length === 0 && (
        <div className="empty-state">
          <p>Aucune annonce</p>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingAnnouncement ? 'Modifier' : 'Nouvelle'} Annonce</h2>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Titre *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
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
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Type *</label>
                  <select name="type" value={formData.type} onChange={handleChange}>
                    <option value="OFFICIAL">Officiel</option>
                    <option value="PRESS_RELEASE">Communiqué de presse</option>
                    <option value="NOTICE">Avis</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Priorité</label>
                  <select name="priority" value={formData.priority} onChange={handleChange}>
                    <option value="HIGH">Haute</option>
                    <option value="MEDIUM">Moyenne</option>
                    <option value="LOW">Basse</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Contenu *</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows="10"
                  required
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isPublished"
                    checked={formData.isPublished}
                    onChange={handleChange}
                  />
                  Publier immédiatement
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  {editingAnnouncement ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;
