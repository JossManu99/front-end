import React, { useState, useEffect } from 'react';
import { createPropietario, updatePropietario } from '../../services/propietarioService';
import styles from './FormularioPropietario.module.css';
import Menu from '../../components/header/DashboardHeader';

function FormularioPropietario({ initialData, onClose }) {
  // Se define el modo edición según si se pasó información inicial
  const isEditing = initialData ? true : false;

  const [formData, setFormData] = useState({
    nombrePropietario: '',
    rfc: '',
    solicitudComentarios: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Si se está editando, se carga la información del propietario
  useEffect(() => {
    if (isEditing && initialData) {
      setFormData({
        nombrePropietario: initialData.nombrePropietario || '',
        rfc: initialData.rfc || '',
        solicitudComentarios: initialData.solicitudComentarios || '',
      });
    }
  }, [isEditing, initialData]);

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditing) {
        // Actualiza el propietario existente
        const response = await updatePropietario(initialData._id, formData);
        console.log('Propietario actualizado:', response);
        alert('Propietario actualizado con éxito');
      } else {
        // Crea un nuevo propietario
        const response = await createPropietario(formData);
        console.log('Propietario creado:', response);
        alert('Propietario guardado con éxito');
      }
      
      // Reinicia el formulario y cierra el modo edición
      setFormData({
        nombrePropietario: '',
        rfc: '',
        solicitudComentarios: '',
      });
      
      if (onClose) onClose();
    } catch (error) {
      console.error(`Error al ${isEditing ? 'actualizar' : 'guardar'} el propietario:`, error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onClose) onClose();
  };

  return (
    <div className={styles.mainContainer}>
      {/* Se renderiza el header solo si no se está en modo edición */}
      {!isEditing && <Menu />}
      <div className={styles.Container}>
        <h2 className={styles.formTitle}>
          {isEditing ? 'Editar propietario' : 'Crear propietario'}
        </h2>
        <form onSubmit={manejarEnvio} className={styles.formContainer}>
          {error && (
            <div className={styles.errorMessage}>
              ⚠️ {error}
            </div>
          )}
          <div className={styles.formField}>
            <label htmlFor="nombrePropietario" className={styles.fieldLabel}>
              Nombre del propietario:
            </label>
            <input
              type="text"
              id="nombrePropietario"
              name="nombrePropietario"
              value={formData.nombrePropietario}
              onChange={manejarCambio}
              className={styles.textInput}
              required
            />
          </div>
          <div className={styles.formField}>
            <label htmlFor="rfc" className={styles.fieldLabel}>
              RFC:
            </label>
            <input
              type="text"
              id="rfc"
              name="rfc"
              value={formData.rfc}
              onChange={manejarCambio}
              className={styles.textInput}
              required
            />
          </div>
          <div className={styles.buttonRow}>
            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Guardar'}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={handleCancel}
                className={styles.cancelButton || styles.submitButton}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormularioPropietario;
