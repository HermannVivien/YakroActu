import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { authorService } from '../services/authorService';

const Authors = () => {
  const [authors, setAuthors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', bio: '', avatar: '', email: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const data = await authorService.getAll();
      setAuthors(data);
    } catch (error) { toast.error('Erreur lors du chargement'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await authorService.update(editingItem.id, formData);
        toast.success('Auteur mis à jour');
      } else {
        await authorService.create(formData);
        toast.success('Auteur créé');
      }
      setShowModal(false);
      setFormData({ name: '', bio: '', avatar: '', email: '' });
      setEditingItem(null);
      loadData();
    } catch (error) { toast.error('Erreur'); }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ name: item.name, bio: item.bio || '', avatar: item.avatar || '', email: item.email || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet auteur?')) return;
    try {
      await authorService.delete(id);
      toast.success('Auteur supprimé');
      loadData();
    } catch (error) { toast.error('Erreur'); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>✍️ Auteurs</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">+ Nouvel Auteur</button>
      </div>
      <div className="card">
        <table className="table">
          <thead><tr><th>Nom</th><th>Email</th><th>Bio</th><th>Actions</th></tr></thead>
          <tbody>
            {authors.map((item) => (
              <tr key={item.id}>
                <td>
                  {item.avatar && <img src={item.avatar} alt="" style={{width:40,height:40,borderRadius:'50%',marginRight:10}} />}
                  <strong>{item.name}</strong>
                </td>
                <td>{item.email}</td>
                <td>{item.bio ? item.bio.substring(0, 80) + '...' : '-'}</td>
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
            <h2>{editingItem ? 'Modifier' : 'Nouvel'} Auteur</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nom *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>URL Avatar</label>
                <input type="url" value={formData.avatar} onChange={(e) => setFormData({ ...formData, avatar: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Biographie</label>
                <textarea rows="3" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} />
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

export default Authors;
