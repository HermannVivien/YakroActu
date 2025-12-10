import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { bannerService } from '../services/bannerService';
import './Banners.css';

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    linkUrl: '',
    type: 'HOME',
    position: 'TOP',
    order: 0,
    isActive: true,
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      const data = await bannerService.getAll();
      setBanners(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des bannières');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
      };

      if (editingBanner) {
        await bannerService.update(editingBanner.id, payload);
        toast.success('Bannière mise à jour');
      } else {
        await bannerService.create(payload);
        toast.success('Bannière créée');
      }
      closeModal();
      loadBanners();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBanner(null);
    setFormData({
      title: '',
      imageUrl: '',
      linkUrl: '',
      type: 'HOME',
      position: 'TOP',
      order: 0,
      isActive: true,
      startDate: '',
      endDate: '',
    });
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || '',
      type: banner.type,
      position: banner.position,
      order: banner.order,
      isActive: banner.isActive,
      startDate: banner.startDate ? banner.startDate.split('T')[0] : '',
      endDate: banner.endDate ? banner.endDate.split('T')[0] : '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette bannière?')) return;
    try {
      await bannerService.delete(id);
      toast.success('Bannière supprimée');
      loadBanners();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const isActive = (banner) => {
    if (!banner.isActive) return false;
    const now = new Date();
    if (banner.startDate && new Date(banner.startDate) > now) return false;
    if (banner.endDate && new Date(banner.endDate) < now) return false;
    return true;
  };

  const getTypeBadge = (type) => {
    const badges = {
      HOME: { label: '🏠 Accueil', class: 'badge-primary' },
      ARTICLE: { label: '📰 Article', class: 'badge-info' },
      CATEGORY: { label: '📁 Catégorie', class: 'badge-warning' },
      POPUP: { label: '🎯 Popup', class: 'badge-danger' },
    };
    const badge = badges[type] || { label: type, class: 'badge-secondary' };
    return <span className={`badge ${badge.class}`}>{badge.label}</span>;
  };

  return (
    <div className="banners-page">
      <div className="page-header">
        <h1>🎨 Bannières Publicitaires</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          + Nouvelle Bannière
        </button>
      </div>

      <div className="banners-grid">
        {banners.map((banner) => (
          <div key={banner.id} className={`banner-card ${isActive(banner) ? 'active' : 'inactive'}`}>
            <div className="banner-image">
              {banner.imageUrl ? (
                <img src={banner.imageUrl} alt={banner.title} />
              ) : (
                <div className="no-image">Pas d'image</div>
              )}
              {!isActive(banner) && (
                <div className="inactive-overlay">
                  <span>❌ Inactive</span>
                </div>
              )}
            </div>
            <div className="banner-info">
              <h3>{banner.title}</h3>
              <div className="banner-meta">
                {getTypeBadge(banner.type)}
                <span className="position-badge">{banner.position}</span>
                <span className="order-badge">Ordre: {banner.order}</span>
              </div>
              <div className="banner-stats">
                <span>👁️ {banner.viewCount || 0} vues</span>
                <span>🖱️ {banner.clickCount || 0} clics</span>
                <span className="ctr">
                  CTR: {banner.viewCount > 0 
                    ? `${Math.round((banner.clickCount / banner.viewCount) * 100)}%` 
                    : '0%'}
                </span>
              </div>
              {(banner.startDate || banner.endDate) && (
                <div className="banner-dates">
                  {banner.startDate && <span>📅 Début: {new Date(banner.startDate).toLocaleDateString('fr-FR')}</span>}
                  {banner.endDate && <span>⏰ Fin: {new Date(banner.endDate).toLocaleDateString('fr-FR')}</span>}
                </div>
              )}
              <div className="banner-actions">
                <button onClick={() => handleEdit(banner)} className="btn btn-sm btn-primary">
                  ✏️ Éditer
                </button>
                <button onClick={() => handleDelete(banner.id)} className="btn btn-sm btn-danger">
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingBanner ? 'Modifier la bannière' : 'Nouvelle bannière'}</h2>
              <button onClick={closeModal} className="btn-close">×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Titre *</label>
                <input
                  type="text"
                  placeholder="Nom de la bannière"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>URL de l'image *</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  required
                />
                {formData.imageUrl && (
                  <div className="image-preview">
                    <img src={formData.imageUrl} alt="Preview" />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Lien de destination</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  >
                    <option value="HOME">🏠 Accueil</option>
                    <option value="ARTICLE">📰 Article</option>
                    <option value="CATEGORY">📁 Catégorie</option>
                    <option value="POPUP">🎯 Popup</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Position *</label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    required
                  >
                    <option value="TOP">Haut</option>
                    <option value="MIDDLE">Milieu</option>
                    <option value="BOTTOM">Bas</option>
                    <option value="SIDEBAR">Barre latérale</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Ordre d'affichage</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    <span>✅ Active</span>
                  </label>
                </div>

                <div className="form-group">
                  <label>Date de début</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Date de fin</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={closeModal} className="btn btn-secondary">
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingBanner ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Banners;
