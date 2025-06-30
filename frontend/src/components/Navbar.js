import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, setUser } = useAuth();

  const handleLogout = () => {
    setUser(null);
    // Si usas token, también haz: localStorage.removeItem('token');
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.brand}>Palonegro Conectado</div>
      <div className={styles.links}>
        <NavLink to="/blog" className={({ isActive }) => isActive ? styles.active : ''}>Inicio</NavLink>
        {!user && <NavLink to="/login" className={({ isActive }) => isActive ? styles.active : ''}>Login</NavLink>}
        {user && (
          <button onClick={handleLogout} className={styles.logout}>Cerrar sesión</button>
        )}
      </div>
    </nav>
  );
}