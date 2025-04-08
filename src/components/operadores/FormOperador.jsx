import React, { useState, useEffect, useRef } from 'react';
import { createOperador, updateOperador } from '../../services/OperadorService';
import styles from './OperadorForm.module.css';
import Menu from '../../components/header/DashboardHeader';
import das from '../header/Dashboard.module.css';

const OperadorForm = ({ operador = null, onSave }) => {
  const [formData, setFormData] = useState({
    numeroOperador: '',
    nombre: '',
    fechaNacimiento: '',
    fechaIngreso: '',
    edad: '',
    tipoLicencia: '',
    documentoLicenciaEstatal: null,
    fechaVencimientoLicenciaEstatal: '',
    documentoLicenciaFederal: null,
    fechaVencimientoLicenciaFederal: '',
    puesto: '',
    otroPuesto: '',
    fechaVencimientoExamenMedico: '',
    documentoExamenMedico: null,
    observaciones: '',
    documentoTarjeton: null,
    fechaVencimientoTarjeton: '',
    foto: null,
  });

  const [userData, setUserData] = useState({ role: 'admin' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    if (operador) {
      // Determinar si el puesto corresponde a alguno de los estándar
      const standardPuestos = ['secretario', 'operador', 'logiostaca', 'mecánico', 'ojaltero'];
      let puestoValor = operador.puesto || '';
      let otroPuesto = '';
      if (puestoValor && !standardPuestos.includes(puestoValor.toLowerCase())) {
        otroPuesto = puestoValor;
        puestoValor = 'otro';
      }
      setFormData(prevData => ({
        ...prevData,
        ...operador,
        puesto: puestoValor,
        otroPuesto: otroPuesto,
        fechaNacimiento: operador.fechaNacimiento
          ? new Date(operador.fechaNacimiento).toISOString().split('T')[0]
          : '',
        fechaIngreso: operador.fechaIngreso
          ? new Date(operador.fechaIngreso).toISOString().split('T')[0]
          : '',
        fechaVencimientoLicenciaEstatal: operador.fechaVencimientoLicenciaEstatal
          ? new Date(operador.fechaVencimientoLicenciaEstatal).toISOString().split('T')[0]
          : '',
        fechaVencimientoLicenciaFederal: operador.fechaVencimientoLicenciaFederal
          ? new Date(operador.fechaVencimientoLicenciaFederal).toISOString().split('T')[0]
          : '',
        fechaVencimientoExamenMedico: operador.fechaVencimientoExamenMedico
          ? new Date(operador.fechaVencimientoExamenMedico).toISOString().split('T')[0]
          : '',
        fechaVencimientoTarjeton: operador.fechaVencimientoTarjeton
          ? new Date(operador.fechaVencimientoTarjeton).toISOString().split('T')[0]
          : '',
      }));
    }
  }, [operador]);

  const handleChange = (e) => {
    const { name, value, files, type } = e.target;

    // Si se cambia la fecha de nacimiento, calcular la edad
    if (name === 'fechaNacimiento' && value) {
      const birthDate = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      setFormData(prevData => ({
        ...prevData,
        fechaNacimiento: value,
        edad: age.toString()
      }));
    } else {
      // Para inputs tipo file se toma el primer archivo
      setFormData(prevData => ({
        ...prevData,
        [name]: files ? files[0] : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Si el puesto es "operador" validar licencias
    if(formData.puesto === 'operador'){
      if (formData.tipoLicencia === 'federal') {
        if (!formData.documentoLicenciaFederal && !operador) {
          setError('Debe subir la Licencia Federal');
          return;
        }
        if (!formData.documentoLicenciaEstatal && !operador) {
          setError('Debe subir la Licencia Estatal');
          return;
        }
      } else if (formData.tipoLicencia === 'estatal' && !formData.documentoLicenciaEstatal && !operador) {
        setError('Debe subir la Licencia Estatal');
        return;
      }
    }

    setError('');
    setIsSubmitting(true);

    // Si el puesto es "otro", asignarlo a partir del input extra
    const dataToSubmit = { ...formData };
    if(dataToSubmit.puesto === "otro"){
      dataToSubmit.puesto = dataToSubmit.otroPuesto;
    }

    // Convertir fechas a ISO string
    const updatedFormData = {
      ...dataToSubmit,
      fechaNacimiento: dataToSubmit.fechaNacimiento ? new Date(dataToSubmit.fechaNacimiento).toISOString() : '',
      fechaIngreso: dataToSubmit.fechaIngreso ? new Date(dataToSubmit.fechaIngreso).toISOString() : '',
      fechaVencimientoLicenciaEstatal: dataToSubmit.fechaVencimientoLicenciaEstatal ? new Date(dataToSubmit.fechaVencimientoLicenciaEstatal).toISOString() : '',
      fechaVencimientoLicenciaFederal: dataToSubmit.fechaVencimientoLicenciaFederal ? new Date(dataToSubmit.fechaVencimientoLicenciaFederal).toISOString() : '',
      fechaVencimientoExamenMedico: dataToSubmit.fechaVencimientoExamenMedico ? new Date(dataToSubmit.fechaVencimientoExamenMedico).toISOString() : '',
      fechaVencimientoTarjeton: dataToSubmit.fechaVencimientoTarjeton ? new Date(dataToSubmit.fechaVencimientoTarjeton).toISOString() : '',
    };

    // Construir FormData para el envío
    const form = new FormData();
    Object.keys(updatedFormData).forEach((key) => {
      if (updatedFormData[key] !== null && updatedFormData[key] !== '') {
        form.append(key, updatedFormData[key]);
      }
    });

    // Depuración: mostrar en consola el contenido del FormData
    for (const pair of form.entries()) {
      console.log(`${pair[0]}:`, pair[1]);
    }

    try {
      let response;
      if (operador) {
        // Actualización
        response = await updateOperador(operador._id, form);
      } else {
        // Creación
        response = await createOperador(form);
      }

      if (response && (response.message === 'Operador creado' || response.message === 'Operador actualizado')) {
        alert(operador ? 'Operador actualizado exitosamente' : 'Operador creado exitosamente');
        if (formRef.current) formRef.current.reset();
        setFormData({
          numeroOperador: '',
          nombre: '',
          fechaNacimiento: '',
          fechaIngreso: '',
          edad: '',
          tipoLicencia: '',
          documentoLicenciaEstatal: null,
          fechaVencimientoLicenciaEstatal: '',
          documentoLicenciaFederal: null,
          fechaVencimientoLicenciaFederal: '',
          puesto: '',
          otroPuesto: '',
          fechaVencimientoExamenMedico: '',
          documentoExamenMedico: null,
          observaciones: '',
          documentoTarjeton: null,
          fechaVencimientoTarjeton: '',
          foto: null,
        });
        setIsSubmitting(false);
        if (onSave) onSave(response.operador || updatedFormData);
      } else {
        alert('Error: ' + (response?.message || 'Desconocido'));
        setIsSubmitting(false);
      }
    } catch (err) {
      alert('Hubo un error al procesar la solicitud');
      setIsSubmitting(false);
    }
  };

  // Función para renderizar un campo de fecha con ícono
  const renderDateInput = (id, name, value, label) => (
    <div className={styles.fieldColumn}>
      <div className={styles.fieldHeader}>{label}</div>
      <div className={styles.fieldInput}>
        <div className={styles.dateInput}>
          <input
            type="date"
            id={id}
            name={name}
            value={value}
            onChange={handleChange}
            placeholder="dd/mm/aaaa"
          />
          <span className={styles.dateIcon}>📅</span>
        </div>
      </div>
    </div>
  );

  // Función para renderizar un campo de archivo
  const renderFileInput = (id, name, accept, label) => (
    <div className={styles.fieldColumn}>
      <div className={styles.fieldHeader}>{label}</div>
      <div className={styles.fieldInput}>
        <div className={styles.fileInput}>
          <input
            type="file"
            id={id}
            name={name}
            accept={accept}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );

  // Función para renderizar un campo de texto
  const renderTextInput = (id, name, value, label, type = "text", readOnly = false) => (
    <div className={styles.fieldColumn}>
      <div className={styles.fieldHeader}>{label}</div>
      <div className={styles.fieldInput}>
        <input
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={handleChange}
          readOnly={readOnly}
        />
      </div>
    </div>
  );

  return (
    <div className={styles.mainContainer}>
      {(!operador || !operador._id) && (
        <div className={das.menuContainer}>
          <Menu />
        </div>
      )}

      <div className={styles.formContainer}>
        <div className={styles.container}>
          <h2>{operador ? 'Editar Operador' : 'Crear Operador'}</h2>

          <form onSubmit={handleSubmit} ref={formRef} className={styles.form}>
            {/* Primera fila: Datos básicos */}
            <div className={styles.formRow}>
              {renderTextInput("numero-operador", "numeroOperador", formData.numeroOperador, "Número de Operador:")}
              {renderTextInput("nombre", "nombre", formData.nombre, "Nombre:")}
              {renderDateInput("fecha-nacimiento", "fechaNacimiento", formData.fechaNacimiento, "Fecha de Nacimiento:")}
              {renderTextInput("edad", "edad", formData.edad, "Edad:", "number", true)}
            </div>
            
            {/* Segunda fila: Fecha de Ingreso, Puesto y, si corresponde, Tipo de Licencia */}
            <div className={styles.formRow}>
              {renderDateInput("fecha-ingreso", "fechaIngreso", formData.fechaIngreso, "Fecha de Ingreso:")}
              
              <div className={styles.fieldColumn}>
                <div className={styles.fieldHeader}>Puesto:</div>
                <div className={styles.fieldInput}>
                  <select name="puesto" value={formData.puesto} onChange={handleChange}>
                    <option value="">Seleccione</option>
                    <option value="secretario">Secretario</option>
                    <option value="operador">Operador</option>
                    <option value="logiostaca">Logiostaca</option>
                    <option value="mecánico">Mecánico</option>
                    <option value="ojaltero">Ojaltero</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
              </div>
              
              {formData.puesto === "otro" && (
                <div className={styles.fieldColumn}>
                  {renderTextInput("otro-puesto", "otroPuesto", formData.otroPuesto, "Ingrese el puesto:")}
                </div>
              )}

              {formData.puesto === "operador" && (
                <div className={styles.fieldColumn}>
                  <div className={styles.fieldHeader}>Tipo de Licencia:</div>
                  <div className={styles.fieldInput}>
                    <div className={styles.radioGroup}>
                      <label className={styles.radioLabel}>
                        <input
                          type="radio"
                          id="licencia-federal"
                          name="tipoLicencia"
                          value="federal"
                          checked={formData.tipoLicencia === 'federal'}
                          onChange={handleChange}
                        />
                        <span className={styles.radioText}>Federal</span>
                      </label>
                      <label className={styles.radioLabel}>
                        <input
                          type="radio"
                          id="licencia-estatal"
                          name="tipoLicencia"
                          value="estatal"
                          checked={formData.tipoLicencia === 'estatal'}
                          onChange={handleChange}
                        />
                        <span className={styles.radioText}>Estatal</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Renderizado Condicional para campos de Licencias y Tarjetón solo si el puesto es "operador" */}
            {formData.puesto === "operador" && (
              <>
                <div className={styles.formRow}>
                  {(formData.tipoLicencia === 'estatal' || formData.tipoLicencia === 'federal') && (
                    renderFileInput("documento-licencia-estatal", "documentoLicenciaEstatal", ".pdf", "Licencia Estatal:")
                  )}
                  
                  {(formData.tipoLicencia === 'estatal' || formData.tipoLicencia === 'federal') && (
                    renderDateInput("fecha-vencimiento-licencia-estatal", "fechaVencimientoLicenciaEstatal", formData.fechaVencimientoLicenciaEstatal, "Vencimiento Licencia Estatal:")
                  )}
                  
                  {formData.tipoLicencia === 'federal' && (
                    renderFileInput("documento-licencia-federal", "documentoLicenciaFederal", ".pdf", "Licencia Federal:")
                  )}
                </div>

                {formData.tipoLicencia === 'federal' && (
                  <div className={styles.formRow}>
                    {renderDateInput("fecha-vencimiento-licencia-federal", "fechaVencimientoLicenciaFederal", formData.fechaVencimientoLicenciaFederal, "Vencimiento Licencia Federal:")}
                  </div>
                )}

                <div className={styles.formRow}>
                  {renderFileInput("documento-tarjeton", "documentoTarjeton", ".pdf", "Tarjetón:")}
                  {renderDateInput("fecha-vencimiento-tarjeton", "fechaVencimientoTarjeton", formData.fechaVencimientoTarjeton, "Vencimiento Tarjetón:")}
                </div>
              </>
            )}

            {/* Campos siempre visibles: Examen Médico y Foto */}
            <div className={styles.formRow}>
              {renderFileInput("documento-examen-medico", "documentoExamenMedico", ".pdf", "Examen Médico:")}
              {renderDateInput("fecha-vencimiento-examen-medico", "fechaVencimientoExamenMedico", formData.fechaVencimientoExamenMedico, "Vencimiento Examen Médico:")}
              {renderFileInput("foto", "foto", "image/*", "Foto:")}
            </div>

            {/* Observaciones */}
            <div className={styles.formRow}>
              <div className={styles.fieldColumn} style={{ width: '100%' }}>
                <div className={styles.fieldHeader}>Observaciones:</div>
                <div className={styles.fieldInput}>
                  <textarea
                    id="observaciones"
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleChange}
                    rows="3"
                  />
                </div>
              </div>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (operador ? 'Actualizando Operador...' : 'Creando Operador...') : 'Guardar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OperadorForm;
