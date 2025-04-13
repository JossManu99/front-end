import React, { useState, useEffect } from 'react';
import { createPropietario, updatePropietario } from '../../services/propietarioService';
import styles from './FormularioPropietario.module.css';
import Menu from '../../components/header/DashboardHeader';

function FormularioPropietario({ initialData, onClose }) {
  // Se define el modo edición según si se pasó información inicial
  const isEditing = !!initialData;

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

      // Reinicia el formulario solo en caso de creación (para seguir creando varios)
      if (!isEditing) {
        setFormData({
          nombrePropietario: '',
          rfc: '',
          solicitudComentarios: '',
        });
      }

      // OPCIONAL: si quieres cerrar el formulario automáticamente tras guardar,
      // descomenta la siguiente línea (pero entonces no podrás crear varios seguidos):
      // if (onClose) onClose();

    } catch (error) {
      console.error(
        `Error al ${isEditing ? 'actualizar' : 'guardar'} el propietario:`,
        error
      );
      // Si axios o fetch devuelven un mensaje de error en .response.data, lo puedes leer aquí:
      const msg = error.response?.data?.message || error.message || 'Error desconocido';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onClose) onClose();
  };

  return (
    <div className={styles.mainContainer}>
      {/* Solo renderizamos el header si NO estamos editando */}
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

            {/* Botón cancelar solo aparece en edición */}
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
