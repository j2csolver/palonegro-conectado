import React, { useEffect, useState } from 'react';
import QuejasService from '../services/QuejasService';
import { useAuth } from '../context/AuthContext';
import styles from './Quejas.module.css';
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

export default function Quejas() {
  const { user, token } = useAuth();
  const [state, setState] = useState({
    quejas: [],
    loading: true,
    error: '',
    creando: false,
    editando: null,
    titulo: '',
    descripcion: '',
    quejaId: null,
    mensaje: ''
  });

  const cargarQuejas = async () => {
    setState(prev => ({ ...prev, loading: true, error: '', mensaje: '' }));
    try {
      const data = await QuejasService.getQuejas(token);
      // El administrador ve todas, el residente solo las propias
      const visibles = user?.rol === 'Residente'
        ? data.filter(q => q.usuarioId === user.id)
        : data;
      setState(prev => ({ ...prev, quejas: visibles, loading: false }));
    } catch {
      setState(prev => ({ ...prev, error: 'No se pudieron cargar las quejas', loading: false }));
    }
  };

  useEffect(() => {
    cargarQuejas();
    // eslint-disable-next-line
  }, []);

  const limpiarFormulario = () => setState(prev => ({
    ...prev,
    creando: false,
    editando: null,
    titulo: '',
    descripcion: '',
    quejaId: null,
    mensaje: ''
  }));

  const handleCrearQueja = async (e) => {
    e.preventDefault();
    if (!state.titulo.trim() || !state.descripcion.trim()) {
      setState(prev => ({ ...prev, mensaje: 'Completa todos los campos.' }));
      return;
    }
    try {
      await QuejasService.createQueja({
        titulo: state.titulo,
        descripcion: state.descripcion
      }, token);
      limpiarFormulario();
      cargarQuejas();
    } catch (error) {
      setState(prev => ({ ...prev, mensaje: error.message || 'No se pudo crear la queja.' }));
    }
  };

  const handleEditarQueja = (queja) => {
    setState(prev => ({
      ...prev,
      creando: false,
      editando: queja.id,
      titulo: queja.titulo,
      descripcion: queja.descripcion,
      quejaId: queja.id,
      mensaje: ''
    }));
  };

  const handleActualizarQueja = async (e) => {
    e.preventDefault();
    if (!state.titulo.trim() || !state.descripcion.trim()) {
      setState(prev => ({ ...prev, mensaje: 'Completa todos los campos.' }));
      return;
    }
    try {
      await QuejasService.updateQueja(state.quejaId, {
        titulo: state.titulo,
        descripcion: state.descripcion
      }, token);
      limpiarFormulario();
      cargarQuejas();
    } catch (error) {
      setState(prev => ({ ...prev, mensaje: error.message || 'No se pudo actualizar la queja.' }));
    }
  };

  const handleEliminarQueja = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta queja?')) return;
    try {
      await QuejasService.deleteQueja(id, token);
      cargarQuejas();
    } catch (error) {
      setState(prev => ({ ...prev, mensaje: error.message || 'No se pudo eliminar la queja.' }));
    }
  };

  return (
    <main>
      <section aria-label="Quejas y sugerencias">
        <h2>Quejas y Sugerencias</h2>
        {!state.creando && state.editando === null && (
          <button
            className={styles.quejasBtn}
            onClick={() => setState(prev => ({ ...prev, creando: true, mensaje: '' }))}
          >
            Agregar queja
          </button>
        )}

        {(state.creando || state.editando !== null) && (
          <div className={styles.quejasCard}>
            <form
              onSubmit={state.editando !== null ? handleActualizarQueja : handleCrearQueja}
              className={styles.quejasForm}
              style={{ marginBottom: 24 }}
            >
              <h3>{state.editando !== null ? 'Editar queja' : 'Nueva queja'}</h3>
              <label>
                Título:
                <input
                  type="text"
                  value={state.titulo}
                  onChange={e => setState(prev => ({ ...prev, titulo: e.target.value }))}
                  required
                  className={styles.quejasInput}
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
                  className={styles.quejasInput}
                />
              </label>
              <div style={{ marginTop: 12 }}>
                <button type="submit" className={styles.quejasBtn}>
                  {state.editando !== null ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  className={styles.quejasBtn}
                  style={{ marginLeft: 8 }}
                  onClick={limpiarFormulario}
                >
                  Cancelar
                </button>
              </div>
              {state.mensaje && (
                <div className={styles.quejasMensajeError} role="alert" aria-live="assertive" style={{ marginTop: 8 }}>
                  {state.mensaje}
                </div>
              )}
            </form>
          </div>
        )}

        {state.loading && <p>Cargando quejas...</p>}
        {state.error && <p style={{ color: 'red' }}>{state.error}</p>}
        {!state.loading && !state.error && state.quejas.length === 0 && (
          <p>No hay quejas registradas en este momento.</p>
        )}
        <ul className={styles.quejasLista}>
          {state.quejas.map(queja => (
            <li key={queja.id} className={styles.quejaItem}>
              <h3 className={styles.quejaTitulo}>{queja.titulo}</h3>
              <div className={styles.quejaDescripcion}>
                <span dangerouslySetInnerHTML={{ __html: queja.descripcion }} />
              </div>
              <small className={styles.quejaMeta}>
                Enviada por: {queja.usuario?.email || 'Anónimo'}
              </small>
              <br />
              <small className={styles.quejaMeta}>
                {new Date(queja.fecha).toLocaleDateString()}
              </small>
              {/* El autor o el administrador pueden editar/eliminar */}
              {(user?.id === queja.usuarioId || user?.rol === 'Administrador') && (
                <div style={{ marginTop: 8 }}>
                  <button
                    className={styles.quejasBtnSmall}
                    onClick={() => handleEditarQueja(queja)}
                    style={{ marginRight: 8 }}
                  >
                    Editar
                  </button>
                  <button
                    className={styles.quejasBtnSmall}
                    style={{ background: '#d32f2f' }}
                    onClick={() => handleEliminarQueja(queja.id)}
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