import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Login.module.css';

export default function Login() {
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validación frontend
    if (!email.trim()) {
      setError('El correo electrónico es obligatorio.');
      return;
    }
    // Validación de formato de email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('El correo electrónico no es válido.');
      return;
    }
    if (!password) {
      setError('La contraseña es obligatoria.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        setError('Credenciales inválidas');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setUser(data.user, data.token);
      setSuccess('¡Inicio de sesión exitoso!');
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginTitle}>Acceder a tu cuenta</div>
      <form className={styles.loginForm} onSubmit={handleSubmit}>
        <div className={styles.loginField}>
          <label className={styles.loginLabel}>Email</label>
          <div className={styles.inputWrapper}>
            <span className={styles.inputIcon}>📧</span>
            <input
              className={styles.loginInput}
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        <div className={styles.loginField}>
          <label className={styles.loginLabel}>Contraseña</label>
          <div className={styles.inputWrapper}>
            <span className={styles.inputIcon}>🔒</span>
            <input
              className={styles.loginInput}
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
        </div>
        {error && <div className={styles.loginError}>{error}</div>}
        {success && <div className={styles.loginSuccess}>{success}</div>}
        <button className={styles.loginButton} type="submit" disabled={loading}>
          {loading ? <span className={styles.spinner}></span> : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}