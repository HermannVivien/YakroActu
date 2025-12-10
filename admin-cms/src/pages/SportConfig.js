import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import sportConfigService from '../services/sportConfigService';
import './SportConfig.css';

const SportConfig = () => {
  const [configs, setConfigs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [formData, setFormData] = useState({
    apiProvider: '',
    apiKey: '',
    apiUrl: '',
    isActive: false,
    config: {}
  });

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const response = await sportConfigService.getAll();
      setConfigs(response.data.data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des configurations');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingConfig) {
        await sportConfigService.update(editingConfig.id, formData);
        toast.success('Configuration mise à jour');
      } else {
        await sportConfigService.create(formData);
        toast.success('Configuration créée');
      }
      closeModal();
      loadConfigs();
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const handleEdit = (config) => {
    setEditingConfig(config);
    setFormData({
      apiProvider: config.apiProvider,
      apiKey: config.apiKey,
      apiUrl: config.apiUrl,
      isActive: config.isActive,
      config: config.config || {}
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Confirmer la suppression ?')) {
      try {
        await sportConfigService.delete(id);
        toast.success('Configuration supprimée');
        loadConfigs();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingConfig(null);
    setFormData({
      apiProvider: '',
      apiKey: '',
      apiUrl: '',
      isActive: false,
      config: {}
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
    <div className="sport-config-container">
      <div className="page-header">
        <h1>⚽ Configuration Sport</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Nouvelle Configuration
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Provider API</th>
              <th>URL API</th>
              <th>Clé API</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {configs.map((config) => (
              <tr key={config.id}>
                <td>{config.apiProvider}</td>
                <td><code>{config.apiUrl}</code></td>
                <td>
                  <span className="api-key">
                    {config.apiKey ? '••••••••' + config.apiKey.slice(-4) : 'N/A'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${config.isActive ? 'badge-success' : 'badge-secondary'}`}>
                    {config.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td>
                  <button className="btn-edit" onClick={() => handleEdit(config)}>
                    ✏️ Modifier
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(config.id)}>
                    🗑️ Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {configs.length === 0 && (
          <div className="empty-state">
            <p>Aucune configuration API sport</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingConfig ? 'Modifier' : 'Nouvelle'} Configuration Sport</h2>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Provider API *</label>
                <select
                  name="apiProvider"
                  value={formData.apiProvider}
                  onChange={handleChange}
                  required
                >
                  <option value="">Sélectionner...</option>
                  <option value="API-FOOTBALL">API-Football</option>
                  <option value="RAPID_API_SPORTS">RapidAPI Sports</option>
                  <option value="SPORTMONKS">SportMonks</option>
                  <option value="THE_ODDS_API">The Odds API</option>
                  <option value="CUSTOM">Personnalisé</option>
                </select>
              </div>

              <div className="form-group">
                <label>URL API *</label>
                <input
                  type="url"
                  name="apiUrl"
                  value={formData.apiUrl}
                  onChange={handleChange}
                  placeholder="https://api-football-v1.p.rapidapi.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Clé API *</label>
                <input
                  type="text"
                  name="apiKey"
                  value={formData.apiKey}
                  onChange={handleChange}
                  placeholder="Votre clé API"
                  required
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                  Configuration active (désactive les autres)
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  {editingConfig ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SportConfig;
