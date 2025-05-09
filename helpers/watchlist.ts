import { simplifyItem } from '@/server/dynamodb';
import { AttributeValue } from '@aws-sdk/client-dynamodb/dist-types/models/models_0';

export const itemToWatchlist = (item: Record<string, any>) => {
  const { PK, SK, managedBy, ...restWatchlist } = item;

  return {
    id: SK.replace('LIST#', ''),
    manager: managedBy.replace('USER#', ''),
    ...restWatchlist,
  };
};

export const itemsToWatchlistMovies = (
  items: Record<string, AttributeValue>[],
) => {
  return items.map((item) => {
    const { PK, SK, addedBy, ...restMovie } = simplifyItem(item);

    return {
      tmdbId: PK.replace('MOVIE#', ''),
      addedBy: addedBy.replace('USER#', ''),
      ...restMovie,
    };
  });
};
