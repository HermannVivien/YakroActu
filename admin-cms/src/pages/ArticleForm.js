import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { articleService } from '../services/articleService';
import { categoryService } from '../services/categoryService';
import './ArticleForm.css';

const ArticleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    categoryId: '',
    status: 'DRAFT',
    featuredImage: '',
    isBreaking: false,
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadCategories();
    if (isEdit) {
      loadArticle();
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des catégories');
    }
  };

  const loadArticle = async () => {
    try {
      const article = await articleService.getById(id);
      setFormData({
        title: article.title,
        content: article.content,
        excerpt: article.excerpt || '',
        categoryId: article.categoryId,
        status: article.status,
        featuredImage: article.featuredImage || '',
        isBreaking: article.isBreaking || false,
      });
    } catch (error) {
      toast.error('Erreur lors du chargement de l\'article');
      navigate('/articles');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await articleService.uploadImage(file);
      setFormData({ ...formData, featuredImage: url });
      toast.success('Image uploadée');
    } catch (error) {
      toast.error('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        categoryId: parseInt(formData.categoryId),
      };

      if (isEdit) {
        await articleService.update(id, data);
        toast.success('Article mis à jour');
      } else {
        await articleService.create(data);
        toast.success('Article créé');
      }
      navigate('/articles');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="article-form-page">
      <div className="page-header">
        <h1>{isEdit ? 'Éditer l\'article' : 'Nouvel article'}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="form-group">
            <label>Titre *</label>
            <input
              type="text"
              name="title"
              className="form-control"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Résumé</label>
            <textarea
              name="excerpt"
              className="form-control"
              rows="3"
              value={formData.excerpt}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Contenu *</label>
            <ReactQuill
              theme="snow"
              value={formData.content}
              onChange={(value) => setFormData({ ...formData, content: value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Catégorie *</label>
              <select
                name="categoryId"
                className="form-control"
                value={formData.categoryId}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionner...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Statut</label>
              <select
                name="status"
                className="form-control"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="DRAFT">Brouillon</option>
                <option value="PUBLISHED">Publié</option>
                <option value="ARCHIVED">Archivé</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Image mise en avant</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
            />
            {formData.featuredImage && (
              <img
                src={formData.featuredImage}
                alt="Preview"
                className="image-preview"
              />
            )}
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isBreaking"
                checked={formData.isBreaking}
                onChange={handleChange}
              />
              <span>Breaking News</span>
            </label>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/articles')}
            >
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ArticleForm;
