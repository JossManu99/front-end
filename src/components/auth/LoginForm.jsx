import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginService } from '../../services/authService';
import styles from './LoginForm.module.css';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Limpia errores previos
    
    try {
      const { data } = await loginService({ email, password });
      
      // Almacena usuario y redirige al perfil
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/profile'); // Redirige al perfil del usuario
    } catch (err) {
      setError(err.message || 'Error desconocido al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.sideBar}></div>
      <div className={styles.formSection}>
        <div className={styles.loginContainer}>
          <h2 className={styles.title}>Iniciar sesión</h2>
          
          <form onSubmit={handleLogin}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Correo electrónico <span className={styles.requiredMark}>*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@gmail.com"
                required
                className={styles.inputField}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                Contraseña <span className={styles.requiredMark}>*</span>
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                required
                className={styles.inputField}
              />
            </div>
            
            <a href="/recuperar" className={styles.forgotPassword}>
              
            </a>
            
            <button
              type="submit"
              disabled={loading}
              className={styles.loginButton}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>
          
          {error && (
            <p className={styles.errorMessage}>{error}</p>
          )}
          
          <div className={styles.divider}></div>
          
          <div className={styles.registerSection}>
            <p className={styles.registerPrompt}>¿No tienes una cuenta?</p>
            <p>solicita al administrador que te otorgue un perfil</p>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;