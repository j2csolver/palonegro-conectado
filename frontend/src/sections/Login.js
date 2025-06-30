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
    <main>
      <section
        className={styles.loginContainer}
        aria-label="Formulario de inicio de sesión"
      >
        <h1 className={styles.loginTitle}>Acceder a tu cuenta</h1>
        <form
          className={styles.loginForm}
          onSubmit={handleSubmit}
          aria-label="Formulario de acceso"
        >
          <div className={styles.loginField}>
            <label
              className={styles.loginLabel}
              htmlFor="email"
            >
              Email
            </label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon} aria-hidden="true">📧</span>
              <input
                className={styles.loginInput}
                id="email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoFocus
                aria-required="true"
                aria-label="Correo electrónico"
              />
            </div>
          </div>
          <div className={styles.loginField}>
            <label
              className={styles.loginLabel}
              htmlFor="password"
            >
              Contraseña
            </label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon} aria-hidden="true">🔒</span>
              <input
                className={styles.loginInput}
                id="password"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                aria-required="true"
                aria-label="Contraseña"
              />
            </div>
          </div>
          {error && (
            <div
              className={styles.loginError}
              role="alert"
              aria-live="assertive"
            >
              {error}
            </div>
          )}
          {success && (
            <div
              className={styles.loginSuccess}
              role="status"
              aria-live="polite"
            >
              {success}
            </div>
          )}
          <button
            className={styles.loginButton}
            type="submit"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? <span className={styles.spinner} aria-hidden="true"></span> : 'Ingresar'}
          </button>
        </form>
      </section>
    </main>
  );
}