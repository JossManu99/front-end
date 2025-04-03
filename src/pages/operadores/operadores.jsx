// src/pages/operadores/Operadores.js
import React, { useEffect, useState } from 'react';
// Remove: import axios from 'axios';   // We won't need axios directly here
import OperadorModal from '../../components/operadores/OperadorModal ';
import Menu from '../../components/header/DashboardHeader';
import das from '../../components/header/Dashboard.module.css';
import styles from './Operadores.module.css';

// Import the methods from your service
import {
  getOperadores,
  deleteOperador,
  updateOperador,
} from '../../services/OperadorService';

const Operadores = () => {
  const [operadores, setOperadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOperador, setSelectedOperador] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fecha actual (ejemplo: "abril 2025")
  const currentMonth = new Date().toLocaleString('es-ES', { month: 'long' });
  const currentYear = new Date().getFullYear();

  // Obtener operadores al montar el componente
  useEffect(() => {
    const fetchAllOperadores = async () => {
      try {
        const data = await getOperadores();
        setOperadores(data);
      } catch (err) {
        setError('Error al obtener los operadores');
        console.error('Error al obtener operadores:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllOperadores();
  }, []);

  const handleViewDetails = (operador) => {
    setSelectedOperador(operador);
  };

  const handleCloseModal = () => {
    setSelectedOperador(null);
  };

  // Eliminar operador usando la función del servicio
  const handleDelete = async (id) => {
    try {
      await deleteOperador(id);
      setOperadores((prev) => prev.filter((op) => op._id !== id));
      setSelectedOperador(null);
    } catch (err) {
      console.error('Error al eliminar operador:', err);
      setError('Error al eliminar el operador.');
    }
  };

  // Actualizar operador usando la función del servicio
  const handleUpdate = async (operadorActualizado) => {
    if (!operadorActualizado._id) return;
    try {
      // Llamamos al servicio para actualizar
      const updated = await updateOperador(
        operadorActualizado._id,
        operadorActualizado
      );

      // Actualiza el estado con los datos actualizados
      setOperadores((prev) =>
        prev.map((op) => (op._id === updated._id ? updated : op))
      );
      setSelectedOperador(null);
    } catch (err) {
      console.error('Error al actualizar operador:', err);
      setError('Error al actualizar el operador.');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filtrar según el término de búsqueda
  const filteredOperadores = operadores.filter((operador) =>
    Object.values(operador)
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Formatear fecha a "4 marzo, 2025"
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return 'N/A';
    return `${date.getDate()} ${date.toLocaleString('es-ES', { month: 'long' })}, ${date.getFullYear()}`;
  };

  // Determina el estado (vencido, por vencer, vigente, sin datos) de un documento
  const checkSpecificDocumentStatus = (dateString) => {
    if (!dateString) return 'no-data';
    const currentDate = new Date();
    const expirationDate = new Date(dateString);
    if (isNaN(expirationDate)) return 'no-data';

    const daysRemaining = Math.ceil((expirationDate - currentDate) / (1000 * 60 * 60 * 24));
    if (daysRemaining <= 0) {
      return 'expired';  // rojo
    } else if (daysRemaining <= 30) {
      return 'warning';  // amarillo
    } else {
      return 'valid';    // verde
    }
  };

  return (
    <div className={styles.mainContainer}>
      {/* Header */}
      <div className={das.menuContainer}>
        <Menu />
      </div>

      <div className={styles.operadoresPage}>
        <h1 className={styles.mainTitle}>Listado de trabajadores</h1>
        <p className={styles.currentDate}>
          {currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)} {currentYear}
        </p>

        {/* Barra de búsqueda (opcional) */}
        {/* 
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Buscar trabajador..."
            value={searchTerm}
            onChange={handleSearch}
            className={styles.searchInput}
          />
        </div>
        */}

        <div className={styles.operadoresTableContainer}>
          <table className={styles.operadoresTable}>
            <thead>
              <tr>
                <th>Información</th>
                <th>Núm. operador</th>
                <th>Observaciones</th>
                <th>Puesto</th>
                <th>Fecha de inicio</th>
                <th>Vigencia en documentos</th>
                <th>Ver más</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className={styles.loadingMessage}>
                    Cargando trabajadores...
                  </td>
                </tr>
              ) : filteredOperadores.length === 0 ? (
                <tr>
                  <td colSpan="7" className={styles.noResultsMessage}>
                    No se encontraron trabajadores.
                  </td>
                </tr>
              ) : (
                filteredOperadores.map((operador) => {
                  const examenMedicoStatus = checkSpecificDocumentStatus(
                    operador.fechaVencimientoExamenMedico
                  );
                  const tarjetonStatus = checkSpecificDocumentStatus(
                    operador.fechaVencimientoTarjeton
                  );

                  return (
                    <tr key={operador._id || operador.numeroOperador}>
                      {/* INFORMACIÓN */}
                      <td
                        className={styles.operadorInfoCell}
                        data-label="Información"
                      >
                        <div className={styles.operadorInfo}>
                          <div className={styles.avatarContainer}>
                            <img
                              src={operador.foto || '/default-avatar.png'}
                              alt={`Foto de ${operador.nombre}`}
                              className={styles.operadorAvatar}
                            />
                          </div>
                          <div className={styles.operadorDetails}>
                            <div className={styles.operadorName}>
                              {operador.nombre}
                            </div>
                            <div className={styles.operadorEmail}>
                              {operador.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* NUM OP */}
                      <td data-label="Núm. operador">
                        {operador.telefono || operador.numeroOperador || 'N/A'}
                      </td>

                      {/* OBSERVACIONES */}
                      <td
                        className={styles.operadorAddress}
                        data-label="Observaciones"
                      >
                        {operador.observaciones || 'N/A'}
                      </td>

                      {/* PUESTO */}
                      <td data-label="Puesto">
                        {operador.puesto || 'N/A'}
                      </td>

                      {/* FECHA DE INICIO */}
                      <td data-label="Fecha de inicio">
                        {formatDate(
                          operador.fechaIngreso || operador.fechaContratacion
                        )}
                      </td>

                      {/* VIGENCIA DOCUMENTOS */}
                      <td
                        className={styles.documentStatus}
                        data-label="Vigencia en documentos"
                      >
                        <div className={styles.documentsContainer}>
                          <div className={styles.documentItem}>
                            <span className={styles.documentLabel}>
                              Examen Médico:
                            </span>
                            <div className={styles.statusContainer}>
                              <span
                                className={`${styles.statusIndicator} ${
                                  styles[examenMedicoStatus]
                                }`}
                              ></span>
                              <span className={styles.statusDate}>
                                {operador.fechaVencimientoExamenMedico
                                  ? formatDate(
                                      operador.fechaVencimientoExamenMedico
                                    )
                                  : 'N/A'}
                              </span>
                            </div>
                          </div>
                          <div className={styles.documentItem}>
                            <span className={styles.documentLabel}>
                              Tarjetón:
                            </span>
                            <div className={styles.statusContainer}>
                              <span
                                className={`${styles.statusIndicator} ${
                                  styles[tarjetonStatus]
                                }`}
                              ></span>
                              <span className={styles.statusDate}>
                                {operador.fechaVencimientoTarjeton
                                  ? formatDate(operador.fechaVencimientoTarjeton)
                                  : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* VER MÁS */}
                      <td data-label="Ver más">
                        <button
                          className={styles.detailsButton}
                          onClick={() => handleViewDetails(operador)}
                        >
                          <span className={styles.detailsIcon}>⚪</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {selectedOperador && (
          <OperadorModal
            operador={selectedOperador}
            onClose={handleCloseModal}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default Operadores;
