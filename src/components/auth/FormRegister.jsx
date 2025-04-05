import React, { useState, useEffect } from 'react';
import { registerUser } from '../../services/registerService';
import { updateUserService } from '../../services/usuariosService';
import styles from './FormRegister.module.css';

const FormRegister = ({ initialData = null, onCancel, editingId = null, refreshUsers }) => {
  // Estado inicial en blanco
  const initialState = {
    name: '',
    surname: '',
    email: '',
    nick: '',
    password: '',
    role: 'user',
  };

  const [formData, setFormData] = useState(initialState);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Al montar el componente, si no hay datos para editar, se limpia el formulario.
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        surname: initialData.surname || '',
        email: initialData.email || '',
        nick: initialData.nick || '',
        password: '', // La contraseña se deja en blanco al editar
        role: initialData.role || 'user',
      });
    } else {
      setFormData(initialState);
    }
  }, [initialData]); // Se ejecuta cada vez que cambia initialData

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, surname, email, nick, password } = formData;

    // Validar campos requeridos (excepto la contraseña cuando se edita)
    if (!name || !surname || !email || !nick || (!editingId && !password)) {
      setError("Todos los campos son requeridos (excepto contraseña al editar).");
      return;
    }

    try {
      let response;
      if (editingId) {
        // Si estamos editando, solo enviar la contraseña si se cambió
        const dataToSend = { ...formData };
        if (!dataToSend.password) {
          delete dataToSend.password;
        }
        
        response = await updateUserService(editingId, dataToSend);
        if (response.status === 'success') {
          setMessage('Usuario actualizado correctamente');
          
          if (refreshUsers) refreshUsers();
          if (onCancel) onCancel();
        } else {
          setError(response.message || 'Error al actualizar usuario');
        }
      } else {
        // Registro de nuevo usuario
        response = await registerUser(formData);
        if (response.status === 'success') {
          setMessage('Usuario registrado correctamente');
          // Reiniciar el formulario
          setFormData(initialState);
        } else {
          setError(response.message || 'Error al registrar usuario');
        }
      }
    } catch (err) {
      console.error('Error en formulario:', err);
      setError(err.message || 'Error desconocido al procesar la solicitud.');
      setMessage('');
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2>{editingId ? 'Editar Usuario' : 'Registro de usuario'}</h2>
      {/* autoComplete="off" para todo el formulario */}
      <form onSubmit={handleSubmit} className={styles.form} autoComplete="off">
        {/* Atributo “oculto” para engañar al autocompletado de algunos navegadores */}
        <input type="text" name="fakeusernameremembered" style={{ display: 'none' }} />
        <input type="password" name="fakepasswordremembered" style={{ display: 'none' }} />

        <div className={styles.formField}>
          <label htmlFor="name">Nombre:</label>
          {/* Para reforzar, también puedes poner autoComplete="off" aquí */}
          <input 
            type="text"
            id="name"
            name="name"
            placeholder="Nombre"
            value={formData.name}
            onChange={handleChange}
            autoComplete="off"
          />
        </div>

        <div className={styles.formField}>
          <label htmlFor="surname">Apellido:</label>
          <input 
            type="text"
            id="surname"
            name="surname"
            placeholder="Apellido"
            value={formData.surname}
            onChange={handleChange}
            autoComplete="off"
          />
        </div>

        <div className={styles.formField}>
          <label htmlFor="email">Correo electrónico:</label>
          <input 
            type="email"
            id="email"
            name="email"
            placeholder="Correo electrónico"
            value={formData.email}
            onChange={handleChange}
            autoComplete="off"
          />
        </div>

        <div className={styles.formField}>
          <label htmlFor="nick">Nick:</label>
          <input 
            type="text"
            id="nick"
            name="nick"
            placeholder="Nick"
            value={formData.nick}
            onChange={handleChange}
            autoComplete="off"
          />
        </div>

        <div className={styles.formField}>
          <label htmlFor="password">
            {editingId ? 'Contraseña (dejar en blanco para mantener actual):' : 'Contraseña:'}
          </label>
          {/* autoComplete="new-password" para “romper” el autocompletado de password */}
          <input 
            type="password"
            id="password"
            name="password"
            placeholder={editingId ? "Dejar en blanco para no cambiar" : "Contraseña"}
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
          />
        </div>

        <div className={styles.formField}>
          <label htmlFor="role">Rol:</label>
          <select 
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className={styles.selectRole}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.submitButton}>
            {editingId ? 'Actualizar' : 'Registrar'}
          </button>
          {onCancel && (
            <button 
              type="button"
              className={styles.cancelButton}
              onClick={onCancel}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {error && <p className={styles.error}>{error}</p>}
      {message && <p className={styles.success}>{message}</p>}
    </div>
  );
};

export default FormRegister;
