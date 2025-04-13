import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import Menu from '../../components/header/DashboardHeader';
import das from '../../components/header/Dashboard.module.css';
import AutobusModal from '../../components/autobuses/AutobusModal';
import { getAutobuses, deleteAutobus, updateAutobus } from '../../services/AutobusesService';
import './Autobuses.css';

// Importamos las librerías para PDF
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Autobuses = () => {
  const [autobuses, setAutobuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAutobus, setSelectedAutobus] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  // Nuevo estado para controlar la exportación (Excel/PDF)
  const [isExporting, setIsExporting] = useState(false);

  // Cargar autobuses al montar
  const fetchAllAutobuses = async () => {
    try {
      const data = await getAutobuses();
      setAutobuses(data);
    } catch (err) {
      setError('Error al obtener los autobuses');
      console.error('Error al obtener los autobuses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAutobuses();
  }, []);

  // Formatea fechas a "30 de enero de 2025"
  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Determina el color del semáforo basado en la fecha de caducidad
  const getVencimientoStatusColor = (fechaVencimiento) => {
    if (!fechaVencimiento) return '#ccc';
    const now = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diffTime = vencimiento - now;
    const diffDays = diffTime / (1000 * 3600 * 24);
    if (diffDays < 16) return '#e74c3c';     // Rojo
    else if (diffDays <= 30) return '#f39c12'; // Amarillo
    else return '#2ecc71';                   // Verde
  };

  // Manejo del modal de detalles
  const handleViewDetails = (autobus) => {
    setSelectedAutobus(autobus);
  };

  const handleCloseModal = () => {
    setSelectedAutobus(null);
  };

  // Eliminar autobús
  const handleDelete = async (id) => {
    try {
      await deleteAutobus(id);
      setAutobuses((prev) => prev.filter((a) => a._id !== id));
      setSelectedAutobus(null);
    } catch (err) {
      console.error('Error al eliminar autobús:', err);
      setError('Error al eliminar el autobús.');
    }
  };

  // Actualizar autobús
  const handleUpdate = async (autobusActualizado) => {
    try {
      await updateAutobus(autobusActualizado._id, autobusActualizado);
      await fetchAllAutobuses();
      setSelectedAutobus(null);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error('Error al actualizar el autobús:', err);
      setError('Error al actualizar el autobús.');
    }
  };

  // Filtrado: se buscan coincidencias en varios campos
  const filteredAutobuses = autobuses.filter((autobus) => {
    const lowerSearch = searchTerm.toLowerCase();
    const fieldsToSearch = [
      autobus.numeroEconomico,
      autobus.numeroMotor,
      autobus.numeroSerie,
      autobus.marca,
      autobus.modelo,
      autobus.tipoPlaca,
      autobus.numeroPlaca,
      autobus.nombrePropietario,
      (autobus.usos || '').toString(),
      autobus.verificacionContaminante || 'No disponible',
      autobus.verificacionFisicoMecanico || 'No disponible',
      autobus.tarjetaCirculacion || 'No disponible',
      autobus.seguro || 'No disponible',
      autobus.permiso || 'No disponible',
      formatDate(autobus.caducidadVerificacionContaminante),
      formatDate(autobus.caducidadVerificacionFisicoMecanico),
      formatDate(autobus.caducidadTarjetaCirculacion),
      formatDate(autobus.caducidadSeguro),
      formatDate(autobus.caducidadPermiso),
      autobus.numeroAsientos?.toString() || '',
    ];
    return fieldsToSearch.join(' ').toLowerCase().includes(lowerSearch);
  });

  // Exportar a Excel
  const exportToExcel = () => {
    setIsExporting(true);
    try {
      const wsData = filteredAutobuses.map((a) => ({
        'Número Económico': a.numeroEconomico || '',
        'Número de Motor': a.numeroMotor || '',
        'Número de Serie': a.numeroSerie || '',
        'Marca': a.marca || '',
        'Modelo': a.modelo || '',
        'Tipo de Placa': a.tipoPlaca || '',
        'Verificación (Contaminante)': a.verificacionContaminante || 'No disponible',
        'Caducidad Verif. (Cont.)': a.caducidadVerificacionContaminante
          ? formatDate(a.caducidadVerificacionContaminante)
          : 'N/D',
        'Verificación (Físico-Mecánico)': a.verificacionFisicoMecanico || 'No disponible',
        'Caducidad Verif. (F-M)': a.caducidadVerificacionFisicoMecanico
          ? formatDate(a.caducidadVerificacionFisicoMecanico)
          : 'N/D',
        'Tarjeta de Circulación': a.tarjetaCirculacion || 'No disponible',
        'Caducidad Tarjeta': a.caducidadTarjetaCirculacion
          ? formatDate(a.caducidadTarjetaCirculacion)
          : 'N/D',
        'Seguro': a.seguro || 'No disponible',
        'Caducidad Seguro': a.caducidadSeguro ? formatDate(a.caducidadSeguro) : 'N/D',
        'Permiso': a.permiso || 'No disponible',
        'Caducidad Permiso': a.caducidadPermiso ? formatDate(a.caducidadPermiso) : 'N/D',
        'Número de Asientos': a.numeroAsientos || '',
        'Usos': a.usos || '',
        'Propietario': a.nombrePropietario || '',
      }));
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, 'Autobuses');
      XLSX.writeFile(wb, 'Listado_Autobuses.xlsx');
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Función para descargar PDF utilizando html2canvas y jsPDF.
   * Se configuran useCORS y crossOrigin para cargar imágenes externas.
   */
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
      crossOrigin: 'anonymous',
    })
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
        pdf.save('Listado_Autobuses.pdf');
      })
      .catch((error) => {
        console.error('Error al generar el PDF:', error);
      })
      .finally(() => {
        setIsExporting(false);
      });
  };

  if (loading) {
    return <p>Cargando autobuses...</p>;
  }

  return (
    <div className="mainContainer">
      {/* Menú superior (no se incluirá en el PDF) */}
      <div className={das.menuContainer}>
        <Menu />
      </div>

      {/* Contenedor a exportar en PDF: se asigna id "pdfContent" */}
      <div className="autobuses-page" id="pdfContent">
        <h2>Listado de flotillas</h2>
        <p>Marzo 2025</p>

        {/* Barra del buscador y botones */}
        <div className="toolbar-buscar">
          <input
            type="text"
            className="search-input"
            placeholder="Buscador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="boton excel" onClick={exportToExcel} disabled={isExporting}>
            Exportar a Excel
          </button>
          <button className="boton imprimir" onClick={handleDownloadPDF} disabled={isExporting}>
            Descargar PDF
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="container" key={refreshKey}>
          <div className="autobuses-list-header">
            <div className="header-item">Núm. económico</div>
            <div className="header-item">Núm. serie</div>
            <div className="header-item">Tipo placa</div>
            <div className="header-item">Núm. placa</div>
            <div className="header-item">Vigencia en documentos</div>
            <div className="header-item acciones">Ver más</div>
          </div>
          <div className="autobuses-list">
            {filteredAutobuses.length === 0 ? (
              <div className="no-results">No se encontraron autobuses.</div>
            ) : (
              filteredAutobuses.map((autobus) => (
                <div key={autobus._id} className="autobus-row">
                  <div className="autobus-info">
                    <div className="autobus-avatar">
                      <div
                        className="avatar-circle"
                        style={{
                          backgroundImage: `url(${autobus.foto || 'https://via.placeholder.com/150'})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />
                    </div>
                    <div className="autobus-details">
                      <h3>No. {autobus.numeroEconomico || '1234'}</h3>
                      <p>{autobus.tipoPropietario || ''}</p>
                    </div>
                  </div>
                  <div className="autobus-serie">
                    {autobus.numeroSerie || '3CEJ2X51435002740'}
                  </div>
                  <div className="autobus-tipo-placa">
                    {autobus.tipoPlaca || 'Estatales'}
                  </div>
                  <div className="autobus-placa">
                    {autobus.numeroPlaca || '632025T'}
                  </div>
                  <div className="vigencia-docs">
                    <div className="documento-status">
                      <div className="documento-label">Permiso:</div>
                      <div className="documento-info">
                        <div
                          className="status-indicator"
                          style={{
                            backgroundColor: getVencimientoStatusColor(autobus.caducidadPermiso),
                          }}
                          title={
                            autobus.caducidadPermiso
                              ? formatDate(autobus.caducidadPermiso)
                              : 'Sin fecha'
                          }
                        />
                        <span className="fecha-vencimiento">
                          {autobus.caducidadPermiso
                            ? formatDate(autobus.caducidadPermiso)
                            : 'N/D'}
                        </span>
                      </div>
                    </div>
                    <div className="documento-status">
                      <div className="documento-label">Seguro:</div>
                      <div className="documento-info">
                        <div
                          className="status-indicator"
                          style={{
                            backgroundColor: getVencimientoStatusColor(autobus.caducidadSeguro),
                          }}
                          title={
                            autobus.caducidadSeguro
                              ? formatDate(autobus.caducidadSeguro)
                              : 'Sin fecha'
                          }
                        />
                        <span className="fecha-vencimiento">
                          {autobus.caducidadSeguro
                            ? formatDate(autobus.caducidadSeguro)
                            : 'N/D'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="actions">
                    <button
                      className="view-details-btn"
                      onClick={() => handleViewDetails(autobus)}
                    >
                      <i className="details-icon"></i>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {selectedAutobus && (
        <AutobusModal
          key={selectedAutobus._id}
          autobus={selectedAutobus}
          onClose={handleCloseModal}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
};

export default Autobuses;
