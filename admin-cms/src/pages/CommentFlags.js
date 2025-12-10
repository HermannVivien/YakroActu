import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const CommentFlags = () => {
  const [flags, setFlags] = useState([]);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => { loadData(); }, [filter]);

  const loadData = async () => {
    try {
      const response = await api.get(`/comment-flags${filter !== 'ALL' ? `?status=${filter}` : ''}`);
      setFlags(response.data.data);
    } catch (error) { toast.error('Erreur lors du chargement'); }
  };

  const handleResolve = async (id) => {
    try {
      await api.put(`/comment-flags/${id}`, { status: 'RESOLVED' });
      toast.success('Signalement résolu');
      loadData();
    } catch (error) { toast.error('Erreur'); }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/comment-flags/${id}`, { status: 'REJECTED' });
      toast.success('Signalement rejeté');
      loadData();
    } catch (error) { toast.error('Erreur'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce signalement?')) return;
    try {
      await api.delete(`/comment-flags/${id}`);
      toast.success('Signalement supprimé');
      loadData();
    } catch (error) { toast.error('Erreur'); }
  };

  const getStatusBadge = (status) => {
    const badges = { PENDING: 'badge-warning', RESOLVED: 'badge-success', REJECTED: 'badge-danger' };
    return <span className={`badge ${badges[status]}`}>{status}</span>;
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>🚩 Signalements de Commentaires</h1>
        <div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="form-control" style={{width: 'auto', display: 'inline-block'}}>
            <option value="ALL">Tous</option>
            <option value="PENDING">En attente</option>
            <option value="RESOLVED">Résolus</option>
            <option value="REJECTED">Rejetés</option>
          </select>
        </div>
      </div>
      <div className="card">
        <table className="table">
          <thead><tr><th>Raison</th><th>Commentaire</th><th>Statut</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {flags.map((flag) => (
              <tr key={flag.id}>
                <td><strong>{flag.reason}</strong></td>
                <td>{flag.comment?.content?.substring(0, 80) || '-'}</td>
                <td>{getStatusBadge(flag.status)}</td>
                <td>{new Date(flag.createdAt).toLocaleDateString('fr-FR')}</td>
                <td>
                  {flag.status === 'PENDING' && (
                    <>
                      <button onClick={() => handleResolve(flag.id)} className="btn btn-sm btn-success">✓ Résoudre</button>
                      <button onClick={() => handleReject(flag.id)} className="btn btn-sm btn-warning">✗ Rejeter</button>
                    </>
                  )}
                  <button onClick={() => handleDelete(flag.id)} className="btn btn-sm btn-danger">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CommentFlags;
