import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx'; // Para exportar a Excel
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas'; // Esta importación ya no se usará para el PDF
import Menu from '../../components/header/DashboardHeader';
import {
  obtenerRefacciones,
  eliminarRefaccion,
} from '../../services/refaccionService';
import RefactionForm from '../mantenimiento/FormularioRefaccion'; // Ajusta la ruta si es necesario
import styles from './RefaccionesComponent.module.css';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';

const RefaccionesComponent = () => {
  const [refacciones, setRefacciones] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [selectedRefaccion, setSelectedRefaccion] = useState(null);
  // Buscador
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar refacciones al montar
  useEffect(() => {
    cargarRefacciones();
  }, []);

  const cargarRefacciones = async () => {
    try {
      const data = await obtenerRefacciones();
      setRefacciones(data || []);
    } catch (error) {
      console.error('Error al cargar las refacciones:', error);
    }
  };

  // Iniciar edición
  const handleEditar = (ref) => {
    setEditandoId(ref._id);
    setSelectedRefaccion(ref);
  };

  // Eliminar refacción
  const handleEliminar = async (id) => {
    if (window.confirm('¿Está seguro que desea eliminar esta refacción?')) {
      try {
        await eliminarRefaccion(id);
        cargarRefacciones();
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  };

  // Completar edición (vuelve a cargar la lista)
  const handleEditComplete = () => {
    setEditandoId(null);
    setSelectedRefaccion(null);
    cargarRefacciones();
  };

  // Buscador - filtra por cualquier campo en la refacción
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filtrarRefacciones = () => {
    if (!searchTerm.trim()) {
      return refacciones;
    }
    return refacciones.filter((ref) =>
      Object.values(ref)
        .join(' ')
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  };

  const refaccionesFiltradas = filtrarRefacciones();

  // Exportar a Excel
  const exportToExcel = () => {
    const wsData = refaccionesFiltradas.map((ref) => ({
      'Código': ref.codigo || '',
      'Nombre': ref.nombreRefaccion || '',
      'Cantidad': ref.cantidad || 0,
      'Proveedor': ref.nombreProveedor || '',
      'Costo individual': ref.costoIndividual != null ? `$${ref.costoIndividual}` : '',
      'Costo total': ref.costoTotal != null ? `$${ref.costoTotal}` : '',
      'Descripción': ref.descripcion || ''
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Refacciones');
    XLSX.writeFile(wb, 'ListaRefacciones.xlsx');
  };

  // Exportar a PDF usando jsPDF y jspdf-autotable (nueva implementación)
  const handleDownloadPDF = () => {
    try {
      const pdf = new jsPDF('p', 'pt', 'a4');
      // Definir columnas para la tabla PDF
      const columns = [
        { header: "Código", dataKey: "codigo" },
        { header: "Nombre", dataKey: "nombreRefaccion" },
        { header: "Cantidad", dataKey: "cantidad" },
        { header: "Proveedor", dataKey: "nombreProveedor" },
        { header: "Costo individual", dataKey: "costoIndividual" },
        { header: "Costo total", dataKey: "costoTotal" },
        { header: "Descripción", dataKey: "descripcion" }
      ];

      // Mapeamos los datos filtrados a un arreglo de objetos
      const data = refaccionesFiltradas.map((ref) => ({
        codigo: ref.codigo || '',
        nombreRefaccion: ref.nombreRefaccion || '',
        cantidad: ref.cantidad || 0,
        nombreProveedor: ref.nombreProveedor || '',
        costoIndividual: ref.costoIndividual != null ? `$${ref.costoIndividual}` : '',
        costoTotal: ref.costoTotal != null ? `$${ref.costoTotal}` : '',
        descripcion: ref.descripcion || ''
      }));

      autoTable(pdf, {
        columns: columns,
        body: data,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [22, 160, 133] },
        margin: { top: 40, left: 20, right: 20 },
        didDrawPage: (dataArg) => {
          pdf.setFontSize(12);
          pdf.text("Lista de Refacciones", dataArg.settings.margin.left, 30);
        },
      });

      pdf.save('Refacciones.pdf');
    } catch (error) {
      console.error("Error generando el PDF:", error);
    }
  };

  // Si estamos en modo edición, mostramos el formulario
  if (editandoId) {
    return (
      <RefactionForm 
        isEditing={true} 
        refaccionId={editandoId} 
        initialData={selectedRefaccion}
        onEditComplete={handleEditComplete}
      />
    );
  }

  return (
    // Se asigna id="pdfContent" al contenedor que queremos capturar en PDF
    <div className={styles.mainContainer} id="pdfContent">
      {/* Contenedor del menú (se ignora en la exportación PDF mediante configuración) */}
      <div className={styles.menuContainer} id="menuContainer">
        <Menu />
      </div>

      <div className={styles.container}>
        <h2 className={styles.title}>Refacciones Registradas</h2>

        {/* Barra de búsqueda + botones de acción */}
        <div className={styles.toolbar}>
          <input
            type="text"
            placeholder="Buscador..."
            value={searchTerm}
            onChange={handleSearch}
            className={styles.searchInput}
          />
          <button className={styles.btnExport} onClick={exportToExcel}>
            Exportar a Excel
          </button>
          <button className={styles.btnExport} onClick={handleDownloadPDF}>
            Descargar PDF
          </button>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Cantidad</th>
                <th>Proveedor</th>
                <th>Costo individual</th>
                <th>Costo total</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {refaccionesFiltradas.length > 0 ? (
                refaccionesFiltradas.map((ref) => (
                  <tr key={ref._id}>
                    <td>{ref.codigo}</td>
                    <td>{ref.nombreRefaccion}</td>
                    <td>{ref.cantidad}</td>
                    <td>{ref.nombreProveedor}</td>
                    <td>{`$${ref.costoIndividual ?? ''}`}</td>
                    <td>{`$${ref.costoTotal ?? ''}`}</td>
                    <td>{ref.descripcion || '-'}</td>
                    <td className={styles.actions}>
                      <button 
                        className={`${styles.button} ${styles.editButton}`} 
                        onClick={() => handleEditar(ref)}
                      >
                        Editar
                      </button>
                      <button 
                        className={`${styles.button} ${styles.deleteButton}`} 
                        onClick={() => handleEliminar(ref._id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className={styles.emptyMessage}>
                    No hay refacciones registradas (o no coinciden con el filtro).
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RefaccionesComponent;
