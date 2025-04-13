import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { getPropietarios, deletePropietario } from '../../services/propietarioService';
import Menu from '../../components/header/DashboardHeader';
import FormularioPropietario from '../autobuses/propietarioform';
import styles from './ListaPropietarios.module.css';
import das from '../header/Dashboard.module.css';

// Importamos las librerías necesarias para PDF
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ListaPropietarios = () => {
  const [propietarios, setPropietarios] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [initialData, setInitialData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    cargarPropietarios();
  }, []);

  const cargarPropietarios = async () => {
    try {
      const data = await getPropietarios();
      if (data?.success && Array.isArray(data.data)) {
        setPropietarios(data.data);
      } else if (Array.isArray(data)) {
        setPropietarios(data);
      } else {
        setPropietarios([]);
      }
    } catch (error) {
      console.error('Error al cargar propietarios:', error);
    }
  };

  const handleEditar = (prop) => {
    setInitialData(prop);
    setMostrarFormulario(true);
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Eliminar este propietario?')) {
      try {
        await deletePropietario(id);
        cargarPropietarios();
      } catch (error) {
        console.error('Error al eliminar propietario:', error);
      }
    }
  };

  const handleCerrarFormulario = () => {
    setMostrarFormulario(false);
    setInitialData(null);
    cargarPropietarios();
  };

  // Filtrado usando únicamente "nombrePropietario" y "rfc"
  const filteredPropietarios = propietarios.filter((prop) => {
    const texto = searchTerm.toLowerCase();
    return (
      prop.nombrePropietario?.toLowerCase().includes(texto) ||
      prop.rfc?.toLowerCase().includes(texto)
    );
  });

  // Función para formatear fechas (ej: "30 de enero de 2025")
  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Función para exportar a Excel con los campos: Nombre y RFC
  const exportToExcel = () => {
    setIsExporting(true);
    try {
      const wsData = filteredPropietarios.map((p) => ({
        'Nombre': p.nombrePropietario || '',
        'RFC': p.rfc || ''
      }));
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, 'Propietarios');
      XLSX.writeFile(wb, 'ListaPropietarios.xlsx');
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Función para generar PDF sin incluir el menú
  const handleDownloadPDF = async () => {
    setIsExporting(true);
    try {
      // Seleccionamos el contenedor a exportar (sin el menú)
      const input = document.getElementById('pdfContent');
      if (!input) return;
      html2canvas(input, { scale: 2 }).then((canvas) => {
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
        pdf.save('ListaPropietarios.pdf');
      }).catch((error) => {
        console.error('Error al generar el PDF:', error);
      }).finally(() => {
        setIsExporting(false);
      });
    } catch (error) {
      console.error('Error en handleDownloadPDF:', error);
      setIsExporting(false);
    }
  };

  return (
    <div className={styles.mainContainer}>
      {/* Menú (no se incluirá en el PDF) */}
      <div className={das.menuContainer}>
        <Menu />
      </div>

      {/* Contenedor a exportar en PDF */}
      <div id="pdfContent" className={styles.container}>
        <h2 className={styles.title}>Lista de Propietarios</h2>

        <div className={styles.toolBar}>
          <input
            type="text"
            placeholder="Buscar (nombre, RFC...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />

          <button
            className={`${styles.bigButton} ${styles.btnExport}`}
            onClick={exportToExcel}
            disabled={isExporting}
          >
            Exportar a Excel
          </button>

          <button
            className={`${styles.bigButton} ${styles.btnPrint}`}
            onClick={handleDownloadPDF}
            disabled={isExporting}
          >
            Descargar PDF
          </button>
        </div>

        {mostrarFormulario ? (
          <FormularioPropietario
            initialData={initialData}
            onClose={handleCerrarFormulario}
          />
        ) : (
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th>Nombre</th>
                <th>RFC</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {filteredPropietarios.length > 0 ? (
                filteredPropietarios.map((prop) => (
                  <tr key={prop._id}>
                    <td>{prop.nombrePropietario}</td>
                    <td>{prop.rfc}</td>
                    <td>
                      <div className={styles.btnContainer}>
                        <button
                          className={styles.btnEdit}
                          onClick={() => handleEditar(prop)}
                          disabled={isExporting}
                        >
                          Editar
                        </button>
                        <button
                          className={styles.btnDelete}
                          onClick={() => handleEliminar(prop._id)}
                          disabled={isExporting}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className={styles.noData}>
                    No hay propietarios registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ListaPropietarios;
