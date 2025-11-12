import React, { createContext } from 'react';
import theme, { gradients } from './theme';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const value = {
    theme,
    gradients,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
