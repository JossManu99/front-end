import React, { useEffect, useState } from 'react';
import { getEmpresasRoles } from '../../services/empresaroles'; // Importa el servicio correctamente

const EmpresaDetalles = () => {
  const [empresaRol, setEmpresaRol] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Función para obtener los datos de la empresa y roles al cargar el componente
    const fetchEmpresaRol = async () => {
      try {
        const data = await getEmpresasRoles(); // Obtener los datos
        console.log('Datos obtenidos:', data); // Verifica los datos que recibimos
        setEmpresaRol(data);  // Asegúrate de que es un array, aunque sea con un solo objeto
      } catch (err) {
        setError('Error al obtener los datos');
        console.error('Error al obtener los datos:', err); // Muestra el error en consola
      } finally {
        setLoading(false);
      }
    };

    fetchEmpresaRol();
  }, []);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!empresaRol || empresaRol.length === 0) {
    return <div>No se encontraron datos.</div>;
  }

  // Función para formatear fecha
  const formatFecha = (fecha) => {
    const fechaCreacion = new Date(fecha);
    return !isNaN(fechaCreacion)
      ? fechaCreacion.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      : 'Fecha inválida';
  };

  return (
    <div>
      <h2>Detalles de la Empresa y Rol</h2>
      
      <table border="1" cellPadding="10" style={{ width: '100%', marginTop: '20px' }}>
        <thead>
          <tr>
            <th>Empresa/Rol</th>
            <th>Turnos</th>
            <th>Rutas</th>
            <th>Elaborado por</th>
            <th>Fecha de creación</th>
          </tr>
        </thead>
        <tbody>
          {empresaRol.map((datosEmpresa, index) => {
            const turnos = datosEmpresa.turnos && datosEmpresa.turnos.length > 0
              ? datosEmpresa.turnos.join(', ')
              : 'No hay turnos disponibles';
            const rutas = datosEmpresa.rutas && datosEmpresa.rutas.length > 0
              ? datosEmpresa.rutas.join(', ')
              : 'No hay rutas disponibles';

            return (
              <tr key={index}>
                <td>{datosEmpresa.empresarol}</td>
                <td>{turnos}</td>
                <td>{rutas}</td>
                <td>{datosEmpresa.elaboradoPor}</td>
                <td>{formatFecha(datosEmpresa.fechaCreacion)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default EmpresaDetalles;
