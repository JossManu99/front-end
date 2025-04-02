import React, { useState } from 'react';
import { registerUser } from '../../services/registerService';
import styles from './FormRegister.module.css';

const FormRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    nick: '',
    password: '',
    role: 'user', // Iniciamos por defecto en 'user'
  });

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Maneja cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Maneja el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, surname, email, nick, password, role } = formData;

    // Validación básica
    if (!name || !surname || !email || !nick || !password) {
      setError("Todos los campos son requeridos.");
      return;
    }

    try {
      const response = await registerUser(formData);
      setMessage(response.message); // p. ej. "Usuario registrado con éxito"
      setError('');
    } catch (err) {
      setError(err.message || 'Error desconocido al registrar.');
      setMessage('');
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2>Registro de usuario</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          name="name"
          placeholder="Nombre"
          value={formData.name}
          onChange={handleChange}
        />
        <input
          type="text"
          name="surname"
          placeholder="Apellido"
          value={formData.surname}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
        />
        <input
          type="text"
          name="nick"
          placeholder="Nick"
          value={formData.nick}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
        />

        {/* Select para escoger el rol */}
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className={styles.selectRole}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <button type="submit">Registrar</button>
      </form>

      {error && <p className={styles.error}>{error}</p>}
      {message && <p className={styles.success}>{message}</p>}
    </div>
  );
};

export default FormRegister;
