import React from 'react';
import DashboardCards from '../components/DashboardCards';

export default function ResidenteDashboard() {
  return (
    <section>
      <h2 style={{ textAlign: 'center', marginTop: '2rem' }}>Panel del Residente</h2>
      <p style={{ textAlign: 'center' }}>Resumen financiero, acceso al blog, sugerencias, denuncias y encuestas.</p>
      <DashboardCards rol="Residente" />
      {/* Aquí puedes agregar accesos directos y widgets para el residente */}
    </section>
  );
}
