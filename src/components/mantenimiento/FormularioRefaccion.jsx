import { useState } from 'react';
import { crearRefaccion } from '../../services/refaccionService';
import styles from './RefactionForm.module.css';
import Menu from '../../components/header/DashboardHeader';
import das from '../header/Dashboard.module.css';

const RefactionForm = ({ isEditing = false, refaccionId = null }) => {
  const [userData, setUserData] = useState({ role: 'admin' });
  const [formData, setFormData] = useState({
    cantidad: '',
    codigo: '',
    nombreRefaccion: '',
    nombreProveedor: '',
    costoTotal: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await crearRefaccion(formData);
      console.log('Refacción creada:', response);

      if (response.exito) {
        setSuccess(true);
        setFormData({
          cantidad: '',
          codigo: '',
          nombreRefaccion: '',
          nombreProveedor: '',
          costoTotal: ''
        });
      } else {
        setError(response.error || 'Error al crear la refacción.');
      }
    } catch (err) {
      console.error('Error al crear la refacción:', err);
      setError('Error al crear la refacción. Por favor, intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('¿Está seguro que desea cancelar? Los datos no guardados se perderán.')) {
      setFormData({
        cantidad: '',
        codigo: '',
        nombreRefaccion: '',
        nombreProveedor: '',
        costoTotal: ''
      });
      setError(null);
      setSuccess(false);
    }
  };

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

      {/* Contenedor del formulario */}
      <div className={styles.formContainer}>
        <div className={styles.formHeader}>
          <span className={styles.keyboardIcon}>⌨</span> Registro de nueva refacción
        </div>

        <p className={styles.formInstructions}>
          Llene el siguiente formulario, los campos obligatorios están marcados{' '}
          <span className={styles.required}>*</span>:
        </p>

        {/* Mensajes de éxito o error */}
        {success && <div className={styles.successMessage}>Refacción registrada exitosamente.</div>}
        {error && <div className={styles.errorMessage}>{error}</div>}

        <hr className={styles.divider} />

        <form onSubmit={handleSubmit}>
          <div className={styles.formFields}>
            <div className={styles.formGroup}>
              <label htmlFor="cantidad">
                Cantidad <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="cantidad"
                name="cantidad"
                placeholder="Ej: 01"
                value={formData.cantidad}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="codigo">
                Código <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="codigo"
                name="codigo"
                placeholder="Ej: RF001"
                value={formData.codigo}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="nombreRefaccion">
                Nombre refacción <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="nombreRefaccion"
                name="nombreRefaccion"
                placeholder="Ej: ABCD"
                value={formData.nombreRefaccion}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="nombreProveedor">
                Nombre proveedor <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="nombreProveedor"
                name="nombreProveedor"
                placeholder="Ej: ABCD"
                value={formData.nombreProveedor}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="costoTotal">
                Costo total <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="costoTotal"
                name="costoTotal"
                placeholder="Ej: 00.00"
                value={formData.costoTotal}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.formButtons}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleCancel}
              disabled={loading}
            >
              CANCELAR
            </button>
            <button type="submit" className={styles.registerButton} disabled={loading}>
              {loading ? 'PROCESANDO...' : 'REGISTRAR'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RefactionForm;
