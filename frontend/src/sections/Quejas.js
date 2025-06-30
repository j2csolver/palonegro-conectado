import React, { useEffect, useState } from 'react';

export default function Quejas() {
  const [quejas, setQuejas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:4000/api/quejas')
      .then(res => {
        if (!res.ok) throw new Error('No se pudieron cargar las quejas');
        return res.json();
      })
      .then(data => setQuejas(data))
      .catch(() => setError('No se pudieron cargar las quejas'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <section aria-label="Quejas y sugerencias">
        <h2>Quejas y Sugerencias</h2>
        {loading && <p>Cargando quejas...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && quejas.length === 0 && (
          <p>No hay quejas registradas en este momento.</p>
        )}
        <ul>
          {quejas.map(queja => (
            <li key={queja._id}>
              <h3>{queja.titulo}</h3>
              <p>{queja.descripcion}</p>
              <small>Enviada por: {queja.usuario?.email || 'Anónimo'}</small>
              <br />
              <small>{new Date(queja.fecha).toLocaleDateString()}</small>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}