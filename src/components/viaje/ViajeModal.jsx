// src/components/viaje/ViajeModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import FormViaje from './FormViaje';
import { getTurnos } from '../../services/clientesServive';
import styles from './ViajeModal.module.css';

// Función para formatear fechas en formato dd/mm/yyyy
const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${day}/${month}/${year}`;
};

const ViajeModal = ({ viaje, onClose, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Referencia para capturar la sección de detalles al exportar a PDF
  const detailsRef = useRef(null);

  // Cargar los turnos cuando el componente se monta o cuando cambia la empresa del viaje
  useEffect(() => {
    const fetchTurnos = async () => {
      if (viaje.empresa) {
        setLoading(true);
        try {
          const turnosData = await getTurnos(viaje.empresa);
          console.log("Turnos obtenidos:", turnosData);
          const empresaTurnos = turnosData.filter((item) => item.empresa === viaje.empresa);
          if (empresaTurnos.length > 0) {
            setTurnos(empresaTurnos[0].turnos || []);
          } else {
            console.error('No se encontraron turnos válidos para esta empresa');
            setError('No se encontraron turnos válidos para esta empresa.');
          }
        } catch (err) {
          console.error("Error al obtener los turnos:", err);
          setError("Hubo un error al cargar los turnos.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTurnos();
  }, [viaje.empresa]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  // Al actualizar, se llama a onUpdate y luego se cierra el modal
  const handleUpdate = (updatedViaje) => {
    onUpdate(updatedViaje);
    setIsEditing(false);
    onClose();
  };

  const handleDelete = () => {
    if (!viaje._id) {
      alert('El viaje no tiene un ID válido');
      return;
    }
    if (window.confirm(`¿Estás seguro de que deseas eliminar el viaje con ruta ${viaje.numeroRuta}?`)) {
      onDelete(viaje._id);
    }
  };

  const renderTurnos = () => {
    if (!viaje.turnos || viaje.turnos.length === 0) {
      return <p><strong>Turnos:</strong> No hay turnos asignados.</p>;
    }
    return (
      <div>
        <strong>Turnos y Horarios:</strong>
        <ul className={styles.turnosList}>
          {viaje.turnos.map((turnoItem, index) => (
            <li key={index} className={styles.turnoItem}>
              <p><strong>Turno:</strong> {turnoItem.turno}</p>
              <p>
                <strong>Entrada:</strong> {turnoItem.horarioEntrada} | <strong>Salida:</strong> {turnoItem.horarioSalida}
              </p>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Función para exportar a Excel
  const exportToExcel = () => {
    const data = [
      ['Campo', 'Valor'],
      ['Número de Ruta', viaje.numeroRuta || 'N/A'],
      ['Nombre Cliente', viaje.nombreCliente || 'N/A'],
      ['Origen', viaje.saleDe || 'Desconocido'],
      ['Destino', viaje.llegaA || 'Desconocido'],
      ['Distancia', viaje.distancia ? `${viaje.distancia} km` : 'N/A'],
      ['Costo por Km', viaje.costoPorKm ? `$${viaje.costoPorKm}` : 'N/A'],
      ['Costo Total', viaje.costo ? `$${viaje.costo}` : 'N/A'],
    ];

    // Agregar datos de turnos, si existen
    if (viaje.turnos && viaje.turnos.length > 0) {
      data.push(['Turnos y Horarios', '']);
      viaje.turnos.forEach((t, index) => {
        data.push([`Turno ${index + 1}`, `Entrada: ${t.horarioEntrada} - Salida: ${t.horarioSalida}`]);
      });
    }

    const sheet = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, 'Viaje');
    XLSX.writeFile(wb, `Viaje-${viaje.numeroRuta || 'N-A'}.xlsx`);
  };

  // Función para exportar a PDF usando html2canvas y jsPDF
  const exportToPDF = () => {
    if (!detailsRef.current) return;
    html2canvas(detailsRef.current, { scale: 2, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Viaje-${viaje.numeroRuta || 'N-A'}.pdf`);
    });
  };

  return (
    <div className={styles.viajeModal}>
      <div className={styles.modalContent}>
        <span className={styles.closeBtn} onClick={onClose}>&times;</span>
        <h2 className={styles.modalTitle}>
          {isEditing ? 'Editar Información del Viaje' : 'Información del Viaje'}
        </h2>
        {isEditing ? (
          <FormViaje
            viaje={viaje}
            onViajeCreated={handleUpdate}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <div ref={detailsRef}>
            <div className={styles.viajeDetails}>
              <p><strong>Número de Ruta:</strong> {viaje.numeroRuta || 'N/A'}</p>
              <p><strong>Nombre Cliente:</strong> {viaje.nombreCliente || 'N/A'}</p>
              <p><strong>Origen:</strong> {viaje.saleDe || 'Desconocido'}</p>
              <p><strong>Destino:</strong> {viaje.llegaA || 'Desconocido'}</p>
              <p><strong>Distancia:</strong> {viaje.distancia || 'N/A'} km</p>
              <p><strong>Costo por Km:</strong> ${viaje.costoPorKm || 'N/A'}</p>
              <p><strong>Costo Total:</strong> ${viaje.costo || 'N/A'}</p>
              {renderTurnos()}
              {loading && <p>Cargando turnos...</p>}
              {error && <p style={{ color: 'red' }}>{error}</p>}
            </div>
          </div>
        )}
        {!isEditing && (
          <div className={styles.modalActions}>
            <div className={styles.exportButtons}>
              <button className={styles.exportBtn} onClick={exportToExcel}>
                Exportar a Excel
              </button>
              <button className={styles.exportBtn} onClick={exportToPDF}>
                Exportar a PDF
              </button>
            </div>
            <div className={styles.actionButtons}>
              <button className={styles.updateBtn} onClick={handleEditClick}>
                Editar
              </button>
              <button className={styles.deleteBtn} onClick={handleDelete}>
                Eliminar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViajeModal;
