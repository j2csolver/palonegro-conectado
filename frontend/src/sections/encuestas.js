import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);
import { Pie } from 'react-chartjs-2';

export default function Encuestas() {
  const { token, user } = useAuth();
  const [encuestas, setEncuestas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [seleccionada, setSeleccionada] = useState(null);
  const [respuestas, setRespuestas] = useState({});
  const [mensaje, setMensaje] = useState('');
  const [yaParticipo, setYaParticipo] = useState(false);
  const [resultados, setResultados] = useState(null);

  // Estado para crear encuesta (solo Administrador)
  const [creando, setCreando] = useState(false);
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevaActiva, setNuevaActiva] = useState(true);
  const [nuevasPreguntas, setNuevasPreguntas] = useState([]);
  const [preguntaTexto, setPreguntaTexto] = useState('');
  const [opciones, setOpciones] = useState(['', '']);
  const [crearMensaje, setCrearMensaje] = useState('');

  // Cargar encuestas
  useEffect(() => {
    setLoading(true);
    setError('');
    console.log('Token usado para fetch:', token); // <-- Agrega este log
    fetch('http://localhost:4000/api/encuestas', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('No se pudieron cargar las encuestas');
        return res.json();
      })
      .then(data => setEncuestas(data))
      .catch(() => setError('No se pudieron cargar las encuestas'))
      .finally(() => setLoading(false));
  }, [token, creando]);

  // Al seleccionar una encuesta, verifica si ya participó y carga resultados si es necesario
  const handleSeleccionar = async (encuesta) => {
    setSeleccionada(encuesta);
    setRespuestas({});
    setMensaje('');
    setResultados(null);
    setYaParticipo(false);

    // Verifica si ya participó (backend debe exponer este endpoint)
    if (user?.rol === 'Residente' || user?.rol === 'Administrador') {
      try {
        const res = await fetch(`http://localhost:4000/api/encuestas/${encuesta.id}/participacion`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.yaParticipo) {
            setYaParticipo(true);
            await cargarResultados(encuesta.id);
          }
        } else {
          setMensaje('No se pudo verificar la participación.');
        }
      } catch {
        setMensaje('Error de conexión al verificar participación.');
      }
    }
  };

  // Cargar resultados de la encuesta seleccionada
  const cargarResultados = async (encuestaId) => {
    try {
      const res = await fetch(`http://localhost:4000/api/encuestas/${encuestaId}/resultados`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setResultados(await res.json());
      else setMensaje('No se pudieron cargar los resultados.');
    } catch {
      setMensaje('Error de conexión al cargar resultados.');
      setResultados(null);
    }
  };

  const handleRespuesta = (preguntaId, opcionId) => {
    setRespuestas(prev => ({ ...prev, [preguntaId]: opcionId }));
  };

  const handleVotar = async (e) => {
    e.preventDefault();
    setMensaje('');
    if (!seleccionada) return;
    const preguntas = seleccionada.preguntas || [];
    // Validación: todas las preguntas deben tener respuesta
    const faltantes = preguntas.filter(p => !respuestas[p.id]);
    if (faltantes.length > 0) {
      setMensaje('Responde todas las preguntas para votar.');
      return;
    }
    try {
      const res = await fetch(`http://localhost:4000/api/encuestas/${seleccionada.id}/responder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ respuestas })
      });
      if (!res.ok) {
        if (res.status === 409) {
          setMensaje('Ya has participado en esta encuesta.');
        } else {
          setMensaje('No se pudo registrar el voto');
        }
        return;
      }
      setMensaje('¡Voto registrado correctamente!');
      setYaParticipo(true);
      await cargarResultados(seleccionada.id);
    } catch {
      setMensaje('No se pudo registrar el voto por un error de conexión');
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
    setOpciones([...opciones, '']);
  };

  const handleOpcionChange = (idx, value) => {
    setOpciones(opciones.map((op, i) => (i === idx ? value : op)));
  };

  const handleAgregarPregunta = () => {
    if (!preguntaTexto.trim() || opciones.some(op => !op.trim())) {
      setCrearMensaje('Completa el texto de la pregunta y todas las opciones.');
      return;
    }
    setNuevasPreguntas([
      ...nuevasPreguntas,
      { texto: preguntaTexto, opciones: opciones.filter(op => op.trim()) }
    ]);
    setPreguntaTexto('');
    setOpciones(['', '']);
    setCrearMensaje('');
  };

  const handleEliminarPregunta = (idx) => {
    setNuevasPreguntas(nuevasPreguntas.filter((_, i) => i !== idx));
  };

  const handleCrearEncuesta = async (e) => {
    e.preventDefault();
    setCrearMensaje('');
    if (!nuevoTitulo.trim() || nuevasPreguntas.length === 0) {
      setCrearMensaje('Agrega un título y al menos una pregunta.');
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
          titulo: nuevoTitulo,
          activa: nuevaActiva,
          preguntas: nuevasPreguntas
        })
      });
      if (!res.ok) throw new Error('No se pudo crear la encuesta');
      setCrearMensaje('¡Encuesta creada correctamente!');
      setCreando(false);
      setNuevoTitulo('');
      setNuevaActiva(true);
      setNuevasPreguntas([]);
    } catch {
      setCrearMensaje('No se pudo crear la encuesta');
    }
  };

  return (
    <main>
      <section aria-label="Encuestas y votaciones comunitarias">
        <h2>Encuestas</h2>
        {user?.rol === 'Administrador' && !creando && (
          <button
            onClick={() => setCreando(true)}
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

        {creando && (
          <form onSubmit={handleCrearEncuesta} style={{ marginBottom: 32, border: '1px solid #ccc', padding: 16, borderRadius: 8 }}>
            <h3>Crear nueva encuesta</h3>
            <label>
              Título:
              <input
                type="text"
                value={nuevoTitulo}
                onChange={e => setNuevoTitulo(e.target.value)}
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
                onChange={e => setNuevaActiva(e.target.checked)}
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
                onChange={e => setPreguntaTexto(e.target.value)}
                style={{ marginLeft: 8, width: '60%' }}
                required
                aria-required="true"
              />
            </label>
            <div>
              Opciones:
              {opciones.map((op, idx) => (
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
              onClick={() => setCreando(false)}
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

        {!creando && (
          <>
            {loading && <p aria-live="polite">Cargando encuestas...</p>}
            {error && <div style={{ color: 'red' }} role="alert" aria-live="assertive">{error}</div>}
            {!loading && !error && encuestas.length === 0 && (
              <p>No hay encuestas disponibles en este momento.</p>
            )}
            {!seleccionada && !loading && !error && encuestas.length > 0 && (
              <ul>
                {encuestas.map(encuesta => (
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
            {seleccionada && (
              <>
                {user?.rol === 'Residente' && yaParticipo ? (
                  <div>
                    <h3 tabIndex={0}>{seleccionada.titulo}</h3>
                    {seleccionada.preguntas?.map(pregunta => (
                      <div key={pregunta.id} style={{ marginBottom: 24 }}>
                        <strong tabIndex={0}>{pregunta.texto}</strong>
                        {renderGrafico(pregunta)}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setSeleccionada(null)}
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
                                  disabled={yaParticipo}
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
                      disabled={yaParticipo}
                      style={{
                        background: '#1976d2',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        padding: '8px 16px',
                        fontWeight: 'bold',
                        cursor: yaParticipo ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Votar
                    </button>
                    <button
                      type="button"
                      onClick={() => setSeleccionada(null)}
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