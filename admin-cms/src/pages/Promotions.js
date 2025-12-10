import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaBullhorn } from 'react-icons/fa';

const Promotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    link: '',
    startDate: '',
    endDate: '',
    isActive: true
  });

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/promotions');
      setPromotions(response.data.data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des promotions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingPromo) {
        await api.put(`/promotions/${editingPromo.id}`, formData);
        toast.success('Promotion mise à jour');
      } else {
        await api.post('/promotions', formData);
        toast.success('Promotion créée');
      }
      closeModal();
      loadPromotions();
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const deletePromotion = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette promotion ?')) return;

    try {
      await api.delete(`/promotions/${id}`);
      toast.success('Promotion supprimée');
      loadPromotions();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const openModal = (promo = null) => {
    if (promo) {
      setEditingPromo(promo);
      setFormData({
        title: promo.title,
        description: promo.description || '',
        image: promo.image || '',
        link: promo.link || '',
        startDate: promo.startDate?.split('T')[0] || '',
        endDate: promo.endDate?.split('T')[0] || '',
        isActive: promo.isActive
      });
    } else {
      setEditingPromo(null);
      setFormData({
        title: '',
        description: '',
        image: '',
        link: '',
        startDate: '',
        endDate: '',
        isActive: true
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPromo(null);
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
        <h2>📢 Gestion des Promotions & Annonces</h2>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <FaPlus className="me-2" />
          Nouvelle Promotion
        </button>
      </div>

      <div className="row g-4">
        {promotions.length === 0 ? (
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center py-5 text-muted">
                <FaBullhorn size={48} className="mb-3" />
                <p className="mb-0">Aucune promotion créée</p>
              </div>
            </div>
          </div>
        ) : (
          promotions.map((promo) => (
            <div key={promo.id} className="col-md-6 col-lg-4">
              <div className="card h-100">
                {promo.image && (
                  <img 
                    src={promo.image} 
                    className="card-img-top" 
                    alt={promo.title}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                )}
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title">{promo.title}</h5>
                    <span className={`badge ${promo.isActive ? 'bg-success' : 'bg-secondary'}`}>
                      {promo.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="card-text text-muted small">
                    {promo.description}
                  </p>
                  {promo.link && (
                    <a href={promo.link} target="_blank" rel="noopener noreferrer" className="small">
                      Voir le lien →
                    </a>
                  )}
                  <div className="mt-3">
                    <small className="text-muted">
                      <strong>Début:</strong> {promo.startDate ? new Date(promo.startDate).toLocaleDateString('fr-FR') : 'N/A'}
                      <br />
                      <strong>Fin:</strong> {promo.endDate ? new Date(promo.endDate).toLocaleDateString('fr-FR') : 'N/A'}
                    </small>
                  </div>
                </div>
                <div className="card-footer">
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-sm btn-outline-primary flex-grow-1"
                      onClick={() => openModal(promo)}
                    >
                      <FaEdit className="me-1" /> Modifier
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => deletePromotion(promo.id)}
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

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingPromo ? 'Modifier la promotion' : 'Nouvelle promotion'}
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
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Image URL</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.image}
                      onChange={(e) => setFormData({...formData, image: e.target.value})}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Lien externe</label>
                    <input
                      type="url"
                      className="form-control"
                      value={formData.link}
                      onChange={(e) => setFormData({...formData, link: e.target.value})}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Date de début</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.startDate}
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Date de fin</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.endDate}
                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    />
                    <label className="form-check-label" htmlFor="isActive">
                      Promotion active
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingPromo ? 'Mettre à jour' : 'Créer'}
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

export default Promotions;
