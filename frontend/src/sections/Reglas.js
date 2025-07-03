import React, { useEffect, useState } from 'react';
import ReglasService from '../services/ReglasService';
import { useAuth } from '../context/AuthContext';
import styles from './Reglas.module.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Configuración de la toolbar y formatos igual que en Noticias.js
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link', 'image', 'video', 'blockquote', 'code-block'],
    [{ 'color': [] }, { 'background': [] }],
    ['clean']
  ]
};

const quillFormats = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'link', 'image', 'video', 'blockquote', 'code-block',
  'color', 'background'
];

export default function Reglas() {
  const { user, token } = useAuth();
  const [state, setState] = useState({
    reglas: [],
    loading: true,
    error: '',
    creando: false,
    editando: null,
    titulo: '',
    descripcion: '',
    fecha: '',
    reglaId: null,
    mensaje: ''
  });

  const cargarReglas = async () => {
    setState(prev => ({ ...prev, loading: true, error: '', mensaje: '' }));
    try {
      const data = await ReglasService.getReglas();
      setState(prev => ({ ...prev, reglas: data, loading: false }));
    } catch {
      setState(prev => ({ ...prev, error: 'No se pudieron cargar las reglas', loading: false }));
    }
  };

  useEffect(() => {
    cargarReglas();
    // eslint-disable-next-line
  }, []);

  const limpiarFormulario = () => setState(prev => ({
    ...prev,
    creando: false,
    editando: null,
    titulo: '',
    descripcion: '',
    fecha: '',
    reglaId: null,
    mensaje: ''
  }));

  const handleCrearRegla = async (e) => {
    e.preventDefault();
    if (!state.titulo.trim() || !state.descripcion.trim() || !state.fecha) {
      setState(prev => ({ ...prev, mensaje: 'Completa todos los campos.' }));
      return;
    }
    try {
      await ReglasService.createRegla({
        titulo: state.titulo,
        descripcion: state.descripcion,
        fecha: state.fecha
      }, token);
      limpiarFormulario();
      cargarReglas();
    } catch (error) {
      setState(prev => ({ ...prev, mensaje: error.message || 'No se pudo crear la regla.' }));
    }
  };

  const handleEditarRegla = (regla) => {
    setState(prev => ({
      ...prev,
      creando: false,
      editando: regla.id,
      titulo: regla.titulo,
      descripcion: regla.descripcion,
      fecha: regla.fecha ? regla.fecha.slice(0, 10) : '',
      reglaId: regla.id,
      mensaje: ''
    }));
  };

  const handleActualizarRegla = async (e) => {
    e.preventDefault();
    if (!state.titulo.trim() || !state.descripcion.trim() || !state.fecha) {
      setState(prev => ({ ...prev, mensaje: 'Completa todos los campos.' }));
      return;
    }
    try {
      await ReglasService.updateRegla(state.reglaId, {
        titulo: state.titulo,
        descripcion: state.descripcion,
        fecha: state.fecha
      }, token);
      limpiarFormulario();
      cargarReglas();
    } catch (error) {
      setState(prev => ({ ...prev, mensaje: error.message || 'No se pudo actualizar la regla.' }));
    }
  };

  const handleEliminarRegla = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta regla?')) return;
    try {
      await ReglasService.deleteRegla(id, token);
      cargarReglas();
    } catch (error) {
      setState(prev => ({ ...prev, mensaje: error.message || 'No se pudo eliminar la regla.' }));
    }
  };

  return (
    <main>
      <section aria-label="Reglas de convivencia">
        <h2>Reglas de Convivencia</h2>
        {user?.rol === 'Administrador' && !state.creando && state.editando === null && (
          <button
            className={styles.reglasBtn}
            onClick={() => setState(prev => ({ ...prev, creando: true, mensaje: '' }))}
          >
            Agregar regla
          </button>
        )}

        {(state.creando || state.editando !== null) && (
          <div className={styles.reglasCard}>
            <form
              onSubmit={state.editando !== null ? handleActualizarRegla : handleCrearRegla}
              className={styles.reglasForm}
              style={{ marginBottom: 24 }}
            >
              <h3>{state.editando !== null ? 'Editar regla' : 'Nueva regla'}</h3>
              <label>
                Título:
                <input
                  type="text"
                  value={state.titulo}
                  onChange={e => setState(prev => ({ ...prev, titulo: e.target.value }))}
                  required
                  className={styles.reglasInput}
                />
              </label>
              <label>
                Descripción:
                <ReactQuill
                  theme="snow"
                  value={state.descripcion}
                  onChange={value => setState(prev => ({ ...prev, descripcion: value }))}
                  modules={quillModules}
                  formats={quillFormats}
                  className={styles.reglasInput}
                />
              </label>
              <label>
                Fecha:
                <input
                  type="date"
                  value={state.fecha}
                  onChange={e => setState(prev => ({ ...prev, fecha: e.target.value }))}
                  required
                  className={styles.reglasInput}
                />
              </label>
              <div style={{ marginTop: 12 }}>
                <button type="submit" className={styles.reglasBtn}>
                  {state.editando !== null ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  className={styles.reglasBtn}
                  style={{ marginLeft: 8 }}
                  onClick={limpiarFormulario}
                >
                  Cancelar
                </button>
              </div>
              {state.mensaje && (
                <div className={styles.reglasMensajeError} role="alert" aria-live="assertive" style={{ marginTop: 8 }}>
                  {state.mensaje}
                </div>
              )}
            </form>
          </div>
        )}

        {state.loading && <p>Cargando reglas...</p>}
        {state.error && <p style={{ color: 'red' }}>{state.error}</p>}
        {!state.loading && !state.error && state.reglas.length === 0 && (
          <p>No hay reglas disponibles en este momento.</p>
        )}
        <ul className={styles.reglasLista}>
          {state.reglas.map(regla => (
            <li key={regla.id} className={styles.reglaItem}>
              <h3 className={styles.reglaTitulo}>{regla.titulo}</h3>
              <div className={styles.reglaDescripcion}>
                <span dangerouslySetInnerHTML={{ __html: regla.descripcion }} />
              </div>
              {regla.fecha && (
                <small className={styles.reglaFecha}>
                  Fecha: {new Date(regla.fecha).toLocaleDateString()}
                </small>
              )}
              {user?.rol === 'Administrador' && (
                <div style={{ marginTop: 8 }}>
                  <button
                    className={styles.reglasBtnSmall}
                    onClick={() => handleEditarRegla(regla)}
                    style={{ marginRight: 8 }}
                  >
                    Editar
                  </button>
                  <button
                    className={styles.reglasBtnSmall}
                    style={{ background: '#d32f2f' }}
                    onClick={() => handleEliminarRegla(regla.id)}
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}