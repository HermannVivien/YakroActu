import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import './Layout.css';

const Layout = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>News App</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/" className="nav-item">
            <span>📊</span> Dashboard
          </Link>
          
          <div className="nav-section-title">Gestion des Actualités</div>
          <Link to="/categories" className="nav-item">
            <span>🏷️</span> Catégories
          </Link>
          <Link to="/subcategories" className="nav-item">
            <span>📁</span> Sous-catégories
          </Link>
          <Link to="/tags" className="nav-item">
            <span>🔖</span> Mots-clés
          </Link>
          <Link to="/articles" className="nav-item">
            <span>📰</span> Actualités
          </Link>
          <Link to="/breaking-news" className="nav-item">
            <span>⚡</span> Flash Info
          </Link>
          <Link to="/authors" className="nav-item">
            <span>✍️</span> Auteurs
          </Link>
          <Link to="/live-streaming" className="nav-item">
            <span>📹</span> Direct (Live)
          </Link>
          <Link to="/rss-feeds" className="nav-item">
            <span>📡</span> Flux RSS
          </Link>
          
          <div className="nav-section-title">Gestion de l'Écran d'Accueil</div>
          <Link to="/featured-sections" className="nav-item">
            <span>⭐</span> Sections en Vedette
          </Link>
          <Link to="/ad-spaces" className="nav-item">
            <span>📢</span> Espaces Publicitaires
          </Link>
          <Link to="/media" className="nav-item">
            <span>🖼️</span> Gestion des Médias
          </Link>
          
          <div className="nav-section-title">Gestion de l'Application Mobile</div>
          <Link to="/app-versions" className="nav-item">
            <span>📱</span> Versions de l'App
          </Link>
          <Link to="/push-notifications" className="nav-item">
            <span>🔔</span> Notifications Push
          </Link>
          <Link to="/banners" className="nav-item">
            <span>🎨</span> Bannières Publicitaires
          </Link>
          
          <div className="nav-section-title">Gestion des Utilisateurs</div>
          <Link to="/users" className="nav-item">
            <span>👤</span> Utilisateurs
          </Link>
          <Link to="/comments" className="nav-item">
            <span>💬</span> Commentaires
          </Link>
          <Link to="/comment-flags" className="nav-item">
            <span>🚩</span> Signalements
          </Link>
          <Link to="/surveys" className="nav-item">
            <span>📊</span> Sondages
          </Link>
          
          <div className="nav-section-title">Module Sport</div>
          <Link to="/sport-config" className="nav-item">
            <span>⚽</span> Configuration API Sport
          </Link>
          
          <div className="nav-section-title">Contenus Enrichis</div>
          <Link to="/reportages" className="nav-item">
            <span>📝</span> Reportages
          </Link>
          <Link to="/interviews" className="nav-item">
            <span>🎤</span> Interviews
          </Link>
          <Link to="/announcements" className="nav-item">
            <span>📢</span> Annonces & Communiqués
          </Link>
          
          <div className="nav-section-title">Communauté</div>
          <Link to="/testimonies" className="nav-item">
            <span>💬</span> Témoignages
          </Link>
          <Link to="/forum-categories" className="nav-item">
            <span>📋</span> Catégories du Forum
          </Link>
          <Link to="/forum-topics" className="nav-item">
            <span>💬</span> Topics du Forum
          </Link>
          
          <div className="nav-section-title">Autres</div>
          <Link to="/pharmacies" className="nav-item">
            <span>💊</span> Pharmacies de Garde
          </Link>
          <Link to="/events" className="nav-item">
            <span>📅</span> Événements
          </Link>
          <Link to="/titrilologie" className="nav-item">
            <span>📄</span> Titrologie
          </Link>
          
          <div className="nav-section-title">Gestion du Personnel</div>
          <Link to="/roles" className="nav-item">
            <span>🎭</span> Rôles
          </Link>
          <Link to="/staff" className="nav-item">
            <span>👥</span> Personnel
          </Link>
          
          <div className="nav-section-title">Configuration Système</div>
          <Link to="/settings" className="nav-item">
            <span>⚙️</span> Paramètres Système
          </Link>
        </nav>
      </aside>

      <div className="main-content">
        <header className="header">
          <div className="header-right">
            <div className="user-info">
              <span>{user?.firstName} {user?.lastName}</span>
              <span className="user-role">{user?.role}</span>
            </div>
            <button onClick={handleLogout} className="btn btn-danger">
              Déconnexion
            </button>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
