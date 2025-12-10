import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import forumService from '../services/forumService';
import './ForumTopics.css';

const ForumTopics = () => {
  const [topics, setTopics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadCategories();
    loadTopics();
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const response = await forumService.getAllCategories();
      setCategories(response.data.data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des catégories');
    }
  };

  const loadTopics = async () => {
    try {
      const params = selectedCategory !== 'all' ? { categoryId: selectedCategory } : {};
      const response = await forumService.getAllTopics(params);
      setTopics(response.data.data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des topics');
    }
  };

  const handleTogglePin = async (topicId, isPinned) => {
    try {
      await forumService.updateTopic(topicId, { isPinned: !isPinned });
      toast.success(isPinned ? 'Topic dépinglé' : 'Topic épinglé');
      loadTopics();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleToggleLock = async (topicId, isLocked) => {
    try {
      await forumService.updateTopic(topicId, { isLocked: !isLocked });
      toast.success(isLocked ? 'Topic déverrouillé' : 'Topic verrouillé');
      loadTopics();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer ce topic ? Tous les posts seront également supprimés.')) {
      try {
        await forumService.deleteTopic(id);
        toast.success('Topic supprimé');
        loadTopics();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  return (
    <div className="forum-topics-container">
      <div className="page-header">
        <h1>💬 Topics du Forum</h1>
        <select 
          className="category-filter"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="all">Toutes les catégories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
          ))}
        </select>
      </div>

      <div className="topics-list">
        <div className="topics-header">
          <div>Topic</div>
          <div>Auteur</div>
          <div>Réponses</div>
          <div>Vues</div>
          <div>Dernier post</div>
          <div>Actions</div>
        </div>

        {topics.map((topic) => (
          <div key={topic.id} className={`topic-row ${topic.isPinned ? 'pinned' : ''}`}>
            <div className="topic-info">
              {topic.isPinned && <span className="pin-icon">📌</span>}
              {topic.isLocked && <span className="lock-icon">🔒</span>}
              <div>
                <h4>{topic.title}</h4>
                <span className="category-tag">{topic.category?.icon} {topic.category?.name}</span>
              </div>
            </div>

            <div className="topic-author">
              {topic.user?.firstName} {topic.user?.lastName}
            </div>

            <div className="topic-stats">
              {(topic.postCount || 1) - 1}
            </div>

            <div className="topic-stats">
              {topic.viewCount || 0}
            </div>

            <div className="topic-last-post">
              {topic.lastPoster && (
                <>
                  <span>{topic.lastPoster.firstName} {topic.lastPoster.lastName}</span>
                  <span className="last-post-date">
                    {new Date(topic.lastPostAt).toLocaleDateString('fr-FR')}
                  </span>
                </>
              )}
            </div>

            <div className="topic-actions">
              <button
                className={`btn-icon ${topic.isPinned ? 'active' : ''}`}
                onClick={() => handleTogglePin(topic.id, topic.isPinned)}
                title={topic.isPinned ? 'Dépingler' : 'Épingler'}
              >
                📌
              </button>
              <button
                className={`btn-icon ${topic.isLocked ? 'active' : ''}`}
                onClick={() => handleToggleLock(topic.id, topic.isLocked)}
                title={topic.isLocked ? 'Déverrouiller' : 'Verrouiller'}
              >
                🔒
              </button>
              <button
                className="btn-icon btn-delete"
                onClick={() => handleDelete(topic.id)}
                title="Supprimer"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {topics.length === 0 && (
        <div className="empty-state">
          <p>Aucun topic</p>
        </div>
      )}
    </div>
  );
};

export default ForumTopics;
