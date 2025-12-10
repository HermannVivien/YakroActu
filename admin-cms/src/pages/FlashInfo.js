import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaBolt, FaToggleOn, FaToggleOff, FaExclamationCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

const FlashInfo = () => {
  const [flashInfos, setFlashInfos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFlash, setEditingFlash] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, inactive
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'MEDIUM',
    link: '',
    isActive: true,
    expiresAt: ''
  });

  useEffect(() => {
    loadFlashInfos();
  }, [filter]);

  const loadFlashInfos = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter === 'active') params.isActive = 'true';
      if (filter === 'inactive') params.isActive = 'false';
      
      const response = await api.get('/flash-info', { params });
      setFlashInfos(response.data.data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des flash infos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const dataToSend = {
        ...formData,
        expiresAt: formData.expiresAt || null
      };

      if (editingFlash) {
        await api.put(`/flash-info/${editingFlash.id}`, dataToSend);
        toast.success('Flash info mis à jour');
      } else {
        await api.post('/flash-info', dataToSend);
        toast.success('Flash info créé');
      }
      closeModal();
      loadFlashInfos();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const deleteFlashInfo = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce flash info ?')) return;

    try {
      await api.delete(`/flash-info/${id}`);
      toast.success('Flash info supprimé');
      loadFlashInfos();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      await api.patch(`/flash-info/${id}`, { isActive: !currentStatus });
      toast.success(currentStatus ? 'Flash info désactivé' : 'Flash info activé');
      loadFlashInfos();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const openModal = (flashInfo = null) => {
    if (flashInfo) {
      setEditingFlash(flashInfo);
      setFormData({
        title: flashInfo.title,
        content: flashInfo.content,
        priority: flashInfo.priority,
        link: flashInfo.link || '',
        isActive: flashInfo.isActive,
        expiresAt: flashInfo.expiresAt ? new Date(flashInfo.expiresAt).toISOString().slice(0, 16) : ''
      });
    } else {
      setEditingFlash(null);
      setFormData({
        title: '',
        content: '',
        priority: 'MEDIUM',
        link: '',
        isActive: true,
        expiresAt: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingFlash(null);
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
      HIGH: { className: 'bg-danger', icon: <FaExclamationCircle />, text: 'Haute' },
      MEDIUM: { className: 'bg-warning', icon: <FaExclamationTriangle />, text: 'Moyenne' },
      LOW: { className: 'bg-info', icon: <FaInfoCircle />, text: 'Basse' }
    };
    const badge = badges[priority] || badges.MEDIUM;
    return (
      <span className={`badge ${badge.className} d-flex align-items-center gap-1`}>
        {badge.icon} {badge.text}
      </span>
    );
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
        <h2>⚡ Flash Infos</h2>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <FaPlus className="me-2" />
          Nouveau Flash Info
        </button>
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
              className={`btn ${filter === 'active' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('active')}
            >
              Actifs
            </button>
            <button
              className={`btn ${filter === 'inactive' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('inactive')}
            >
              Inactifs
            </button>
          </div>
        </div>
      </div>

      {/* Liste des flash infos */}
      <div className="row">
        {flashInfos.map(flash => (
          <div key={flash.id} className="col-12 mb-3">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-3 mb-2">
                      <h5 className="mb-0">
                        <FaBolt className="text-warning me-2" />
                        {flash.title}
                      </h5>
                      {getPriorityBadge(flash.priority)}
                      {flash.isActive ? (
                        <span className="badge bg-success">Actif</span>
                      ) : (
                        <span className="badge bg-secondary">Inactif</span>
                      )}
                    </div>
                    <p className="text-muted mb-2">{flash.content}</p>
                    {flash.link && (
                      <a href={flash.link} target="_blank" rel="noopener noreferrer" className="small text-primary">
                        🔗 {flash.link}
                      </a>
                    )}
                    <div className="small text-muted mt-2">
                      {flash.expiresAt && (
                        <span>Expire le: {new Date(flash.expiresAt).toLocaleString('fr-FR')}</span>
                      )}
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => openModal(flash)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className={`btn btn-sm ${flash.isActive ? 'btn-warning' : 'btn-success'}`}
                      onClick={() => toggleActive(flash.id, flash.isActive)}
                    >
                      {flash.isActive ? <FaToggleOff /> : <FaToggleOn />}
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => deleteFlashInfo(flash.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {flashInfos.length === 0 && (
        <div className="text-center text-muted py-5">
          <FaBolt size={48} className="mb-3 opacity-50" />
          <p>Aucun flash info trouvé</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingFlash ? 'Modifier le flash info' : 'Nouveau flash info'}
                </h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Titre *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      maxLength="200"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Contenu *</label>
                    <textarea
                      className="form-control"
                      name="content"
                      value={formData.content}
                      onChange={handleChange}
                      rows="4"
                      required
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Priorité</label>
                      <select
                        className="form-select"
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                      >
                        <option value="LOW">Basse</option>
                        <option value="MEDIUM">Moyenne</option>
                        <option value="HIGH">Haute</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Date d'expiration</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        name="expiresAt"
                        value={formData.expiresAt}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Lien (optionnel)</label>
                    <input
                      type="url"
                      className="form-control"
                      name="link"
                      value={formData.link}
                      onChange={handleChange}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="isActive">
                      Activer immédiatement
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingFlash ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashInfo;
