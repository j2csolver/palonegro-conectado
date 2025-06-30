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
    <div className={styles.grid}>
      {allSections
        .filter(sec => sec.roles.includes(rol))
        .map(sec => (
          <div
            key={sec.path}
            className={styles.card}
            onClick={() => navigate(sec.path)}
          >
            <span
              className={styles.iconBox}
              style={{ background: sec.color + '22', color: sec.color }}
            >
              <span className={styles.icon}>{sec.icon}</span>
            </span>
            <span className={styles.title}>{sec.title}</span>
            <span className={styles.desc}>{sec.desc}</span>
          </div>
        ))}
    </div>
  );
}