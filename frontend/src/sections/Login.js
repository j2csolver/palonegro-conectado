import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Login.module.css';

export default function Login() {
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        setError('Credenciales inválidas');
        return;
      }
      const data = await res.json();
      setUser(data.user, data.token);
      localStorage.setItem('token', data.token);
      navigate('/dashboard');
    } catch (err) {
      setError('Error de conexión');
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
        <button className={styles.loginButton} type="submit">Ingresar</button>
      </form>
    </div>
  );
}