import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaCalendar, FaMapMarkerAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/events');
      setEvents(response.data.data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des événements');
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;

    try {
      await api.delete(`/events/${id}`);
      toast.success('Événement supprimé');
      loadEvents();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const togglePublish = async (id, currentStatus) => {
    try {
      await api.patch(`/events/${id}`, { 
        isPublished: !currentStatus 
      });
      toast.success(currentStatus ? 'Événement dépublié' : 'Événement publié');
      loadEvents();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
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
        <h2>📅 Gestion des Événements</h2>
        <button className="btn btn-primary" onClick={() => navigate('/events/new')}>
          <FaPlus className="me-2" />
          Nouvel Événement
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          {events.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <FaCalendar size={48} className="mb-3" />
              <p className="mb-0">Aucun événement créé</p>
              <button className="btn btn-primary mt-3" onClick={() => navigate('/events/new')}>
                Créer le premier événement
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Titre</th>
                    <th>Date & Heure</th>
                    <th>Lieu</th>
                    <th>Catégorie</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id}>
                      <td>
                        {event.coverImage ? (
                          <img 
                            src={event.coverImage} 
                            alt={event.title}
                            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                          />
                        ) : (
                          <div 
                            className="bg-secondary d-flex align-items-center justify-content-center text-white"
                            style={{ width: '60px', height: '60px', borderRadius: '8px' }}
                          >
                            <FaCalendar />
                          </div>
                        )}
                      </td>
                      <td>
                        <strong>{event.title}</strong>
                        <br />
                        <small className="text-muted">
                          {event.description?.substring(0, 60)}...
                        </small>
                      </td>
                      <td>
                        <small>
                          <strong>Début:</strong> {new Date(event.startDate).toLocaleString('fr-FR')}<br />
                          {event.endDate && (
                            <><strong>Fin:</strong> {new Date(event.endDate).toLocaleString('fr-FR')}</>
                          )}
                        </small>
                      </td>
                      <td>
                        {event.location && (
                          <small>
                            <FaMapMarkerAlt className="me-1 text-danger" />
                            {event.location}
                          </small>
                        )}
                      </td>
                      <td>
                        <span className="badge bg-info">
                          {event.category || 'Non catégorisé'}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`btn btn-sm ${event.isPublished ? 'btn-success' : 'btn-secondary'}`}
                          onClick={() => togglePublish(event.id, event.isPublished)}
                        >
                          {event.isPublished ? 'Publié' : 'Brouillon'}
                        </button>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button 
                            className="btn btn-outline-primary"
                            onClick={() => navigate(`/events/${event.id}/edit`)}
                            title="Modifier"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="btn btn-outline-danger"
                            onClick={() => deleteEvent(event.id)}
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

export default Events;
