import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
      // Cambia la URL por la de tu backend
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
      // data.user debe tener { id, nombre, rol, ... }
      setUser(data.user);
      // Puedes guardar el token en localStorage si lo necesitas
      // localStorage.setItem('token', data.token);
      navigate('/dashboard');
    } catch (err) {
      setError('Error de conexión');
    }
  };

  return (
    <section>
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: 320 }}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoFocus
          />
        </div>
        <div>
          <label>Contraseña:</label>
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
        <button type="submit" style={{ marginTop: 12 }}>Entrar</button>
      </form>
    </section>
  );
}