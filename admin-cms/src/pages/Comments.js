import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

const Comments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected

  useEffect(() => {
    loadComments();
  }, [filter]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/comments', {
        params: { status: filter !== 'all' ? filter : undefined }
      });
      setComments(response.data.data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des commentaires');
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) return;

    try {
      await api.delete(`/comments/${id}`);
      toast.success('Commentaire supprimé');
      loadComments();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const approveComment = async (id) => {
    try {
      await api.patch(`/comments/${id}/approve`);
      toast.success('Commentaire approuvé');
      loadComments();
    } catch (error) {
      toast.error('Erreur lors de l\'approbation');
    }
  };

  const rejectComment = async (id) => {
    try {
      await api.patch(`/comments/${id}/reject`);
      toast.success('Commentaire rejeté');
      loadComments();
    } catch (error) {
      toast.error('Erreur lors du rejet');
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
        <h2>💬 Gestion des Commentaires</h2>
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
              className={`btn ${filter === 'pending' ? 'btn-warning' : 'btn-outline-warning'}`}
              onClick={() => setFilter('pending')}
            >
              En attente
            </button>
            <button 
              className={`btn ${filter === 'approved' ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => setFilter('approved')}
            >
              Approuvés
            </button>
            <button 
              className={`btn ${filter === 'rejected' ? 'btn-danger' : 'btn-outline-danger'}`}
              onClick={() => setFilter('rejected')}
            >
              Rejetés
            </button>
          </div>
        </div>
      </div>

      {/* Liste des commentaires */}
      <div className="card">
        <div className="card-body">
          {comments.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <p className="mb-0">Aucun commentaire trouvé</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Auteur</th>
                    <th>Article</th>
                    <th>Commentaire</th>
                    <th>Date</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {comments.map((comment) => (
                    <tr key={comment.id}>
                      <td>
                        <strong>{comment.user?.firstName} {comment.user?.lastName}</strong>
                        <br />
                        <small className="text-muted">{comment.user?.email}</small>
                      </td>
                      <td>
                        <a href={`/articles/${comment.article?.id}`} className="text-decoration-none">
                          {comment.article?.title?.substring(0, 50)}...
                        </a>
                      </td>
                      <td>
                        <div style={{ maxWidth: '300px' }}>
                          {comment.content.substring(0, 100)}
                          {comment.content.length > 100 && '...'}
                        </div>
                      </td>
                      <td>
                        <small>{new Date(comment.createdAt).toLocaleDateString('fr-FR')}</small>
                      </td>
                      <td>
                        <span className={`badge ${
                          comment.status === 'approved' ? 'bg-success' :
                          comment.status === 'rejected' ? 'bg-danger' :
                          'bg-warning'
                        }`}>
                          {comment.status === 'approved' ? 'Approuvé' :
                           comment.status === 'rejected' ? 'Rejeté' :
                           'En attente'}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          {comment.status !== 'approved' && (
                            <button 
                              className="btn btn-success"
                              onClick={() => approveComment(comment.id)}
                              title="Approuver"
                            >
                              <FaCheck />
                            </button>
                          )}
                          {comment.status !== 'rejected' && (
                            <button 
                              className="btn btn-warning"
                              onClick={() => rejectComment(comment.id)}
                              title="Rejeter"
                            >
                              <FaTimes />
                            </button>
                          )}
                          <button 
                            className="btn btn-danger"
                            onClick={() => deleteComment(comment.id)}
                            title="Supprimer"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Comments;
