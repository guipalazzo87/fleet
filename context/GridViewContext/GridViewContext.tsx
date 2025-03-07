import React, { createContext, ReactNode, useContext, useState } from 'react';

interface GridViewContextProps {
  isGridView: boolean;
  setIsGridView: React.Dispatch<React.SetStateAction<boolean>>;
}

interface GridViewProviderProps {
  children: ReactNode;
}

const GridViewContext = createContext<GridViewContextProps | undefined>(undefined);

export const useGridView = () => {
  const context = useContext(GridViewContext);
  if (!context) {
    throw new Error('useGridView must be used within a GridViewProvider');
  }
  return context;
};

export const GridViewProvider: React.FC<GridViewProviderProps> = ({ children }) => {
  const [isGridView, setIsGridView] = useState(false);
  return <GridViewContext.Provider value={{ isGridView, setIsGridView }}>{children}</GridViewContext.Provider>;
};
