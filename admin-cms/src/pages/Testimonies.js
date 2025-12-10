import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import testimonyService from '../services/testimonyService';
import './Testimonies.css';

const Testimonies = () => {
  const [testimonies, setTestimonies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved
  const [showModal, setShowModal] = useState(false);
  const [selectedTestimony, setSelectedTestimony] = useState(null);

  useEffect(() => {
    loadTestimonies();
  }, [filter]);

  const loadTestimonies = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter === 'pending') params.isApproved = false;
      if (filter === 'approved') params.isApproved = true;

      const response = await testimonyService.getAll(params);
      setTestimonies(response.data.data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await testimonyService.approve(id);
      toast.success('Témoignage approuvé');
      loadTestimonies();
    } catch (error) {
      toast.error('Erreur lors de l\'approbation');
    }
  };

  const handleReject = async (id) => {
    if (window.confirm('Rejeter ce témoignage ?')) {
      try {
        await testimonyService.reject(id);
        toast.success('Témoignage rejeté');
        loadTestimonies();
      } catch (error) {
        toast.error('Erreur lors du rejet');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer définitivement ?')) {
      try {
        await testimonyService.delete(id);
        toast.success('Témoignage supprimé');
        loadTestimonies();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const viewDetails = (testimony) => {
    setSelectedTestimony(testimony);
    setShowModal(true);
  };

  return (
    <div className="testimonies-container">
      <div className="page-header">
        <h1>💬 Témoignages</h1>
        <div className="filter-buttons">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            Tous
          </button>
          <button 
            className={filter === 'pending' ? 'active' : ''}
            onClick={() => setFilter('pending')}
          >
            En attente
          </button>
          <button 
            className={filter === 'approved' ? 'active' : ''}
            onClick={() => setFilter('approved')}
          >
            Approuvés
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Chargement...</div>
      ) : (
        <div className="testimonies-grid">
          {testimonies.map((testimony) => (
            <div key={testimony.id} className="testimony-card">
              <div className="testimony-header">
                <img 
                  src={testimony.authorPhoto || '/default-avatar.png'} 
                  alt={testimony.authorName}
                  className="author-photo"
                />
                <div>
                  <h3>{testimony.authorName}</h3>
                  <p className="author-role">{testimony.authorRole}</p>
                  <p className="location">{testimony.location}</p>
                </div>
                <div className="rating">
                  {'⭐'.repeat(testimony.rating || 5)}
                </div>
              </div>

              <h4 className="testimony-title">{testimony.title}</h4>
              <p className="testimony-excerpt">
                {testimony.content.substring(0, 150)}...
              </p>

              <div className="testimony-footer">
                <div className="status-badges">
                  {testimony.isApproved ? (
                    <span className="badge badge-success">✓ Approuvé</span>
                  ) : (
                    <span className="badge badge-warning">En attente</span>
                  )}
                  {testimony.isPublished && (
                    <span className="badge badge-info">Publié</span>
                  )}
                </div>

                <div className="testimony-actions">
                  <button className="btn-view" onClick={() => viewDetails(testimony)}>
                    👁️ Voir
                  </button>
                  {!testimony.isApproved && (
                    <>
                      <button className="btn-approve" onClick={() => handleApprove(testimony.id)}>
                        ✓ Approuver
                      </button>
                      <button className="btn-reject" onClick={() => handleReject(testimony.id)}>
                        ✗ Rejeter
                      </button>
                    </>
                  )}
                  <button className="btn-delete" onClick={() => handleDelete(testimony.id)}>
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {testimonies.length === 0 && !loading && (
        <div className="empty-state">
          <p>Aucun témoignage</p>
        </div>
      )}

      {showModal && selectedTestimony && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content testimony-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedTestimony.title}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            
            <div className="modal-body">
              <div className="author-info">
                <img src={selectedTestimony.authorPhoto || '/default-avatar.png'} alt={selectedTestimony.authorName} />
                <div>
                  <h3>{selectedTestimony.authorName}</h3>
                  <p>{selectedTestimony.authorRole}</p>
                  <p>{selectedTestimony.location}</p>
                  <div className="rating">{'⭐'.repeat(selectedTestimony.rating || 5)}</div>
                </div>
              </div>
              
              <div className="testimony-full-content">
                <p>{selectedTestimony.content}</p>
              </div>

              {selectedTestimony.category && (
                <p><strong>Catégorie:</strong> {selectedTestimony.category.name}</p>
              )}
              
              <div className="testimony-meta">
                <p><strong>Créé le:</strong> {new Date(selectedTestimony.createdAt).toLocaleString('fr-FR')}</p>
                {selectedTestimony.approvedAt && (
                  <p><strong>Approuvé le:</strong> {new Date(selectedTestimony.approvedAt).toLocaleString('fr-FR')}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Testimonies;
