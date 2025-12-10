import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { pushNotificationService } from '../services/pushNotificationService';
import './PushNotifications.css';

const PushNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    platform: 'ALL',
    targetUserIds: '',
    imageUrl: '',
    deepLink: '',
    data: '',
    scheduledFor: '',
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await pushNotificationService.getAll();
      setNotifications(data);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('📤 FormData avant envoi:', formData);
      
      // Convertir targetUserIds en tableau si renseigné
      const payload = {
        title: formData.title,
        body: formData.body,
        platform: formData.platform,
        imageUrl: formData.imageUrl || null,
        deepLink: formData.deepLink || null,
        targetUserIds: formData.targetUserIds 
          ? formData.targetUserIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
          : null,
        scheduledFor: formData.scheduledFor || null,
      };
      
      // Ajouter data seulement si renseigné et valide
      if (formData.data && formData.data.trim()) {
        try {
          payload.data = JSON.parse(formData.data);
        } catch (err) {
          toast.error('Format JSON invalide pour les données');
          return;
        }
      }

      console.log('📤 Payload à envoyer:', payload);
      const newNotif = await pushNotificationService.create(payload);
      
      if (!formData.scheduledFor) {
        // Envoyer immédiatement si pas de planification
        await pushNotificationService.send(newNotif.id);
        toast.success('Notification envoyée avec succès!');
      } else {
        toast.success('Notification planifiée avec succès!');
      }
      
      closeModal();
      loadNotifications();
    } catch (error) {
      console.error('❌ Erreur:', error);
      toast.error('Erreur: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSend = async (id) => {
    if (!window.confirm('Envoyer cette notification maintenant?')) return;
    try {
      await pushNotificationService.send(id);
      toast.success('Notification envoyée!');
      loadNotifications();
    } catch (error) {
      toast.error('Erreur lors de l\'envoi');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette notification?')) return;
    try {
      await pushNotificationService.delete(id);
      toast.success('Notification supprimée');
      loadNotifications();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({
      title: '',
      body: '',
      platform: 'ALL',
      targetUserIds: '',
      imageUrl: '',
      deepLink: '',
      data: '',
      scheduledFor: '',
    });
  };

  const getPlatformBadge = (platform) => {
    const icons = {
      ANDROID: '🤖',
      IOS: '🍎',
      WEB: '🌐',
      ALL: '📱',
    };
    return `${icons[platform] || '📱'} ${platform}`;
  };

  return (
    <div className="push-notifications-page">
      <div className="page-header">
        <h1>🔔 Notifications Push</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          + Nouvelle Notification
        </button>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-label">Total envoyées</div>
          <div className="stat-value">
            {notifications.reduce((sum, n) => sum + (n.sentCount || 0), 0)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total ouvertes</div>
          <div className="stat-value">
            {notifications.reduce((sum, n) => sum + (n.openedCount || 0), 0)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Taux d'ouverture</div>
          <div className="stat-value">
            {(() => {
              const total = notifications.reduce((sum, n) => sum + (n.sentCount || 0), 0);
              const opened = notifications.reduce((sum, n) => sum + (n.openedCount || 0), 0);
              return total > 0 ? `${Math.round((opened / total) * 100)}%` : '0%';
            })()}
          </div>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Plateforme</th>
              <th>Envoyées</th>
              <th>Ouvertes</th>
              <th>Planifiée pour</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((notif) => (
              <tr key={notif.id}>
                <td>
                  <strong>{notif.title}</strong>
                  <div className="notif-body">{notif.message}</div>
                </td>
                <td>
                  <span className="platform-badge">
                    {getPlatformBadge(notif.platform || 'ALL')}
                  </span>
                </td>
                <td>{notif.sentCount || 0}</td>
                <td>{notif.openedCount || 0}</td>
                <td>
                  {notif.scheduledAt ? (
                    <span className="scheduled-date">
                      ⏰ {new Date(notif.scheduledAt).toLocaleString('fr-FR')}
                    </span>
                  ) : (
                    <span className="badge badge-success">Envoyée</span>
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    {notif.scheduledAt && new Date(notif.scheduledAt) > new Date() && (
                      <button 
                        onClick={() => handleSend(notif.id)} 
                        className="btn btn-sm btn-success"
                        title="Envoyer maintenant"
                      >
                        📤
                      </button>
                    )}
                    <button onClick={() => handleDelete(notif.id)} className="btn btn-sm btn-danger">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📤 Nouvelle Notification Push</h2>
              <button onClick={closeModal} className="btn-close">×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Titre *</label>
                <input
                  type="text"
                  placeholder="Titre de la notification"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Message *</label>
                <textarea
                  rows="3"
                  placeholder="Contenu de la notification"
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  required
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Plateforme</label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  >
                    <option value="ALL">Toutes les plateformes</option>
                    <option value="ANDROID">Android uniquement</option>
                    <option value="IOS">iOS uniquement</option>
                    <option value="WEB">Web uniquement</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>URL de l'image</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Lien profond</label>
                  <input
                    type="text"
                    placeholder="/article/123"
                    value={formData.deepLink}
                    onChange={(e) => setFormData({ ...formData, deepLink: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Planifier pour</label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledFor}
                    onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                  />
                  <small>Laisser vide pour envoyer immédiatement</small>
                </div>
              </div>

              <div className="form-group">
                <label>IDs utilisateurs cibles (optionnel)</label>
                <input
                  type="text"
                  placeholder="1, 2, 3, 4 (séparés par des virgules)"
                  value={formData.targetUserIds}
                  onChange={(e) => setFormData({ ...formData, targetUserIds: e.target.value })}
                />
                <small>Laisser vide pour envoyer à tous les utilisateurs</small>
              </div>

              <div className="form-group">
                <label>Données JSON (optionnel)</label>
                <textarea
                  rows="3"
                  placeholder='{"articleId": 123, "category": "sport"}'
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                />
              </div>

              <div className="modal-footer">
                <button type="button" onClick={closeModal} className="btn btn-secondary">
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  {formData.scheduledFor ? '⏰ Planifier' : '📤 Envoyer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PushNotifications;
