import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './DashboardCards.module.css';

const allSections = [
  { title: 'Noticias', path: '/noticias', color: '#6a89cc', icon: '📰', roles: ['Administrador', 'Tesorero', 'Residente', 'Publico'] },
  { title: 'Eventos', path: '/eventos', color: '#38ada9', icon: '📅', roles: ['Administrador', 'Tesorero', 'Residente', 'Publico'] },
  { title: 'Reglas', path: '/reglas', color: '#e17055', icon: '📜', roles: ['Administrador', 'Residente'] },
  { title: 'Quejas', path: '/quejas', color: '#b53471', icon: '⚠️', roles: ['Administrador', 'Residente'] },
  { title: 'Tesorería', path: '/tesoreria', color: '#f6b93b', icon: '💰', roles: ['Tesorero'] },
  { title: 'Historial', path: '/historial', color: '#60a3bc', icon: '📊', roles: ['Tesorero'] },
  { title: 'Resumen Financiero', path: '/resumen', color: '#78e08f', icon: '📈', roles: ['Tesorero', 'Residente'] },
  { title: 'Blog', path: '/blog', color: '#e66767', icon: '✍️', roles: ['Administrador', 'Tesorero', 'Residente', 'Publico'] },
  // Puedes agregar más secciones y roles aquí
];

export default function DashboardCards({ rol }) {
  const navigate = useNavigate();

  // Si no hay rol, se asume "Publico"
  const userRol = rol || 'Publico';

  return (
    <div className={styles.grid}>
      {allSections
        .filter(sec => sec.roles.includes(userRol))
        .map(sec => (
          <div
            key={sec.path}
            className={styles.card}
            style={{ background: sec.color }}
            onClick={() => navigate(sec.path)}
          >
            <span className={styles.icon}>{sec.icon}</span>
            <span className={styles.title}>{sec.title}</span>
          </div>
        ))}
    </div>
  );
}