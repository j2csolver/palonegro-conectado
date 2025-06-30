import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './DashboardCards.module.css';

const allSections = [
  {
    title: 'Noticias',
    path: '/noticias',
    color: '#007bff',
    icon: '📰',
    desc: 'Información relevante y actualizada de la comunidad.',
    roles: ['Publico', 'Administrador', 'Tesorero', 'Residente']
  },
  {
    title: 'Eventos',
    path: '/eventos',
    color: '#007bff',
    icon: '📅',
    desc: 'Calendario y detalles de actividades y reuniones.',
    roles: ['Publico', 'Administrador', 'Tesorero', 'Residente']
  },
  {
    title: 'Reglas',
    path: '/reglas',
    color: '#007bff',
    icon: '📜',
    desc: 'Normas de convivencia y participación comunitaria.',
    roles: ['Publico', 'Administrador', 'Residente']
  },
  {
    title: 'Quejas',
    path: '/quejas',
    color: '#007bff',
    icon: '⚠️',
    desc: 'Canal para reportar inquietudes y sugerencias.',
    roles: ['Administrador', 'Residente']
  },
  {
    title: 'Encuestas',
    path: '/encuestas',
    color: '#007bff',
    icon: '🗳️',
    desc: 'Participa en encuestas y votaciones comunitarias.',
    roles: ['Residente', 'Administrador']
  },
  {
    title: 'Tesorería',
    path: '/tesoreria',
    color: '#28a745',
    icon: '💰',
    desc: 'Gestión y registro de ingresos y egresos.',
    roles: ['Tesorero']
  },
  {
    title: 'Historial',
    path: '/historial',
    color: '#28a745',
    icon: '📊',
    desc: 'Historial detallado de movimientos financieros.',
    roles: ['Tesorero']
  },
  {
    title: 'Resumen Financiero',
    path: '/resumen',
    color: '#28a745',
    icon: '📈',
    desc: 'Resumen de ingresos y gastos por categorías.',
    roles: ['Tesorero', 'Residente']
  },
];

export default function DashboardCards({ rol = 'Publico' }) {
  const navigate = useNavigate();

  return (
    <section aria-label="Panel de accesos rápidos">
      <div className={styles.grid} role="list">
        {allSections
          .filter(sec => sec.roles.includes(rol))
          .map(sec => (
            <button
              key={sec.path}
              className={styles.card}
              onClick={() => navigate(sec.path)}
              role="listitem"
              aria-label={sec.title + '. ' + sec.desc}
              tabIndex={0}
            >
              <span
                className={styles.iconBox}
                aria-hidden="true"
              >
                <span className={styles.icon}>{sec.icon}</span>
              </span>
              <span className={styles.title}>{sec.title}</span>
              <span className={styles.desc}>{sec.desc}</span>
            </button>
          ))}
      </div>
    </section>
  );
}