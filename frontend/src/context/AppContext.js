import React, { createContext, useReducer, useContext } from 'react';

const AppContext = createContext();

const initialState = {
  // Estado global inicial
};

function reducer(state, action) {
  switch (action.type) {
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}