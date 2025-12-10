import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { surveyService } from '../services/surveyService';

const Surveys = () => {
  const [surveys, setSurveys] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', isActive: true });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const data = await surveyService.getAll();
      setSurveys(data);
    } catch (error) { toast.error('Erreur lors du chargement'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await surveyService.update(editingItem.id, formData);
        toast.success('Sondage mis à jour');
      } else {
        await surveyService.create(formData);
        toast.success('Sondage créé');
      }
      setShowModal(false);
      setFormData({ title: '', description: '', isActive: true });
      setEditingItem(null);
      loadData();
    } catch (error) { toast.error('Erreur'); }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ title: item.title, description: item.description || '', isActive: item.isActive });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce sondage?')) return;
    try {
      await surveyService.delete(id);
      toast.success('Sondage supprimé');
      loadData();
    } catch (error) { toast.error('Erreur'); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>📊 Sondages</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">+ Nouveau Sondage</button>
      </div>
      <div className="card">
        <table className="table">
          <thead><tr><th>Titre</th><th>Statut</th><th>Réponses</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {surveys.map((item) => (
              <tr key={item.id}>
                <td><strong>{item.title}</strong></td>
                <td>{item.isActive ? <span className="badge badge-success">Actif</span> : <span className="badge badge-secondary">Fermé</span>}</td>
                <td>{item.responses?.length || 0}</td>
                <td>{new Date(item.createdAt).toLocaleDateString('fr-FR')}</td>
                <td>
                  <button onClick={() => handleEdit(item)} className="btn btn-sm btn-primary">✏️</button>
                  <button onClick={() => handleDelete(item.id)} className="btn btn-sm btn-danger">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingItem ? 'Modifier' : 'Nouveau'} Sondage</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Titre *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
                  <span>Actif</span>
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Annuler</button>
                <button type="submit" className="btn btn-primary">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Surveys;
