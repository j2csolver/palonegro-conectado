import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import EncuestasService from '../services/EncuestasService';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
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
    crearMensaje: ''
  });
  const cargarEncuestas = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: '' }));
      const data = await EncuestasService.getEncuestas(token);
      setState(prev => ({ ...prev, encuestas: data }));
    } catch (error) {
      setState(prev => ({ ...prev, error: error.message }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
      }
  }, [token]);
  useEffect(() => {
    cargarEncuestas();
  }, [cargarEncuestas, state.creando]);
  const handleSeleccionar = async (encuesta) => {
    setState(prev => ({
      ...prev,
      seleccionada: encuesta,
      respuestas: {},
      mensaje: '',
      resultados: null,
      yaParticipo: false
    }));
    if (user?.rol === 'Residente' || user?.rol === 'Administrador') {
      try {
        const { yaParticipo } = await EncuestasService.verificarParticipacion(encuesta.id, token);
        if (yaParticipo) {
          setState(prev => ({ ...prev, yaParticipo: true }));
            await cargarResultados(encuesta.id);
          }
      } catch (error) {
        setState(prev => ({ ...prev, mensaje: error.message }));
      }
    }
  };

  // Cargar resultados de la encuesta seleccionada
  const cargarResultados = async (encuestaId) => {
    try {
      const res = await fetch(`http://localhost:4000/api/encuestas/${encuestaId}/resultados`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
if (res.ok) {
  const data = await res.json();
  setState(prev => ({ ...prev, resultados: data }));
        setState(prev => ({ ...prev, mensaje: 'No se pudieron cargar los resultados.' }));
      }
    } catch {
      setState(prev => ({ 
        ...prev, 
        mensaje: 'Error de conexión al cargar resultados.',
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
      const res = await fetch(`http://localhost:4000/api/encuestas/${state.seleccionada.id}/responder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ respuestas: state.respuestas })
      });
      if (!res.ok) {
        if (res.status === 409) {
          setState(prev => ({ ...prev, mensaje: 'Ya has participado en esta encuesta.' }));
        } else {
          setState(prev => ({ ...prev, mensaje: 'No se pudo registrar el voto' }));
        }
        return;
      }
      setState(prev => ({ 
        ...prev, 
        mensaje: '¡Voto registrado correctamente!',
        yaParticipo: true
      }));
      
      await cargarResultados(state.seleccionada.id);
    } catch {
      setState(prev => ({ ...prev, mensaje: 'No se pudo registrar el voto por un error de conexión' }));
    }
  };

  // Renderiza gráfico de resultados para una pregunta
  const renderGrafico = (pregunta) => {
    if (!resultados || !resultados[pregunta.id]) return <p>No hay resultados.</p>;
    const data = {
      labels: pregunta.opciones.map(op => op.texto),
      datasets: [
        {
          data: pregunta.opciones.map(op => resultados[pregunta.id][op.id] || 0),
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
    setState(prev => ({ ...prev, opciones: [...prev.opciones, ''] }));
  };

  const handleOpcionChange = (idx, value) => {
    setState(prev => ({ ...prev, opciones: prev.opciones.map((op, i) => (i === idx ? value : op)) }));
  };

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
  };

  const handleEliminarPregunta = (idx) => {
    setState(prev => ({ ...prev, nuevasPreguntas: prev.nuevasPreguntas.filter((_, i) => i !== idx) }));
  };

  const handleCrearEncuesta = async (e) => {
    e.preventDefault();
    setState(prev => ({ ...prev, crearMensaje: '' }));
    
    if (!state.nuevoTitulo.trim() || state.nuevasPreguntas.length === 0) {
      setState(prev => ({ ...prev, crearMensaje: 'Agrega un título y al menos una pregunta.' }));
      return;
    }
    
    try {
      const res = await fetch('http://localhost:4000/api/encuestas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          titulo: state.nuevoTitulo,
          activa: state.nuevaActiva,
          preguntas: state.nuevasPreguntas
        })
      });
      
      if (!res.ok) throw new Error('No se pudo crear la encuesta');
      
      setState(prev => ({
        ...prev,
        crearMensaje: '¡Encuesta creada correctamente!',
        creando: false,
        nuevoTitulo: '',
        nuevaActiva: true,
        nuevasPreguntas: []
      }));
    } catch {
      setState(prev => ({ ...prev, crearMensaje: 'No se pudo crear la encuesta' }));
    }
  };

  return (
    <main>
      <section aria-label="Encuestas y votaciones comunitarias">
        <h2>Encuestas</h2>
        {user?.rol === 'Administrador' && !state.creando && (
          <button
            onClick={() => setState(prev => ({ ...prev, creando: true }))}
            style={{
              marginBottom: 16,
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              padding: '8px 16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Crear nueva encuesta
          </button>
        )}

        {state.creando && (
          <form onSubmit={handleCrearEncuesta} style={{ marginBottom: 32, border: '1px solid #ccc', padding: 16, borderRadius: 8 }}>
            <h3>Crear nueva encuesta</h3>
            <label>
              Título:
              <input
                type="text"
                value={nuevoTitulo}
                onChange={e => setState(prev => ({ ...prev, NuevoTitulo: e.target.value }))}
                style={{ marginLeft: 8, width: '60%' }}
                required
                aria-required="true"
              />
            </label>
            <br />
            <label>
              Activa:
              <input
                type="checkbox"
                checked={nuevaActiva}
                onChange={e => setState(prev => ({ ...prev, NuevaActiva: e.target.checked }))}
                style={{ marginLeft: 8 }}
                aria-checked={nuevaActiva}
              />
            </label>
            <hr />
            <h4>Agregar pregunta</h4>
            <label>
              Pregunta:
              <input
                type="text"
                value={preguntaTexto}
                onChange={e => setState(prev => ({ ...prev, PreguntaTexto: e.target.value }))}
                style={{ marginLeft: 8, width: '60%' }}
                required
                aria-required="true"
              />
            </label>
            <div>
              Opciones:
              {state.opciones.map((op, idx) => (
                <input
                  key={idx}
                  type="text"
                  value={op}
                  onChange={e => handleOpcionChange(idx, e.target.value)}
                  placeholder={`Opción ${idx + 1}`}
                  style={{ marginLeft: 8, marginBottom: 4 }}
                  required
                  aria-required="true"
                />
              ))}
              <button
                type="button"
                onClick={handleAgregarOpcion}
                style={{
                  marginLeft: 8,
                  background: '#1976d2',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  padding: '4px 12px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
                aria-label="Agregar opción"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={handleAgregarPregunta}
              style={{
                marginTop: 8,
                background: '#1976d2',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                padding: '8px 16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Agregar pregunta
            </button>
            <ul>
              {nuevasPreguntas.map((p, idx) => (
                <li key={idx}>
                  <strong>{p.texto}</strong> ({p.opciones.join(', ')})
                  <button
                    type="button"
                    onClick={() => handleEliminarPregunta(idx)}
                    style={{
                      marginLeft: 8,
                      background: '#1976d2',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      padding: '4px 12px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="submit"
              style={{
                marginTop: 8,
                background: '#1976d2',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                padding: '8px 16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Crear encuesta
            </button>
            <button
              type="button"
              onClick={() => setState(prev => ({ ...prev, creando: true }))}
              style={{
                marginLeft: 8,
                background: '#1976d2',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                padding: '8px 16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
            {crearMensaje && (
              <div style={{ marginTop: 8, color: crearMensaje.startsWith('¡') ? 'green' : 'red' }} role="alert" aria-live="polite">
                {crearMensaje}
              </div>
            )}
          </form>
        )}

        {!state.creando && (
          <>
            {state.loading && <p aria-live="polite">Cargando encuestas...</p>}
            {state.error && <div style={{ color: 'red' }} role="alert" aria-live="assertive">{state.error}</div>}
            {!state.loading && !state.error && state.encuestas.length === 0 && (
              <p>No hay encuestas disponibles en este momento.</p>
            )}
            {!state.seleccionada && !state.loading && !state.error && state.encuestas.length > 0 && (
              <ul>
                {state.encuestas.map(encuesta => (
                  <li key={encuesta.id}>
                    <strong>{encuesta.titulo}</strong>
                    <button
                      onClick={() => handleSeleccionar(encuesta)}
                      style={{
                        marginLeft: 8,
                        background: '#1976d2',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        padding: '8px 16px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                      aria-label={`Participar en la encuesta ${encuesta.titulo}`}
                    >
                      Participar
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {state.seleccionada && (
              <>
                {(user?.rol === 'Residente' || user?.rol === 'Administrador') && state.yaParticipo ? (
                  <div>
                    <h3 tabIndex={0}>{state.seleccionada.titulo}</h3>
                    {state.seleccionada.preguntas?.map(pregunta => (
                      <div key={pregunta.id} style={{ marginBottom: 24 }}>
                        <strong tabIndex={0}>{pregunta.texto}</strong>
                        {renderGrafico(pregunta)}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setState(prev => ({ ...prev, seleccionada: null }))}
                      style={{
                        marginBottom: 16,
                        background: '#1976d2',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        padding: '8px 16px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                      aria-label="Volver a la lista de encuestas"
                    >
                      Volver
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleVotar} aria-label={`Encuesta: ${seleccionada.titulo}`}>
                    <h3 tabIndex={0}>{seleccionada.titulo}</h3>
                    {seleccionada.preguntas?.map(pregunta => (
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
                                  checked={respuestas[pregunta.id] === op.id}
                                  onChange={() => handleRespuesta(pregunta.id, op.id)}
                                  aria-checked={respuestas[pregunta.id] === op.id}
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
                      style={{
                        background: '#1976d2',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        padding: '8px 16px',
                        fontWeight: 'bold',
                        cursor: state.yaParticipo ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Votar
                    </button>
                    <button
                      type="button"
                      onClick={() => setState(prev => ({ ...prev, seleccionada: null }))}
                      style={{
                        marginLeft: 8,
                        background: '#1976d2',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        padding: '8px 16px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                      aria-label="Volver a la lista de encuestas"
                    >
                      Volver
                    </button>
                    {mensaje && (
                      <div
                        style={{ marginTop: 8, color: mensaje.startsWith('¡') ? 'green' : 'red' }}
                        role={mensaje.startsWith('¡') ? 'status' : 'alert'}
                        aria-live="polite"
                      >
                        {mensaje}
                      </div>
                    )}
                  </form>
                )}
              </>
            )}
          </>
        )}
      </section>
    </main>
  );
}