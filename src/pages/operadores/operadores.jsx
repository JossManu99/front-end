import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import Menu from '../../components/header/DashboardHeader';
import OperadorModal from '../../components/operadores/OperadorModal';
import das from '../../components/header/Dashboard.module.css';
import styles from './Operadores.module.css';
import { getOperadores, deleteOperador, updateOperador } from '../../services/OperadorService';

// Importamos las librerías para generar PDF
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Operadores = () => {
  const [operadores, setOperadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOperador, setSelectedOperador] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  // Fecha actual (ej: "Marzo 2025")
  const currentMonth = new Date().toLocaleString('es-ES', { month: 'long' });
  const currentYear = new Date().getFullYear();

  // Cargar operadores al montar
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

  useEffect(() => {
    fetchAllOperadores();
  }, []);

  // Función para formatear fechas (ej: "18 de octubre de 1999")
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date)) return 'N/A';
    return `${date.getDate()} de ${date.toLocaleString('es-ES', { month: 'long' })} de ${date.getFullYear()}`;
  };

  // Función para determinar estado de un documento (ejemplo)
  const checkSpecificDocumentStatus = (dateString) => {
    if (!dateString) return 'no-data';
    const currentDate = new Date();
    const expirationDate = new Date(dateString);
    if (isNaN(expirationDate)) return 'no-data';
    const daysRemaining = Math.ceil((expirationDate - currentDate) / (1000 * 60 * 60 * 24));
    if (daysRemaining <= 0) return 'expired';
    else if (daysRemaining <= 30) return 'warning';
    else return 'valid';
  };

  // Manejo del modal de detalles
  const handleViewDetails = (operador) => {
    setSelectedOperador(operador);
  };
  const handleCloseModal = () => {
    setSelectedOperador(null);
  };

  // Eliminar un operador
  const handleDelete = async (id) => {
    try {
      await deleteOperador(id);
      setOperadores((prev) => prev.filter((op) => op._id !== id));
      setSelectedOperador(null);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error('Error al eliminar operador:', err);
      setError('Error al eliminar el operador.');
    }
  };

  // Actualizar un operador
  const handleUpdate = async (operadorActualizado) => {
    if (!operadorActualizado || !operadorActualizado._id) {
      console.error('No se recibió objeto válido para actualizar');
      return;
    }
    try {
      await updateOperador(operadorActualizado._id, operadorActualizado);
      await fetchAllOperadores();
      setSelectedOperador(null);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error('Error al actualizar operador:', err);
      setError('Error al actualizar el operador.');
    }
  };

  // Actualizar el término de búsqueda
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filtrar operadores según búsqueda (usando "nombre" y otros campos)
  const filteredOperadores = operadores.filter((operador) => {
    const fieldsToSearch = [
      operador.numeroOperador || '',
      operador.nombre || '',
      operador.fechaNacimiento ? formatDate(operador.fechaNacimiento) : '',
      operador.edad ? operador.edad.toString() : '',
      operador.fechaIngreso ? formatDate(operador.fechaIngreso) : '',
      operador.fechaContratacion ? formatDate(operador.fechaContratacion) : '',
      operador.puesto || '',
      operador.tipoLicencia || '',
      operador.fechaVencimientoLicenciaEstatal ? formatDate(operador.fechaVencimientoLicenciaEstatal) : '',
      operador.documentoLicenciaEstatal || '',
      operador.fechaVencimientoLicenciaFederal ? formatDate(operador.fechaVencimientoLicenciaFederal) : '',
      operador.documentoLicenciaFederal || '',
      operador.fechaVencimientoTarjeton ? formatDate(operador.fechaVencimientoTarjeton) : '',
      operador.documentoTarjeton || '',
      operador.fechaVencimientoExamenMedico ? formatDate(operador.fechaVencimientoExamenMedico) : '',
      operador.documentoExamenMedico || '',
      operador.observaciones || '',
    ];
    return fieldsToSearch.join(' ').toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Exportar a Excel: mapea todas las propiedades con los nombres exactos
  const exportToExcel = () => {
    setIsExporting(true);
    try {
      const wsData = filteredOperadores.map((op) => ({
        'Número de Operador': op.numeroOperador || '',
        'Nombre': op.nombre || '',
        'Fecha de Nacimiento': op.fechaNacimiento ? formatDate(op.fechaNacimiento) : 'N/A',
        'Edad': op.edad || '',
        'Fecha de Ingreso': op.fechaIngreso
          ? formatDate(op.fechaIngreso)
          : op.fechaContratacion
          ? formatDate(op.fechaContratacion)
          : 'N/A',
        'Puesto': op.puesto || '',
        'Tipo de Licencia': op.tipoLicencia || '',
        'Fecha de Vencimiento Licencia Estatal': op.fechaVencimientoLicenciaEstatal
          ? formatDate(op.fechaVencimientoLicenciaEstatal)
          : 'N/A',
        'Documento Licencia Estatal': op.documentoLicenciaEstatal || '',
        'Fecha de Vencimiento Licencia Federal': op.fechaVencimientoLicenciaFederal
          ? formatDate(op.fechaVencimientoLicenciaFederal)
          : 'N/A',
        'Documento Licencia Federal': op.documentoLicenciaFederal || '',
        'Fecha de Vencimiento Tarjetón': op.fechaVencimientoTarjeton
          ? formatDate(op.fechaVencimientoTarjeton)
          : 'N/A',
        'Documento Tarjetón': op.documentoTarjeton || '',
        'Fecha de Vencimiento Examen Médico': op.fechaVencimientoExamenMedico
          ? formatDate(op.fechaVencimientoExamenMedico)
          : 'N/A',
        'Documento Examen Médico': op.documentoExamenMedico || '',
        'Observaciones': op.observaciones || '',
      }));
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, 'Operadores');
      XLSX.writeFile(wb, 'ListaOperadores.xlsx');
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Función para descargar PDF (se excluye el menú)
  const handleDownloadPDF = () => {
    setIsExporting(true);
    const input = document.getElementById('pdfContent');
    if (!input) {
      setIsExporting(false);
      return;
    }
    html2canvas(input, { 
      scale: 2, 
      useCORS: true, 
      crossOrigin: 'anonymous' 
    }).then((canvas) => {
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
      pdf.save('Listado_Operadores.pdf');
    }).catch((error) => {
      console.error('Error al generar el PDF:', error);
    }).finally(() => {
      setIsExporting(false);
    });
  };

  if (loading) {
    return (
      <div className={styles.operadoresPage}>
        <p className={styles.loadingMessage}>Cargando trabajadores...</p>
      </div>
    );
  }

  return (
    <div className={styles.mainContainer}>
      {/* Menú superior (no se incluirá en el PDF) */}
      <div className={das.menuContainer}>
        <Menu />
      </div>

      {/* Contenedor a exportar al PDF (se asigna id "pdfContent") */}
      <div className={styles.operadoresPage} id="pdfContent">
        <h1 className={styles.mainTitle}>Listado de trabajadores</h1>
        <p className={styles.currentDate}>
          {currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)} {currentYear}
        </p>

        {/* Barra de búsqueda y botones */}
        <div className={styles.toolbarBuscar}>
          <input
            type="text"
            placeholder="Buscador..."
            value={searchTerm}
            onChange={handleSearch}
            className={styles.searchInput}
          />
          <button className={styles.btnExport} onClick={exportToExcel} disabled={isExporting}>
            Exportar a Excel
          </button>
          <button className={styles.btnPrint} onClick={handleDownloadPDF} disabled={isExporting}>
            Descargar PDF
          </button>
        </div>

        {error && <p className={styles.loadingMessage}>{error}</p>}

        <div className={styles.operadoresTableContainer} key={refreshKey}>
          <table className={styles.operadoresTable}>
            <thead>
              <tr>
                <th>Información</th>
                <th>Núm. Operador</th>
                <th>Observaciones</th>
                <th>Puesto</th>
                <th>Fecha de Inicio</th>
                <th>Vigencia en Documentos</th>
                <th>Ver más</th>
              </tr>
            </thead>
            <tbody>
              {filteredOperadores.length > 0 ? (
                filteredOperadores.map((operador) => {
                  const examenMedicoStatus = checkSpecificDocumentStatus(
                    operador.fechaVencimientoExamenMedico
                  );
                  const tarjetonStatus = checkSpecificDocumentStatus(
                    operador.fechaVencimientoTarjeton
                  );
                  return (
                    <tr key={operador._id || operador.numeroOperador}>
                      {/* Información: foto, nombre y email */}
                      <td className={styles.operadorInfoCell} data-label="Información">
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

                      <td data-label="Núm. Operador">
                        {operador.numeroOperador || 'N/A'}
                      </td>

                      <td className={styles.operadorAddress} data-label="Observaciones">
                        {operador.observaciones || 'N/A'}
                      </td>

                      <td data-label="Puesto">
                        {operador.puesto || 'N/A'}
                      </td>

                      <td data-label="Fecha de Inicio">
                        {operador.fechaIngreso
                          ? formatDate(operador.fechaIngreso)
                          : operador.fechaContratacion
                          ? formatDate(operador.fechaContratacion)
                          : 'N/A'}
                      </td>

                      <td className={styles.documentStatus} data-label="Vigencia en Documentos">
                        <div className={styles.documentsContainer}>
                          <div className={styles.documentItem}>
                            <span className={styles.documentLabel}>Examen Médico:</span>
                            <div className={styles.statusContainer}>
                              <span
                                className={`${styles.statusIndicator} ${styles[examenMedicoStatus]}`}
                              ></span>
                              <span className={styles.statusDate}>
                                {operador.fechaVencimientoExamenMedico
                                  ? formatDate(operador.fechaVencimientoExamenMedico)
                                  : 'N/A'}
                              </span>
                            </div>
                          </div>
                          <div className={styles.documentItem}>
                            <span className={styles.documentLabel}>Tarjetón:</span>
                            <div className={styles.statusContainer}>
                              <span
                                className={`${styles.statusIndicator} ${styles[tarjetonStatus]}`}
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
              ) : (
                <tr>
                  <td colSpan="7" className={styles.noResultsMessage}>
                    No se encontraron trabajadores.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
  );
};

export default Operadores;
