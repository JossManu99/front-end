import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import FormOperador from './FormOperador';
import styles from './OperadorModal.module.css';

// Función para formatear fechas en formato dd/mm/yyyy
const formatDate = (date) => {
  if (!date) return 'N/A';
  
  const d = new Date(date);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  
  return `${day}/${month}/${year}`;
};

const OperadorModal = ({ operador, onClose, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  // Referencia al bloque de detalles para exportar a PDF
  const detailsRef = useRef(null);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleUpdate = (updatedOperador) => {
    onUpdate(updatedOperador);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!operador._id) {
      alert('El operador no tiene un ID válido');
      return;
    }
    if (window.confirm(`¿Estás seguro de que deseas eliminar al operador ${operador.nombre}?`)) {
      onDelete(operador._id);
    }
  };

  // Verificamos si el puesto es "operador" (ignorando mayúsculas/minúsculas)
  const isOperador = operador?.puesto?.toLowerCase() === 'operador';

  // ======= Funciones de Exportación =======

  // Exportar a Excel
  const exportToExcel = () => {
    const data = [
      ['Campo', 'Valor'],
      ['Número de Operador', operador.numeroOperador || 'N/A'],
      ['Nombre', operador.nombre || 'Desconocido'],
      ['Fecha de Nacimiento', formatDate(operador.fechaNacimiento)],
      ['Edad', operador.edad || 'N/A'],
      ['Fecha de Ingreso', formatDate(operador.fechaIngreso)],
      ['Puesto', operador.puesto || 'N/A'],
    ];

    // Si es operador, incluir datos adicionales de licencias y tarjetón
    if (isOperador) {
      data.push(
        ['Tipo de Licencia', operador.tipoLicencia || 'N/A'],
        ['Fecha Vencimiento Licencia Estatal', formatDate(operador.fechaVencimientoLicenciaEstatal)],
        ['Documento Licencia Estatal', operador.documentoLicenciaEstatal ? 'Ver Documento' : 'N/A'],
        ['Fecha Vencimiento Licencia Federal', formatDate(operador.fechaVencimientoLicenciaFederal)],
        ['Documento Licencia Federal', operador.documentoLicenciaFederal ? 'Ver Documento' : 'N/A'],
        ['Fecha Vencimiento Tarjetón', formatDate(operador.fechaVencimientoTarjeton)],
        ['Documento Tarjetón', operador.documentoTarjeton ? 'Ver Documento' : 'N/A']
      );
    }

    // Datos de examen médico y observaciones
    data.push(
      ['Fecha Vencimiento Examen Médico', formatDate(operador.fechaVencimientoExamenMedico)],
      ['Documento Examen Médico', operador.documentoExamenMedico ? 'Ver Documento' : 'N/A'],
      ['Observaciones', operador.observaciones || 'Sin observaciones']
    );

    // Se genera la hoja de Excel
    const sheet = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, 'Operador');
    XLSX.writeFile(wb, `Operador-${operador.numeroOperador || 'N-A'}.xlsx`);
  };

  // Exportar a PDF
  const exportToPDF = () => {
    if (!detailsRef.current) return;
    html2canvas(detailsRef.current, { scale: 2, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Operador-${operador.numeroOperador || 'N-A'}.pdf`);
    });
  };

  return (
    <div className={styles['operador-modal']}>
      <div className={styles['modal-content']}>
        <span className={styles['close-btn']} onClick={onClose}>&times;</span>
        <h2 className={styles['modal-title']}>
          {isEditing ? 'Editar Información del Operador' : 'Información del Operador'}
        </h2>

        {isEditing ? (
          <FormOperador
            operador={operador}
            onSave={handleUpdate}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <div className={styles['operador-details']} ref={detailsRef}>
            <div className={styles['operador-photo']}>
              <img
                src={operador.foto || '/default-avatar.png'}
                alt={`Foto de ${operador.nombre}`}
                className={styles['photo-img']}
              />
            </div>
            
            <div className={styles['details-section']}>
              <p><strong>Número de Operador:</strong> {operador.numeroOperador || 'N/A'}</p>
              <p><strong>Nombre:</strong> {operador.nombre || 'Desconocido'}</p>
              <p><strong>Fecha de Nacimiento:</strong> {formatDate(operador.fechaNacimiento)}</p>
              <p><strong>Edad:</strong> {operador.edad || 'N/A'}</p>
              <p><strong>Fecha de Ingreso:</strong> {formatDate(operador.fechaIngreso)}</p>
              <p><strong>Puesto:</strong> {operador.puesto || 'N/A'}</p>
              {isOperador && (
                <>
                  <p><strong>Tipo de Licencia:</strong> {operador.tipoLicencia || 'N/A'}</p>
                  <p>
                    <strong>Fecha Vencimiento Licencia Estatal:</strong> {formatDate(operador.fechaVencimientoLicenciaEstatal)}
                  </p>
                  <p>
                    <strong>Documento Licencia Estatal:</strong> {operador.documentoLicenciaEstatal ? (
                      <a
                        href={operador.documentoLicenciaEstatal}
                        target="_blank"
                        rel="noopener noreferrer"
                      >Ver Documento</a>
                    ) : 'N/A'}
                  </p>
                  <p>
                    <strong>Fecha Vencimiento Licencia Federal:</strong> {formatDate(operador.fechaVencimientoLicenciaFederal)}
                  </p>
                  <p>
                    <strong>Documento Licencia Federal:</strong> {operador.documentoLicenciaFederal ? (
                      <a
                        href={operador.documentoLicenciaFederal}
                        target="_blank"
                        rel="noopener noreferrer"
                      >Ver Documento</a>
                    ) : 'N/A'}
                  </p>
                  <p>
                    <strong>Fecha Vencimiento Tarjetón:</strong> {formatDate(operador.fechaVencimientoTarjeton)}
                  </p>
                  <p>
                    <strong>Documento Tarjetón:</strong> {operador.documentoTarjeton ? (
                      <a
                        href={operador.documentoTarjeton}
                        target="_blank"
                        rel="noopener noreferrer"
                      >Ver Documento</a>
                    ) : 'N/A'}
                  </p>
                </>
              )}
              <p>
                <strong>Fecha Vencimiento Examen Médico:</strong> {formatDate(operador.fechaVencimientoExamenMedico)}
              </p>
              <p>
                <strong>Documento Examen Médico:</strong> {operador.documentoExamenMedico ? (
                  <a
                    href={operador.documentoExamenMedico}
                    target="_blank"
                    rel="noopener noreferrer"
                  >Ver Documento</a>
                ) : 'N/A'}
              </p>
              <p><strong>Observaciones:</strong> {operador.observaciones || 'Sin observaciones'}</p>
            </div>
          </div>
        )}

        {/* Botones de acción y exportación (sólo en modo visualización) */}
        {!isEditing && (
          <div className={styles['modal-actions']}>
            <div className={styles['export-buttons']}>
              <button className={styles['export-btn']} onClick={exportToExcel}>
                Exportar a Excel
              </button>
              <button className={styles['export-btn']} onClick={exportToPDF}>
                Exportar a PDF
              </button>
            </div>
            <div className={styles['action-buttons']}>
              <button className={styles['update-btn']} onClick={handleEditClick}>
                Editar
              </button>
              <button className={styles['delete-btn']} onClick={handleDelete}>
                Eliminar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OperadorModal;
