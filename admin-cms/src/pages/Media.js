import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FaUpload, FaTrash, FaCopy, FaImage, FaVideo, FaMusic, FaFile } from 'react-icons/fa';

const Media = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, IMAGE, VIDEO, AUDIO, DOCUMENT

  useEffect(() => {
    loadMedia();
  }, [filter]);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const response = await api.get('/media', {
        params: { type: filter !== 'all' ? filter : undefined }
      });
      setMedia(response.data.data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des médias');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      setUploading(true);
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success(`${files.length} fichier(s) téléchargé(s)`);
      loadMedia();
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    } finally {
      setUploading(false);
    }
  };

  const deleteMedia = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce média ?')) return;

    try {
      await api.delete(`/media/${id}`);
      toast.success('Média supprimé');
      loadMedia();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copiée dans le presse-papier');
  };

  const getMediaIcon = (type) => {
    switch(type) {
      case 'IMAGE': return <FaImage className="text-primary" />;
      case 'VIDEO': return <FaVideo className="text-danger" />;
      case 'AUDIO': return <FaMusic className="text-success" />;
      case 'DOCUMENT': return <FaFile className="text-warning" />;
      default: return <FaFile />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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
        <h2>🎨 Médiathèque</h2>
        <div>
          <label className="btn btn-primary">
            <FaUpload className="me-2" />
            {uploading ? 'Téléchargement...' : 'Télécharger des fichiers'}
            <input
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* Filtres */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="btn-group" role="group">
            <button 
              className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('all')}
            >
              Tous
            </button>
            <button 
              className={`btn ${filter === 'IMAGE' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('IMAGE')}
            >
              <FaImage className="me-1" /> Images
            </button>
            <button 
              className={`btn ${filter === 'VIDEO' ? 'btn-danger' : 'btn-outline-danger'}`}
              onClick={() => setFilter('VIDEO')}
            >
              <FaVideo className="me-1" /> Vidéos
            </button>
            <button 
              className={`btn ${filter === 'AUDIO' ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => setFilter('AUDIO')}
            >
              <FaMusic className="me-1" /> Audio
            </button>
            <button 
              className={`btn ${filter === 'DOCUMENT' ? 'btn-warning' : 'btn-outline-warning'}`}
              onClick={() => setFilter('DOCUMENT')}
            >
              <FaFile className="me-1" /> Documents
            </button>
          </div>
        </div>
      </div>

      {/* Grille de médias */}
      <div className="row g-4">
        {media.length === 0 ? (
          <div className="col-12 text-center py-5 text-muted">
            <p className="mb-0">Aucun média trouvé</p>
          </div>
        ) : (
          media.map((item) => (
            <div key={item.id} className="col-md-4 col-lg-3">
              <div className="card h-100">
                {/* Aperçu */}
                <div className="card-img-top bg-light d-flex align-items-center justify-content-center" 
                     style={{ height: '200px', overflow: 'hidden' }}>
                  {item.type === 'IMAGE' ? (
                    <img src={item.url} alt={item.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div className="text-center">
                      <div style={{ fontSize: '3rem' }}>
                        {getMediaIcon(item.type)}
                      </div>
                    </div>
                  )}
                </div>

                <div className="card-body">
                  <h6 className="card-title text-truncate" title={item.filename}>
                    {item.filename}
                  </h6>
                  <p className="card-text small text-muted mb-2">
                    <strong>Type:</strong> {item.mimeType}<br />
                    <strong>Taille:</strong> {formatFileSize(item.size)}<br />
                    <strong>Date:</strong> {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                  </p>

                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-sm btn-outline-primary flex-grow-1"
                      onClick={() => copyUrl(item.url)}
                      title="Copier l'URL"
                    >
                      <FaCopy />
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => deleteMedia(item.id)}
                      title="Supprimer"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Media;
