import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [token, setTokenState] = useState(null);

  // Cargar usuario y token desde localStorage al iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser) setUserState(JSON.parse(storedUser));
    if (storedToken) setTokenState(storedToken);
  }, []);

  // Guardar usuario y token en localStorage cuando cambien
  const setUser = (userData, tokenData) => {
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
      setUserState(userData);
    } else {
      localStorage.removeItem('user');
      setUserState(null);
    }
    if (tokenData) {
      localStorage.setItem('token', tokenData);
      setTokenState(tokenData);
    } else if (tokenData === null) {
      localStorage.removeItem('token');
      setTokenState(null);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUserState(null);
    setTokenState(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}