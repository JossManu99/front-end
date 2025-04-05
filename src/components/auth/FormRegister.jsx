import React, { useState, useEffect } from 'react';
import { registerUser} from '../../services/registerService';
import {
  updateUserService,
} from '../../services/usuariosService';
import styles from './FormRegister.module.css';

const FormRegister = ({ initialData = null, onCancel, editingId = null, refreshUsers }) => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    nick: '',
    password: '',
    role: 'user',
  });

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // This useEffect ensures the form is pre-populated when initialData changes
  useEffect(() => {
    if (initialData) {
      console.log('Pre-populating form with:', initialData);
      setFormData({ 
        name: initialData.name || '',
        surname: initialData.surname || '',
        email: initialData.email || '',
        nick: initialData.nick || '',
        password: '', // Password field is intentionally blank during edit
        role: initialData.role || 'user',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, surname, email, nick, password, role } = formData;

    // Validate required fields (except password when editing)
    if (!name || !surname || !email || !nick || (!editingId && !password)) {
      setError("Todos los campos son requeridos (excepto contraseña al editar).");
      return;
    }

    try {
      let response;
      if (editingId) {
        // When editing, only send password if it's been changed
        const dataToSend = { ...formData };
        if (!dataToSend.password) {
          delete dataToSend.password;
        }
        
        response = await updateUserService(editingId, dataToSend);
        if (response.status === 'success') {
          setMessage('Usuario actualizado correctamente');
          
          // Refresh the users list and close the form
          if (refreshUsers) refreshUsers();
          if (onCancel) onCancel();
        } else {
          setError(response.message || 'Error al actualizar usuario');
        }
      } else {
        response = await registerUser(formData);
        if (response.status === 'success') {
          setMessage('Usuario registrado correctamente');
          // Clear the form after successful registration
          setFormData({
            name: '',
            surname: '',
            email: '',
            nick: '',
            password: '',
            role: 'user',
          });
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
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formField}>
          <label htmlFor="name">Nombre:</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            placeholder="Nombre" 
            value={formData.name} 
            onChange={handleChange} 
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
          />
        </div>

        <div className={styles.formField}>
          <label htmlFor="password">
            {editingId ? 'Contraseña (dejar en blanco para mantener actual):' : 'Contraseña:'}
          </label>
          <input 
            type="password" 
            id="password" 
            name="password" 
            placeholder={editingId ? "Dejar en blanco para no cambiar" : "Contraseña"} 
            value={formData.password} 
            onChange={handleChange} 
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