import { DurationOption, MoviePoolOption, PickOption } from '@/constants';
import { PickExpiryOptions } from '@/types';
import React, { ReactNode, createContext, useContext, useState } from 'react';

type PickContextType = {
  pickName: string;
  setPickName: (name: string) => void;
  pickType: PickOption;
  setPickType: (type: PickOption) => void;
  moviePool: MoviePoolOption;
  setMoviePool: (pool: MoviePoolOption) => void;
  expiryOptions: PickExpiryOptions;
  setExpiryOptions: (expiryOptions: PickExpiryOptions) => void;
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
  const [expiryOptions, setExpiryOptions] = useState<PickExpiryOptions>({
    count: 1,
    type: DurationOption.WEEK,
  });

  return (
    <Context.Provider
      value={{
        pickName,
        setPickName,
        pickType,
        setPickType,
        moviePool,
        setMoviePool,
        expiryOptions,
        setExpiryOptions,
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
