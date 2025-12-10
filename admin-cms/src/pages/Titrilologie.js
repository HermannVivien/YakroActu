import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FaPlus, FaTrophy } from 'react-icons/fa';

const Titrilologie = () => {
  const [, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      setLoading(true);
      const response = await api.get('/titrilologie');
      setGames(response.data.data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
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
        <h2>🎯 Titrilologie - Jeux de Prédiction</h2>
        <button className="btn btn-primary">
          <FaPlus className="me-2" />
          Nouveau Jeu
        </button>
      </div>

      <div className="card">
        <div className="card-body text-center py-5 text-muted">
          <FaTrophy size={48} className="mb-3" />
          <p className="mb-0">Fonctionnalité en développement</p>
          <small>Gestion des jeux de prédiction sportifs</small>
        </div>
      </div>
    </div>
  );
};

export default Titrilologie;
