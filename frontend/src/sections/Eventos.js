import React, { useEffect, useState, useCallback } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styles from './Eventos.module.css';
import EventosService from '../services/EventosService';
import { useAuth } from '../context/AuthContext';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Configuración personalizada para la toolbar y los formatos permitidos, igual que en Noticias.js
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

export default function Eventos() {
  const { user, token } = useAuth();
  const [state, setState] = useState({
    eventos: [],
    loading: true,
    error: '',
    value: new Date(),
    creando: false,
    editando: null,
    titulo: '',
    descripcion: '',
    fechaInicio: '',
    fechaFin: '',
    eventoId: null,
    mensaje: ''
  });

  const cargarEventos = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: '', mensaje: '' }));
    try {
      const data = await EventosService.getEventos();
      setState(prev => ({ ...prev, eventos: data, loading: false }));
    } catch {
      setState(prev => ({ ...prev, error: 'No se pudieron cargar los eventos', loading: false }));
    }
  }, []);

  useEffect(() => {
    cargarEventos();
  }, [cargarEventos]);

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const hayEvento = state.eventos.some(ev =>
        new Date(ev.fechaInicio).toDateString() === date.toDateString()
      );
      return hayEvento ? <span style={{ color: 'red' }}>●</span> : null;
    }
  };

  const eventosDelDia = state.eventos.filter(ev =>
    new Date(ev.fechaInicio).toDateString() === state.value.toDateString()
  );

  // --- CRUD ADMIN ---

  const limpiarFormulario = () => setState(prev => ({
    ...prev,
    creando: false,
    editando: null,
    titulo: '',
    descripcion: '',
    fechaInicio: '',
    fechaFin: '',
    eventoId: null,
    mensaje: ''
  }));

  const handleCrearEvento = async (e) => {
    e.preventDefault();
    if (!state.titulo.trim() || !state.descripcion.trim() || !state.fechaInicio || !state.fechaFin) {
      setState(prev => ({ ...prev, mensaje: 'Completa todos los campos.' }));
      return;
    }
    try {
      await EventosService.createEvento({
        titulo: state.titulo,
        descripcion: state.descripcion,
        fechaInicio: state.fechaInicio,
        fechaFin: state.fechaFin
      }, token);
      limpiarFormulario();
      cargarEventos();
    } catch (error) {
      setState(prev => ({ ...prev, mensaje: error.message || 'No se pudo crear el evento.' }));
    }
  };

  const handleEditarEvento = (evento) => {
    setState(prev => ({
      ...prev,
      creando: false,
      editando: evento.id,
      titulo: evento.titulo,
      descripcion: evento.descripcion,
      fechaInicio: evento.fechaInicio.slice(0, 16),
      fechaFin: evento.fechaFin.slice(0, 16),
      eventoId: evento.id,
      mensaje: ''
    }));
  };

  const handleActualizarEvento = async (e) => {
    e.preventDefault();
    if (!state.titulo.trim() || !state.descripcion.trim() || !state.fechaInicio || !state.fechaFin) {
      setState(prev => ({ ...prev, mensaje: 'Completa todos los campos.' }));
      return;
    }
    try {
      await EventosService.updateEvento(state.eventoId, {
        titulo: state.titulo,
        descripcion: state.descripcion,
        fechaInicio: state.fechaInicio,
        fechaFin: state.fechaFin
      }, token);
      limpiarFormulario();
      cargarEventos();
    } catch (error) {
      setState(prev => ({ ...prev, mensaje: error.message || 'No se pudo actualizar el evento.' }));
    }
  };

  const handleEliminarEvento = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este evento?')) return;
    try {
      await EventosService.deleteEvento(id, token);
      cargarEventos();
    } catch (error) {
      setState(prev => ({ ...prev, mensaje: error.message || 'No se pudo eliminar el evento.' }));
    }
  };

  // --- FIN CRUD ADMIN ---

  return (
    <main>
      <section aria-label="Calendario de eventos comunitarios">
        <h2>Eventos</h2>
        {user?.rol === 'Administrador' && !state.creando && state.editando === null && (
          <button
            className={styles.eventosBtn}
            onClick={() => setState(prev => ({ ...prev, creando: true, mensaje: '' }))}
          >
            Agregar evento
          </button>
        )}

        {(state.creando || state.editando !== null) && (
          <div className={styles.eventosCard}>
            <form
              onSubmit={state.editando !== null ? handleActualizarEvento : handleCrearEvento}
              className={styles.eventosForm}
              style={{ marginBottom: 24 }}
            >
              <h3>{state.editando !== null ? 'Editar evento' : 'Nuevo evento'}</h3>
              <label>
                Título:
                <input
                  type="text"
                  value={state.titulo}
                  onChange={e => setState(prev => ({ ...prev, titulo: e.target.value }))}
                  required
                  className={styles.eventosInput}
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
                  className={styles.eventosInput}
                />
              </label>
              <label>
                Fecha y hora de inicio:
                <input
                  type="datetime-local"
                  value={state.fechaInicio}
                  onChange={e => setState(prev => ({ ...prev, fechaInicio: e.target.value }))}
                  required
                  className={styles.eventosInput}
                />
              </label>
              <label>
                Fecha y hora de fin:
                <input
                  type="datetime-local"
                  value={state.fechaFin}
                  onChange={e => setState(prev => ({ ...prev, fechaFin: e.target.value }))}
                  required
                  className={styles.eventosInput}
                />
              </label>
              <div style={{ marginTop: 12 }}>
                <button type="submit" className={styles.eventosBtn}>
                  {state.editando !== null ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  className={styles.eventosBtn}
                  style={{ marginLeft: 8 }}
                  onClick={limpiarFormulario}
                >
                  Cancelar
                </button>
              </div>
              {state.mensaje && (
                <div className={styles.eventosMensajeError} role="alert" aria-live="assertive" style={{ marginTop: 8 }}>
                  {state.mensaje}
                </div>
              )}
            </form>
          </div>
        )}

        {state.loading && <p>Cargando eventos...</p>}
        {state.error && (
          <div style={{ color: 'red' }} role="alert" aria-live="assertive">
            {state.error}
          </div>
        )}
        {!state.loading && !state.error && (
          <div className={styles.eventosGrid}>
            <div className={styles.calendarioBox}>
              <Calendar
                onChange={value => setState(prev => ({ ...prev, value }))}
                value={state.value}
                tileContent={tileContent}
              />
            </div>
            <div className={styles.listaEventosBox}>
              <h3 className={styles.eventosDiaTitulo}>
                Eventos del {state.value.toLocaleDateString()}
              </h3>
              <ul className={styles.listaEventos}>
                {eventosDelDia.length === 0 && <li>No hay eventos este día.</li>}
                {eventosDelDia.map(ev => (
                  <li key={ev.id} className={styles.eventoItem}>
                    <strong>{ev.titulo}</strong><br />
                    <span dangerouslySetInnerHTML={{ __html: ev.descripcion }} /><br />
                    {new Date(ev.fechaInicio).toLocaleTimeString()} - {new Date(ev.fechaFin).toLocaleTimeString()}
                    {user?.rol === 'Administrador' && (
                      <div style={{ marginTop: 8 }}>
                        <button
                          className={styles.eventosBtnSmall}
                          onClick={() => handleEditarEvento(ev)}
                          style={{ marginRight: 8 }}
                        >
                          Editar
                        </button>
                        <button
                          className={styles.eventosBtnSmall}
                          style={{ background: '#d32f2f' }}
                          onClick={() => handleEliminarEvento(ev.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}