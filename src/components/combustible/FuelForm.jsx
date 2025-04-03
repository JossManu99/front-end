import { useState, useEffect } from 'react';
import axios from 'axios';

// Estilos y componentes
import styles from './FuelForm.module.css';
import das from '../header/Dashboard.module.css';
import Menu from '../../components/header/DashboardHeader';

// Servicios
import { getAutobuses } from '../../services/AutobusesService';
import { getRecargas, updateRecarga } from '../../services/recargaService';

const FuelForm = () => {
  // ============================
  // Formateo de fecha y hora
  // ============================
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

  // ============================
  // Estados
  // ============================
  const [autobuses, setAutobuses] = useState([]);
  const [litrosOverLimit, setLitrosOverLimit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fecha: formattedDate,
    hora: formattedTime,
    costoPorLitro: '',
    numeroEconomico: '',
    folioSeguridadInicial: '',
    folioSeguridadRegreso: '',
    kilometraje: '',
    litrosCargados: '',
    costoTotal: '',
    contador: '',
    rendimientoPromedio: '',
    rendimientoAlcanzado: '',
    taller: false,
    foraneo: false,
    gasolinera: '',
  });

  const [rendimientoIndicatorColor, setRendimientoIndicatorColor] = useState('');

  // =======================================================
  // useEffect para cargar autobuses al montar el componente
  // =======================================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const autobusesData = await getAutobuses();
        setAutobuses(autobusesData);
      } catch (error) {
        console.error('Error al obtener datos de autobuses:', error);
      }
    };
    fetchData();
  }, []);

  // ============================================
  // Función para evaluar rendimiento (color)
  // ============================================
  const evaluarRendimiento = (promedio, alcanzado) => {
    if (!promedio || !alcanzado) return '';
    const promedioNum = parseFloat(promedio);
    const alcanzadoNum = parseFloat(alcanzado);

    if (alcanzadoNum >= promedioNum) {
      return '#2ecc71'; // Verde
    } else if (alcanzadoNum >= promedioNum * 0.875) {
      return '#f1c40f'; // Amarillo
    } else {
      return '#e74c3c'; // Rojo
    }
  };

  // ============================================
  // Manejador de cambios en el formulario
  // ============================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    const newFormData = { ...formData, [name]: newValue };

    // Calcular costo total al cambiar costoPorLitro o litrosCargados
    if (name === 'costoPorLitro' || name === 'litrosCargados') {
      const costoPorLitro = parseFloat(newFormData.costoPorLitro) || 0;
      const litrosCargados = parseFloat(newFormData.litrosCargados) || 0;
      newFormData.costoTotal = (costoPorLitro * litrosCargados).toFixed(2);
    }

    // Al cambiar el número económico, asignar rendimiento promedio si existe
    if (name === 'numeroEconomico') {
      const autobusSeleccionado = autobuses.find(
        (autobus) => autobus.numeroEconomico === value
      );
      newFormData.rendimientoPromedio =
        (autobusSeleccionado && autobusSeleccionado.rendimientoPromedio) || '';

      setRendimientoIndicatorColor(
        evaluarRendimiento(
          newFormData.rendimientoPromedio,
          newFormData.rendimientoAlcanzado
        )
      );
    }

    // Si cambia el rendimiento alcanzado, actualizar el color
    if (name === 'rendimientoAlcanzado') {
      setRendimientoIndicatorColor(
        evaluarRendimiento(newFormData.rendimientoPromedio, value)
      );
    }

    // Si se desmarca "foraneo", limpiar el campo de gasolinera
    if (name === 'foraneo' && !checked) {
      newFormData.gasolinera = '';
    }

    setFormData(newFormData);
  };

  // =====================================================================
  // Función para actualizar litros cuando el propietario usa su stock
  // =====================================================================
  const actualizarLitrosPropietario = async (nombrePropietario, litrosCargados) => {
    try {
      // 1) Obtenemos todas las recargas
      const recargasResponse = await getRecargas();
      let recargasArray = [];

      if (Array.isArray(recargasResponse)) {
        recargasArray = recargasResponse;
      } else if (recargasResponse && typeof recargasResponse === 'object') {
        if (Array.isArray(recargasResponse.data)) {
          recargasArray = recargasResponse.data;
        } else if (Array.isArray(recargasResponse.recargas)) {
          recargasArray = recargasResponse.recargas;
        } else {
          recargasArray = [recargasResponse];
        }
      }

      // 2) Encontrar la recarga que contenga a ese propietario
      const recargaDoc = recargasArray.find((rec) =>
        rec.distribuciones?.some(
          (dist) => dist.nombrePropietario === nombrePropietario
        )
      );
      if (!recargaDoc) {
        console.warn('No se encontró recarga para:', nombrePropietario);
        return;
      }

      // 3) Localizar la distribución concreta
      const distributionIndex = recargaDoc.distribuciones.findIndex(
        (dist) => dist.nombrePropietario === nombrePropietario
      );
      if (distributionIndex === -1) {
        console.warn('No se encontró la distribución para:', nombrePropietario);
        return;
      }

      // Valores actuales
      const distribucion = recargaDoc.distribuciones[distributionIndex];
      const cantidadAnterior =
        typeof distribucion.cantidadrepartirlitrosrestantes === 'number'
          ? distribucion.cantidadrepartirlitrosrestantes
          : distribucion.cantidadrepartirlitros;

      // IMPORTANTE: Quitamos Math.abs aquí para que respete el signo anterior
      const cantidadAUsar = parseFloat(litrosCargados);
      const cantidadRestante = cantidadAnterior - cantidadAUsar;

      // Actualizamos 'cantidadrepartirlitrosrestantes'
      recargaDoc.distribuciones[distributionIndex].cantidadrepartirlitrosrestantes =
        cantidadRestante;

      // 4) Agregar el nuevo movimiento al historial
      if (!recargaDoc.distribuciones[distributionIndex].historial) {
        recargaDoc.distribuciones[distributionIndex].historial = [];
      }

      const nuevoMovimiento = {
        quienRecargo: nombrePropietario,
        cantidadAnterior,
        cantidadCargada: Math.abs(cantidadAUsar),
        cantidadRestante,
        fecha: formData.fecha,
        hora: formData.hora,
        numeroEconomico: formData.numeroEconomico,
        observacion: `Cargó ${Math.abs(cantidadAUsar)} litros del taller.`,
      };

      recargaDoc.distribuciones[distributionIndex].historial.push(nuevoMovimiento);

      // 5) Hacemos el PUT / update de esa recarga
      await updateRecarga(recargaDoc._id, {
        distribuciones: recargaDoc.distribuciones,
      });

      console.log(
        `Recarga actualizada para ${nombrePropietario}: 
         - Cuánto usó: ${cantidadAUsar} 
         - Cuánto tenía: ${cantidadAnterior} 
         - Cuánto quedó: ${cantidadRestante}`
      );
    } catch (error) {
      console.error('Error al actualizar recarga del propietario:', error);
    }
  };

  // =====================================================
  // Función para manejar PRÉSTAMO de litros (automático)
  // =====================================================
  const actualizarPrestamo = async (borrowerName, lenderName, borrowedLiters) => {
    try {
      // 1) Obtenemos todas las recargas
      const recargasResponse = await getRecargas();
      let recargasArray = [];
  
      if (Array.isArray(recargasResponse)) {
        recargasArray = recargasResponse;
      } else if (recargasResponse && typeof recargasResponse === 'object') {
        if (Array.isArray(recargasResponse.data)) {
          recargasArray = recargasResponse.data;
        } else if (Array.isArray(recargasResponse.recargas)) {
          recargasArray = recargasResponse.recargas;
        } else {
          recargasArray = [recargasResponse];
        }
      }
  
      // ================================
      // PRIMERO: Actualizar al que presta
      // ================================
      const recargaDocLender = recargasArray.find((rec) =>
        rec.distribuciones?.some((dist) => dist.nombrePropietario === lenderName)
      );
      if (!recargaDocLender) {
        console.warn('No se encontró recarga para el prestador:', lenderName);
        return;
      }
  
      const distIndexLender = recargaDocLender.distribuciones.findIndex(
        (d) => d.nombrePropietario === lenderName
      );
      if (distIndexLender === -1) {
        console.warn('No se encontró la distribución para el prestador:', lenderName);
        return;
      }
  
      const distribucionLender = recargaDocLender.distribuciones[distIndexLender];
      const lenderDisponible =
        typeof distribucionLender.cantidadrepartirlitrosrestantes === 'number'
          ? distribucionLender.cantidadrepartirlitrosrestantes
          : distribucionLender.cantidadrepartirlitros;
  
      const litrosPrestamo = parseFloat(borrowedLiters);
  
      if (litrosPrestamo > lenderDisponible) {
        alert(`El propietario ${lenderName} no tiene suficientes litros para prestar.`);
        return;
      }
  
      const nuevoLenderDisponible = lenderDisponible - litrosPrestamo;
      recargaDocLender.distribuciones[distIndexLender].cantidadrepartirlitrosrestantes =
        nuevoLenderDisponible;
  
      if (!distribucionLender.vecesPrestadas) {
        distribucionLender.vecesPrestadas = 0;
      }
      distribucionLender.vecesPrestadas += 1;
  
      if (!distribucionLender.historial) {
        distribucionLender.historial = [];
      }
      const movimientoLender = {
        quienRecargo: lenderName,
        cantidadAnterior: lenderDisponible,
        cantidadCargada: Math.abs(litrosPrestamo),
        cantidadRestante: nuevoLenderDisponible,
        fecha: formData.fecha,
        hora: formData.hora,
        numeroEconomico: formData.numeroEconomico,
        observacion: `Préstamo #${distribucionLender.vecesPrestadas}. Prestó ${litrosPrestamo} litros a ${borrowerName}. Restante: ${nuevoLenderDisponible}`,
      };
      distribucionLender.historial.push(movimientoLender);
  
      await updateRecarga(recargaDocLender._id, {
        distribuciones: recargaDocLender.distribuciones,
      });
  
      // ================================
      // SEGUNDO: Actualizar al que recibe
      // ================================
      const recargaDocBorrower = recargasArray.find((rec) =>
        rec.distribuciones?.some((dist) => dist.nombrePropietario === borrowerName)
      );
      if (!recargaDocBorrower) {
        console.warn('No se encontró recarga para el solicitante:', borrowerName);
        return;
      }
  
      const distIndexBorrower = recargaDocBorrower.distribuciones.findIndex(
        (d) => d.nombrePropietario === borrowerName
      );
      if (distIndexBorrower === -1) {
        console.warn('No se encontró la distribución para el solicitante:', borrowerName);
        return;
      }
  
      const distribucionBorrower =
        recargaDocBorrower.distribuciones[distIndexBorrower];
  
      if (!distribucionBorrower.historial) {
        distribucionBorrower.historial = [];
      }
  
      const borrowerDisponible =
        typeof distribucionBorrower.cantidadrepartirlitrosrestantes === 'number'
          ? distribucionBorrower.cantidadrepartirlitrosrestantes
          : distribucionBorrower.cantidadrepartirlitros;
  
      const newBorrowerDisponible = borrowerDisponible - litrosPrestamo;
      recargaDocBorrower.distribuciones[distIndexBorrower].cantidadrepartirlitrosrestantes =
        newBorrowerDisponible;
  
      const movimientoBorrower = {
        quienRecargo: borrowerName,
        cantidadAnterior: borrowerDisponible,
        cantidadCargada: Math.abs(litrosPrestamo),
        cantidadRestante: newBorrowerDisponible, 
        fecha: formData.fecha,
        hora: formData.hora,
        numeroEconomico: formData.numeroEconomico,
        observacion: `Recibió ${Math.abs(litrosPrestamo)} litros prestados de ${lenderName}`,
      };
      distribucionBorrower.historial.push(movimientoBorrower);
  
      await updateRecarga(recargaDocBorrower._id, {
        distribuciones: recargaDocBorrower.distribuciones,
      });
  
      console.log(
        `Prestador ${lenderName} → prestó ${litrosPrestamo} litros. ` +
        `Receptor ${borrowerName} → recibió ${litrosPrestamo} litros.`
      );
    } catch (error) {
      console.error('Error al actualizar préstamo:', error);
    }
  };

  // ============================================
  // Manejar envío del formulario
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      // 1) Buscar el autobús seleccionado para obtener el propietario
      const autobusSeleccionado = autobuses.find(
        (autobus) => autobus.numeroEconomico === formData.numeroEconomico
      );

      // 2) Si el autobús se marcó con "taller", checar si hay suficiente stock
      if (
        autobusSeleccionado &&
        autobusSeleccionado.nombrepropietario &&
        formData.taller
      ) {
        const recargasResponse = await getRecargas();
        let recargasArray = [];

        if (Array.isArray(recargasResponse)) {
          recargasArray = recargasResponse;
        } else if (recargasResponse && typeof recargasResponse === 'object') {
          if (Array.isArray(recargasResponse.data)) {
            recargasArray = recargasResponse.data;
          } else if (Array.isArray(recargasResponse.recargas)) {
            recargasArray = recargasResponse.recargas;
          } else {
            recargasArray = [recargasResponse];
          }
        }

        // Hallar stock del propietario
        const recargaDoc = recargasArray.find((rec) =>
          rec.distribuciones?.some(
            (dist) => dist.nombrePropietario === autobusSeleccionado.nombrepropietario
          )
        );

        let disponible = 0;
        if (recargaDoc) {
          const distIndex = recargaDoc.distribuciones.findIndex(
            (d) => d.nombrePropietario === autobusSeleccionado.nombrepropietario
          );
          if (distIndex !== -1) {
            const distribucion = recargaDoc.distribuciones[distIndex];
            disponible =
              typeof distribucion.cantidadrepartirlitrosrestantes === 'number'
                ? distribucion.cantidadrepartirlitrosrestantes
                : distribucion.cantidadrepartirlitros;
          }
        }

        const aCargar = Math.abs(parseFloat(formData.litrosCargados)) || 0;
        const effectiveDisponible = disponible > 0 ? disponible : 0;

        if (aCargar > effectiveDisponible) {
          setLitrosOverLimit(true);
          const difference = aCargar - effectiveDisponible;
          if (effectiveDisponible > 0) {
            await actualizarLitrosPropietario(
              autobusSeleccionado.nombrepropietario,
              effectiveDisponible
            );
          }
          const potentialLenders = [];
          recargasArray.forEach((rec) => {
            if (rec.distribuciones && Array.isArray(rec.distribuciones)) {
              rec.distribuciones.forEach((dist) => {
                if (dist.nombrePropietario !== autobusSeleccionado.nombrepropietario) {
                  const available =
                    typeof dist.cantidadrepartirlitrosrestantes === 'number'
                      ? dist.cantidadrepartirlitrosrestantes
                      : dist.cantidadrepartirlitros;
                  potentialLenders.push({
                    nombrePropietario: dist.nombrePropietario,
                    available,
                  });
                }
              });
            }
          });

          if (potentialLenders.length === 0) {
            alert('No hay propietarios disponibles para prestar.');
            return;
          }

          let selectedLender;
          if (potentialLenders.length === 1) {
            selectedLender = potentialLenders[0].nombrePropietario;
          } else {
            selectedLender = potentialLenders.reduce((max, curr) =>
              curr.available > max.available ? curr : max
            ).nombrePropietario;
          }

          await actualizarPrestamo(
            autobusSeleccionado.nombrepropietario,
            selectedLender,
            difference
          );
        } else {
          setLitrosOverLimit(false);
          await actualizarLitrosPropietario(
            autobusSeleccionado.nombrepropietario,
            aCargar
          );
        }
      }

      // 3) Guardar registro de combustible
      const response = await axios.post('http://localhost:3000/api/combustible', formData);
      console.log('Respuesta del servidor:', response.data);

      // 4) Éxito
      alert('Formulario enviado con éxito');

      // 5) Limpiar el formulario
      setFormData({
        ...formData,
        costoPorLitro: '',
        numeroEconomico: '',
        folioSeguridadInicial: '',
        folioSeguridadRegreso: '',
        kilometraje: '',
        litrosCargados: '',
        costoTotal: '',
        contador: '',
        rendimientoPromedio: '',
        rendimientoAlcanzado: '',
        taller: false,
        foraneo: false,
        gasolinera: '',
      });
      setRendimientoIndicatorColor('');
      setLitrosOverLimit(false);
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
      alert('Hubo un error al enviar el formulario');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.mainContainer}>
      <div className={das.menuContainer}>
        <Menu />
      </div>

      <div className={styles.formContainer}>
        <div className={styles.formHeader}>
          <div className={styles.formTitle}>
            <span className={styles.icon}>⌨️</span> Registro de combustible por flotilla
          </div>
          <p className={styles.formInstructions}>
            Llene el siguiente formulario, los campos obligatorios están marcados con *
          </p>
          <hr className={styles.divider} />
        </div>

        <form onSubmit={handleSubmit}>
          {/* Fila 1: Fecha, hora y costo por litro */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="fecha">Fecha de hoy</label>
              <input
                type="text"
                id="fecha"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
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
                onChange={handleChange}
                className={styles.formControl}
                disabled
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="costoPorLitro">Costo por litro:</label>
              <div className={styles.inputWithIcon}>
                <input
                  type="text"
                  id="costoPorLitro"
                  name="costoPorLitro"
                  value={formData.costoPorLitro}
                  onChange={handleChange}
                  className={styles.inputWithIconControl}
                  placeholder="00"
                />
                <div
                  className={styles.iconOverlay}
                  style={{ backgroundColor: '#2ecc71' }}
                >
                  <span>✓</span>
                </div>
              </div>
            </div>
          </div>

          {/* Fila 2: Número económico, folios de seguridad */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="numeroEconomico"># Número económico *</label>
              <select
                id="numeroEconomico"
                name="numeroEconomico"
                value={formData.numeroEconomico}
                onChange={handleChange}
                className={styles.formControl}
                required
              >
                <option value="">Seleccione un número económico</option>
                {autobuses.map((autobus) => (
                  <option key={autobus._id} value={autobus.numeroEconomico}>
                    {autobus.numeroEconomico} -- {autobus.nombrepropietario}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="folioSeguridadInicial">
                # Folio seguridad inicial *
              </label>
              <input
                type="text"
                id="folioSeguridadInicial"
                name="folioSeguridadInicial"
                value={formData.folioSeguridadInicial}
                onChange={handleChange}
                className={styles.formControl}
                placeholder="Folio inicial"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="folioSeguridadRegreso"># Folio seguridad regreso *</label>
              <input
                type="text"
                id="folioSeguridadRegreso"
                name="folioSeguridadRegreso"
                value={formData.folioSeguridadRegreso}
                onChange={handleChange}
                className={styles.formControl}
                placeholder="Folio regreso"
                required
              />
            </div>
          </div>

          {/* Fila 3: Kilometraje, litros cargados y costo total */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="kilometraje"># Kilometraje *</label>
              <input
                type="text"
                id="kilometraje"
                name="kilometraje"
                value={formData.kilometraje}
                onChange={handleChange}
                className={styles.formControl}
                placeholder="Ej: 1900"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="litrosCargados"># Litros cargados *</label>
              <input
                type="text"
                id="litrosCargados"
                name="litrosCargados"
                value={formData.litrosCargados}
                onChange={handleChange}
                className={`${styles.formControl} ${
                  litrosOverLimit ? styles.errorInput : ''
                }`}
                placeholder="Ej: 1200"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="costoTotal"># Costo total *</label>
              <input
                type="text"
                id="costoTotal"
                name="costoTotal"
                value={formData.costoTotal}
                onChange={handleChange}
                className={styles.formControl}
                placeholder="$,000.00"
                required
                disabled
              />
            </div>
          </div>

          {/* Fila 4: Contador y rendimiento */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="contador"># Contador *</label>
              <input
                type="text"
                id="contador"
                name="contador"
                value={formData.contador}
                onChange={handleChange}
                className={styles.formControl}
                placeholder="Ej: 1200"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="rendimientoPromedio">Rendimiento promedio *</label>
              <input
                type="text"
                id="rendimientoPromedio"
                name="rendimientoPromedio"
                value={formData.rendimientoPromedio}
                onChange={handleChange}
                className={styles.formControl}
                placeholder="Km/L"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="rendimientoAlcanzado">Rendimiento alcanzado *</label>
              <div className={styles.inputWithIcon}>
                <input
                  type="text"
                  id="rendimientoAlcanzado"
                  name="rendimientoAlcanzado"
                  value={formData.rendimientoAlcanzado}
                  onChange={handleChange}
                  className={styles.inputWithIconControl}
                  placeholder="Km/L"
                  required
                />
                {rendimientoIndicatorColor && (
                  <div
                    className={styles.iconOverlay}
                    style={{ backgroundColor: rendimientoIndicatorColor }}
                  >
                    <span>•</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Fila 5: Checkboxes (taller y foráneo) */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <div className={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  id="taller"
                  name="taller"
                  checked={formData.taller}
                  onChange={handleChange}
                  className={styles.checkbox}
                />
                <label htmlFor="taller">Diesel del taller</label>
              </div>
            </div>
            <div className={styles.formGroup}>
              <div className={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  id="foraneo"
                  name="foraneo"
                  checked={formData.foraneo}
                  onChange={handleChange}
                  className={styles.checkbox}
                />
                <label htmlFor="foraneo">Diesel foráneo</label>
              </div>
            </div>
            {formData.foraneo && (
              <div className={styles.formGroup}>
                <label htmlFor="gasolinera">Nombre de la gasolinera *</label>
                <input
                  type="text"
                  id="gasolinera"
                  name="gasolinera"
                  value={formData.gasolinera}
                  onChange={handleChange}
                  className={styles.formControl}
                  placeholder="Nombre de la gasolinera"
                  required={formData.foraneo}
                />
              </div>
            )}
          </div>

          {/* Botones */}
          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.registerButton} disabled={isSubmitting}>
              {isSubmitting ? 'REGISTRANDO...' : 'REGISTRAR'}
            </button>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => {
                setFormData({
                  ...formData,
                  costoPorLitro: '',
                  numeroEconomico: '',
                  folioSeguridadInicial: '',
                  folioSeguridadRegreso: '',
                  kilometraje: '',
                  litrosCargados: '',
                  costoTotal: '',
                  contador: '',
                  rendimientoPromedio: '',
                  rendimientoAlcanzado: '',
                  taller: false,
                  foraneo: false,
                  gasolinera: '',
                });
                setRendimientoIndicatorColor('');
                setLitrosOverLimit(false);
              }}
            >
              CANCELAR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FuelForm;
