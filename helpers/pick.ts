import { simplifyItem } from '@/server/dynamodb';
import { WatchlistPick } from '@/types';
import { AttributeValue } from '@aws-sdk/client-dynamodb/dist-types/models/models_0';

export const itemsToWatchlistPick = (
  items: Record<string, AttributeValue>[],
): WatchlistPick[] => {
  return items.map((item) => {
    const { PK, SK, ttl, votingExpiry, ...restPick } = simplifyItem(item);

    return {
      name: SK.replace('PICK#', ''),
      expiresAt: ttl * 1000,
      votingExpiresAt: votingExpiry * 1000,
      watchlistId: PK.replace('LIST#', ''),
      ...restPick,
    } as WatchlistPick;
  });
};
