import React from 'react';
import Navbar from '../components/Navbar';
import DashboardCards from '../components/DashboardCards';

export default function TesoreroDashboard() {
  return (
    <>
      <section>
        <h2 style={{ textAlign: 'center', marginTop: '2rem' }}>Panel de Tesorería</h2>
        <p style={{ textAlign: 'center' }}>Registro y visualización de ingresos, egresos y reportes financieros.</p>
        <DashboardCards rol="Tesorero" />
      </section>
    </>
  );
}
