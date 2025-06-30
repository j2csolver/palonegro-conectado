import React, { useEffect, useState } from 'react';

export default function Reglas() {
  const [reglas, setReglas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:4000/api/reglas')
      .then(res => {
        if (!res.ok) throw new Error('No se pudieron cargar las reglas');
        return res.json();
      })
      .then(data => setReglas(data))
      .catch(() => setError('No se pudieron cargar las reglas'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <section aria-label="Reglas de convivencia">
        <h2>Reglas de Convivencia</h2>
        {loading && <p>Cargando reglas...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && reglas.length === 0 && (
          <p>No hay reglas disponibles en este momento.</p>
        )}
        <ul>
          {reglas.map(regla => (
            <li key={regla._id}>
              <h3>{regla.titulo}</h3>
              <p>{regla.descripcion}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}