import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Menu from '../../components/header/DashboardHeader';
import FormRegister from '../../components/auth/FormRegister';
import { getOperadores } from '../../services/OperadorService';
import styles from './Profile.module.css';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [operadores, setOperadores] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para mostrar/ocultar el formulario
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    // Obtener datos del usuario desde localStorage
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/');
    } else {
      const parsedUser = JSON.parse(user);
      setUserData(parsedUser);
      
      // Si es admin, cargamos los operadores para mostrar el dashboard completo
      if (parsedUser.role === 'admin') {
        fetchOperadores();
      } else {
        // Si es user, no necesitamos cargar operadores
        setLoading(false);
      }
    }
  }, [navigate]);
  
  const fetchOperadores = async () => {
    try {
      const data = await getOperadores();
      setOperadores(data);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener operadores:', error);
      setLoading(false);
    }
  };
  
  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };
  
  // Funciones de cálculo
  const getProximosCumpleanos = () => {
    const today = new Date();
    return operadores
      .filter(op => {
        if (!op.fechaNacimiento) return false;
        const fechaNacimiento = new Date(op.fechaNacimiento);
        const mesActual = today.getMonth();
        const mesNacimiento = fechaNacimiento.getMonth();
        return mesNacimiento >= mesActual && mesNacimiento <= mesActual + 1;
      })
      .sort((a, b) => {
        const fechaA = new Date(a.fechaNacimiento);
        const fechaB = new Date(b.fechaNacimiento);
        fechaA.setFullYear(today.getFullYear());
        fechaB.setFullYear(today.getFullYear());
        if (fechaA < today) fechaA.setFullYear(today.getFullYear() + 1);
        if (fechaB < today) fechaB.setFullYear(today.getFullYear() + 1);
        return fechaA - fechaB;
      })
      .slice(0, 5);
  };
  
  const getProximasVigenciasLicencias = () => {
    const today = new Date();
    const tresMesesDespues = new Date();
    tresMesesDespues.setMonth(today.getMonth() + 3);
    return operadores
      .filter(op => {
        if (!op.fechaVencimientoLicenciaEstatal) return false;
        const fechaVencimiento = new Date(op.fechaVencimientoLicenciaEstatal);
        return fechaVencimiento >= today && fechaVencimiento <= tresMesesDespues;
      })
      .sort((a, b) => new Date(a.fechaVencimientoLicenciaEstatal) - new Date(b.fechaVencimientoLicenciaEstatal))
      .map(op => {
        const fechaVencimiento = new Date(op.fechaVencimientoLicenciaEstatal);
        const diasRestantes = Math.ceil((fechaVencimiento - new Date()) / (1000 * 60 * 60 * 24));
        let estadoAlerta = 'verde';
        if (diasRestantes <= 15) {
          estadoAlerta = 'rojo';
        } else if (diasRestantes <= 30) {
          estadoAlerta = 'amarillo';
        }
        return { ...op, estadoAlerta, diasRestantes };
      })
      .slice(0, 5);
  };
  
  const getProximasVigenciasExamenMedico = () => {
    const today = new Date();
    const tresMesesDespues = new Date();
    tresMesesDespues.setMonth(today.getMonth() + 3);
    return operadores
      .filter(op => {
        if (!op.fechaVencimientoExamenMedico) return false;
        const fechaVencimiento = new Date(op.fechaVencimientoExamenMedico);
        return fechaVencimiento >= today && fechaVencimiento <= tresMesesDespues;
      })
      .sort((a, b) => new Date(a.fechaVencimientoExamenMedico) - new Date(b.fechaVencimientoExamenMedico))
      .map(op => {
        const fechaVencimiento = new Date(op.fechaVencimientoExamenMedico);
        const diasRestantes = Math.ceil((fechaVencimiento - new Date()) / (1000 * 60 * 60 * 24));
        let estadoAlerta = 'verde';
        if (diasRestantes <= 15) {
          estadoAlerta = 'rojo';
        } else if (diasRestantes <= 30) {
          estadoAlerta = 'amarillo';
        }
        return { ...op, estadoAlerta, diasRestantes };
      })
      .slice(0, 5);
  };
  
  const getProximasVigenciasTarjeton = () => {
    const today = new Date();
    const tresMesesDespues = new Date();
    tresMesesDespues.setMonth(today.getMonth() + 3);
    return operadores
      .filter(op => {
        if (!op.fechaVencimientoTarjeton) return false;
        const fechaVencimiento = new Date(op.fechaVencimientoTarjeton);
        return fechaVencimiento >= today && fechaVencimiento <= tresMesesDespues;
      })
      .sort((a, b) => new Date(a.fechaVencimientoTarjeton) - new Date(b.fechaVencimientoTarjeton))
      .map(op => {
        const fechaVencimiento = new Date(op.fechaVencimientoTarjeton);
        const diasRestantes = Math.ceil((fechaVencimiento - new Date()) / (1000 * 60 * 60 * 24));
        let estadoAlerta = 'verde';
        if (diasRestantes <= 15) {
          estadoAlerta = 'rojo';
        } else if (diasRestantes <= 30) {
          estadoAlerta = 'amarillo';
        }
        return { ...op, estadoAlerta, diasRestantes };
      })
      .slice(0, 5);
  };
  
  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return '';
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return `${edad} años`;
  };
  
  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    const opciones = { day: 'numeric', month: 'long' };
    return new Date(fecha).toLocaleDateString('es-MX', opciones);
  };
  
  const formatearFechaCompleta = (fecha) => {
    if (!fecha) return '';
    const opciones = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(fecha).toLocaleDateString('es-MX', opciones).replace(/\//g, ' ');
  };
  
  const getBorderColor = (estadoAlerta) => {
    switch (estadoAlerta) {
      case 'rojo':
        return '#e74c3c';
      case 'amarillo':
        return '#f39c12';
      case 'verde':
      default:
        return '#2ecc71';
    }
  };
  
  const getItemStyle = (estadoAlerta) => {
    const borderColor = getBorderColor(estadoAlerta);
    return {
      borderLeftColor: borderColor,
      borderLeftWidth: '3px',
      borderLeftStyle: 'solid'
    };
  };
  
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Cargando datos...</p>
      </div>
    );
  }
  
  const fechaActual = new Date()
    .toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
    .replace(/\//g, ' ');
  
  const nombreCompleto = userData ? `${userData.name || ''} ${userData.surname || ''}` : 'Usuario';
  const nombreMostrar = userData?.nick || nombreCompleto;
  
  return (
    <div className={styles.generalContainer}>
      {/* Header siempre visible */}
      <Menu userData={userData} />
      
      {/* Información del usuario */}
      <div className={styles.userInfoContainer}>
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>
            <img
              src={userData?.photo || 'default-avatar.png'}
              alt="Avatar de usuario"
              className={styles.avatarImage}
            />
          </div>
          <div className={styles.userDetails}>
            <h3>Bienvenido(a), {nombreMostrar}</h3>
            <p>{userData?.email || 'usuario@ejemplo.com'}</p>
            {userData?.role && <span className={styles.userRole}>{userData.role}</span>}
  
            {/* Botones dentro de la tarjeta (solo para admin con el correo nallelif_19@hotmail.com) */}
            {userData?.role === 'admin' && userData?.email === "nallelif_19@hotmail.com" && (
              <div className={styles.userActions}>
                <button
                  className={styles.registerToggleButton}
                  onClick={() => setShowRegisterForm(!showRegisterForm)}
                >
                  {showRegisterForm ? 'Ocultar formulario' : 'Registrar nuevo usuario'}
                </button>
                <button onClick={handleLogout} className={styles.logoutButton}>
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
  
      {/* Formulario de registro (solo si se abre y se cumple la condición) */}
      {userData?.role === 'admin' && userData?.email === "nallelif_19@hotmail.com" && showRegisterForm && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <FormRegister />
        </div>
      )}
  
      {userData?.role === 'admin' ? (
        /* ---------------- VISTA ADMIN: Dashboard completo ---------------- */
        <div className={styles.dashboardContainer}>
          <div className={styles.dashboardRow}>
            <div className={styles.widget}>
              <div className={styles.widgetIcon}>
                <div className={styles.calendarIcon}>
                  <i className="fas fa-calendar-alt"></i>
                </div>
              </div>
              <div className={styles.widgetContent}>
                <div className={styles.widgetTitle}>
                  <i className="fas fa-birthday-cake"></i> Cumpleaños
                </div>
                <h2>Próximos cumpleaños</h2>
                <p className={styles.widgetDate}>{fechaActual}</p>
                <div className={styles.widgetList}>
                  {getProximosCumpleanos().length > 0 ? (
                    <>
                      <p>¡Los cumpleaños más próximos!, felicitar a:</p>
                      {getProximosCumpleanos().map((operador, index) => (
                        <div className={styles.birthdayItem} key={operador._id}>
                          <div className={styles.birthdayNumber}>{index + 1}.</div>
                          <div className={styles.birthdayAvatar}></div>
                          <div className={styles.birthdayInfo}>
                            <p>{operador.nombre}</p>
                            <p>{formatearFecha(operador.fechaNacimiento)}</p>
                          </div>
                          <div className={styles.birthdayAge}>
                            {calcularEdad(operador.fechaNacimiento)}
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <p>No hay cumpleaños próximos, ¡genial!</p>
                  )}
                  <a href="#" className={styles.viewMore}>Ver lista completa</a>
                </div>
              </div>
              <div className={styles.widgetPin}>
                <i className="fas fa-thumbtack"></i>
              </div>
            </div>
  
            <div className={styles.widget}>
              <div className={styles.widgetIcon}>
                <div className={styles.calendarIcon}>
                  <i className="fas fa-calendar-alt"></i>
                </div>
              </div>
              <div className={styles.widgetContent}>
                <div className={styles.widgetTitle}>
                  <i className="fas fa-id-card"></i> Próximas vigencias
                </div>
                <h2>Vigencias en licencias</h2>
                <p className={styles.widgetDate}>{fechaActual}</p>
                <div className={styles.widgetList}>
                  {getProximasVigenciasLicencias().length > 0 ? (
                    <>
                      <p>Próximas licencias a vencer:</p>
                      {getProximasVigenciasLicencias().map((operador, index) => (
                        <div
                          className={styles.licenseItem}
                          key={operador._id}
                          style={getItemStyle(operador.estadoAlerta)}
                        >
                          <div className={styles.licenseNumber}>{index + 1}.</div>
                          <div className={styles.licenseInfo}>
                            <p>{operador.nombre}</p>
                            <p>Vence: {formatearFechaCompleta(operador.fechaVencimientoLicenciaEstatal)}</p>
                          </div>
                        </div>
                      ))}
                      <a href="#" className={styles.viewMore}>Ver lista completa</a>
                    </>
                  ) : (
                    <>
                      <p>No hay vigencias próximas, genial, lindo día.</p>
                      <a href="#" className={styles.viewMore}>Ver lista completa</a>
                    </>
                  )}
                </div>
              </div>
              <div className={styles.widgetPin}>
                <i className="fas fa-thumbtack"></i>
              </div>
            </div>
          </div>
  
          <div className={styles.widgetSectionTitle}>
            <h2>Más vigencias en trabajadores</h2>
          </div>
  
          <div className={styles.dashboardRow}>
            <div className={styles.widget}>
              <div className={styles.widgetIcon}>
                <div className={styles.calendarIcon}>
                  <i className="fas fa-calendar-alt"></i>
                </div>
              </div>
              <div className={styles.widgetContent}>
                <div className={styles.widgetTitle}>
                  <i className="fas fa-stethoscope"></i> Próximas vigencias
                </div>
                <h2>Vigencias en examen médico</h2>
                <p className={styles.widgetDate}>{fechaActual}</p>
                <div className={styles.widgetList}>
                  {getProximasVigenciasExamenMedico().length > 0 ? (
                    <>
                      <p>Próximos exámenes médicos a vencer:</p>
                      {getProximasVigenciasExamenMedico().map((operador, index) => (
                        <div
                          className={styles.examItem}
                          key={operador._id}
                          style={getItemStyle(operador.estadoAlerta)}
                        >
                          <div className={styles.examNumber}>{index + 1}.</div>
                          <div className={styles.examInfo}>
                            <p>{operador.nombre}</p>
                            <p>Vence: {formatearFechaCompleta(operador.fechaVencimientoExamenMedico)}</p>
                          </div>
                        </div>
                      ))}
                      <a href="#" className={styles.viewMore}>Ver lista completa</a>
                    </>
                  ) : (
                    <>
                      <p>No hay vigencias próximas, genial, lindo día.</p>
                      <a href="#" className={styles.viewMore}>Ver lista completa</a>
                    </>
                  )}
                </div>
              </div>
              <div className={styles.widgetPin}>
                <i className="fas fa-thumbtack"></i>
              </div>
            </div>
  
            <div className={styles.widget}>
              <div className={styles.widgetIcon}>
                <div className={styles.calendarIcon}>
                  <i className="fas fa-calendar-alt"></i>
                </div>
              </div>
              <div className={styles.widgetContent}>
                <div className={styles.widgetTitle}>
                  <i className="fas fa-id-card"></i> Próximas vigencias
                </div>
                <h2>Vigencias en tarjetón vehicular</h2>
                <p className={styles.widgetDate}>{fechaActual}</p>
                <div className={styles.widgetList}>
                  {getProximasVigenciasTarjeton().length > 0 ? (
                    <>
                      <p>Próximos tarjetones a vencer:</p>
                      {getProximasVigenciasTarjeton().map((operador, index) => (
                        <div
                          className={styles.tarjetonItem}
                          key={operador._id}
                          style={getItemStyle(operador.estadoAlerta)}
                        >
                          <div className={styles.tarjetonNumber}>{index + 1}.</div>
                          <div className={styles.tarjetonInfo}>
                            <p>{operador.nombre}</p>
                            <p>Vence: {formatearFechaCompleta(operador.fechaVencimientoTarjeton)}</p>
                          </div>
                        </div>
                      ))}
                      <a href="#" className={styles.viewMore}>Ver lista completa</a>
                    </>
                  ) : (
                    <>
                      <p>No hay vigencias próximas, genial, lindo día.</p>
                      <a href="#" className={styles.viewMore}>Ver lista completa</a>
                    </>
                  )}
                </div>
              </div>
              <div className={styles.widgetPin}>
                <i className="fas fa-thumbtack"></i>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ---------------- VISTA USUARIO COMÚN ---------------- */
        <div className={styles.userOnlyContainer}>
          <h2>Bienvenido, usuario</h2>
          <p>Aquí puedes acceder a tus funciones como user.</p>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;
