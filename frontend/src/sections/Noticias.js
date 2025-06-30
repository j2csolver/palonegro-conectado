import React, { useEffect, useState } from 'react';

export default function Noticias() {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:4000/api/noticias')
      .then(res => {
        if (!res.ok) throw new Error('No se pudieron cargar las noticias');
        return res.json();
      })
      .then(data => setNoticias(data))
      .catch(() => setError('No se pudieron cargar las noticias'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <section aria-label="Noticias de la comunidad">
        <h2>Noticias</h2>
        {loading && <p>Cargando noticias...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && noticias.length === 0 && (
          <p>No hay noticias disponibles en este momento.</p>
        )}
        <ul>
          {noticias.map(noticia => (
            <li key={noticia._id}>
              <h3>{noticia.titulo}</h3>
              <p>{noticia.contenido}</p>
              <small>{new Date(noticia.fecha).toLocaleDateString()}</small>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}