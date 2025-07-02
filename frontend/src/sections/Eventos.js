import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styles from './Eventos.module.css';

export default function Eventos() {
  const [eventos, setEventos] = useState([]);
  const [value, setValue] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:4000/api/eventos')
      .then(res => {
        if (!res.ok) throw new Error('No se pudieron cargar los eventos');
        return res.json();
      })
      .then(data => setEventos(data))
      .catch(() => setError('No se pudieron cargar los eventos'))
      .finally(() => setLoading(false));
  }, []);

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const hayEvento = eventos.some(ev =>
        new Date(ev.fechaInicio).toDateString() === date.toDateString()
      );
      return hayEvento ? <span style={{ color: 'red' }}>●</span> : null;
    }
  };

  const eventosDelDia = eventos.filter(ev =>
    new Date(ev.fechaInicio).toDateString() === value.toDateString()
  );

  return (
    <main>
      <section aria-label="Calendario de eventos comunitarios">
        <h2>Eventos</h2>
        {loading && <p>Cargando eventos...</p>}
        {error && (
          <div style={{ color: 'red' }} role="alert" aria-live="assertive">
            {error}
          </div>
        )}
        {!loading && !error && (
          <div className={styles.eventosGrid}>
            <div className={styles.calendarioBox}>
              <Calendar
                onChange={setValue}
                value={value}
                tileContent={tileContent}
              />
            </div>
            <div className={styles.listaEventosBox}>
              <h3 className={styles.eventosDiaTitulo}>
                Eventos del {value.toLocaleDateString()}
              </h3>
              <ul className={styles.listaEventos}>
                {eventosDelDia.length === 0 && <li>No hay eventos este día.</li>}
                {eventosDelDia.map(ev => (
                  <li key={ev.id} className={styles.eventoItem}>
                    <strong>{ev.titulo}</strong><br />
                    {ev.descripcion}<br />
                    {new Date(ev.fechaInicio).toLocaleTimeString()} - {new Date(ev.fechaFin).toLocaleTimeString()}
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