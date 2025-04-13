import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Importa el plugin correctamente
import { getMantenimientos, deleteMantenimiento } from '../../services/manttoService';
import styles from './MantenimientosList.module.css';
import MaintenanceForm from '../mantenimiento/MaintenanceForm';
import Menu from '../../components/header/DashboardHeader';

const MantenimientosList = () => {
  const [mantenimientos, setMantenimientos] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    cargarMantenimientos();
  }, []);

  const cargarMantenimientos = async () => {
    try {
      const data = await getMantenimientos();
      if (data?.success && Array.isArray(data.data)) {
        setMantenimientos(data.data);
      } else if (Array.isArray(data)) {
        setMantenimientos(data);
      } else {
        setMantenimientos([]);
      }
    } catch (error) {
      console.error('Error al cargar mantenimientos:', error);
    }
  };

  const handleEditar = (mntId) => {
    setEditandoId(mntId);
    setShowForm(true);
  };

  const handleCancelarEdicion = () => {
    setEditandoId(null);
    setShowForm(false);
    cargarMantenimientos();
  };

  const handleEliminar = async (mntId) => {
    if (window.confirm('¿Eliminar este registro?')) {
      try {
        await deleteMantenimiento(mntId);
        cargarMantenimientos();
      } catch (error) {
        console.error('Error al eliminar mantenimiento:', error);
      }
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const exportToExcel = () => {
    const filteredData = filtrarMantenimientos();
    const wsData = filteredData.map((mnt) => ({
      'Fecha': mnt.fecha || '',
      'Hora': mnt.hora || '',
      '# Económico': mnt.numeroEconomico || '',
      'Operador': mnt.nombreOperador || '',
      'Kilometraje': mnt.kilometraje || '',
      'Falla': mnt.falla || '',
      'Solución': mnt.solucion || '',
      'Asignado': mnt.asignado || '',
      'Total': mnt.total || '',
      'Refacciones': (mnt.refacciones || []).map(r => r.nombre).join(', '),
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Mantenimientos');
    XLSX.writeFile(wb, 'ListaMantenimientos.xlsx');
  };

  const handleDownloadPDF = () => {
    try {
      // Crea la instancia de jsPDF (puedes probar con "l" para landscape)
      const pdf = new jsPDF('p', 'pt', 'a4');

      // Define las columnas para la tabla en el PDF
      const columns = [
        { header: 'Fecha', dataKey: 'fecha' },
        { header: 'Hora', dataKey: 'hora' },
        { header: '# Económico', dataKey: 'numeroEconomico' },
        { header: 'Operador', dataKey: 'nombreOperador' },
        { header: 'Kilometraje', dataKey: 'kilometraje' },
        { header: 'Falla', dataKey: 'falla' },
        { header: 'Solución', dataKey: 'solucion' },
        { header: 'Asignado', dataKey: 'asignado' },
        { header: 'Total', dataKey: 'total' },
        { header: 'Refacciones', dataKey: 'refacciones' },
      ];

      // Mapea los datos para la tabla
      const dataForPdf = filtrarMantenimientos().map((mnt) => ({
        fecha: mnt.fecha,
        hora: mnt.hora,
        numeroEconomico: mnt.numeroEconomico,
        nombreOperador: mnt.nombreOperador,
        kilometraje: mnt.kilometraje,
        falla: mnt.falla,
        solucion: mnt.solucion,
        asignado: mnt.asignado,
        total: `$${parseFloat(mnt.total || 0).toFixed(2)}`,
        refacciones: mnt.refacciones && mnt.refacciones.length > 0 
          ? mnt.refacciones.map((ref) => ref.nombre).join(', ')
          : 'N/A',
      }));

      // Utiliza autoTable pasando la instancia de pdf como primer parámetro
      autoTable(pdf, {
        columns: columns,
        body: dataForPdf,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [22, 160, 133] },
        margin: { top: 40 },
        didDrawPage: (data) => {
          pdf.setFontSize(12);
          pdf.text('Lista de Mantenimientos', data.settings.margin.left, 30);
        },
      });

      pdf.save('Mantenimientos.pdf');
    } catch (error) {
      console.error('Error generando el PDF:', error);
    }
  };

  const filtrarMantenimientos = () => {
    if (!searchTerm.trim()) {
      return mantenimientos;
    }
    return mantenimientos.filter((mnt) =>
      Object.values(mnt)
        .join(' ')
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  };

  const mantenimientosFiltrados = filtrarMantenimientos();

  return (
    <div className={styles.mainContainer} id="pdfContent">
      <div className={styles.menuContainer} id="menuContainer">
        <Menu />
      </div>

      <div className={styles.container}>
        <h2 className={styles.title}>Lista de Mantenimientos</h2>

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

        {showForm && editandoId ? (
          <MaintenanceForm
            isEditing={true}
            mantenimientoId={editandoId}
            onCancel={handleCancelarEdicion}
            onSuccess={handleCancelarEdicion}
          />
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th># Económico</th>
                  <th>Operador</th>
                  <th>Kilometraje</th>
                  <th>Falla</th>
                  <th>Solución</th>
                  <th>Asignado</th>
                  <th>Total</th>
                  <th>Refacciones</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {mantenimientosFiltrados.length > 0 ? (
                  mantenimientosFiltrados.map((mnt) => (
                    <tr key={mnt._id}>
                      <td>{mnt.fecha}</td>
                      <td>{mnt.hora}</td>
                      <td>{mnt.numeroEconomico}</td>
                      <td>{mnt.nombreOperador}</td>
                      <td>{mnt.kilometraje}</td>
                      <td>{mnt.falla}</td>
                      <td>{mnt.solucion}</td>
                      <td>{mnt.asignado}</td>
                      <td>${parseFloat(mnt.total || 0).toFixed(2)}</td>
                      <td>
                        {mnt.refacciones && mnt.refacciones.length > 0
                          ? mnt.refacciones.map((ref, index) => (
                              <span key={index}>
                                {ref.nombre}
                                {index < mnt.refacciones.length - 1 && ', '}
                              </span>
                            ))
                          : 'N/A'}
                      </td>
                      <td>
                        <div className={styles.btnContainer}>
                          <button
                            className={styles.btnEdit}
                            onClick={() => handleEditar(mnt._id)}
                          >
                            Editar
                          </button>
                          <button
                            className={styles.btnDelete}
                            onClick={() => handleEliminar(mnt._id)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" className={styles.noData}>
                      No hay registros de mantenimiento (con ese filtro).
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MantenimientosList;
