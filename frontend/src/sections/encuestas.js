import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import EncuestasService from '../services/EncuestasService';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import styles from './Encuestas.module.css';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Encuestas() {
  const { token, user } = useAuth();
  const [state, setState] = useState({
    encuestas: [],
    loading: true,
    error: '',
    seleccionada: null,
    respuestas: {},
    mensaje: '',
    yaParticipo: false,
    resultados: null,
    creando: false,
    nuevoTitulo: '',
    nuevaActiva: true,
    nuevasPreguntas: [],
    preguntaTexto: '',
    opciones: ['', ''],
    crearMensaje: '',
    participaciones: {} // <--- Nuevo: mapa de encuestaId a true/false
  });

  // Nuevo: Verificar participación de todas las encuestas al cargar
  const verificarParticipaciones = useCallback(async (encuestas) => {
    if (!user || !token) return;
    const participaciones = {};
    for (const encuesta of encuestas) {
      try {
        const { yaParticipo } = await EncuestasService.verificarParticipacion(encuesta.id, token);
        participaciones[encuesta.id] = yaParticipo;
      } catch {
        participaciones[encuesta.id] = false;
      }
    }
    setState(prev => ({ ...prev, participaciones }));
  }, [token, user]);

  const cargarEncuestas = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: '' }));
      const data = await EncuestasService.getEncuestas(token);
      setState(prev => ({ ...prev, encuestas: data }));
      await verificarParticipaciones(data);
    } catch (error) {
      setState(prev => ({ ...prev, error: error.message }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [token, verificarParticipaciones]);

  useEffect(() => {
    cargarEncuestas();
  }, [cargarEncuestas, state.creando]);

  const handleSeleccionar = async (encuesta) => {
    setState(prev => ({
      ...prev,
      seleccionada: encuesta,
      respuestas: {},
      mensaje: '',
      resultados: null
    }));
    if (user?.rol === 'Residente' || user?.rol === 'Administrador') {
      try {
        const { yaParticipo } = await EncuestasService.verificarParticipacion(encuesta.id, token);
        if (yaParticipo) {
          setState(prev => ({ ...prev, yaParticipo: true }));
          await cargarResultados(encuesta.id);
        } else {
          setState(prev => ({ ...prev, yaParticipo: false }));
        }
      } catch (error) {
        setState(prev => ({ ...prev, mensaje: error.message }));
      }
    }
  };

  // Cargar resultados de la encuesta seleccionada
  const cargarResultados = async (encuestaId) => {
    try {
      const data = await EncuestasService.cargarResultados(encuestaId, token);
  setState(prev => ({ ...prev, resultados: data }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        mensaje: 'Error al cargar resultados',
        resultados: null 
      }));
    }
  };

  const handleRespuesta = (preguntaId, opcionId) => {
    setState(prev => ({ ...prev, respuestas: { ...prev.respuestas, [preguntaId]: opcionId } }));
  };
  const handleVotar = async (e) => {
    e.preventDefault();
    setState(prev => ({ ...prev, mensaje: '' }));
    if (!state.seleccionada) return;

    const preguntas = state.seleccionada.preguntas || [];
    const faltantes = preguntas.filter(p => !state.respuestas[p.id]);

    if (faltantes.length > 0) {
      setState(prev => ({ ...prev, mensaje: 'Responde todas las preguntas para votar.' }));
      return;
    }
    try {
      await EncuestasService.enviarRespuestas(state.seleccionada.id, state.respuestas, token);
      setState(prev => ({
        ...prev,
        mensaje: '¡Voto registrado correctamente!',
        yaParticipo: true,
        participaciones: {
          ...prev.participaciones,
          [state.seleccionada.id]: true // <-- Actualiza la participación para la encuesta actual
        }
      }));

      await cargarResultados(state.seleccionada.id);
    } catch (error) {
      setState(prev => ({ ...prev, mensaje: error.message }));
    }
  };

  // Renderiza gráfico de resultados para una pregunta
  const renderGrafico = (pregunta) => {
    if (!state.resultados || !state.resultados[pregunta.id]) return <p>No hay resultados.</p>;
    const data = {
      labels: pregunta.opciones.map(op => op.texto),
      datasets: [
        {
          data: pregunta.opciones.map(op => state.resultados[pregunta.id][op.id] || 0),
          backgroundColor: [
            '#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
          ],
        },
      ],
    };
    return (
      <div style={{ maxWidth: 350, margin: '0 auto' }}>
        <Pie data={data} aria-label={`Resultados de ${pregunta.texto}`} />
      </div>
    );
  };

  // Funciones para crear encuesta
  const handleAgregarOpcion = () => {
    setState(prev => {
      const nuevasOpciones = [...prev.opciones, ''];
      // Ajusta el tamaño del array de refs si es necesario
      setTimeout(() => {
        if (opcionesRefs.current[nuevasOpciones.length - 1]) {
          opcionesRefs.current[nuevasOpciones.length - 1].focus();
        }
      }, 0);
      return { ...prev, opciones: nuevasOpciones };
    });
  };

  const handleOpcionChange = (idx, value) => {
    setState(prev => ({ ...prev, opciones: prev.opciones.map((op, i) => (i === idx ? value : op)) }));
  };

  // Referencias para los inputs de opciones y preguntas
  const opcionesRefs = useRef([]);
  const preguntaRef = useRef(null);

  const handleAgregarPregunta = () => {
    if (!state.preguntaTexto.trim() || state.opciones.some(op => !op.trim())) {
      setState(prev => ({ ...prev, crearMensaje: 'Completa el texto de la pregunta y todas las opciones.' }));
      return;
    }
    setState(prev => ({
      ...prev,
      nuevasPreguntas: [
        ...prev.nuevasPreguntas,
        { texto: prev.preguntaTexto, opciones: prev.opciones.filter(op => op.trim()) }
      ],
      preguntaTexto: '',
      opciones: ['', ''],
      crearMensaje: ''
    }));
    setTimeout(() => {
      if (preguntaRef.current) {
        preguntaRef.current.focus();
      }
    }, 0);
  };

  const handleEliminarPregunta = (idx) => {
    setState(prev => ({ ...prev, nuevasPreguntas: prev.nuevasPreguntas.filter((_, i) => i !== idx) }));
  };

  const handleCrearEncuesta = async (e) => {
    e.preventDefault();
    setState(prev => ({ ...prev, crearMensaje: '' }));

    // Construye el array de preguntas a enviar, agregando la pendiente si corresponde
    let preguntasAEnviar = state.nuevasPreguntas;
    if (state.preguntaTexto.trim() && state.opciones.every(op => op.trim())) {
      preguntasAEnviar = [
        ...preguntasAEnviar,
        { texto: state.preguntaTexto, opciones: state.opciones.filter(op => op.trim()) }
      ];
    }

    if (!state.nuevoTitulo.trim() || preguntasAEnviar.length === 0) {
      setState(prev => ({ ...prev, crearMensaje: 'Agrega un título y al menos una pregunta.' }));
      return;
    }

    try {
      await EncuestasService.crearEncuesta({
        titulo: state.nuevoTitulo,
        activa: state.nuevaActiva,
        preguntas: preguntasAEnviar
      }, token);

      setState(prev => ({
        ...prev,
        crearMensaje: '¡Encuesta creada correctamente!',
        creando: false,
        nuevoTitulo: '',
        nuevaActiva: true,
        nuevasPreguntas: [],
        preguntaTexto: '',
        opciones: ['', '']
      }));
    } catch (error) {
      setState(prev => ({ ...prev, crearMensaje: error.message || 'No se pudo crear la encuesta' }));
    }
  };

  // Agrega función para eliminar encuesta
  const handleEliminarEncuesta = async (encuestaId) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta encuesta?')) return;
    try {
      await EncuestasService.eliminarEncuesta(encuestaId, token);
      setState(prev => ({
        ...prev,
        encuestas: prev.encuestas.filter(e => e.id !== encuestaId),
        seleccionada: prev.seleccionada && prev.seleccionada.id === encuestaId ? null : prev.seleccionada,
        mensaje: 'Encuesta eliminada correctamente.'
      }));
    } catch (error) {
      setState(prev => ({ ...prev, mensaje: error.message || 'No se pudo eliminar la encuesta.' }));
    }
  };

  // Agrega función para actualizar encuesta (solo ejemplo para activar/desactivar)
  const handleActualizarEncuesta = async (encuestaId, data) => {
    try {
      await EncuestasService.actualizarEncuesta(encuestaId, data, token);
      setState(prev => ({
        ...prev,
        mensaje: 'Encuesta actualizada correctamente.',
        creando: false,
        seleccionada: null
      }));
      cargarEncuestas();
    } catch (error) {
      setState(prev => ({ ...prev, mensaje: error.message || 'No se pudo actualizar la encuesta.' }));
    }
  };

  return (
    <main>
      <section aria-label="Encuestas y votaciones comunitarias">
        <h2>Encuestas</h2>
        {user?.rol === 'Administrador' && !state.creando && (
          <button
            onClick={() => setState(prev => ({ ...prev, creando: true }))}
            className={styles.encuestasBtn}
          >
            Crear nueva encuesta
          </button>
        )}

        {state.creando && (
          <form onSubmit={handleCrearEncuesta} className={styles.encuestasForm}>
            <h3>Crear nueva encuesta</h3>
            <label>
              Título:
              <input
                type="text"
                value={state.nuevoTitulo}
                onChange={e => setState(prev => ({ ...prev, nuevoTitulo: e.target.value }))}
                className={styles.encuestasInput}
                required
                aria-required="true"
              />
            </label>
            <br />
            <label>
              Activa:
              <input
                type="checkbox"
                checked={state.nuevaActiva}
                onChange={e => setState(prev => ({ ...prev, nuevaActiva: e.target.checked }))}
                className={styles.encuestasCheckbox}
                aria-checked={state.nuevaActiva}
              />
            </label>
            <hr />
            <h4>Agregar pregunta</h4>
            <label>
              Pregunta:
              <input
                type="text"
                value={state.preguntaTexto}
                onChange={e => setState(prev => ({ ...prev, preguntaTexto: e.target.value }))}
                className={styles.encuestasPreguntaInput}
                required
                aria-required="true"
                ref={preguntaRef}
              />
            </label>
            <div>
              Opciones:
              {state.opciones.map((op, idx) => (
                <input
                  key={idx}
                  type="text"
                  value={op}
                  ref={el => (opcionesRefs.current[idx] = el)}
                  onChange={e => handleOpcionChange(idx, e.target.value)}
                  placeholder={`Opción ${idx + 1}`}
                  className={styles.encuestasOpcionInput}
                  required
                  aria-required="true"
                />
              ))}
              <button
                type="button"
                onClick={handleAgregarOpcion}
                className={styles.encuestasBtnSmall}
                aria-label="Agregar opción"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={handleAgregarPregunta}
              className={styles.encuestasBtn}
              style={{ marginTop: 8 }}
            >
              Agregar pregunta
            </button>
            <ul className={styles.encuestasPreguntaLista}>
              {state.nuevasPreguntas.map((p, idx) => (
                <li key={idx}>
                  <strong>{p.texto}</strong> ({p.opciones.join(', ')})
                  <button
                    type="button"
                    onClick={() => handleEliminarPregunta(idx)}
                    className={styles.encuestasBtnSmall}
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="submit"
              className={styles.encuestasBtn}
              style={{ marginTop: 8 }}
            >
              Crear encuesta
            </button>
            <button
              type="button"
              onClick={() => setState(prev => ({ ...prev, creando: false }))}
              className={styles.encuestasBtn}
              style={{ marginLeft: 8 }}
            >
              Cancelar
            </button>
            {state.crearMensaje && (
              <div
                className={
                  state.crearMensaje.startsWith('¡')
                    ? styles.encuestasMensajeExito
                    : styles.encuestasMensajeError
                }
                role="alert"
                aria-live="polite"
              >
                {state.crearMensaje}
              </div>
            )}
          </form>
        )}

        {!state.creando && (
          <>
            {state.loading && <p aria-live="polite">Cargando encuestas...</p>}
            {state.error && (
              <div className={styles.encuestasMensajeError} role="alert" aria-live="assertive">
                {state.error}
              </div>
            )}
            {!state.loading && !state.error && state.encuestas.length === 0 && (
              <p>No hay encuestas disponibles en este momento.</p>
            )}
            {/* LISTADO DE ENCUESTAS */}
            {!state.seleccionada && !state.loading && !state.error && state.encuestas.length > 0 && (
              <ul>
                {state.encuestas.map(encuesta => (
                  <li key={encuesta.id}>
                    <strong>{encuesta.titulo}</strong>
                    <span style={{ marginLeft: 8, color: encuesta.activa ? 'green' : 'gray', fontWeight: 'bold' }}>
                      {encuesta.activa ? 'Activa' : 'Inactiva'}
                    </span>
                    <button
                      onClick={() => handleSeleccionar(encuesta)}
                      className={styles.encuestasBtn}
                      style={{ marginLeft: 8 }}
                      aria-label={
                        encuesta.activa
                          ? (state.participaciones[encuesta.id] ? 'Ver resultados de' : 'Participar en') + ` la encuesta ${encuesta.titulo}`
                          : 'Ver resultados de la encuesta ' + encuesta.titulo
                      }
                    >
                      {encuesta.activa
                        ? (state.participaciones[encuesta.id] ? 'Ver Resultados' : 'Participar')
                        : 'Ver Resultados'}
                    </button>
                    {user?.rol === 'Administrador' && (
                      <>
                        <button
                          onClick={() => handleActualizarEncuesta(encuesta.id, { activa: !encuesta.activa })}
                          className={styles.encuestasBtnSmall}
                          style={{ marginLeft: 8 }}
                          aria-label={encuesta.activa ? 'Desactivar encuesta' : 'Activar encuesta'}
                        >
                          {encuesta.activa ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          onClick={() => handleEliminarEncuesta(encuesta.id)}
                          className={styles.encuestasBtnSmall}
                          style={{ marginLeft: 8, background: '#d32f2f' }}
                          aria-label="Eliminar encuesta"
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {state.seleccionada && (
              <>
                {/* Si la encuesta está activa y el usuario no ha participado, muestra el formulario de votación */}
                {(user?.rol === 'Residente' || user?.rol === 'Administrador') &&
                  state.seleccionada.activa &&
                  !state.yaParticipo ? (
                  <form onSubmit={handleVotar} aria-label={`Encuesta: ${state.seleccionada.titulo}`}>
                    <h3 tabIndex={0}>{state.seleccionada.titulo}</h3>
                    {state.seleccionada.preguntas?.map(pregunta => (
                      <div key={pregunta.id} style={{ marginBottom: 16 }}>
                        <strong tabIndex={0}>{pregunta.texto}</strong>
                        <ul>
                          {pregunta.opciones?.map(op => (
                            <li key={op.id}>
                              <label>
                                <input
                                  type="radio"
                                  name={`pregunta-${pregunta.id}`}
                                  value={op.id}
                                  checked={state.respuestas[pregunta.id] === op.id}
                                  onChange={() => handleRespuesta(pregunta.id, op.id)}
                                  aria-checked={state.respuestas[pregunta.id] === op.id}
                                  aria-label={`Opción ${op.texto} para la pregunta ${pregunta.texto}`}
                                  required
                                  disabled={state.yaParticipo}
                                />
                                {op.texto}
                              </label>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    <button
                      type="submit"
                      disabled={state.yaParticipo}
                      className={styles.encuestasBtn}
                      style={{ cursor: state.yaParticipo ? 'not-allowed' : 'pointer' }}
                    >
                      Votar
                    </button>
                    <button
                      type="button"
                      onClick={() => setState(prev => ({ ...prev, seleccionada: null }))}
                      className={styles.encuestasBtn}
                      style={{ marginLeft: 8 }}
                      aria-label="Volver a la lista de encuestas"
                    >
                      Volver
                    </button>
                    {state.mensaje && (
                      <div
                        className={
                          state.mensaje.startsWith('¡')
                            ? styles.encuestasMensajeExito
                            : styles.encuestasMensajeError
                        }
                        style={{ marginTop: 8 }}
                        role={state.mensaje.startsWith('¡') ? 'status' : 'alert'}
                        aria-live="polite"
                      >
                        {state.mensaje}
                      </div>
                    )}
                  </form>
                ) : (
                  // Si la encuesta está inactiva o el usuario ya participó, solo muestra resultados
                  <div>
                    <h3 tabIndex={0}>{state.seleccionada.titulo}</h3>
                    {state.seleccionada.preguntas?.map(pregunta => (
                      <div key={pregunta.id} style={{ marginBottom: 24 }}>
                        <strong tabIndex={0}>{pregunta.texto}</strong>
                        <div className={styles.encuestasGrafico}>
                          {renderGrafico(pregunta)}
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setState(prev => ({ ...prev, seleccionada: null }))}
                      className={styles.encuestasBtn}
                      style={{ marginBottom: 16 }}
                      aria-label="Volver a la lista de encuestas"
                    >
                      Volver
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </section>
    </main>
  );
}