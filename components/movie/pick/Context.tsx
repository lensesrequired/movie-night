import { MoviePoolOption, PickOption } from '@/constants';
import React, { ReactNode, createContext, useContext, useState } from 'react';

type PickContextType = {
  pickName: string;
  setPickName: (name: string) => void;
  pickType: PickOption;
  setPickType: (type: PickOption) => void;
  moviePool: MoviePoolOption;
  setMoviePool: (pool: MoviePoolOption) => void;
};

const Context = createContext<PickContextType | undefined>(undefined);

export const PickProvider = ({
  children,
  defaultPickType,
}: {
  children: ReactNode;
  defaultPickType: PickOption;
}) => {
  const [pickName, setPickName] = useState<string>('');
  const [pickType, setPickType] = useState<PickOption>(defaultPickType);
  const [moviePool, setMoviePool] = useState<MoviePoolOption>(
    MoviePoolOption.ALL_MOVIES,
  );

  return (
    <Context.Provider
      value={{
        pickName,
        setPickName,
        pickType,
        setPickType,
        moviePool,
        setMoviePool,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const usePickContext = (): PickContextType => {
  const context = useContext(Context);
  if (!context) {
    throw new Error('usePickContext must be used within a PickProvider');
  }
  return context;
};
