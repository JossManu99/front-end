// src/pages/viajes/ViajePage.jsx
import React, { useEffect, useState } from 'react';
import ViajeModal from '../../components/viaje/ViajeModal';
import Menu from '../../components/header/DashboardHeader';
import das from '../../components/header/Dashboard.module.css';
import './ViajePage.css';
import { getViajes, deleteViaje, updateViaje } from '../../services/viaje/viajeService';
import * as XLSX from 'xlsx';

// Importamos las librerías para PDF
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ViajePage = () => {
  const [viajes, setViajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedViaje, setSelectedViaje] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Función para obtener viajes
  const fetchAllViajes = async () => {
    try {
      const data = await getViajes();
      setViajes(data);
    } catch (err) {
      setError('Error al obtener los viajes');
      console.error('Error al obtener viajes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllViajes();
  }, []);

  // Función para ver detalles de un viaje
  const handleViewDetails = (viaje) => {
    setSelectedViaje(viaje);
  };

  const handleCloseModal = () => {
    setSelectedViaje(null);
  };

  const handleDelete = async (id) => {
    try {
      await deleteViaje(id);
      setViajes((prev) => prev.filter((viaje) => viaje._id !== id));
      setSelectedViaje(null);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error('Error al eliminar viaje:', err);
      setError('Error al eliminar el viaje.');
    }
  };

  const handleUpdate = async (viajeActualizado) => {
    try {
      await updateViaje(viajeActualizado);
      await fetchAllViajes();
      setSelectedViaje(null);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error('Error al actualizar viaje:', err);
      setError('Error al actualizar el viaje.');
    }
  };

  // Función de filtrado: buscamos en todos los campos concatenados de cada viaje
  const filteredViajes = viajes.filter((viaje) =>
    Object.values(viaje)
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Agrupar viajes por cliente
  const groupViajesByClient = (viajes) => {
    const grouped = {};
    viajes.forEach((viaje) => {
      const clientName = viaje.nombreCliente || 'Sin cliente';
      if (!grouped[clientName]) {
        grouped[clientName] = [];
      }
      grouped[clientName].push(viaje);
    });
    return grouped;
  };

  const groupedViajes = groupViajesByClient(filteredViajes);

  // Función para exportar a Excel incluyendo toda la información del viaje
  const exportToExcel = () => {
    const wsData = filteredViajes.map((a) => ({
      'Número de Ruta': a.numeroRuta || '',
      'Nombre Cliente': a.nombreCliente || '',
      'Origen': a.saleDe || '',
      'Destino': a.llegaA || '',
      'Distancia': a.distancia || '',
      'Costo por Km': a.costoPorKm || '',
      'Costo': a.costo || '',
      'Turnos': Array.isArray(a.turnos) && a.turnos.length > 0
        ? a.turnos
            .map((t) =>
              `Turno: ${t.turno || ''}, Entrada: ${t.horarioEntrada || ''}, Salida: ${t.horarioSalida || ''}, Inicio Salida Origen: ${t.horarioinicio_jordana_salidaOrigen || ''}, Inicio Llegada Destino: ${t.horarioinicio_jornada_llegada_a_Destino || ''}, Salida de Origen: ${t.horariosalida_jornada_salida_de_Origen || ''}, Llegada a Destino: ${t.horariosalida_jornada_llegada_a_Destino || ''}`
            )
            .join(' | ')
        : '',
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Viajes');
    XLSX.writeFile(wb, 'Lista_Viajes.xlsx');
  };

  // Función para descargar PDF utilizando html2canvas y jsPDF
  const handleDownloadPDF = () => {
    // Seleccionamos el contenedor a exportar (excluyendo el menú)
    const input = document.getElementById('pdfContent');
    if (!input) return;

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
        pdf.save('Lista_Viajes.pdf');
      })
      .catch((error) => {
        console.error('Error al generar el PDF:', error);
      });
  };

  // Manejador para actualizar el término de búsqueda
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading) {
    return <p>Cargando viajes...</p>;
  }

  return (
    <div className="mainContainer">
      <div className={das.menuContainer}>
        <Menu />
      </div>
      {/* Encapsulamos el contenido a exportar en un contenedor con id "pdfContent" */}
      <div className="viajes-page" id="pdfContent">
        <h2>Lista de Viajes</h2>
        <div className="toolbar-buscar">
          <input
            type="text"
            placeholder="Buscador..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
          <button className="boton excel" onClick={exportToExcel}>
            Exportar a Excel
          </button>
          <button className="boton imprimir" onClick={handleDownloadPDF}>
            Descargar PDF
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="Container" key={refreshKey}>
          {Object.keys(groupedViajes).length === 0 ? (
            <p>No se encontraron viajes.</p>
          ) : (
            Object.entries(groupedViajes).map(([clientName, clientViajes]) => (
              <div key={clientName} className="cliente-grupo">
                <h3 className="cliente-titulo">Cliente: {clientName}</h3>
                <div className="viajes-list">
                  {clientViajes.map((viaje) => (
                    <div key={viaje._id} className="viaje-card">
                      <h3>{viaje.numeroRuta}</h3>
                      <p>
                        <strong>Origen:</strong> {viaje.saleDe}
                      </p>
                      <p>
                        <strong>Destino:</strong> {viaje.llegaA}
                      </p>
                      <button
                        className="ver-info"
                        onClick={() => handleViewDetails(viaje)}
                      >
                        Ver información del viaje
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedViaje && (
        <ViajeModal
          viaje={selectedViaje}
          onClose={handleCloseModal}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
};

export default ViajePage;
