import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { liveStreamingService } from '../services/liveStreamingService';

const LiveStreaming = () => {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', streamUrl: '', thumbnailUrl: '', isLive: false });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const data = await liveStreamingService.getAll();
      setItems(data);
    } catch (error) { toast.error('Erreur lors du chargement'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await liveStreamingService.update(editingItem.id, formData);
        toast.success('Direct mis à jour');
      } else {
        await liveStreamingService.create(formData);
        toast.success('Direct créé');
      }
      setShowModal(false);
      setFormData({ title: '', description: '', streamUrl: '', thumbnailUrl: '', isLive: false });
      setEditingItem(null);
      loadData();
    } catch (error) { toast.error('Erreur'); }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ title: item.title, description: item.description || '', streamUrl: item.streamUrl, thumbnailUrl: item.thumbnailUrl || '', isLive: item.isLive });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce direct?')) return;
    try {
      await liveStreamingService.delete(id);
      toast.success('Direct supprimé');
      loadData();
    } catch (error) { toast.error('Erreur'); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>📹 Direct (Live Streaming)</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">+ Nouveau Direct</button>
      </div>
      <div className="card">
        <table className="table">
          <thead><tr><th>Titre</th><th>URL Stream</th><th>Statut</th><th>Vues</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  {item.thumbnailUrl && <img src={item.thumbnailUrl} alt="" style={{width:60,height:40,marginRight:10,objectFit:'cover'}} />}
                  <strong>{item.title}</strong>
                </td>
                <td><small>{item.streamUrl}</small></td>
                <td>{item.isLive ? <span className="badge badge-danger">🔴 EN DIRECT</span> : <span className="badge badge-secondary">Hors ligne</span>}</td>
                <td>{item.viewCount || 0}</td>
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
            <h2>{editingItem ? 'Modifier' : 'Nouveau'} Direct</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Titre *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>URL du Stream *</label>
                <input type="url" value={formData.streamUrl} onChange={(e) => setFormData({ ...formData, streamUrl: e.target.value })} required placeholder="https://youtube.com/watch?v=..." />
              </div>
              <div className="form-group">
                <label>URL Miniature</label>
                <input type="url" value={formData.thumbnailUrl} onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows="2" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" checked={formData.isLive} onChange={(e) => setFormData({ ...formData, isLive: e.target.checked })} />
                  <span>🔴 En direct maintenant</span>
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

export default LiveStreaming;
