import React from 'react';
import DashboardCards from '../components/DashboardCards';
import { useAuth } from '../context/AuthContext';

export default function Blog() {
  const { user } = useAuth();

  return (
    <section>
      <h2 style={{ textAlign: 'center', marginTop: '2rem' }}>Bienvenido a la Comunidad Palonegro</h2>
      <DashboardCards rol={user?.rol} />
    </section>
  );
}