import React from 'react';
import Navbar from '../components/Navbar';
import DashboardCards from '../components/DashboardCards';

export default function AdminDashboard() {
  return (
    <>
      <Navbar />
      <section>
        <h2 style={{ textAlign: 'center', marginTop: '2rem' }}>Panel de Administrador</h2>
        <p style={{ textAlign: 'center' }}>Gestión de noticias, eventos, normas, denuncias y encuestas.</p>
        <DashboardCards rol="Administrador" />
      </section>
    </>
  );
}
