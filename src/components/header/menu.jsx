import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Menu.module.css';

const Menu = () => {
  // Obtener el usuario desde localStorage
  const storedUser = localStorage.getItem('user');
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const currentRole = currentUser?.role?.toLowerCase();

  // Manejo del dropdown (para submenús)
  const [activeDropdown, setActiveDropdown] = useState(null);
  // Manejo del menú hamburguesa
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleDropdown = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Función para verificar si el rol actual está permitido para un ítem
  const isAllowed = (menuItem) => {
    if (!menuItem.roles) return true;
    return menuItem.roles.includes(currentRole);
  };

  // Definir TODOS los ítems, sin filtrar, con roles y submenús
  const menuItems = [
    {
      label: 'Inicio',
      icon: '🏠',
      path: '/Profile',
      roles: ['admin', 'user']
    },
    {
      label: 'Propietarios',
      icon: '👥',
      roles: ['admin'],
      submenu: [
        { label: 'Crear propietario', path: '/propietario', roles: ['admin'] }
      ]
    },
    {
      label: 'Flota',
      icon: '🚌',
      roles: ['admin'],
      submenu: [
        { label: 'Crear autobús', path: '/crear-autobus', roles: ['admin'] },
        { label: 'Lista de autobuses', path: '/lista-autobus', roles: ['admin'] }
      ]
    },
    {
      label: 'Trabajadores',
      icon: '👥',
      roles: ['admin'],
      submenu: [
        { label: 'Crear operador', path: '/crear-operador', roles: ['admin'] },
        { label: 'Lista de operadores', path: '/lista-operadores', roles: ['admin'] }
      ]
    },
    {
      label: 'Rutas',
      icon: '🗺️',
      roles: ['admin'],
      submenu: [
        { label: 'Registrar rutas', path: '/crear-viaje', roles: ['admin'] },
        { label: 'Listar rutas', path: '/lista-viajes', roles: ['admin'] }
      ]
    },
    {
      label: 'Combustible',
      icon: '⛽',
      roles: ['admin'],
      submenu: [
        { label: 'Registrar', path: '/combustible', roles: ['admin'] },
        { label: 'Recarga', path: '/recargacombustible', roles: ['admin'] },
        { label: 'Ver recargas', path: '/verrecargacombustible', roles: ['admin'] }
      ]
    },
    {
      label: 'Mantenimiento',
      icon: '🔧',
      roles: ['admin'],
      submenu: [
        { label: 'Registrar', path: '/mantenimiento', roles: ['admin'] },
        { label: 'Refacciones', path: '/refacciones', roles: ['admin'] }
      ]
    },
    {
      label: 'Cargar viajes',
      icon: '📅',
      roles: ['admin', 'user'],
      submenu: [
        { label: 'Precargar viajes', path: '/tabla', roles: ['admin'] },
        { label: 'Ver viajes', path: '/vertablaroles', roles: ['admin'] },
        { label: 'Definir roles', path: '/tablarfr', roles: ['admin', 'user'] },
        { label: 'Ver roles', path: '/cargarTablasRol', roles: ['admin', 'user'] }
      ]
    },
    {
      label: 'Utilidades y Nóminas',
      icon: '🗂️',
      roles: ['admin'],
      submenu: [
        { label: 'Utilidades', path: '/utilidades', roles: ['admin'] },
        { label: 'Nómina', path: '/Nomina', roles: ['admin'] }
      ]
    }
  ];

  return (
    <nav className={styles.menuWrapper}>
      {/* Botón hamburguesa: visible en pantallas pequeñas */}
      <button className={styles.hamburger} onClick={toggleMenu}>
        ☰
      </button>
      {/* Lista de menú */}
      <ul className={`${styles.menuList} ${menuOpen ? styles.open : ''}`}>
        {menuItems.map((item, index) => (
          <li key={index} className={activeDropdown === index ? styles.active : ''}>
            {item.submenu ? (
              <>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleDropdown(index);
                  }}
                  className={!isAllowed(item) ? styles.disabledLink : ''}
                >
                  <span className={styles.icon}>{item.icon}</span>
                  {item.label}
                  <span className={styles.dropdownIcon}>▼</span>
                </a>
                <ul className={activeDropdown === index ? styles.show : ''}>
                  {item.submenu.map((subItem, subIndex) => (
                    <li key={subIndex}>
                      {isAllowed(subItem) ? (
                        <Link to={subItem.path}>{subItem.label}</Link>
                      ) : (
                        <span className={styles.disabledLink}>{subItem.label}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              isAllowed(item) ? (
                <Link to={item.path}>
                  <span className={styles.icon}>{item.icon}</span>
                  {item.label}
                </Link>
              ) : (
                <span className={styles.disabledLink}>
                  <span className={styles.icon}>{item.icon}</span>
                  {item.label}
                </span>
              )
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Menu;
