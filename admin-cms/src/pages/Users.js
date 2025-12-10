import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FaUserShield, FaUser, FaPen, FaBan, FaCheckCircle, FaTrash, FaSearch } from 'react-icons/fa';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('all'); // all, ADMIN, JOURNALIST, USER
  const [filterStatus, setFilterStatus] = useState('all'); // all, ACTIVE, SUSPENDED, PENDING
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, [filterRole, filterStatus]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterRole !== 'all') params.role = filterRole;
      if (filterStatus !== 'all') params.status = filterStatus;
      if (searchTerm) params.search = searchTerm;
      
      const response = await api.get('/users', { params });
      setUsers(response.data.data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadUsers();
  };

  const updateUserRole = async (userId, newRole) => {
    if (!window.confirm(`Changer le rôle en ${newRole} ?`)) return;

    try {
      await api.patch(`/users/${userId}`, { role: newRole });
      toast.success('Rôle mis à jour');
      loadUsers();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du rôle');
    }
  };

  const updateUserStatus = async (userId, newStatus) => {
    if (!window.confirm(`Changer le statut en ${newStatus} ?`)) return;

    try {
      await api.patch(`/users/${userId}`, { status: newStatus });
      toast.success('Statut mis à jour');
      loadUsers();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) return;

    try {
      await api.delete(`/users/${userId}`);
      toast.success('Utilisateur supprimé');
      loadUsers();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      ADMIN: { className: 'bg-danger', icon: <FaUserShield />, text: 'Admin' },
      JOURNALIST: { className: 'bg-primary', icon: <FaPen />, text: 'Journaliste' },
      USER: { className: 'bg-secondary', icon: <FaUser />, text: 'Utilisateur' }
    };
    const badge = badges[role] || badges.USER;
    return (
      <span className={`badge ${badge.className} d-flex align-items-center gap-1`}>
        {badge.icon} {badge.text}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const badges = {
      ACTIVE: { className: 'bg-success', text: 'Actif' },
      SUSPENDED: { className: 'bg-warning', text: 'Suspendu' },
      PENDING: { className: 'bg-info', text: 'En attente' }
    };
    const badge = badges[status] || badges.PENDING;
    return <span className={`badge ${badge.className}`}>{badge.text}</span>;
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
        <h2>👥 Gestion des Utilisateurs</h2>
      </div>

      {/* Filtres et Recherche */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <form onSubmit={handleSearch}>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Rechercher par nom ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button className="btn btn-outline-primary" type="submit">
                    <FaSearch />
                  </button>
                </div>
              </form>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="all">Tous les rôles</option>
                <option value="ADMIN">Administrateurs</option>
                <option value="JOURNALIST">Journalistes</option>
                <option value="USER">Utilisateurs</option>
              </select>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Tous les statuts</option>
                <option value="ACTIVE">Actifs</option>
                <option value="SUSPENDED">Suspendus</option>
                <option value="PENDING">En attente</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table des utilisateurs */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Utilisateur</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Statistiques</th>
                  <th>Inscription</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={`${user.firstName} ${user.lastName}`}
                            className="rounded-circle me-2"
                            style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                          />
                        ) : (
                          <div
                            className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-2"
                            style={{ width: '32px', height: '32px' }}
                          >
                            {user.firstName[0]}{user.lastName[0]}
                          </div>
                        )}
                        <span>{user.firstName} {user.lastName}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.phone || '-'}</td>
                    <td>
                      <div className="dropdown">
                        <button
                          className="btn btn-sm p-0 border-0"
                          type="button"
                          data-bs-toggle="dropdown"
                        >
                          {getRoleBadge(user.role)}
                        </button>
                        <ul className="dropdown-menu">
                          <li><a className="dropdown-item" onClick={() => updateUserRole(user.id, 'ADMIN')}>Admin</a></li>
                          <li><a className="dropdown-item" onClick={() => updateUserRole(user.id, 'JOURNALIST')}>Journaliste</a></li>
                          <li><a className="dropdown-item" onClick={() => updateUserRole(user.id, 'USER')}>Utilisateur</a></li>
                        </ul>
                      </div>
                    </td>
                    <td>{getStatusBadge(user.status)}</td>
                    <td>
                      <small className="text-muted">
                        {user._count?.articles || 0} articles<br />
                        {user._count?.comments || 0} commentaires
                      </small>
                    </td>
                    <td>
                      <small className="text-muted">
                        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                      </small>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm" role="group">
                        {user.status === 'ACTIVE' ? (
                          <button
                            className="btn btn-outline-warning"
                            onClick={() => updateUserStatus(user.id, 'SUSPENDED')}
                            title="Suspendre"
                          >
                            <FaBan />
                          </button>
                        ) : (
                          <button
                            className="btn btn-outline-success"
                            onClick={() => updateUserStatus(user.id, 'ACTIVE')}
                            title="Activer"
                          >
                            <FaCheckCircle />
                          </button>
                        )}
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => deleteUser(user.id)}
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

          {users.length === 0 && (
            <div className="text-center text-muted py-5">
              <FaUser size={48} className="mb-3 opacity-50" />
              <p>Aucun utilisateur trouvé</p>
            </div>
          )}
        </div>
      </div>

      {/* Statistiques */}
      <div className="row mt-4">
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-primary">{users.length}</h3>
              <p className="text-muted mb-0">Total Utilisateurs</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-danger">{users.filter(u => u.role === 'ADMIN').length}</h3>
              <p className="text-muted mb-0">Administrateurs</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-primary">{users.filter(u => u.role === 'JOURNALIST').length}</h3>
              <p className="text-muted mb-0">Journalistes</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-success">{users.filter(u => u.status === 'ACTIVE').length}</h3>
              <p className="text-muted mb-0">Actifs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
