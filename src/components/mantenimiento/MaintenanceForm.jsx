import { useState, useEffect } from 'react';
import { getOperadores } from '../../services/OperadorService';
import { getAutobuses } from '../../services/AutobusesService';
import {
  createMantenimiento,
  updateMantenimiento,
  getMantenimientoById
} from '../../services/manttoService';
import {
  obtenerRefacciones,
  crearRefaccion,
  actualizarRefaccion,
} from '../../services/refaccionService';

import styles from './MaintenanceForm.module.css';
import Menu from '../../components/header/DashboardHeader';
import das from '../header/Dashboard.module.css';

const MaintenanceForm = ({ isEditing = false, mantenimientoId = null, onCancel, onSuccess }) => {
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

  // Estado del formulario principal
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

  // Estado para refacciones seleccionadas en el mantenimiento
  const [refaccionesList, setRefaccionesList] = useState([]);
  // Todas las refacciones disponibles (se obtiene desde la BD)
  const [allRefacciones, setAllRefacciones] = useState([]);
  // Total calculado
  const [total, setTotal] = useState('0.00');

  // Catálogos
  const [operadores, setOperadores] = useState([]);
  const [autobuses, setAutobuses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Control de errores, éxito y envío
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Simulación de usuario (por ejemplo, admin)
  const [userData] = useState({ role: 'admin' });

  // ─────────────────────────────
  // 1. Cargar catálogos y refacciones de la BD
  // ─────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const operadoresData = await getOperadores();
        const autobusesData = await getAutobuses();
        const refaccionesData = await obtenerRefacciones();

        // En este servicio se retorna directamente el array (response.data.datos)
        if (Array.isArray(refaccionesData)) {
          setAllRefacciones(refaccionesData);
        } else {
          setAllRefacciones([]);
        }
        setOperadores(operadoresData);
        setAutobuses(autobusesData);
      } catch (err) {
        setError('Error al cargar los datos. Por favor, inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ─────────────────────────────
  // 2. Si se edita, cargar el mantenimiento y mapear sus refacciones
  // ─────────────────────────────
  useEffect(() => {
    if (isEditing && mantenimientoId) {
      const fetchMaintenance = async () => {
        try {
          const response = await getMantenimientoById(mantenimientoId);
          if (response?.success && response.data) {
            const mto = response.data;
            setFormData({
              fecha: mto.fecha || formattedDate,
              hora: mto.hora || formattedTime,
              numeroEconomico: mto.numeroEconomico || '',
              nombreOperador: mto.nombreOperador || '',
              kilometraje: mto.kilometraje || '',
              falla: mto.falla || '',
              solucion: mto.solucion || '',
              horasUsadas: mto.horasUsadas || { inicio: '', fin: '' },
              asignado: mto.asignado || '',
            });
            if (mto.refacciones && Array.isArray(mto.refacciones)) {
              // Aquí asumimos que en el mantenimiento las refacciones se guardan con:
              // nombre, costo, descripcion y total (por ejemplo)
              const mappedRefacciones = mto.refacciones.map((ref, index) => ({
                id: index + 1,
                isNew: false,
                refaccionId: ref._id || '', // Puede estar vacío si no se guardó el _id
                nombre: ref.nombre || '',  // En el mantenimiento viene "nombre"
                costIndividual: ref.costo ? ref.costo.toString() : '0',
                stock: ref.cantidad ? ref.cantidad.toString() : '0',
                cantidadUsada: ref.cantidad ? ref.cantidad.toString() : '1',
                descripcion: ref.descripcion || '',
              }));
              setRefaccionesList(mappedRefacciones);
            }
          }
        } catch (err) {
          // Manejar error según convenga
        }
      };
      fetchMaintenance();
    }
  }, [isEditing, mantenimientoId, formattedDate, formattedTime]);

  // ─────────────────────────────
  // 2.1 Actualizar las filas de refacciones ya cargadas al tener allRefacciones
  // para preseleccionar el spinner según el nombre.
  // Si alguna fila de refacción (en edición) tiene el campo "nombre" y no tiene refaccionId,
  // se intenta encontrar en allRefacciones una opción cuyo nombreRefaccion coincida.
  // ─────────────────────────────
  useEffect(() => {
    if (isEditing && mantenimientoId && allRefacciones.length > 0 && refaccionesList.length > 0) {
      const updatedList = refaccionesList.map(item => {
        if (!item.refaccionId && item.nombre) {
          const found = allRefacciones.find(r => r.nombreRefaccion === item.nombre);
          if (found) {
            return {
              ...item,
              refaccionId: found._id,
              costIndividual: found.costoIndividual ? found.costoIndividual.toString() : '0',
              stock: found.cantidad ? found.cantidad.toString() : '0',
            };
          }
        }
        return item;
      });
      setRefaccionesList(updatedList);
    }
  }, [isEditing, mantenimientoId, allRefacciones, refaccionesList]);

  // ─────────────────────────────
  // 3. Calcular total a partir de refaccionesList
  // ─────────────────────────────
  useEffect(() => {
    const sum = refaccionesList.reduce((acc, item) => {
      if (item.isNew) {
        return acc + parseFloat(item.costoTotal || '0');
      } else {
        const usedQty = parseFloat(item.cantidadUsada || '0');
        const costInd = parseFloat(item.costIndividual || '0');
        return acc + usedQty * costInd;
      }
    }, 0);
    setTotal(sum.toFixed(2));
  }, [refaccionesList]);

  // ─────────────────────────────
  // Handlers generales
  // ─────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTimeChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      horasUsadas: { ...prev.horasUsadas, [field]: value }
    }));
  };

  // ─────────────────────────────
  // 4. Agregar refacción EXISTENTE (fila vacía para seleccionar)
  // ─────────────────────────────
  const handleAddExistingRefaccion = () => {
    const newId = refaccionesList.length > 0
      ? Math.max(...refaccionesList.map(item => item.id)) + 1
      : 1;
    setRefaccionesList(prev => [
      ...prev,
      {
        id: newId,
        isNew: false,
        refaccionId: '',
        nombre: '',
        costIndividual: '0',
        stock: '0',
        cantidadUsada: '1',
        descripcion: '',
      }
    ]);
  };

  // ─────────────────────────────
  // 5. Al seleccionar una refacción en el spinner, asignar sus datos
  // ─────────────────────────────
  const handleRefaccionSelectChange = (rowId, selectedRefaccionId) => {
    const refBD = allRefacciones.find(r => r._id === selectedRefaccionId);
    if (!refBD) return;
    setRefaccionesList(prev =>
      prev.map(item =>
        item.id === rowId
          ? {
              ...item,
              refaccionId: refBD._id,
              nombre: refBD.nombreRefaccion,
              costIndividual: refBD.costoIndividual ? refBD.costoIndividual.toString() : '0',
              stock: refBD.cantidad ? refBD.cantidad.toString() : '0',
              cantidadUsada: '1',
              descripcion: refBD.descripcion || '',
            }
          : item
      )
    );
  };

  // ─────────────────────────────
  // 6. Agregar refacción NUEVA (no existe en la BD)
  // ─────────────────────────────
  const handleAddNewRefaccion = () => {
    const newId = refaccionesList.length > 0
      ? Math.max(...refaccionesList.map(item => item.id)) + 1
      : 1;
    setRefaccionesList(prev => [
      ...prev,
      {
        id: newId,
        isNew: true,
        cantidad: '',
        codigo: '',
        nombreRefaccion: '',
        nombreProveedor: '',
        costoTotal: '',
        descripcion: '',
      }
    ]);
  };

  // ─────────────────────────────
  // 7. Cambios en la fila de refacción
  // ─────────────────────────────
  const handleRefaccionChange = (rowId, field, value) => {
    setRefaccionesList(prev =>
      prev.map(item => (item.id === rowId ? { ...item, [field]: value } : item))
    );
  };

  // ─────────────────────────────
  // 8. Guardar refacción NUEVA en la BD
  // ─────────────────────────────
  const handleSaveNewRefaccion = async (rowId) => {
    try {
      const fila = refaccionesList.find(r => r.id === rowId);
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
      setAllRefacciones(prev => [...prev, nuevaRef]);
      setRefaccionesList(prev =>
        prev.map(item =>
          item.id === rowId
            ? {
                ...item,
                isNew: false,
                refaccionId: nuevaRef._id || '',
                nombre: nuevaRef.nombreRefaccion,
                costIndividual: nuevaRef.costoIndividual ? nuevaRef.costoIndividual.toString() : '0',
                stock: nuevaRef.cantidad ? nuevaRef.cantidad.toString() : '0',
                cantidadUsada: '1',
              }
            : item
        )
      );
      alert('Refacción creada y agregada correctamente.');
    } catch (err) {
      alert('Error al crear la refacción. Revisa la consola.');
    }
  };

  // ─────────────────────────────
  // 9. Eliminar fila de refacción
  // ─────────────────────────────
  const handleRemoveRefaccion = (rowId) => {
    setRefaccionesList(prev => prev.filter(item => item.id !== rowId));
  };

  // ─────────────────────────────
  // 10. Enviar mantenimiento (Crear/Actualizar)
  // ─────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    // Actualizar stock para refacciones existentes (si corresponde)
    try {
      for (const item of refaccionesList) {
        if (!item.isNew) {
          const usedQty = parseFloat(item.cantidadUsada || '0');
          const currentStock = parseFloat(item.stock || '0');
          if (usedQty > 0) {
            const newStock = currentStock - usedQty;
            if (newStock < 0) {
              alert(`La refacción "${item.nombre}" no tiene stock suficiente.`);
              continue;
            }
            if (item.refaccionId) {
              await actualizarRefaccion({ _id: item.refaccionId, cantidad: newStock });
            }
          }
        }
      }
    } catch (err) {
      setError('Error al actualizar stock de alguna refacción.');
      setSubmitting(false);
      return;
    }

    const refaccionesParaMantenimiento = refaccionesList.map(item => {
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
      if (onSuccess) onSuccess();
    } catch (err) {
      setError('Error al guardar el registro. Por favor, inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─────────────────────────────
  // 11. Cancelar acción
  // ─────────────────────────────
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
      if (onCancel) onCancel();
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  // Separar refacciones existentes y nuevas
  const refaccionesExistentes = refaccionesList.filter(item => !item.isNew);
  const refaccionesNuevas = refaccionesList.filter(item => item.isNew);

  return (
    <div className={styles.maincontainer}>
      {!isEditing && userData?.role === 'admin' && (
        <div className={das.navigationMenu}>
          <div className={das.menuContainer}>
            <Menu />
          </div>
        </div>
      )}

      <div className={styles.formContainer}>
        <div className={styles.formHeader}>
          <div className={styles.formTitle}>
            <span className={styles.icon}>⌨️</span>
            {isEditing ? 'Editar registro de mantenimiento' : 'Registro de mantenimiento por flotilla'}
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
              <input type="text" id="fecha" name="fecha" value={formData.fecha} className={styles.formControl} disabled />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="hora">Hora actual</label>
              <input type="text" id="hora" name="hora" value={formData.hora} className={styles.formControl} disabled />
            </div>
          </div>

          {/* Número Económico y Operador */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="numeroEconomico"># Número económico *</label>
              <div className={styles.inputWithIcon}>
                <select id="numeroEconomico" name="numeroEconomico" value={formData.numeroEconomico} onChange={handleChange} className={styles.inputWithIconControl} required>
                  <option value="">Seleccione un número económico</option>
                  {autobuses.map(autobus => (
                    <option key={autobus._id} value={autobus.numeroEconomico}>
                      {autobus.numeroEconomico}
                    </option>
                  ))}
                </select>
                <div className={styles.iconOverlay} style={{ backgroundColor: '#ccc' }}><span>Q</span></div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="nombreOperador"># Nombre operador *</label>
              <select id="nombreOperador" name="nombreOperador" value={formData.nombreOperador} onChange={handleChange} className={styles.formControl} required>
                <option value="">Seleccione un operador</option>
                {operadores.map(op => (
                  <option key={op._id} value={op.nombre}>
                    {op.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Kilometraje */}
          <div className={styles.formRow}>
            <div className={styles.formGroupFull}>
              <label htmlFor="kilometraje"># Kilometraje *</label>
              <input type="text" id="kilometraje" name="kilometraje" value={formData.kilometraje} onChange={handleChange} className={styles.formControl} placeholder="Escriba aquí..." required />
            </div>
          </div>

          {/* Falla, Solución y Horarios */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="falla"># Falla *</label>
              <textarea id="falla" name="falla" value={formData.falla} onChange={handleChange} className={styles.textArea} placeholder="Describa la falla" required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="solucion"># Solución *</label>
              <textarea id="solucion" name="solucion" value={formData.solucion} onChange={handleChange} className={styles.textArea} placeholder="Describa la solución" required />
            </div>
            <div className={styles.formGroup}>
              <label># Horarios (Inicio/Fin) *</label>
              <div className={styles.timeInputContainer}>
                <div className={styles.timeInputWithIcon}>
                  <input type="text" name="horasInicio" placeholder="00:00 a.m." value={formData.horasUsadas.inicio} onChange={e => handleTimeChange('inicio', e.target.value)} className={styles.timeInput} required />
                  <div className={styles.timeIconOverlay}><span>⌚</span></div>
                </div>
                <div className={styles.timeInputWithIcon}>
                  <input type="text" name="horasFin" placeholder="00:00 p.m." value={formData.horasUsadas.fin} onChange={e => handleTimeChange('fin', e.target.value)} className={styles.timeInput} required />
                  <div className={styles.timeIconOverlay}><span>⌚</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Sección de Refacciones */}
          <div className={styles.refaccionesCard}>
            <h3 className={styles.refaccionesTitle}>Refacciones</h3>
            <div style={{ marginBottom: '1rem' }}>
              <button type="button" onClick={handleAddExistingRefaccion} className={styles.addRefaccionButton}>
                + Agregar Refacción (existente)
              </button>
              &nbsp;
              <button type="button" onClick={handleAddNewRefaccion} className={styles.addRefaccionButton}>
                + Cargar Refacción (nueva)
              </button>
            </div>

            {/* Refacciones EXISTENTES */}
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
                {refaccionesExistentes.map(ref => {
                  const usedQty = parseFloat(ref.cantidadUsada || '0');
                  const costInd = parseFloat(ref.costIndividual || '0');
                  const partialCost = (usedQty * costInd).toFixed(2);
                  return (
                    <div key={ref.id} className={styles.refaccionesRow}>
                      {/* Spinner para seleccionar refacción */}
                      <div className={styles.refaccionesCell}>
                        <select value={ref.refaccionId} onChange={e => handleRefaccionSelectChange(ref.id, e.target.value)} className={styles.refaccionInput} required>
                          <option value="">-- Seleccione --</option>
                          {allRefacciones.map(r => (
                            <option key={r._id} value={r._id}>
                              {r.nombreRefaccion}
                            </option>
                          ))}
                        </select>
                      </div>
                      {/* Existencias (solo lectura) */}
                      <div className={styles.refaccionesCell}>
                        <input type="text" value={ref.stock} className={styles.refaccionInput} disabled />
                      </div>
                      {/* Costo calculado */}
                      <div className={styles.refaccionesCell}>
                        <input type="text" value={partialCost} className={styles.refaccionInput} disabled />
                      </div>
                      {/* Cantidad usada */}
                      <div className={styles.refaccionesCell}>
                        <input type="text" value={ref.cantidadUsada} onChange={e => handleRefaccionChange(ref.id, 'cantidadUsada', e.target.value)} className={styles.refaccionInput} placeholder="1" />
                      </div>
                      {/* Descripción */}
                      <div className={styles.refaccionesCell}>
                        <textarea value={ref.descripcion} onChange={e => handleRefaccionChange(ref.id, 'descripcion', e.target.value)} className={styles.descripcionTextarea} placeholder="Observaciones..." />
                      </div>
                      {/* Botón eliminar */}
                      <div className={styles.refaccionesCell}>
                        <button type="button" onClick={() => handleRemoveRefaccion(ref.id)} className={styles.removeRefaccionButton}>
                          ❌
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Refacciones NUEVAS */}
            {refaccionesNuevas.length > 0 && refaccionesNuevas.map(ref => (
              <div key={ref.id} className={styles.newRefaccionBlock}>
                <div className={styles.formGroup}>
                  <label>Cantidad (stock) *</label>
                  <input type="text" placeholder="ej: 3" value={ref.cantidad} onChange={e => handleRefaccionChange(ref.id, 'cantidad', e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label>Código *</label>
                  <input type="text" placeholder="ej: RF001" value={ref.codigo} onChange={e => handleRefaccionChange(ref.id, 'codigo', e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label>Nombre refacción *</label>
                  <input type="text" placeholder="ej: Tanque de gasolina" value={ref.nombreRefaccion} onChange={e => handleRefaccionChange(ref.id, 'nombreRefaccion', e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label>Nombre proveedor *</label>
                  <input type="text" placeholder="ej: Proveedor XYZ" value={ref.nombreProveedor} onChange={e => handleRefaccionChange(ref.id, 'nombreProveedor', e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label>Costo total *</label>
                  <input type="text" placeholder="ej: 1000.00" value={ref.costoTotal} onChange={e => handleRefaccionChange(ref.id, 'costoTotal', e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label>Descripción</label>
                  <textarea placeholder="Información adicional..." value={ref.descripcion} onChange={e => handleRefaccionChange(ref.id, 'descripcion', e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <button type="button" onClick={() => handleSaveNewRefaccion(ref.id)} className={styles.saveRefaccionButton}>
                    Guardar
                  </button>
                  &nbsp;
                  <button type="button" onClick={() => handleRemoveRefaccion(ref.id)} className={styles.removeRefaccionButton}>
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
              <input type="text" id="total" name="total" value={total} className={styles.formControl} placeholder="000.00" readOnly />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="asignado"># Asignado? *</label>
              <input type="text" id="asignado" name="asignado" value={formData.asignado} onChange={handleChange} className={styles.formControl} placeholder="Nombre del asignado" required />
            </div>
          </div>

          {/* Botones */}
          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.registerButton} disabled={submitting}>
              {submitting ? 'PROCESANDO...' : isEditing ? 'ACTUALIZAR' : 'REGISTRAR'}
            </button>
            <button type="button" className={styles.cancelButton} onClick={handleCancel} disabled={submitting}>
              CANCELAR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceForm;
