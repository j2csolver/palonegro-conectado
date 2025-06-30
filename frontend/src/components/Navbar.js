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
    <nav className={styles.nav}>
      <div className={styles.brand}>Palonegro Conectado</div>
      <div className={styles.links}>
        <a
          href={user ? "/dashboard" : "/inicio"}
          className={styles.active}
          onClick={handleInicioClick}
        >
          Inicio
        </a>
        {!user && (
          <NavLink to="/login" className={({ isActive }) => isActive ? styles.active : ''}>
            Acceder a tu cuenta
          </NavLink>
        )}
        {user && (
          <button onClick={handleLogout} className={styles.logout}>Cerrar sesión</button>
        )}
      </div>
    </nav>
  );
}