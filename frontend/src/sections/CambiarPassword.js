import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import UserService from '../services/UserService';
import { useAuth } from '../context/AuthContext';
import styles from './CambiarPassword.module.css';

export default function CambiarPassword() {
  const { user, token, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState({
    password: '',
    loading: false,
    error: '',
    mensaje: '',
    success: false
  });

  const handleChange = e => {
    setState(prev => ({ ...prev, password: e.target.value }));
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setState(prev => ({ ...prev, loading: true, error: '', mensaje: '', success: false }));
    if (!state.password.trim()) {
      setState(prev => ({ ...prev, loading: false, error: 'La contraseña es obligatoria.' }));
      return;
    }
    try {
      await UserService.cambiarPassword(user.id, state.password, token);
      setUser({ ...user, debeCambiarPassword: false });
      setState(prev => ({
        ...prev,
        loading: false,
        mensaje: 'Contraseña cambiada correctamente. Cerrando sesión...',
        error: '',
        password: '',
        success: true
      }));
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 1500);
    } catch {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Error al cambiar la contraseña.',
        mensaje: '',
        success: false
      }));
    }
  }, [state.password, user, token, setUser, logout, navigate]);

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Cambiar contraseña</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={state.password}
          onChange={handleChange}
          required
          className={styles.input}
          disabled={state.loading || state.success}
        />
        <button
          type="submit"
          className={styles.btn}
          disabled={state.loading || state.success}
        >
          {state.loading ? 'Cambiando...' : 'Cambiar'}
        </button>
      </form>
      {state.error && (
        <div className={`${styles.mensaje} ${styles.mensajeError}`}>{state.error}</div>
      )}
      {state.mensaje && !state.error && (
        <div className={styles.mensaje}>{state.mensaje}</div>
      )}
    </section>
  );
}