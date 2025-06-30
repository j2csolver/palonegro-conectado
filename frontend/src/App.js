import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Noticias from './sections/Noticias';
import Eventos from './sections/Eventos';
import Reglas from './sections/Reglas';
import Quejas from './sections/Quejas';
import Tesoreria from './sections/Tesoreria';
import Historial from './sections/Historial';
import ResumenFinanciero from './sections/ResumenFinanciero';
import Inicio from './sections/Inicio';
import Login from './sections/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import AdminDashboard from './dashboards/AdminDashboard';
import TesoreroDashboard from './dashboards/TesoreroDashboard';
import ResidenteDashboard from './dashboards/ResidenteDashboard';

function AppContent() {
  const { user } = useAuth();

  return (
    <Router>
      {/* Navbar solo en rutas públicas */}
      {!user && <Navbar />}
      <main>
        <Routes>
          {!user && (
            <>
              {/* Rutas públicas */}
              <Route path="/inicio" element={<Inicio />} />
              <Route path="/noticias" element={<Noticias />} />
              <Route path="/reglas" element={<Reglas />} />
              <Route path="/quejas" element={<Quejas />} />
              <Route path="/login" element={<Login />} />
              {/* Redirige todo lo demás a /inicio */}
              <Route path="*" element={<Navigate to="/inicio" />} />
            </>
          )}

          {user?.rol === 'Administrador' && (
            <Route path="/dashboard" element={<AdminDashboard />} />
          )}
          {user?.rol === 'Tesorero' && (
            <Route path="/dashboard" element={<TesoreroDashboard />} />
          )}
          {user?.rol === 'Residente' && (
            <Route path="/dashboard" element={<ResidenteDashboard />} />
          )}
          {/* Si hay usuario, redirige todo lo demás a su dashboard */}
          {user && (
            <Route path="*" element={<Navigate to="/dashboard" />} />
          )}
        </Routes>
      </main>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;