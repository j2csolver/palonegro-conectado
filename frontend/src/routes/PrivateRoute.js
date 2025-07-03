import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children, roles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user?.debeCambiarPassword) {
    return <Navigate to="/cambiar-password" replace />;
  }

  if (roles && !roles.includes(user.rol)) {
    return <Navigate to="/inicio" replace />;
  }

  return children;
}