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
      setFormData(prevData => ({
        ...prevData,
        ...operador,
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
    } else if (type === 'radio') {
      setFormData(prevData => ({
        ...prevData,
        [name]: value,
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: files ? files[0] : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación de licencias
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

    setError('');
    setIsSubmitting(true);

    // Convertir fechas a ISO string
    const updatedFormData = {
      ...formData,
      fechaNacimiento: formData.fechaNacimiento ? new Date(formData.fechaNacimiento).toISOString() : '',
      fechaIngreso: formData.fechaIngreso ? new Date(formData.fechaIngreso).toISOString() : '',
      fechaVencimientoLicenciaEstatal: formData.fechaVencimientoLicenciaEstatal ? new Date(formData.fechaVencimientoLicenciaEstatal).toISOString() : '',
      fechaVencimientoLicenciaFederal: formData.fechaVencimientoLicenciaFederal ? new Date(formData.fechaVencimientoLicenciaFederal).toISOString() : '',
      fechaVencimientoExamenMedico: formData.fechaVencimientoExamenMedico ? new Date(formData.fechaVencimientoExamenMedico).toISOString() : '',
      fechaVencimientoTarjeton: formData.fechaVencimientoTarjeton ? new Date(formData.fechaVencimientoTarjeton).toISOString() : '',
    };

    const form = new FormData();
    Object.keys(updatedFormData).forEach((key) => {
      if (updatedFormData[key] !== null && updatedFormData[key] !== '') {
        form.append(key, updatedFormData[key]);
      }
    });

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
          fechaVencimientoExamenMedico: '',
          documentoExamenMedico: null,
          observaciones: '',
          documentoTarjeton: null,
          fechaVencimientoTarjeton: '',
          foto: null,
        });
        setIsSubmitting(false);
        // Envía el objeto actualizado o la respuesta para que el padre lo procese
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

  // Función para renderizar un campo de fecha con icono
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
            
            {/* Segunda fila: Fecha de Ingreso, Tipo de Licencia */}
            <div className={styles.formRow}>
              {renderDateInput("fecha-ingreso", "fechaIngreso", formData.fechaIngreso, "Fecha de Ingreso:")}
              
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
              
              {renderTextInput("puesto", "puesto", formData.puesto, "Puesto:")}
            </div>

            {/* Licencia Estatal y fecha de vencimiento */}
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

            {/* Vencimiento Licencia Federal - solo visible si es federal */}
            {formData.tipoLicencia === 'federal' && (
              <div className={styles.formRow}>
                {renderDateInput("fecha-vencimiento-licencia-federal", "fechaVencimientoLicenciaFederal", formData.fechaVencimientoLicenciaFederal, "Vencimiento Licencia Federal:")}
              </div>
            )}

            {/* Los siguientes campos siempre visibles */}
            <div className={styles.formRow}>
              {renderFileInput("documento-examen-medico", "documentoExamenMedico", ".pdf", "Examen Médico:")}
              {renderDateInput("fecha-vencimiento-examen-medico", "fechaVencimientoExamenMedico", formData.fechaVencimientoExamenMedico, "Vencimiento Examen Médico:")}
              {renderFileInput("documento-tarjeton", "documentoTarjeton", ".pdf", "Tarjetón:")}
            </div>

            <div className={styles.formRow}>
              {renderDateInput("fecha-vencimiento-tarjeton", "fechaVencimientoTarjeton", formData.fechaVencimientoTarjeton, "Vencimiento Tarjetón:")}
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
