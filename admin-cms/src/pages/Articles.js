import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { articleService } from '../services/articleService';
import './Articles.css';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadArticles();
  }, [page]);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const data = await articleService.getAll({ page, limit: 10 });
      setArticles(data.articles);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      toast.error('Erreur lors du chargement des articles');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet article?')) {
      return;
    }

    try {
      await articleService.delete(id);
      toast.success('Article supprimé');
      loadArticles();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PUBLISHED: 'badge-success',
      DRAFT: 'badge-warning',
      ARCHIVED: 'badge-danger',
    };
    return badges[status] || 'badge-warning';
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="articles-page">
      <div className="page-header">
        <h1>Articles</h1>
        <Link to="/articles/new" className="btn btn-primary">
          + Nouvel Article
        </Link>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Catégorie</th>
              <th>Statut</th>
              <th>Vues</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id}>
                <td>{article.title}</td>
                <td>{article.category?.name || '-'}</td>
                <td>
                  <span className={`badge ${getStatusBadge(article.status)}`}>
                    {article.status}
                  </span>
                </td>
                <td>{article.views || 0}</td>
                <td>{new Date(article.createdAt).toLocaleDateString('fr-FR')}</td>
                <td>
                  <div className="action-buttons">
                    <Link to={`/articles/edit/${article.id}`} className="btn btn-sm btn-primary">
                      Éditer
                    </Link>
                    <button
                      onClick={() => handleDelete(article.id)}
                      className="btn btn-sm btn-danger"
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="btn"
            >
              Précédent
            </button>
            <span>
              Page {page} sur {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="btn"
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Articles;
