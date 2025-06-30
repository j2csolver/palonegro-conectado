import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Inicio.module.css';
import DashboardCards from '../components/DashboardCards';

export default function Inicio() {
  const navigate = useNavigate();

  return (
    <section>
      <h2 style={{ textAlign: 'center', marginTop: '2rem' }}>Bienvenido a la Comunidad Palonegro</h2>
      <p style={{ textAlign: 'center', marginBottom: '2rem' }}>
        Transparencia, comunicación y participación para todos los residentes.
      </p>
      <DashboardCards />
    </section>
  );
}