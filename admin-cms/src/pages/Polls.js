import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaPoll, FaChartBar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Polls = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadPolls();
  }, []);

  const loadPolls = async () => {
    try {
      setLoading(true);
      const response = await api.get('/polls');
      setPolls(response.data.data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des sondages');
    } finally {
      setLoading(false);
    }
  };

  const deletePoll = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce sondage ?')) return;

    try {
      await api.delete(`/polls/${id}`);
      toast.success('Sondage supprimé');
      loadPolls();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      await api.patch(`/polls/${id}`, { 
        isActive: !currentStatus 
      });
      toast.success(currentStatus ? 'Sondage désactivé' : 'Sondage activé');
      loadPolls();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const getTotalVotes = (options) => {
    if (!options || !Array.isArray(options)) return 0;
    return options.reduce((sum, opt) => sum + (opt.votes || 0), 0);
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
        <h2>📊 Gestion des Sondages</h2>
        <button className="btn btn-primary" onClick={() => navigate('/polls/new')}>
          <FaPlus className="me-2" />
          Nouveau Sondage
        </button>
      </div>

      <div className="row g-4">
        {polls.length === 0 ? (
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center py-5 text-muted">
                <FaPoll size={48} className="mb-3" />
                <p className="mb-0">Aucun sondage créé</p>
                <button className="btn btn-primary mt-3" onClick={() => navigate('/polls/new')}>
                  Créer le premier sondage
                </button>
              </div>
            </div>
          </div>
        ) : (
          polls.map((poll) => (
            <div key={poll.id} className="col-md-6 col-lg-4">
              <div className="card h-100">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <strong className="text-truncate">{poll.question}</strong>
                  <button
                    className={`btn btn-sm ${poll.isActive ? 'btn-success' : 'btn-secondary'}`}
                    onClick={() => toggleActive(poll.id, poll.isActive)}
                  >
                    {poll.isActive ? 'Actif' : 'Inactif'}
                  </button>
                </div>
                <div className="card-body">
                  {poll.description && (
                    <p className="small text-muted mb-3">{poll.description}</p>
                  )}

                  {/* Options du sondage */}
                  <div className="mb-3">
                    {poll.options && poll.options.map((option, index) => {
                      const totalVotes = getTotalVotes(poll.options);
                      const percentage = totalVotes > 0 
                        ? Math.round((option.votes / totalVotes) * 100) 
                        : 0;

                      return (
                        <div key={index} className="mb-2">
                          <div className="d-flex justify-content-between small mb-1">
                            <span>{option.text}</span>
                            <span className="text-muted">{option.votes || 0} votes ({percentage}%)</span>
                          </div>
                          <div className="progress" style={{ height: '8px' }}>
                            <div 
                              className="progress-bar" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Statistiques */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <small className="text-muted">
                      <FaChartBar className="me-1" />
                      Total: {getTotalVotes(poll.options)} votes
                    </small>
                    {poll.expiresAt && (
                      <small className="text-muted">
                        Expire: {new Date(poll.expiresAt).toLocaleDateString('fr-FR')}
                      </small>
                    )}
                  </div>
                </div>

                <div className="card-footer">
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-sm btn-outline-primary flex-grow-1"
                      onClick={() => navigate(`/polls/${poll.id}/edit`)}
                    >
                      <FaEdit className="me-1" /> Modifier
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => deletePoll(poll.id)}
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

export default Polls;
