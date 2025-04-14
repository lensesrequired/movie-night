export const itemToWatchlist = (item: Record<string, any>) => {
  const { PK, SK, managedBy, ...restWatchlist } = item;

  return {
    id: SK.replace('LIST#', ''),
    manager: managedBy.replace('LIST#', ''),
    ...restWatchlist,
  };
};
