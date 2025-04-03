// MaintenanceForm.jsx
import { useState, useEffect } from 'react';
import { getOperadores } from '../../services/OperadorService';
import { getAutobuses } from '../../services/AutobusesService';
import { createMantenimiento, updateMantenimiento } from '../../services/manttoService';
import {
  obtenerRefacciones,
  crearRefaccion,
  actualizarRefaccion, // Función que espera un objeto con _id y datos a actualizar
} from '../../services/refaccionService';

import styles from './MaintenanceForm.module.css';
import Menu from '../../components/header/DashboardHeader';
import das from '../header/Dashboard.module.css';

const MaintenanceForm = ({ isEditing = false, mantenimientoId = null }) => {
  // Fecha y hora actuales
  const today = new Date();
  const formattedDate = today.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formattedTime = today.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Datos principales del formulario
  const [formData, setFormData] = useState({
    fecha: formattedDate,
    hora: formattedTime,
    numeroEconomico: '',
    nombreOperador: '',
    kilometraje: '',
    falla: '',
    solucion: '',
    horasUsadas: { inicio: '', fin: '' },
    asignado: '',
  });

  // Lista de refacciones que se usarán en este mantenimiento
  const [refaccionesList, setRefaccionesList] = useState([]);

  // Lista de refacciones existentes en la BD
  const [allRefacciones, setAllRefacciones] = useState([]);

  // Total calculado
  const [total, setTotal] = useState('0.00');

  // Catálogos
  const [operadores, setOperadores] = useState([]);
  const [autobuses, setAutobuses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Control de errores y éxito
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Simulación de usuario (por ejemplo, admin)
  const [userData] = useState({ role: 'admin' });

  // ─────────────────────────────────────────
  // Cargar catálogos y refacciones de la BD
  // ─────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const operadoresData = await getOperadores();
        const autobusesData = await getAutobuses();
        const refaccionesData = await obtenerRefacciones();

        if (refaccionesData.exito && Array.isArray(refaccionesData.datos)) {
          setAllRefacciones(refaccionesData.datos);
        } else {
          setAllRefacciones([]);
        }

        setOperadores(operadoresData);
        setAutobuses(autobusesData);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos. Por favor, intente de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ─────────────────────────────────────────
  // Calcular total cada vez que cambian las refacciones
  // ─────────────────────────────────────────
  useEffect(() => {
    const sum = refaccionesList.reduce((acc, item) => {
      if (item.isNew) {
        // Para refacciones nuevas usamos el costo total ingresado
        return acc + parseFloat(item.costoTotal || '0');
      } else {
        // Para refacciones existentes: costo = cantidadUsada * costIndividual
        const usedQty = parseFloat(item.cantidadUsada || '0');
        const costInd = parseFloat(item.costIndividual || '0');
        return acc + (usedQty * costInd);
      }
    }, 0);
    setTotal(sum.toFixed(2));
  }, [refaccionesList]);

  // ─────────────────────────────────────────
  // Handlers para el formulario
  // ─────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTimeChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      horasUsadas: { ...prev.horasUsadas, [field]: value },
    }));
  };

  // ─────────────────────────────────────────
  // Agregar refacción EXISTENTE
  // ─────────────────────────────────────────
  const handleAddExistingRefaccion = () => {
    const newId =
      refaccionesList.length > 0
        ? Math.max(...refaccionesList.map((item) => item.id)) + 1
        : 1;

    setRefaccionesList((prev) => [
      ...prev,
      {
        id: newId,
        isNew: false,
        refaccionId: '',
        nombre: '',
        costIndividual: '0', // se obtendrá de la BD
        stock: '0',          // stock actual
        cantidadUsada: '1',  // por defecto 1 pieza
        descripcion: '',
      },
    ]);
  };

  // ─────────────────────────────────────────
  // Al seleccionar una refacción existente
  // ─────────────────────────────────────────
  const handleRefaccionSelectChange = (rowId, selectedRefaccionId) => {
    const refBD = allRefacciones.find((r) => r._id === selectedRefaccionId);
    setRefaccionesList((prev) =>
      prev.map((item) => {
        if (item.id === rowId) {
          return {
            ...item,
            refaccionId: selectedRefaccionId,
            nombre: refBD?.nombreRefaccion || '',
            costIndividual: refBD?.costoIndividual?.toString() || '0',
            stock: refBD?.cantidad?.toString() || '0',
            cantidadUsada: '1',
            descripcion: '',
          };
        }
        return item;
      })
    );
  };

  // ─────────────────────────────────────────
  // Agregar refacción NUEVA
  // ─────────────────────────────────────────
  const handleAddNewRefaccion = () => {
    const newId =
      refaccionesList.length > 0
        ? Math.max(...refaccionesList.map((item) => item.id)) + 1
        : 1;

    setRefaccionesList((prev) => [
      ...prev,
      {
        id: newId,
        isNew: true,
        cantidad: '',         // stock inicial
        codigo: '',
        nombreRefaccion: '',
        nombreProveedor: '',
        costoTotal: '',
        descripcion: '',
      },
    ]);
  };

  // ─────────────────────────────────────────
  // Manejar cambios en las filas de refacción
  // ─────────────────────────────────────────
  const handleRefaccionChange = (rowId, field, value) => {
    setRefaccionesList((prev) =>
      prev.map((item) => (item.id === rowId ? { ...item, [field]: value } : item))
    );
  };

  // ─────────────────────────────────────────
  // Guardar refacción NUEVA en la BD
  // ─────────────────────────────────────────
  const handleSaveNewRefaccion = async (rowId) => {
    try {
      const fila = refaccionesList.find((r) => r.id === rowId);
      if (!fila) return;

      const payload = {
        cantidad: fila.cantidad,
        nombreRefaccion: fila.nombreRefaccion,
        codigo: fila.codigo,
        nombreProveedor: fila.nombreProveedor,
        costoTotal: fila.costoTotal,
        descripcion: fila.descripcion,
      };

      const resp = await crearRefaccion(payload);
      if (!resp.exito) {
        alert(`Error al crear la refacción: ${resp.error || ''}`);
        return;
      }

      const nuevaRef = resp.datos;

      // Agregar la nueva refacción a la lista de refacciones de la BD
      setAllRefacciones((prev) => [...prev, nuevaRef]);

      // Actualizar la fila: dejar de ser "isNew" y asignar datos devueltos
      setRefaccionesList((prev) =>
        prev.map((item) => {
          if (item.id === rowId) {
            return {
              ...item,
              isNew: false,
              refaccionId: nuevaRef._id || '',
              nombre: nuevaRef.nombreRefaccion,
              costIndividual: nuevaRef.costoIndividual?.toString() || '0',
              stock: nuevaRef.cantidad?.toString() || '0',
              cantidadUsada: '1',
            };
          }
          return item;
        })
      );

      alert('Refacción creada y agregada correctamente.');
    } catch (err) {
      console.error('Error al crear la refacción:', err);
      alert('Error al crear la refacción. Revisa la consola.');
    }
  };

  // ─────────────────────────────────────────
  // Eliminar fila de refacción
  // ─────────────────────────────────────────
  const handleRemoveRefaccion = (rowId) => {
    setRefaccionesList((prev) => prev.filter((item) => item.id !== rowId));
  };

  // ─────────────────────────────────────────
  // Enviar (Crear/Actualizar) mantenimiento
  // ─────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    // 1) Actualizar stock en la BD para refacciones existentes
    try {
      for (const item of refaccionesList) {
        if (!item.isNew) {
          const usedQty = parseFloat(item.cantidadUsada || '0');
          const currentStock = parseFloat(item.stock || '0');
          if (usedQty > 0) {
            const newStock = currentStock - usedQty;
            if (newStock < 0) {
              alert(
                `La refacción "${item.nombre}" no tiene stock suficiente (stock actual: ${currentStock}, intentas usar: ${usedQty}).`
              );
              continue;
            }
            // Verificar que refaccionId exista y no sea undefined
            if (item.refaccionId) {
              // Llamamos a la función pasando un objeto con _id y los datos a actualizar
              await actualizarRefaccion({ _id: item.refaccionId, cantidad: newStock });
            } else {
              console.warn(
                `No se actualizó el stock para la refacción "${item.nombre}" ya que no se ha seleccionado un ID válido.`
              );
            }
          }
        }
      }
    } catch (err) {
      console.error('Error al actualizar stock de refacciones:', err);
      setError('Error al actualizar stock de alguna refacción.');
      setSubmitting(false);
      return;
    }

    // 2) Armar arreglo de refacciones para el mantenimiento
    const refaccionesParaMantenimiento = refaccionesList.map((item) => {
      if (item.isNew) {
        return {
          nombreRefaccion: item.nombreRefaccion,
          codigo: item.codigo,
          cantidad: item.cantidad,
          costoTotal: parseFloat(item.costoTotal || '0'),
          descripcion: item.descripcion,
        };
      } else {
        const usedQty = parseFloat(item.cantidadUsada || '0');
        const costInd = parseFloat(item.costIndividual || '0');
        return {
          nombreRefaccion: item.nombre,
          cantidad: usedQty,
          costoTotal: usedQty * costInd,
          descripcion: item.descripcion,
        };
      }
    });

    // 3) Armar objeto final para enviar mantenimiento
    const dataToSubmit = {
      ...formData,
      refacciones: refaccionesParaMantenimiento,
      total: parseFloat(total),
    };

    try {
      if (isEditing && mantenimientoId) {
        await updateMantenimiento(mantenimientoId, dataToSubmit);
      } else {
        await createMantenimiento(dataToSubmit);
      }
      setSuccess(true);
      if (!isEditing) {
        // Resetear formulario en creación
        setFormData({
          fecha: formattedDate,
          hora: formattedTime,
          numeroEconomico: '',
          nombreOperador: '',
          kilometraje: '',
          falla: '',
          solucion: '',
          horasUsadas: { inicio: '', fin: '' },
          asignado: '',
        });
        setRefaccionesList([]);
        setTotal('0.00');
      }
    } catch (err) {
      console.error('Error al guardar el mantenimiento:', err);
      setError('Error al guardar el registro. Por favor, intente de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─────────────────────────────────────────
  // Cancelar
  // ─────────────────────────────────────────
  const handleCancel = () => {
    if (window.confirm('¿Está seguro de cancelar? Se perderán los datos no guardados.')) {
      setFormData({
        fecha: formattedDate,
        hora: formattedTime,
        numeroEconomico: '',
        nombreOperador: '',
        kilometraje: '',
        falla: '',
        solucion: '',
        horasUsadas: { inicio: '', fin: '' },
        asignado: '',
      });
      setRefaccionesList([]);
      setTotal('0.00');
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  // Separar refacciones existentes y nuevas
  const refaccionesExistentes = refaccionesList.filter((item) => !item.isNew);
  const refaccionesNuevas = refaccionesList.filter((item) => item.isNew);

  return (
    <div className={styles.maincontainer}>
      {/* Menú de navegación */}
      <div className={das.navigationMenu}>
        {userData?.role === 'admin' && (
          <div className={das.menuContainer}>
            <Menu />
          </div>
        )}
      </div>

      <div className={styles.formContainer}>
        <div className={styles.formHeader}>
          <div className={styles.formTitle}>
            <span className={styles.icon}>⌨️</span>
            {isEditing
              ? 'Editar registro de mantenimiento'
              : 'Registro de mantenimiento por flotilla'}
          </div>
          <p className={styles.formInstructions}>
            Llene el siguiente formulario. Los campos obligatorios están marcados con *
          </p>
          {success && (
            <div className={styles.successMessage}>
              Registro {isEditing ? 'actualizado' : 'creado'} exitosamente.
            </div>
          )}
          {error && <div className={styles.errorMessage}>{error}</div>}
          <hr className={styles.divider} />
        </div>

        <form onSubmit={handleSubmit}>
          {/* Fecha y Hora */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="fecha">Fecha de hoy</label>
              <input
                type="text"
                id="fecha"
                name="fecha"
                value={formData.fecha}
                className={styles.formControl}
                disabled
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="hora">Hora actual</label>
              <input
                type="text"
                id="hora"
                name="hora"
                value={formData.hora}
                className={styles.formControl}
                disabled
              />
            </div>
          </div>

          {/* Número Económico y Operador */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="numeroEconomico"># Número económico *</label>
              <div className={styles.inputWithIcon}>
                <select
                  id="numeroEconomico"
                  name="numeroEconomico"
                  value={formData.numeroEconomico}
                  onChange={handleChange}
                  className={styles.inputWithIconControl}
                  required
                >
                  <option value="">Seleccione un número económico</option>
                  {autobuses.map((autobus) => (
                    <option
                      key={autobus._id || `bus-${autobus.numeroEconomico}`}
                      value={autobus.numeroEconomico}
                    >
                      {autobus.numeroEconomico}
                    </option>
                  ))}
                </select>
                <div className={styles.iconOverlay} style={{ backgroundColor: '#ccc' }}>
                  <span>Q</span>
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="nombreOperador"># Nombre operador *</label>
              <select
                id="nombreOperador"
                name="nombreOperador"
                value={formData.nombreOperador}
                onChange={handleChange}
                className={styles.formControl}
                required
              >
                <option value="">Seleccione un operador</option>
                {operadores.map((operador) => (
                  <option
                    key={operador._id || `op-${operador.nombre}`}
                    value={operador.nombre}
                  >
                    {operador.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* (Opcional) Tabla de ejemplo */}
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Núm. económico</th>
                  <th>Km</th>
                  <th>Falla</th>
                  <th>Solución</th>
                  <th>Refacciones</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{/* Ejemplo */}</td>
                  <td>{/* Ejemplo */}</td>
                  <td>{/* Ejemplo */}</td>
                  <td>{/* Ejemplo */}</td>
                  <td>{/* Ejemplo */}</td>
                  <td>{/* Ejemplo */}</td>
                  <td>{/* Ejemplo */}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Kilometraje */}
          <div className={styles.formRow}>
            <div className={styles.formGroupFull}>
              <label htmlFor="kilometraje"># Kilometraje *</label>
              <input
                type="text"
                id="kilometraje"
                name="kilometraje"
                value={formData.kilometraje}
                onChange={handleChange}
                className={styles.formControl}
                placeholder="Escriba aquí..."
                required
              />
            </div>
          </div>

          {/* Falla, Solución y Horarios */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="falla"># Falla *</label>
              <textarea
                id="falla"
                name="falla"
                value={formData.falla}
                onChange={handleChange}
                className={styles.textArea}
                placeholder="Escriba aquí..."
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="solucion"># Solución *</label>
              <textarea
                id="solucion"
                name="solucion"
                value={formData.solucion}
                onChange={handleChange}
                className={styles.textArea}
                placeholder="Escriba aquí..."
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="horasUsadas"># Horarios (Inicio/Fin) *</label>
              <div className={styles.timeInputContainer}>
                <div className={styles.timeInputWithIcon}>
                  <input
                    type="text"
                    id="horasInicio"
                    name="horasInicio"
                    value={formData.horasUsadas.inicio}
                    onChange={(e) => handleTimeChange('inicio', e.target.value)}
                    className={styles.timeInput}
                    placeholder="00:00 a.m."
                    required
                  />
                  <div className={styles.timeIconOverlay}>
                    <span>⌚</span>
                  </div>
                </div>
                <div className={styles.timeInputWithIcon}>
                  <input
                    type="text"
                    id="horasFin"
                    name="horasFin"
                    value={formData.horasUsadas.fin}
                    onChange={(e) => handleTimeChange('fin', e.target.value)}
                    className={styles.timeInput}
                    placeholder="00:00 a.m."
                    required
                  />
                  <div className={styles.timeIconOverlay}>
                    <span>⌚</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sección de Refacciones */}
          <div className={styles.refaccionesCard}>
            <h3 className={styles.refaccionesTitle}>Refacciones</h3>
            <div style={{ marginBottom: '1rem' }}>
              <button
                type="button"
                onClick={handleAddExistingRefaccion}
                className={styles.addRefaccionButton}
              >
                + Agregar Refacción (existente)
              </button>
              &nbsp;
              <button
                type="button"
                onClick={handleAddNewRefaccion}
                className={styles.addRefaccionButton}
              >
                + Cargar Refacción (nueva)
              </button>
            </div>

            {/* Refacciones existentes */}
            {refaccionesExistentes.length > 0 && (
              <div className={styles.refaccionesGrid}>
                <div className={styles.refaccionesHeader}>
                  <div className={styles.refaccionesHeaderItem}># Refacción *</div>
                  <div className={styles.refaccionesHeaderItem}>Stock</div>
                  <div className={styles.refaccionesHeaderItem}>Costo</div>
                  <div className={styles.refaccionesHeaderItem}>Cantidad Usada</div>
                  <div className={styles.refaccionesHeaderItem}>Descripción</div>
                  <div className={styles.refaccionesHeaderItem}>Acciones</div>
                </div>
                {refaccionesExistentes.map((ref) => {
                  // Calculamos el costo parcial (cantidadUsada * costIndividual)
                  const usedQty = parseFloat(ref.cantidadUsada || '0');
                  const costInd = parseFloat(ref.costIndividual || '0');
                  const partialCost = (usedQty * costInd).toFixed(2);

                  return (
                    <div key={ref.id} className={styles.refaccionesRow}>
                      {/* Selección de refacción */}
                      <div className={styles.refaccionesCell}>
                        <select
                          value={ref.refaccionId}
                          onChange={(e) =>
                            handleRefaccionSelectChange(ref.id, e.target.value)
                          }
                          className={styles.refaccionInput}
                          required
                        >
                          <option value="">-- Seleccione --</option>
                          {allRefacciones.map((r) => (
                            <option key={r._id} value={r._id}>
                              {r.nombreRefaccion}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Stock (solo lectura) */}
                      <div className={styles.refaccionesCell}>
                        <input
                          type="text"
                          value={ref.stock}
                          className={styles.refaccionInput}
                          disabled
                        />
                      </div>

                      {/* Costo (solo lectura, calculado) */}
                      <div className={styles.refaccionesCell}>
                        <input
                          type="text"
                          value={partialCost}
                          className={styles.refaccionInput}
                          disabled
                        />
                      </div>

                      {/* Cantidad usada (editable) */}
                      <div className={styles.refaccionesCell}>
                        <input
                          type="text"
                          value={ref.cantidadUsada}
                          onChange={(e) =>
                            handleRefaccionChange(ref.id, 'cantidadUsada', e.target.value)
                          }
                          className={styles.refaccionInput}
                          placeholder="1"
                        />
                      </div>

                      {/* Descripción */}
                      <div className={styles.refaccionesCell}>
                        <textarea
                          value={ref.descripcion}
                          onChange={(e) =>
                            handleRefaccionChange(ref.id, 'descripcion', e.target.value)
                          }
                          className={styles.descripcionTextarea}
                          placeholder="Escriba aquí..."
                        />
                      </div>

                      {/* Acciones (eliminar) */}
                      <div className={styles.refaccionesCell}>
                        <button
                          type="button"
                          onClick={() => handleRemoveRefaccion(ref.id)}
                          className={styles.removeRefaccionButton}
                        >
                          ❌
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Refacciones nuevas */}
            {refaccionesNuevas.length > 0 &&
              refaccionesNuevas.map((ref) => (
                <div key={ref.id} className={styles.newRefaccionBlock}>
                  <div className={styles.formGroup}>
                    <label>Cantidad (stock) *</label>
                    <input
                      type="text"
                      placeholder="ej: 3"
                      value={ref.cantidad}
                      onChange={(e) =>
                        handleRefaccionChange(ref.id, 'cantidad', e.target.value)
                      }
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Código *</label>
                    <input
                      type="text"
                      placeholder="ej: RF001"
                      value={ref.codigo}
                      onChange={(e) =>
                        handleRefaccionChange(ref.id, 'codigo', e.target.value)
                      }
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Nombre refacción *</label>
                    <input
                      type="text"
                      placeholder="ej: Tanque de gasolina"
                      value={ref.nombreRefaccion}
                      onChange={(e) =>
                        handleRefaccionChange(ref.id, 'nombreRefaccion', e.target.value)
                      }
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Nombre proveedor *</label>
                    <input
                      type="text"
                      placeholder="ej: Proveedor XYZ"
                      value={ref.nombreProveedor}
                      onChange={(e) =>
                        handleRefaccionChange(ref.id, 'nombreProveedor', e.target.value)
                      }
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Costo total *</label>
                    <input
                      type="text"
                      placeholder="ej: 1000.00"
                      value={ref.costoTotal}
                      onChange={(e) =>
                        handleRefaccionChange(ref.id, 'costoTotal', e.target.value)
                      }
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Descripción</label>
                    <textarea
                      placeholder="ej: Alguna descripción"
                      value={ref.descripcion}
                      onChange={(e) =>
                        handleRefaccionChange(ref.id, 'descripcion', e.target.value)
                      }
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <button
                      type="button"
                      onClick={() => handleSaveNewRefaccion(ref.id)}
                      className={styles.saveRefaccionButton}
                    >
                      Guardar
                    </button>
                    &nbsp;
                    <button
                      type="button"
                      onClick={() => handleRemoveRefaccion(ref.id)}
                      className={styles.removeRefaccionButton}
                    >
                      ❌
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* Total y Asignado */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="total"># Total *</label>
              <input
                type="text"
                id="total"
                name="total"
                value={total}
                className={styles.formControl}
                placeholder="000.00"
                readOnly
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="asignado"># Asignado? *</label>
              <input
                type="text"
                id="asignado"
                name="asignado"
                value={formData.asignado}
                onChange={handleChange}
                className={styles.formControl}
                placeholder="Nombre del asignado"
                required
              />
            </div>
          </div>

          {/* Botones */}
          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.registerButton} disabled={submitting}>
              {submitting ? 'PROCESANDO...' : isEditing ? 'ACTUALIZAR' : 'REGISTRAR'}
            </button>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleCancel}
              disabled={submitting}
            >
              CANCELAR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceForm;
