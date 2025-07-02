import React, { useEffect, useState, useCallback } from 'react';
import NoticiasService from '../services/NoticiasService';

export default function Noticias() {
  const [state, setState] = useState({
    noticias: [],
    loading: true,
    error: ''
  });

  const cargarNoticias = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: ''}));
      const data = await NoticiasService.getNoticias();
      setState(prev => ({ ...prev, noticias: data}));
    } catch (error) {
      setState(prev => ({ ...prev, error: error.message}));
    } finally {
      setState(prev => ({ ...prev, loading: false}));
    }
  }, []);
  useEffect(() => {
    cargarNoticias();
  }, [cargarNoticias]);

  return (
    <main>
      <section aria-label="Noticias de la comunidad">
        <h2>Noticias</h2>
        {state.loading && <p aria-live="polite">Cargando noticias...</p>}
        {state.error && <div style={{ color: 'red' }} role="alert" aria-live='assertive'>{state.error}</div>}
        {!state.loading && !state.error && state.noticias.length === 0 && (
          <p>No hay noticias disponibles en este momento.</p>
        )}
        {!state.loading && !state.error && state.noticias.length > 0 && (
          <ul>
            {state.noticias.map(noticia => (
              <li key={noticia._id}>
                <h3>{noticia.titulo}</h3>
                <p>{noticia.contenido}</p>
                <small>{new Date(noticia.fecha).toLocaleDateString()}</small>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}