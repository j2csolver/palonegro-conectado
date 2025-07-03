import React from 'react';
import unadLogo from '../assets/Logo_de_la_UNAD.svg'; // Asegúrate de tener el logo en esta ruta
import catedraLogo from '../assets/imagen_sissu.png'; // Asegúrate de tener el logo en esta ruta

export default function AcercaDe() {
  return (
    <main>
      <section aria-label="Acerca de Palonegro Conectado" style={{ maxWidth: 700, margin: '2rem auto', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2rem', marginBottom: '1.5rem' }}>
          <img
            src={unadLogo}
            alt="Logo UNAD"
            style={{ maxWidth: 180, height: 'auto' }}
          />
          <img
            src={catedraLogo}
            alt="Logo Cátedra"
            style={{ maxWidth: 120, height: 'auto' }}
          />
        </div>
        <h2>Acerca de</h2>
        <p>
          <strong>Palonegro Conectado</strong> es una plataforma desarrollada para la gestión y comunicación de la comunidad Palonegro.
        </p>
        <p style={{ margin: '1rem 0', fontStyle: 'italic', color: '#444' }}>
          Este trabajo fue elaborado como parte del requisito de grado Prestación del Servicio Social Unadista. Universidad Nacional Abierta y a Distancia (UNAD).
        </p>
        <h3>Créditos</h3>
        <ul>
          <li>Desarrollo y coordinación: <strong>Jhonny Castro Clavijo</strong></li>
          <li>Iconos y recursos: <a href="https://fonts.google.com/icons" target="_blank" rel="noopener noreferrer">Google Fonts Icons</a>, <a href="https://react-icons.github.io/react-icons/" target="_blank" rel="noopener noreferrer">React Icons</a></li>
        </ul>
        <h3>Agradecimientos</h3>
        <ul>
          <li>A la comunidad de Palonegro por su apoyo y participación. En especial a la <strong>familia Ramirez Buitrago</strong> por todo su apoyo</li>
          <li>A mi tutora <strong>Viviana Cardona Franco</strong> por toda su orientación y acompañamiento.</li>
          <li>A los desarrolladores de software libre y las bibliotecas utilizadas en este proyecto.</li>
        </ul>
        <p style={{ marginTop: 24, fontSize: '0.95rem', color: '#555' }}>
          &copy; {new Date().getFullYear()} Palonegro Conectado. Todos los derechos reservados.
        </p>
      </section>
    </main>
  );
}