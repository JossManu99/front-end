import React, { useState, useEffect } from 'react';
import { createAutobus, updateAutobus } from '../../services/AutobusesService';
import { getPropietarios } from '../../services/propietarioService';
import styles from './BusForm.module.css';
import Menu from '../../components/header/DashboardHeader';
import das from '../header/Dashboard.module.css';

const BusForm = ({ onSave, autobus, userData }) => {
  const [formData, setFormData] = useState({
    numeroEconomico: '',
    numeroMotor: '',
    numeroSerie: '',
    marca: '',
    modelo: '',
    tipoPlaca: '',
    numeroPlacaEstatal: '',
    numeroPlacaFederal: '',
    verificacionContaminante: null,
    caducidadVerificacionContaminante: '',
    verificacionFisicoMecanico: null,
    caducidadVerificacionFisicoMecanico: '',
    tarjetaCirculacion: null,
    caducidadTarjetaCirculacion: '',
    seguro: null,
    caducidadSeguro: '',
    permiso: null,
    caducidadPermiso: '',
    foto: null,
    nombrepropietario: '',
    numeroAsientos: '',
    rendimientoPromedio: '',
    usos: [],
    observaciones: ''
  });

  const [propietarios, setPropietarios] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar lista de propietarios
    const loadPropietarios = async () => {
      try {
        const data = await getPropietarios();
        setPropietarios(data);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar propietarios:', error);
        setLoading(false);
      }
    };
    loadPropietarios();
  }, []);

  useEffect(() => {
    if (autobus) {
      setFormData({
        ...autobus,
        caducidadVerificacionContaminante: formatDate(autobus.caducidadVerificacionContaminante),
        caducidadVerificacionFisicoMecanico: formatDate(autobus.caducidadVerificacionFisicoMecanico),
        caducidadTarjetaCirculacion: formatDate(autobus.caducidadTarjetaCirculacion),
        caducidadSeguro: formatDate(autobus.caducidadSeguro),
        caducidadPermiso: formatDate(autobus.caducidadPermiso),
        usos: autobus.usos || [],
        observaciones: autobus.observaciones || ''
      });
    }
  }, [autobus]);

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: checked
          ? [...prev[name], value]
          : prev[name].filter((item) => item !== value)
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: files ? files[0] : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Campos obligatorios
    const requiredFields = [
      'numeroEconomico',
      'numeroMotor',
      'numeroSerie',
      'marca',
      'modelo',
      'caducidadTarjetaCirculacion',
      'caducidadSeguro',
      'caducidadPermiso',
      'numeroAsientos',
      'nombrepropietario',
      'rendimientoPromedio'
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        alert(`El campo ${field} es obligatorio`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== undefined) {
          if (key === 'usos') {
            // Si es un array (usos), iterar y agregar cada valor
            formData[key].forEach((uso) => formDataToSend.append(key, uso));
          } else {
            formDataToSend.append(key, formData[key]);
          }
        }
      });

      let result;
      if (autobus && autobus._id) {
        // Editar autobús
        result = await updateAutobus(autobus._id, formDataToSend);
        alert('Autobús actualizado con éxito');
      } else {
        // Crear autobús
        result = await createAutobus(formDataToSend);
        alert('Autobús creado con éxito');
      }
      if (onSave) onSave(result);
    } catch (error) {
      console.error('Error al guardar el autobús:', error);
      alert('Hubo un problema al guardar el autobús');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lógica de visibilidad según tipo de placa
  const showVerificador1 = formData.tipoPlaca === 'estatal' || formData.tipoPlaca === 'federal';
  const showVerificador2 = formData.tipoPlaca === 'federal';
  const showPlacaEstatal = formData.tipoPlaca === 'estatal' || formData.tipoPlaca === 'federal';
  const showPlacaFederal = formData.tipoPlaca === 'federal';

  return (
    <div className={styles.mainContainer}>
      {/* 
        Si autobus._id existe, estamos editando, entonces NO mostramos el menú.
        Si NO existe autobus._id, estamos creando, entonces mostramos el menú.
      */}
      {(!autobus || !autobus._id) && (
        <div className={das.menuContainer}>
          <Menu />
        </div>
      )}

      <h2 className={styles.formTitle}>
        {autobus && autobus._id ? 'Editar Autobús' : 'Crear Autobús'}
      </h2>

      <form onSubmit={handleSubmit} className={styles.formContainer} encType="multipart/form-data">
        {/* FILA 1 */}
        <div className={styles.row}>
          <div className={styles.formField}>
            <label className={styles.fieldLabel}>Número Económico:</label>
            <div className={styles.fieldColumn}>
              <input
                type="text"
                name="numeroEconomico"
                value={formData.numeroEconomico}
                onChange={handleChange}
                className={styles.fieldInput}
                required
              />
            </div>
          </div>

          <div className={styles.formField}>
            <label className={styles.fieldLabel}>Número de Motor:</label>
            <div className={styles.fieldColumn}>
              <input
                type="text"
                name="numeroMotor"
                value={formData.numeroMotor}
                onChange={handleChange}
                className={styles.textInput}
                required
              />
            </div>
          </div>

          <div className={styles.formField}>
            <label className={styles.fieldLabel}>Número de Serie:</label>
            <div className={styles.fieldColumn}>
              <input
                type="text"
                name="numeroSerie"
                value={formData.numeroSerie}
                onChange={handleChange}
                className={styles.textInput}
                required
              />
            </div>
          </div>
        </div>

        {/* FILA 2 */}
        <div className={styles.row}>
          <div className={styles.formField}>
            <label className={styles.fieldLabel}>Marca:</label>
            <div className={styles.fieldColumn}>
              <input
                type="text"
                name="marca"
                value={formData.marca}
                onChange={handleChange}
                className={styles.textInput}
                required
              />
            </div>
          </div>

          <div className={styles.formField}>
            <label className={styles.fieldLabel}>Modelo:</label>
            <div className={styles.fieldColumn}>
              <input
                type="text"
                name="modelo"
                value={formData.modelo}
                onChange={handleChange}
                className={styles.textInput}
                required
              />
            </div>
          </div>

          <div className={styles.formField}>
            <label className={styles.fieldLabel}>Número de Asientos:</label>
            <div className={styles.fieldColumn}>
              <input
                type="number"
                name="numeroAsientos"
                value={formData.numeroAsientos}
                onChange={handleChange}
                className={styles.textInput}
                required
              />
            </div>
          </div>
        </div>

        {/* FILA 3 (Rendimiento) */}
        <div className={styles.row}>
          <div className={styles.formField}>
            <label className={styles.fieldLabel}>Rendimiento Promedio (km/l):</label>
            <div className={styles.fieldColumn}>
              <input
                type="number"
                step="0.01"
                name="rendimientoPromedio"
                value={formData.rendimientoPromedio}
                onChange={handleChange}
                className={styles.textInput}
                required
              />
            </div>
          </div>
        </div>

        {/* FILA 4 (Tipo de Placa) */}
        <div className={styles.row}>
          <div className={styles.formField}>
            <label className={styles.fieldLabel}>Tipo de Placa:</label>
            <div className={styles.radioGroup}>
              <label>
                <input
                  type="radio"
                  name="tipoPlaca"
                  value="federal"
                  checked={formData.tipoPlaca === 'federal'}
                  onChange={handleChange}
                />
                Federal
              </label>
              <label>
                <input
                  type="radio"
                  name="tipoPlaca"
                  value="estatal"
                  checked={formData.tipoPlaca === 'estatal'}
                  onChange={handleChange}
                />
                Estatal
              </label>
            </div>
          </div>

          {showPlacaEstatal && (
            <div className={styles.formField}>
              <label className={styles.fieldLabel}>Placa Estatal:</label>
              <div className={styles.fieldColumn}>
                <input
                  type="text"
                  name="numeroPlacaEstatal"
                  value={formData.numeroPlacaEstatal}
                  onChange={handleChange}
                  className={styles.textInput}
                />
              </div>
            </div>
          )}

          {showPlacaFederal && (
            <div className={styles.formField}>
              <label className={styles.fieldLabel}>Placa Federal:</label>
              <div className={styles.fieldColumn}>
                <input
                  type="text"
                  name="numeroPlacaFederal"
                  value={formData.numeroPlacaFederal}
                  onChange={handleChange}
                  className={styles.textInput}
                />
              </div>
            </div>
          )}
        </div>

        {/* FILA 5 (Tarjeta Circulación) */}
        <div className={styles.row}>
          <div className={styles.formField}>
            <label className={styles.fieldLabel}>Tarjeta de Circulación:</label>
            <div className={styles.fileInputContainer}>
              <input
                type="file"
                name="tarjetaCirculacion"
                accept=".pdf"
                onChange={handleChange}
                className={styles.fileInput}
              />
              <span className={styles.fileStatus}>
                {autobus?.tarjetaCirculacion ? (
                  <a
                    href={autobus.tarjetaCirculacion}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver archivo actual
                  </a>
                ) : (
                  'Sin archivo seleccionado'
                )}
              </span>
            </div>
          </div>

          <div className={styles.formField}>
            <label className={styles.fieldLabel}>Caducidad Tarjeta de Circulación:</label>
            <input
              type="date"
              name="caducidadTarjetaCirculacion"
              value={formData.caducidadTarjetaCirculacion}
              onChange={handleChange}
              className={styles.dateInput}
              required
            />
          </div>
        </div>

        {/* FILA 6 (Seguro) */}
        <div className={styles.row}>
          <div className={styles.formField}>
            <label className={styles.fieldLabel}>Seguro:</label>
            <div className={styles.fileInputContainer}>
              <input
                type="file"
                name="seguro"
                accept=".pdf"
                onChange={handleChange}
                className={styles.fileInput}
              />
              <span className={styles.fileStatus}>
                {autobus?.seguro ? (
                  <a
                    href={autobus.seguro}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver archivo actual
                  </a>
                ) : (
                  'Sin archivo seleccionado'
                )}
              </span>
            </div>
          </div>

          <div className={styles.formField}>
            <label className={styles.fieldLabel}>Caducidad Seguro:</label>
            <input
              type="date"
              name="caducidadSeguro"
              value={formData.caducidadSeguro}
              onChange={handleChange}
              className={styles.dateInput}
              required
            />
          </div>
        </div>

        {/* FILA 7 (Permiso) */}
        <div className={styles.row}>
          <div className={styles.formField}>
            <label className={styles.fieldLabel}>Permiso:</label>
            <div className={styles.fileInputContainer}>
              <input
                type="file"
                name="permiso"
                accept=".pdf"
                onChange={handleChange}
                className={styles.fileInput}
              />
              <span className={styles.fileStatus}>
                {autobus?.permiso ? (
                  <a
                    href={autobus.permiso}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver archivo actual
                  </a>
                ) : (
                  'Sin archivo seleccionado'
                )}
              </span>
            </div>
          </div>

          <div className={styles.formField}>
            <label className={styles.fieldLabel}>Caducidad Permiso:</label>
            <input
              type="date"
              name="caducidadPermiso"
              value={formData.caducidadPermiso}
              onChange={handleChange}
              className={styles.dateInput}
              required
            />
          </div>
        </div>

        {/* FILA 8 (Verificaciones) */}
        {showVerificador1 && (
          <div className={styles.row}>
            <div className={styles.formField}>
              <label className={styles.fieldLabel}>Verificación Contaminante:</label>
              <div className={styles.fileInputContainer}>
                <input
                  type="file"
                  name="verificacionContaminante"
                  accept=".pdf"
                  onChange={handleChange}
                  className={styles.fileInput}
                />
                <span className={styles.fileStatus}>
                  {autobus?.verificacionContaminante ? (
                    <a
                      href={autobus.verificacionContaminante}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver archivo actual
                    </a>
                  ) : (
                    'Sin archivo seleccionado'
                  )}
                </span>
              </div>
            </div>

            <div className={styles.formField}>
              <label className={styles.fieldLabel}>
                Caducidad Verificación Contaminante:
              </label>
              <input
                type="date"
                name="caducidadVerificacionContaminante"
                value={formData.caducidadVerificacionContaminante}
                onChange={handleChange}
                className={styles.dateInput}
              />
            </div>
          </div>
        )}

        {showVerificador2 && (
          <div className={styles.row}>
            <div className={styles.formField}>
              <label className={styles.fieldLabel}>
                Verificación Físico-Mecánica:
              </label>
              <div className={styles.fileInputContainer}>
                <input
                  type="file"
                  name="verificacionFisicoMecanico"
                  accept=".pdf"
                  onChange={handleChange}
                  className={styles.fileInput}
                />
                <span className={styles.fileStatus}>
                  {autobus?.verificacionFisicoMecanico ? (
                    <a
                      href={autobus.verificacionFisicoMecanico}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver archivo actual
                    </a>
                  ) : (
                    'Sin archivo seleccionado'
                  )}
                </span>
              </div>
            </div>

            <div className={styles.formField}>
              <label className={styles.fieldLabel}>
                Caducidad Verificación Físico-Mecánica:
              </label>
              <input
                type="date"
                name="caducidadVerificacionFisicoMecanico"
                value={formData.caducidadVerificacionFisicoMecanico}
                onChange={handleChange}
                className={styles.dateInput}
              />
            </div>
          </div>
        )}

        {/* FILA 9 (Foto) */}
        <div className={styles.row}>
          <div className={styles.formField}>
            <label className={styles.fieldLabel}>Foto del Autobús:</label>
            <div className={styles.fileInputContainer}>
              <input
                type="file"
                name="foto"
                accept="image/*"
                onChange={handleChange}
                className={styles.fileInput}
                required={!autobus?.foto}
              />
              <span className={styles.fileStatus}>
                {autobus?.foto ? (
                  <img
                    src={autobus.foto}
                    alt="Foto del autobús"
                    className={styles.previewImage}
                  />
                ) : (
                  'Sin archivo seleccionado'
                )}
              </span>
            </div>
          </div>
        </div>

        {/* FILA 10 (Usos, Propietario) */}
        <div className={styles.row}>
          <div className={styles.formField}>
            <label className={styles.fieldLabel}>Uso del Autobús:</label>
            <div className={styles.checkboxGroup}>
              <label>
                <input
                  type="checkbox"
                  name="usos"
                  value="transportePublico"
                  checked={formData.usos.includes('transportePublico')}
                  onChange={handleChange}
                />
                Público
              </label>
              <label>
                <input
                  type="checkbox"
                  name="usos"
                  value="transportePersonal"
                  checked={formData.usos.includes('transportePersonal')}
                  onChange={handleChange}
                />
                Personal
              </label>
              <label>
                <input
                  type="checkbox"
                  name="usos"
                  value="transporteTuristico"
                  checked={formData.usos.includes('transporteTuristico')}
                  onChange={handleChange}
                />
                Turístico
              </label>
            </div>
          </div>

          <div className={styles.formField}>
            <label className={styles.fieldLabel}>Propietario:</label>
            <div className={styles.fieldColumn}>
              {loading ? (
                <div>Cargando propietarios...</div>
              ) : (
                <select
                  name="nombrepropietario"
                  value={formData.nombrepropietario}
                  onChange={handleChange}
                  className={styles.textInput}
                  required
                >
                  <option value="">Seleccione un propietario</option>
                  {propietarios.map((propietario) => (
                    <option
                      key={propietario._id}
                      value={propietario.nombrePropietario}
                    >
                      {propietario.nombrePropietario}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* FILA 11 (Observaciones) */}
        <div className={styles.row}>
          <div className={styles.formField}>
            <label className={styles.fieldLabel}>Observaciones:</label>
            <textarea
              name="observaciones"
              value={formData.observaciones || ''}
              onChange={handleChange}
              className={styles.textArea}
              rows={4}
            />
          </div>
        </div>

        {/* BOTÓN GUARDAR */}
        <div className={styles.buttonRow}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Guardando...'
              : autobus && autobus._id
              ? 'Actualizar Autobús'
              : 'Crear Autobús'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BusForm;
