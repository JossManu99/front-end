import React from 'react';
import styles from './Dashboard.module.css';
import Menu from '../header/menu';
import logo from '../../images/logo.png';

const DashboardHeader = ({ userData }) => {
  return (
    <div className={styles.headerContainer}>
      {/* Header con información de contacto */}
      <div className={styles.dashboardHeader}>
        <div className={styles.logo}>
          <img src={logo} alt="Navarrete" />
        </div>
        <div className={styles.contactInfo}>
          <p>Calle Primavera No.3, Loma Linda 76803, San Juan del Río, Qro.</p>
          <span>{userData?.email}</span>
        </div>
        <div className={styles.userInfo}>
          <div className={styles.avatar}></div>
          <span>{userData?.name}</span>
        </div>
      </div>
      
      {/* Menú de navegación y barra de búsqueda */}
      <div className={styles.navigationMenu}>
        <div className={styles.menuContainer}>
          <Menu />
        </div>
        <div className={styles.searchBar}>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
