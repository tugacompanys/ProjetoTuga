import React, { createContext, useState, useContext } from "react";

// Criar o contexto
const FavoritosContext = createContext();

// Criar o provider
export const FavoritosProvider = ({ children }) => {
  const [favoritos, setFavoritos] = useState([]);

  // Adiciona ou remove um alimento dos favoritos
  const toggleFavorito = (alimento) => {
    setFavoritos((prevFavoritos) => {
      const jaExiste = prevFavoritos.some((item) => item.id === alimento.id);
      if (jaExiste) {
        // se já está, remove
        return prevFavoritos.filter((item) => item.id !== alimento.id);
      } else {
        // se não está, adiciona
        return [...prevFavoritos, alimento];
      }
    });
  };

  return (
    <FavoritosContext.Provider value={{ favoritos, toggleFavorito }}>
      {children}
    </FavoritosContext.Provider>
  );
};

// Hook para usar o contexto facilmente
export const useFavoritos = () => useContext(FavoritosContext);
