import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Vérifier si on a un token avant de charger
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Charger les statistiques depuis l'endpoint dédié
      const response = await api.get('/stats/dashboard');
      
      if (response.data.success) {
        setStats(response.data.data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      // Ne pas afficher d'erreur si c'est juste une annulation
      if (error.code !== 'ECONNABORTED' && error.code !== 'ERR_CANCELED') {
        // Afficher une erreur seulement pour les vraies erreurs
        console.error('Failed to load stats:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Tableau de bord</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📰</div>
          <div className="stat-content">
            <h3>{stats.totalArticles}</h3>
            <p>Total Articles</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.publishedArticles}</h3>
            <p>Articles Publiés</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>{stats.draftArticles}</h3>
            <p>Brouillons</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalUsers}</h3>
            <p>Utilisateurs</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Bienvenue sur YakroActu Admin</h2>
        <p>Gérez vos articles, catégories, pharmacies et utilisateurs depuis cette interface.</p>
      </div>
    </div>
  );
};

export default Dashboard;
