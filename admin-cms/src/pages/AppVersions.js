import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { appVersionService } from '../services/appVersionService';
import './AppVersions.css';

const AppVersions = () => {
  const [versions, setVersions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingVersion, setEditingVersion] = useState(null);
  const [formData, setFormData] = useState({
    version: '',
    buildNumber: '',
    platform: 'ANDROID',
    status: 'ACTIVE',
    forceUpdate: false,
    downloadUrl: '',
    releaseNotes: '',
  });

  useEffect(() => {
    loadVersions();
  }, []);

  const loadVersions = async () => {
    try {
      const data = await appVersionService.getAll();
      setVersions(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des versions');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVersion) {
        await appVersionService.update(editingVersion.id, formData);
        toast.success('Version mise à jour');
      } else {
        await appVersionService.create(formData);
        toast.success('Version créée');
      }
      closeModal();
      loadVersions();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingVersion(null);
    setFormData({
      version: '',
      buildNumber: '',
      platform: 'ANDROID',
      status: 'ACTIVE',
      forceUpdate: false,
      downloadUrl: '',
      releaseNotes: '',
    });
  };

  const handleEdit = (version) => {
    setEditingVersion(version);
    setFormData({
      version: version.version,
      buildNumber: version.buildNumber,
      platform: version.platform,
      status: version.status,
      forceUpdate: version.forceUpdate,
      downloadUrl: version.downloadUrl || '',
      releaseNotes: version.releaseNotes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette version?')) return;
    try {
      await appVersionService.delete(id);
      toast.success('Version supprimée');
      loadVersions();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      ACTIVE: 'badge-success',
      DEPRECATED: 'badge-warning',
      MAINTENANCE: 'badge-info',
    };
    return badges[status] || 'badge-secondary';
  };

  const getPlatformIcon = (platform) => {
    return platform === 'ANDROID' ? '🤖' : '🍎';
  };

  return (
    <div className="app-versions-page">
      <div className="page-header">
        <h1>📱 Versions de l'Application</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          + Nouvelle Version
        </button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Plateforme</th>
              <th>Version</th>
              <th>Build</th>
              <th>Statut</th>
              <th>Mise à jour forcée</th>
              <th>Date de sortie</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {versions.map((version) => (
              <tr key={version.id}>
                <td>
                  <span className="platform-badge">
                    {getPlatformIcon(version.platform)} {version.platform}
                  </span>
                </td>
                <td><strong>{version.version}</strong></td>
                <td>{version.buildNumber}</td>
                <td>
                  <span className={`badge ${getStatusBadge(version.status)}`}>
                    {version.status}
                  </span>
                </td>
                <td>
                  {version.forceUpdate ? (
                    <span className="badge badge-danger">⚠️ OUI</span>
                  ) : (
                    <span className="badge badge-secondary">Non</span>
                  )}
                </td>
                <td>{new Date(version.releaseDate).toLocaleDateString('fr-FR')}</td>
                <td>
                  <div className="action-buttons">
                    <button onClick={() => handleEdit(version)} className="btn btn-sm btn-primary">
                      ✏️
                    </button>
                    <button onClick={() => handleDelete(version.id)} className="btn btn-sm btn-danger">
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingVersion ? 'Modifier la version' : 'Nouvelle version'}</h2>
              <button onClick={closeModal} className="btn-close">×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Plateforme *</label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    required
                  >
                    <option value="ANDROID">Android</option>
                    <option value="IOS">iOS</option>
                    <option value="WEB">Web</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Version *</label>
                  <input
                    type="text"
                    placeholder="1.0.0"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Numéro de build *</label>
                  <input
                    type="text"
                    placeholder="100"
                    value={formData.buildNumber}
                    onChange={(e) => setFormData({ ...formData, buildNumber: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Statut</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="DEPRECATED">Obsolète</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>URL de téléchargement</label>
                  <input
                    type="url"
                    placeholder="https://play.google.com/store/apps/..."
                    value={formData.downloadUrl}
                    onChange={(e) => setFormData({ ...formData, downloadUrl: e.target.value })}
                  />
                </div>

                <div className="form-group full-width">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.forceUpdate}
                      onChange={(e) => setFormData({ ...formData, forceUpdate: e.target.checked })}
                    />
                    <span>⚠️ Forcer la mise à jour (bloquer les anciennes versions)</span>
                  </label>
                </div>

                <div className="form-group full-width">
                  <label>Notes de version</label>
                  <textarea
                    rows="4"
                    placeholder="Quoi de neuf dans cette version..."
                    value={formData.releaseNotes}
                    onChange={(e) => setFormData({ ...formData, releaseNotes: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={closeModal} className="btn btn-secondary">
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingVersion ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppVersions;
