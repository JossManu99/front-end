import React, { useEffect, useState } from 'react';
import {
  getUsersService,
  deleteUserService,
} from '../../services/authService';
import styles from './UsersList.module.css';
import Menu from '../../components/header/DashboardHeader';
import das from '../header/Dashboard.module.css';
import FormRegister from '../auth/FormRegister';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [editingId, setEditingId] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', surname: '', nick: '', email: '', password: '', role: '' });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const result = await getUsersService();
      if (result.status === 'success') {
        console.log('Usuarios cargados:', result.users);
        setUsers(result.users);
      }
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId, userName) => {
    if (window.confirm(`¿Está seguro de eliminar al usuario ${userName}?`)) {
      try {
        const result = await deleteUserService(userId);
        if (result.status === 'success') {
          setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
          alert('Usuario eliminado exitosamente');
        }
      } catch (error) {
        console.error('Error al eliminar el usuario:', error);
        alert('Error al eliminar usuario. Intente de nuevo más tarde.');
      }
    }
  };

  const handleEdit = (user) => {
    setEditingId(user._id);
    setFormData({
      name: user.name || '',
      surname: user.surname || '',
      nick: user.nick || '',
      email: user.email || '',
      password: '',
      role: user.role || 'user',
    });
    setShowEditForm(true);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const filteredUsers = users
    .filter((user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.surname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.nick.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      const aValue = a[sortConfig.key]?.toLowerCase?.() || '';
      const bValue = b[sortConfig.key]?.toLowerCase?.() || '';
      if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });

  const getSortIcon = (name) => {
    if (sortConfig.key !== name) return '↕️';
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.mainContainer}>
      <div className={das.menuContainer}>
        <Menu />
      </div>

      {showEditForm ? (
        <FormRegister 
          initialData={formData} 
          onCancel={() => setShowEditForm(false)} 
          editingId={editingId} 
          refreshUsers={fetchUsers} 
        />
      ) : (
        <div className={styles.container}>
          <h2 className={styles.title}>Gestión de Usuarios</h2>

          <div className={styles.toolBar}>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Buscar usuario..."
                value={searchTerm}
                onChange={handleSearch}
                className={styles.searchInput}
              />
              {searchTerm && (
                <button className={styles.clearSearch} onClick={() => setSearchTerm('')} title="Limpiar búsqueda">
                  ×
                </button>
              )}
            </div>
            <button className={`${styles.button} ${styles.refresh}`} onClick={fetchUsers} title="Actualizar lista">
              Actualizar
            </button>
          </div>

          {filteredUsers.length > 0 ? (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th onClick={() => requestSort('name')}>Nombre {getSortIcon('name')}</th>
                    <th onClick={() => requestSort('surname')}>Apellido {getSortIcon('surname')}</th>
                    <th onClick={() => requestSort('nick')}>Nick {getSortIcon('nick')}</th>
                    <th onClick={() => requestSort('email')}>Email {getSortIcon('email')}</th>
                    <th onClick={() => requestSort('role')}>Rol {getSortIcon('role')}</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.surname || '-'}</td>
                      <td>{user.nick}</td>
                      <td>{user.email}</td>
                      <td>{user.role?.trim() || '-'}</td>
                      <td className={styles.actions}>
                        <button className={styles.button} onClick={() => handleEdit(user)} title="Editar usuario">
                          Editar
                        </button>
                        <button className={`${styles.button} ${styles.delete}`} onClick={() => handleDelete(user._id, user.name)} title="Eliminar usuario">
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.noResults}>
              <p>No se encontraron usuarios{searchTerm ? ` con la búsqueda: ${searchTerm}` : '.'}</p>
              {searchTerm && <button className={styles.button} onClick={() => setSearchTerm('')}>Limpiar filtro</button>}
            </div>
          )}

          <div className={styles.pagination}>
            <p className={styles.totalCount}>Total: {filteredUsers.length} usuario(s)</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;