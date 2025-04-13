import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { getUsersService, deleteUserService } from '../../services/authService';
import styles from './UsersList.module.css';
import Menu from '../../components/header/DashboardHeader';
import das from '../header/Dashboard.module.css';
import FormRegister from '../auth/FormRegister';

// Importamos las librerías para PDF
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  
  // Para controlar el formulario de edición
  const [editingId, setEditingId] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    nick: '',
    email: '',
    password: '',
    role: ''
  });

  // Nuevo estado para deshabilitar los botones de exportación mientras se generan los archivos
  const [isExporting, setIsExporting] = useState(false);

  // Cargar la lista de usuarios al montar
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const result = await getUsersService();
      if (result.status === 'success') {
        setUsers(result.users);
      }
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId, userName) => {
    if (window.confirm(`¿Está seguro de eliminar al usuario ${userName}?`)) {
      try {
        const result = await deleteUserService(userId);
        if (result.status === 'success') {
          setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
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
      role: user.role || 'user'
    });
    setShowEditForm(true);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Ordenar las filas según la clave
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Flechitas de orden
  const getSortIcon = (name) => {
    if (sortConfig.key !== name) return '↕️';
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };

  // Filtrado y ordenado
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

  /**
   * Función para exportar a Excel.
   * Se inhabilitan los botones al iniciar y se habilitan cuando termina.
   */
  const exportToExcel = () => {
    try {
      setIsExporting(true); // Deshabilita botones
      const wsData = filteredUsers.map((user) => ({
        'Nombre': user.name || '',
        'Apellido': user.surname || '',
        'Nick': user.nick || '',
        'Correo electrónico': user.email || '',
        'Rol': user.role || ''
      }));
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');
      XLSX.writeFile(wb, 'ListadoUsuarios.xlsx');
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
    } finally {
      setIsExporting(false); // Habilita botones nuevamente
    }
  };

  /**
   * Función para descargar PDF usando html2canvas y jsPDF.
   * Se inhabilitan los botones al iniciar y se habilitan cuando termina.
   */
  const handleDownloadPDF = () => {
    setIsExporting(true); // Deshabilita botones
    const input = document.getElementById('pdfContent');
    if (!input) {
      setIsExporting(false);
      return;
    }

    html2canvas(input, { scale: 2 })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;
        }
        pdf.save('ListadoUsuarios.pdf');
      })
      .catch((error) => {
        console.error('Error al generar el PDF:', error);
      })
      .finally(() => {
        setIsExporting(false); // Habilita botones
      });
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
      {/* Menú superior (no se capturará en el PDF) */}
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
        // Este contenedor es el que se capturará en el PDF
        <div id="pdfContent" className={styles.container}>
          <h2 className={styles.title}>Gestión de usuarios</h2>

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
                <button
                  className={styles.clearSearch}
                  onClick={() => setSearchTerm('')}
                  title="Limpiar búsqueda"
                >
                  ×
                </button>
              )}
            </div>


            {/* Botón Exportar a Excel */}
            <button
              className={`${styles.button} ${styles.exportarExcel}`}
              onClick={exportToExcel}
              title="Exportar a Excel"
              disabled={isExporting}
            >
              Exportar a Excel
            </button>

            {/* Botón Descargar PDF */}
            <button
              className={`${styles.button} ${styles.imprimir}`}
              onClick={handleDownloadPDF}
              title="Descargar PDF del listado"
              disabled={isExporting}
            >
              Descargar PDF
            </button>
          </div>

          {filteredUsers.length > 0 ? (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th onClick={() => requestSort('name')}>
                      Nombre {getSortIcon('name')}
                    </th>
                    <th onClick={() => requestSort('surname')}>
                      Apellido {getSortIcon('surname')}
                    </th>
                    <th onClick={() => requestSort('nick')}>
                      Nick {getSortIcon('nick')}
                    </th>
                    <th onClick={() => requestSort('email')}>
                      Correo electrónico {getSortIcon('email')}
                    </th>
                    <th onClick={() => requestSort('role')}>
                      Rol {getSortIcon('role')}
                    </th>
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
                        <button
                          className={styles.button}
                          onClick={() => handleEdit(user)}
                          title="Editar usuario"
                          disabled={isExporting}
                        >
                          Editar
                        </button>
                        <button
                          className={`${styles.button} ${styles.delete}`}
                          onClick={() => handleDelete(user._id, user.name)}
                          title="Eliminar usuario"
                          disabled={isExporting}
                        >
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
              <p>
                No se encontraron usuarios
                {searchTerm ? ` con la búsqueda: ${searchTerm}` : '.'}
              </p>
              {searchTerm && (
                <button
                  className={styles.button}
                  onClick={() => setSearchTerm('')}
                >
                  Limpiar filtro
                </button>
              )}
            </div>
          )}

          <div className={styles.pagination}>
            <p className={styles.totalCount}>
              Total: {filteredUsers.length} usuario(s)
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;
