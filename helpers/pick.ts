import { simplifyItem } from '@/server/dynamodb';
import { WatchlistPick } from '@/types';
import { AttributeValue } from '@aws-sdk/client-dynamodb/dist-types/models/models_0';

export const itemsToWatchlistPick = (
  items: Record<string, AttributeValue>[],
): WatchlistPick[] => {
  return items.map((item) => {
    const { PK, SK, ttl, ...restPick } = simplifyItem(item);

    return {
      name: SK.replace('PICK#', ''),
      expiresAt: ttl,
      watchlistId: PK.replace('LIST#', ''),
      ...restPick,
    } as WatchlistPick;
  });
};
