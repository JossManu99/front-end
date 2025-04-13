import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import BusForm from '../../components/autobuses/AutobusForm';
import styles from './AutobusModal.module.css'; // Importando el módulo CSS

const AutobusModal = ({ autobus, onClose, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);

  // Referencia al bloque de detalles, para capturar tal cual se ve en pantalla
  const pdfRef = useRef(null);

  // ========== Handlers principales ==========

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleUpdate = async (updatedAutobus) => {
    await onUpdate(updatedAutobus);
    onClose();
  };

  const handleDelete = () => {
    if (!autobus._id) {
      alert('El autobús no tiene un ID válido');
      return;
    }
    if (
      window.confirm(
        `¿Estás seguro de que deseas eliminar el autobús ${autobus.numeroEconomico}?`
      )
    ) {
      onDelete(autobus._id);
    }
  };

  // ========== Exportar a Excel ==========
  const exportToExcel = () => {
    const data = [
      ['Campo', 'Valor'],
      ['Número Económico', autobus.numeroEconomico || 'N/A'],
      ['Número de Motor', autobus.numeroMotor || 'N/A'],
      ['Número de Serie', autobus.numeroSerie || 'N/A'],
      ['Marca', autobus.marca || 'N/A'],
      ['Modelo', autobus.modelo || 'N/A'],
      ['Tipo de Placa', autobus.tipoPlaca || 'N/A'],
      [
        'Verificación (Contaminante)',
        autobus.verificacionContaminante ? 'Ver documento' : 'No disponible',
      ],
      [
        'Caducidad Verificación (Cont.)',
        autobus.caducidadVerificacionContaminante || 'N/A',
      ],
      [
        'Verificación (Físico-Mecánico)',
        autobus.verificacionFisicoMecanico ? 'Ver documento' : 'No disponible',
      ],
      [
        'Caducidad Verificación (F-M)',
        autobus.caducidadVerificacionFisicoMecanico || 'N/A',
      ],
      [
        'Tarjeta de Circulación',
        autobus.tarjetaCirculacion ? 'Ver documento' : 'No disponible',
      ],
      [
        'Caducidad Tarjeta de Circulación',
        autobus.caducidadTarjetaCirculacion || 'N/A',
      ],
      [
        'Seguro',
        autobus.seguro ? 'Ver documento' : 'No disponible',
      ],
      [
        'Caducidad Seguro',
        autobus.caducidadSeguro || 'N/A',
      ],
      [
        'Permiso',
        autobus.permiso ? 'Ver documento' : 'No disponible',
      ],
      [
        'Caducidad Permiso',
        autobus.caducidadPermiso || 'N/A',
      ],
      ['Número de Asientos', autobus.numeroAsientos || 'N/A'],
      [
        'Usos del Autobús',
        autobus.usos && autobus.usos.length > 0
          ? autobus.usos.join(', ')
          : 'N/A',
      ],
      ['Nombre de Propietario', autobus.nombrepropietario || 'N/A'],
    ];

    const sheet = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, 'Autobus');
    XLSX.writeFile(wb, `Autobus-${autobus.numeroEconomico || 'N-A'}.xlsx`);
  };

  // ========== Exportar a PDF ==========
  const exportToPDF = () => {
    if (!pdfRef.current) return;
    html2canvas(pdfRef.current, { scale: 2, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Autobus-${autobus.numeroEconomico || 'N-A'}.pdf`);
    });
  };

  return (
    <div className={styles["autobus-modal"]}>
      <div className={styles["modal-content"]}>
        <span className={styles["close-btn"]} onClick={onClose}>
          &times;
        </span>
        <h2 className={styles["modal-title"]}>
          {isEditing ? 'Editar Información del Autobús' : 'Información del Autobús'}
        </h2>

        {isEditing ? (
          <BusForm
            autobus={autobus}
            onSave={handleUpdate}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <div className={styles["autobus-details"]} ref={pdfRef}>
            <div className={styles["details-container"]}>
              {autobus.foto ? (
                <img
                  src={autobus.foto}
                  alt="Foto del Autobús"
                  className={styles["autobus-photo"]}
                  crossOrigin="anonymous"
                />
              ) : (
                <p className={styles["no-photo"]}>Sin foto disponible</p>
              )}

              <div className={styles["details-section"]}>
                <p>
                  <strong>Número Económico:</strong>{' '}
                  {autobus.numeroEconomico || 'N/A'}
                </p>
                <p>
                  <strong>Número de Motor:</strong>{' '}
                  {autobus.numeroMotor || 'N/A'}
                </p>
                <p>
                  <strong>Número de Serie:</strong>{' '}
                  {autobus.numeroSerie || 'N/A'}
                </p>
                <p>
                  <strong>Marca:</strong> {autobus.marca || 'N/A'}
                </p>
                <p>
                  <strong>Modelo:</strong> {autobus.modelo || 'N/A'}
                </p>
                <p>
                  <strong>Tipo de Placa:</strong>{' '}
                  {autobus.tipoPlaca || 'N/A'}
                </p>
                <p>
                  <strong>Verificación (Contaminante):</strong>{' '}
                  {autobus.verificacionContaminante ? (
                    <a
                      href={autobus.verificacionContaminante}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver documento
                    </a>
                  ) : (
                    'No disponible'
                  )}
                </p>
                <p>
                  <strong>Caducidad Verificación:</strong>{' '}
                  {autobus.caducidadVerificacionContaminante || 'N/A'}
                </p>
                <p>
                  <strong>Verificación (Físico-Mecánico):</strong>{' '}
                  {autobus.verificacionFisicoMecanico ? (
                    <a
                      href={autobus.verificacionFisicoMecanico}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver documento
                    </a>
                  ) : (
                    'No disponible'
                  )}
                </p>
                <p>
                  <strong>Caducidad Verificación:</strong>{' '}
                  {autobus.caducidadVerificacionFisicoMecanico || 'N/A'}
                </p>
                <p>
                  <strong>Tarjeta de Circulación:</strong>{' '}
                  {autobus.tarjetaCirculacion ? (
                    <a
                      href={autobus.tarjetaCirculacion}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver documento
                    </a>
                  ) : (
                    'No disponible'
                  )}
                </p>
                <p>
                  <strong>Caducidad Tarjeta de Circulación:</strong>{' '}
                  {autobus.caducidadTarjetaCirculacion || 'N/A'}
                </p>
                <p>
                  <strong>Seguro:</strong>{' '}
                  {autobus.seguro ? (
                    <a
                      href={autobus.seguro}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver documento
                    </a>
                  ) : (
                    'No disponible'
                  )}
                </p>
                <p>
                  <strong>Caducidad Seguro:</strong>{' '}
                  {autobus.caducidadSeguro || 'N/A'}
                </p>
                <p>
                  <strong>Permiso:</strong>{' '}
                  {autobus.permiso ? (
                    <a
                      href={autobus.permiso}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver documento
                    </a>
                  ) : (
                    'No disponible'
                  )}
                </p>
                <p>
                  <strong>Caducidad Permiso:</strong>{' '}
                  {autobus.caducidadPermiso || 'N/A'}
                </p>
                <p>
                  <strong>Número de Asientos:</strong>{' '}
                  {autobus.numeroAsientos || 'N/A'}
                </p>
                <p>
                  <strong>Usos del Autobús:</strong>{' '}
                  {autobus.usos?.join(', ') || 'N/A'}
                </p>
                <p>
                  <strong>Nombre de Propietario:</strong>{' '}
                  {autobus.nombrepropietario || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}

        {!isEditing && (
          <div className={styles["modal-actions"]}>
            <div style={{ display: 'flex', gap: '8px', marginRight: 'auto' }}>
              <button className={styles["export-btn"]} onClick={exportToExcel}>
                Exportar a Excel
              </button>
              <button className={styles["export-btn"]} onClick={exportToPDF}>
                Exportar a PDF
              </button>
            </div>
            <div>
              <button className={styles["update-btn"]} onClick={handleEditClick}>
                Editar
              </button>
              <button className={styles["delete-btn"]} onClick={handleDelete}>
                Eliminar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AutobusModal;
