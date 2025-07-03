import React, { useEffect, useCallback, useRef } from 'react';
import UserService from '../services/UserService';
import { useAuth } from '../context/AuthContext';
import styles from './Usuarios.module.css';

export default function Usuarios() {
  const { token } = useAuth();
  const [state, setState] = React.useState({
    usuarios: [],
    loading: true,
    error: '',
    creando: false,
    editando: null,
    nombre: '',
    email: '',
    rol: '',
    mensaje: ''
  });

  const formRef = useRef(null);
  const inputNombreRef = useRef(null); // Referencia para el input de nombre

  // Scroll al formulario cuando se activa y enfoca el primer campo si está editando
  useEffect(() => {
    if (state.creando && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (inputNombreRef.current) {
        inputNombreRef.current.focus();
      }
    }
  }, [state.creando]);

  const cargarUsuarios = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: '' }));
    try {
      const data = await UserService.getUsuarios(token);
      setState(prev => ({ ...prev, usuarios: data, loading: false }));
    } catch (error) {
      setState(prev => ({ ...prev, error: error.message, loading: false }));
    }
  }, [token]);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  const handleGuardar = async (e) => {
    e.preventDefault();
    setState(prev => ({ ...prev, mensaje: '' }));
    if (!state.nombre.trim() || !state.email.trim() || !state.rol.trim()) {
      setState(prev => ({ ...prev, mensaje: 'Todos los campos son obligatorios.' }));
      return;
    }
    try {
      const usuarioPayload = {
        nombre: state.nombre,
        email: state.email,
        rol: state.rol
      };
      if (state.editando) {
        await UserService.updateUsuario(state.editando, usuarioPayload, token);
        setState(prev => ({ ...prev, mensaje: 'Usuario actualizado correctamente.' }));
      } else {
        await UserService.createUsuario(usuarioPayload, token);
        setState(prev => ({ ...prev, mensaje: 'Usuario registrado correctamente.' }));
      }
      setState(prev => ({
        ...prev,
        creando: false,
        editando: null,
        nombre: '',
        email: '',
        rol: ''
      }));
      cargarUsuarios();
    } catch (error) {
      setState(prev => ({ ...prev, mensaje: error.message || 'Error al guardar el usuario.' }));
    }
  };

  const handleEditar = (usuario) => {
    setState(prev => ({
      ...prev,
      editando: usuario.id,
      creando: true,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      mensaje: ''
    }));
    // El foco se maneja en el useEffect de arriba
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este usuario?')) return;
    try {
      await UserService.deleteUsuario(id, token);
      setState(prev => ({ ...prev, mensaje: 'Usuario eliminado.' }));
      cargarUsuarios();
    } catch (error) {
      setState(prev => ({ ...prev, mensaje: error.message || 'No se pudo eliminar el usuario.' }));
    }
  };

  const handleCancelar = () => {
    setState(prev => ({
      ...prev,
      creando: false,
      editando: null,
      nombre: '',
      email: '',
      rol: '',
      mensaje: ''
    }));
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Gestión de Usuarios</h2>
      {!state.creando && (
        <button
          className={styles.button}
          style={{ marginBottom: 16 }}
          onClick={() =>
            setState(prev => ({
              ...prev,
              creando: true,
              editando: null,
              nombre: '',
              email: '',
              rol: '',
              mensaje: ''
            }))
          }
        >
          Agregar usuario
        </button>
      )}

      {state.creando && (
        <form ref={formRef} onSubmit={handleGuardar} className={styles.form}>
          <input
            type="text"
            placeholder="Nombre"
            value={state.nombre}
            onChange={e => setState(prev => ({ ...prev, nombre: e.target.value }))}
            required
            className={styles.input}
            ref={inputNombreRef} // <-- referencia para el foco
          />
          <input
            type="email"
            placeholder="Email"
            value={state.email}
            onChange={e => setState(prev => ({ ...prev, email: e.target.value }))}
            required
            className={styles.input}
          />
          <select
            value={state.rol}
            onChange={e => setState(prev => ({ ...prev, rol: e.target.value }))}
            required
            className={styles.select}
          >
            <option value="">Seleccione un rol</option>
            <option value="Administrador">Administrador</option>
            <option value="Residente">Residente</option>
            <option value="Tesorero">Tesorero</option>
          </select>
          <button type="submit" className={styles.button}>
            {state.editando ? 'Actualizar' : 'Registrar'}
          </button>
          <button
            type="button"
            className={`${styles.button} ${styles.buttonCancel}`}
            onClick={handleCancelar}
          >
            Cancelar
          </button>
          {state.mensaje && (
            <div className={styles.mensaje}>{state.mensaje}</div>
          )}
        </form>
      )}

      {state.error && <div className={styles.mensaje}>{state.error}</div>}
      {state.loading ? (
        <p>Cargando usuarios...</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Nombre</th>
              <th className={styles.th}>Email</th>
              <th className={styles.th}>Rol</th>
              <th className={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {state.usuarios.map(u => (
              <tr key={u.id}>
                <td className={styles.td}>{u.nombre}</td>
                <td className={styles.td}>{u.email}</td>
                <td className={styles.td}>{u.rol}</td>
                <td className={styles.tdAcciones}>
                  <button
                    className={styles.tableButton}
                    onClick={() => handleEditar(u)}
                  >
                    Editar
                  </button>
                  <button
                    className={styles.tableButton}
                    onClick={() => handleEliminar(u.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}