import { DurationOption, MoviePoolOption, PickOption } from '@/constants';
import { PickExpiryOptions, WatchlistMovie, WatchlistPick } from '@/types';
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
  existingPick?: WatchlistPick;
  pickedMovie?: WatchlistMovie;
};

const Context = createContext<PickContextType | undefined>(undefined);

export const PickProvider = ({
  children,
  defaultPickType,
  existingPick,
  pickedMovie,
}: {
  children: ReactNode;
  defaultPickType?: PickOption;
  existingPick?: WatchlistPick;
  pickedMovie?: WatchlistMovie;
}) => {
  const [pickName, setPickName] = useState<string>(existingPick?.name || '');
  const [pickType, setPickType] = useState<PickOption>(
    existingPick?.pickType || defaultPickType || PickOption.RANDOM_SELECTION,
  );
  const [moviePool, setMoviePool] = useState<MoviePoolOption>(
    existingPick?.moviePool || MoviePoolOption.ALL_MOVIES,
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
        existingPick,
        pickedMovie,
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
