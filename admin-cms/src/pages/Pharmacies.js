import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaMapMarkerAlt, FaPhone, FaClock, FaToggleOn, FaToggleOff } from 'react-icons/fa';

const Pharmacies = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPharmacy, setEditingPharmacy] = useState(null);
  const [filter, setFilter] = useState('all'); // all, onDuty
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    commune: '',
    phone: '',
    latitude: '',
    longitude: '',
    openingHours: '',
    isOnDuty: false
  });

  useEffect(() => {
    loadPharmacies();
  }, [filter]);

  const loadPharmacies = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter === 'onDuty') params.onDuty = 'true';
      
      const response = await api.get('/pharmacies', { params });
      setPharmacies(response.data.data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des pharmacies');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const dataToSend = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null
      };

      if (editingPharmacy) {
        await api.put(`/pharmacies/${editingPharmacy.id}`, dataToSend);
        toast.success('Pharmacie mise à jour');
      } else {
        await api.post('/pharmacies', dataToSend);
        toast.success('Pharmacie créée');
      }
      closeModal();
      loadPharmacies();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const deletePharmacy = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette pharmacie ?')) return;

    try {
      await api.delete(`/pharmacies/${id}`);
      toast.success('Pharmacie supprimée');
      loadPharmacies();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const toggleOnDuty = async (id, currentStatus) => {
    try {
      await api.patch(`/pharmacies/${id}`, { isOnDuty: !currentStatus });
      toast.success(currentStatus ? 'Pharmacie retirée de garde' : 'Pharmacie mise de garde');
      loadPharmacies();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const openModal = (pharmacy = null) => {
    if (pharmacy) {
      setEditingPharmacy(pharmacy);
      setFormData({
        name: pharmacy.name,
        address: pharmacy.address,
        commune: pharmacy.commune || '',
        phone: pharmacy.phone,
        latitude: pharmacy.latitude || '',
        longitude: pharmacy.longitude || '',
        openingHours: pharmacy.openingHours || '',
        isOnDuty: pharmacy.isOnDuty
      });
    } else {
      setEditingPharmacy(null);
      setFormData({
        name: '',
        address: '',
        commune: '',
        phone: '',
        latitude: '',
        longitude: '',
        openingHours: '',
        isOnDuty: false
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPharmacy(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
        <h2>💊 Pharmacies de Garde</h2>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <FaPlus className="me-2" />
          Nouvelle Pharmacie
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
              Toutes
            </button>
            <button
              className={`btn ${filter === 'onDuty' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('onDuty')}
            >
              De Garde
            </button>
          </div>
        </div>
      </div>

      {/* Liste des pharmacies */}
      <div className="row">
        {pharmacies.map(pharmacy => (
          <div key={pharmacy.id} className="col-md-6 col-lg-4 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h5 className="card-title mb-0">{pharmacy.name}</h5>
                  {pharmacy.isOnDuty && (
                    <span className="badge bg-success">De Garde</span>
                  )}
                </div>

                <div className="mb-2">
                  <FaMapMarkerAlt className="text-muted me-2" />
                  <small>{pharmacy.address}</small>
                  {pharmacy.commune && (
                    <small className="text-muted d-block ms-4">{pharmacy.commune}</small>
                  )}
                </div>

                <div className="mb-2">
                  <FaPhone className="text-muted me-2" />
                  <small>{pharmacy.phone}</small>
                </div>

                {pharmacy.openingHours && (
                  <div className="mb-3">
                    <FaClock className="text-muted me-2" />
                    <small className="text-muted">{pharmacy.openingHours}</small>
                  </div>
                )}

                <div className="d-flex gap-2 mt-3">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => openModal(pharmacy)}
                  >
                    <FaEdit className="me-1" />
                    Modifier
                  </button>
                  <button
                    className={`btn btn-sm ${pharmacy.isOnDuty ? 'btn-warning' : 'btn-success'}`}
                    onClick={() => toggleOnDuty(pharmacy.id, pharmacy.isOnDuty)}
                  >
                    {pharmacy.isOnDuty ? <FaToggleOff className="me-1" /> : <FaToggleOn className="me-1" />}
                    {pharmacy.isOnDuty ? 'Retirer' : 'Mettre'} de garde
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => deletePharmacy(pharmacy.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {pharmacies.length === 0 && (
        <div className="text-center text-muted py-5">
          <p>Aucune pharmacie trouvée</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingPharmacy ? 'Modifier la pharmacie' : 'Nouvelle pharmacie'}
                </h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-8 mb-3">
                      <label className="form-label">Nom *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Téléphone *</label>
                      <input
                        type="tel"
                        className="form-control"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-8 mb-3">
                      <label className="form-label">Adresse *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Commune</label>
                      <input
                        type="text"
                        className="form-control"
                        name="commune"
                        value={formData.commune}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        className="form-control"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleChange}
                        placeholder="Ex: 5.3599"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        className="form-control"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleChange}
                        placeholder="Ex: -4.0083"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Horaires d'ouverture</label>
                    <textarea
                      className="form-control"
                      name="openingHours"
                      value={formData.openingHours}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Ex: Lun-Ven: 8h-20h, Sam: 8h-18h, Dim: Fermé"
                    />
                  </div>

                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="isOnDuty"
                      name="isOnDuty"
                      checked={formData.isOnDuty}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="isOnDuty">
                      Pharmacie de garde
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingPharmacy ? 'Mettre à jour' : 'Créer'}
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

export default Pharmacies;
