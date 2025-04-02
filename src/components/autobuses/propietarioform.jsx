import React, { useState } from 'react';
import { createPropietario } from '../../services/propietarioService';
import styles from './FormularioPropietario.module.css';
import Menu from '../../components/header/DashboardHeader';

function FormularioPropietario() {
  const [formData, setFormData] = useState({
    nombrePropietario: '',
    rfc: '',
    solicitudComentarios: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      const response = await createPropietario(formData);
      console.log('Propietario creado:', response);
      setFormData({
        nombrePropietario: '',
        rfc: '',
        solicitudComentarios: '',
      });
      alert('Propietario guardado con éxito');
    } catch (error) {
      console.error('Error al guardar el propietario:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.mainContainer}>
      <div>
        <Menu />
      </div>

      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Buscar por nombre en SCDD | Navarrete"
          className={styles.searchInput}
        />
      </div>

      <div className={styles.Container}>
        <h2 className={styles.formTitle}>Crear propietario</h2>
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
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormularioPropietario;
