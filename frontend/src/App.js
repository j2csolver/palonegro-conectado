import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Noticias from './sections/Noticias';
import Eventos from './sections/Eventos';
import Reglas from './sections/Reglas';
import Quejas from './sections/Quejas';
import Tesoreria from './sections/Tesoreria';
import ResumenFinanciero from './sections/ResumenFinanciero';
import Usuarios from './sections/Usuarios';
import Encuestas from './sections/Encuestas';
import Inicio from './sections/Inicio';
import Login from './sections/Login';
import CambiarPassword from './sections/CambiarPassword';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import AdminDashboard from './dashboards/AdminDashboard';
import TesoreroDashboard from './dashboards/TesoreroDashboard';
import ResidenteDashboard from './dashboards/ResidenteDashboard';
import PrivateRoute from './routes/PrivateRoute';
import AcercaDe from './sections/AcercaDe';

function AppContent() {
  const { user } = useAuth();

  return (
    <Router>
      <Navbar />
      <main>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/noticias" element={<Noticias />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/reglas" element={<Reglas />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cambiar-password" element={<CambiarPassword />} />
          <Route path="/acerca-de" element={<AcercaDe />} />

          {/* Rutas privadas por rol */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute roles={['Administrador', 'Tesorero', 'Residente']}>
                {user?.rol === 'Administrador' && <AdminDashboard />}
                {user?.rol === 'Tesorero' && <TesoreroDashboard />}
                {user?.rol === 'Residente' && <ResidenteDashboard />}
              </PrivateRoute>
            }
          />
          <Route
            path="/quejas"
            element={
              <PrivateRoute roles={['Administrador', 'Residente']}>
                <Quejas />
              </PrivateRoute>
            }
          />
          <Route
            path="/usuarios"
            element={
              <PrivateRoute roles={['Administrador']}>
                <Usuarios />
              </PrivateRoute>
            }
          />
          <Route
            path="/tesoreria"
            element={
              <PrivateRoute roles={['Tesorero']}>
                <Tesoreria />
              </PrivateRoute>
            }
          />
          <Route
            path="/resumen"
            element={
              <PrivateRoute roles={['Tesorero', 'Residente']}>
                <ResumenFinanciero />
              </PrivateRoute>
            }
          />
          <Route
            path="/encuestas"
            element={
              <PrivateRoute roles={['Residente', 'Administrador']}>
                <Encuestas />
              </PrivateRoute>
            }
          />

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/inicio" />} />
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