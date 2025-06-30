import React from 'react';
import Navbar from '../components/Navbar';
import DashboardCards from '../components/DashboardCards';

export default function ResidenteDashboard() {
  return (
    <>
      <section>
        <h2 style={{ textAlign: 'center', marginTop: '2rem' }}>Panel del Residente</h2>
        <p style={{ textAlign: 'center' }}>Resumen financiero, acceso a encuestas, sugerencias y denuncias.</p>
        <DashboardCards rol="Residente" />
      </section>
    </>
  );
}
