import { useState, useEffect } from 'react';
import { crearRefaccion, actualizarRefaccion } from '../../services/refaccionService';
import styles from './RefactionForm.module.css';
import Menu from '../../components/header/DashboardHeader';
import das from '../header/Dashboard.module.css';

const RefactionForm = ({ isEditing = false, refaccionId = null, initialData = null, onEditComplete = () => {} }) => {
  const [userData, setUserData] = useState({ role: 'admin' });
  const [formData, setFormData] = useState({
    cantidad: '',
    codigo: '',
    nombreRefaccion: '',
    nombreProveedor: '',
    costoIndividual: '',
    costoTotal: '',
    descripcion: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Prepopular el formulario si estamos en modo edición
  useEffect(() => {
    if (isEditing && initialData) {
      setFormData({
        cantidad: initialData.cantidad || '',
        codigo: initialData.codigo || '',
        nombreRefaccion: initialData.nombreRefaccion || '',
        nombreProveedor: initialData.nombreProveedor || '',
        costoIndividual: initialData.costoIndividual || '',
        costoTotal: initialData.costoTotal || '',
        descripcion: initialData.descripcion || ''
      });
    }
  }, [isEditing, initialData]);

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
      let response;
      
      if (isEditing) {
        // Actualizar refacción existente
        response = await actualizarRefaccion({ _id: refaccionId, ...formData });
        console.log('Refacción actualizada:', response);
      } else {
        // Crear nueva refacción
        response = await crearRefaccion(formData);
        console.log('Refacción creada:', response);
      }

      if (response.exito || response._id) {
        setSuccess(true);
        
        // Si estamos editando, notificar al componente padre
        if (isEditing) {
          setTimeout(() => {
            onEditComplete();
          }, 1500); // Pequeño retraso para mostrar el mensaje de éxito
        } else {
          // Limpiar el formulario solo si es creación
          setFormData({
            cantidad: '',
            codigo: '',
            nombreRefaccion: '',
            nombreProveedor: '',
            costoIndividual: '',
            costoTotal: '',
            descripcion: ''
          });
        }
      } else {
        setError(response.error || 'Error al procesar la refacción.');
      }
    } catch (err) {
      console.error('Error al procesar la refacción:', err);
      setError('Error al procesar la refacción. Por favor, intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    const message = isEditing 
      ? '¿Está seguro que desea cancelar la edición? Los cambios no se guardarán.'
      : '¿Está seguro que desea cancelar? Los datos no guardados se perderán.';
      
    if (window.confirm(message)) {
      if (isEditing) {
        // Regresar a la lista de refacciones
        onEditComplete();
      } else {
        // Limpiar el formulario
        setFormData({
          cantidad: '',
          codigo: '',
          nombreRefaccion: '',
          nombreProveedor: '',
          costoIndividual: '',
          costoTotal: '',
          descripcion: ''
        });
      }
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
          <span className={styles.keyboardIcon}>⌨</span> 
          {isEditing ? 'Editar refacción' : 'Registro de nueva refacción'}
        </div>

        <p className={styles.formInstructions}>
          {isEditing 
            ? 'Modifique los campos necesarios, los campos obligatorios están marcados' 
            : 'Llene el siguiente formulario, los campos obligatorios están marcados'} 
          <span className={styles.required}>*</span>:
        </p>

        {/* Mensajes de éxito o error */}
        {success && (
          <div className={styles.successMessage}>
            {isEditing ? 'Refacción actualizada exitosamente.' : 'Refacción registrada exitosamente.'}
          </div>
        )}
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
              <label htmlFor="costoIndividual">
                Costo individual <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="costoIndividual"
                name="costoIndividual"
                placeholder="Ej: 00.00"
                value={formData.costoIndividual}
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

            <div className={styles.formGroup}>
              <label htmlFor="descripcion">
                Descripción
              </label>
              <input
                type="text"
                id="descripcion"
                name="descripcion"
                placeholder="Descripción opcional"
                value={formData.descripcion}
                onChange={handleChange}
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
              {loading ? 'PROCESANDO...' : isEditing ? 'ACTUALIZAR' : 'REGISTRAR'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RefactionForm;