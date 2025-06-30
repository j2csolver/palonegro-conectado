import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/inicio');
  };

  const handleInicioClick = (e) => {
    e.preventDefault();
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/inicio');
    }
  };

  return (
    <nav className={styles.nav} role="navigation" aria-label="Barra de navegación principal">
      <div className={styles.brand}>Palonegro Conectado</div>
      <ul className={styles.links} role="menubar">
        <li role="none">
          <a
            href={user ? "/dashboard" : "/inicio"}
            className={styles.active}
            onClick={handleInicioClick}
            role="menuitem"
          >
            Inicio
          </a>
        </li>
        {!user && (
          <li role="none">
            <NavLink to="/login" className={({ isActive }) => isActive ? styles.active : ''} role="menuitem">
              Acceder a tu cuenta
            </NavLink>
          </li>
        )}
        {user && (
          <li role="none">
            <button onClick={handleLogout} className={styles.logout} role="menuitem">
              Cerrar sesión
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}