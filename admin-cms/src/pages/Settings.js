import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FaSave } from 'react-icons/fa';

const Settings = () => {
  const [settings, setSettings] = useState({
    siteName: '',
    siteDescription: '',
    logo: '',
    favicon: '',
    contactEmail: '',
    contactPhone: '',
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      youtube: '',
      linkedin: ''
    },
    features: {
      commentsEnabled: true,
      registrationEnabled: true,
      maintenanceMode: false
    },
    seo: {
      metaTitle: '',
      metaDescription: '',
      metaKeywords: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/settings');
      if (response.data.data) {
        setSettings(response.data.data);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      await api.put('/settings', settings);
      toast.success('Paramètres enregistrés');
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>⚙️ Paramètres de l'Application</h2>
      </div>

      <form onSubmit={handleSave}>
        {/* Informations générales */}
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">Informations Générales</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Nom du site</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.siteName}
                  onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Email de contact</label>
                <input
                  type="email"
                  className="form-control"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows="3"
                value={settings.siteDescription}
                onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
              />
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Logo URL</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.logo}
                  onChange={(e) => setSettings({...settings, logo: e.target.value})}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Téléphone</label>
                <input
                  type="tel"
                  className="form-control"
                  value={settings.contactPhone}
                  onChange={(e) => setSettings({...settings, contactPhone: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Réseaux sociaux */}
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">Réseaux Sociaux</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Facebook</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.socialMedia?.facebook || ''}
                  onChange={(e) => setSettings({
                    ...settings, 
                    socialMedia: {...settings.socialMedia, facebook: e.target.value}
                  })}
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Twitter</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.socialMedia?.twitter || ''}
                  onChange={(e) => setSettings({
                    ...settings, 
                    socialMedia: {...settings.socialMedia, twitter: e.target.value}
                  })}
                  placeholder="https://twitter.com/..."
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Instagram</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.socialMedia?.instagram || ''}
                  onChange={(e) => setSettings({
                    ...settings, 
                    socialMedia: {...settings.socialMedia, instagram: e.target.value}
                  })}
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">YouTube</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.socialMedia?.youtube || ''}
                  onChange={(e) => setSettings({
                    ...settings, 
                    socialMedia: {...settings.socialMedia, youtube: e.target.value}
                  })}
                  placeholder="https://youtube.com/..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Fonctionnalités */}
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">Fonctionnalités</h5>
          </div>
          <div className="card-body">
            <div className="form-check mb-3">
              <input
                type="checkbox"
                className="form-check-input"
                id="commentsEnabled"
                checked={settings.features?.commentsEnabled || false}
                onChange={(e) => setSettings({
                  ...settings,
                  features: {...settings.features, commentsEnabled: e.target.checked}
                })}
              />
              <label className="form-check-label" htmlFor="commentsEnabled">
                Activer les commentaires
              </label>
            </div>
            <div className="form-check mb-3">
              <input
                type="checkbox"
                className="form-check-input"
                id="registrationEnabled"
                checked={settings.features?.registrationEnabled || false}
                onChange={(e) => setSettings({
                  ...settings,
                  features: {...settings.features, registrationEnabled: e.target.checked}
                })}
              />
              <label className="form-check-label" htmlFor="registrationEnabled">
                Activer les inscriptions
              </label>
            </div>
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="maintenanceMode"
                checked={settings.features?.maintenanceMode || false}
                onChange={(e) => setSettings({
                  ...settings,
                  features: {...settings.features, maintenanceMode: e.target.checked}
                })}
              />
              <label className="form-check-label" htmlFor="maintenanceMode">
                Mode maintenance
              </label>
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">SEO</h5>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label">Meta Title</label>
              <input
                type="text"
                className="form-control"
                value={settings.seo?.metaTitle || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  seo: {...settings.seo, metaTitle: e.target.value}
                })}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Meta Description</label>
              <textarea
                className="form-control"
                rows="2"
                value={settings.seo?.metaDescription || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  seo: {...settings.seo, metaDescription: e.target.value}
                })}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Meta Keywords</label>
              <input
                type="text"
                className="form-control"
                value={settings.seo?.metaKeywords || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  seo: {...settings.seo, metaKeywords: e.target.value}
                })}
                placeholder="mot-clé1, mot-clé2, mot-clé3"
              />
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end">
          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
            <FaSave className="me-2" />
            {saving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
