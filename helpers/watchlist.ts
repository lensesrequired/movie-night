export const itemToWatchlist = (item: Record<string, any>) => {
  console.log(item);
  const { PK, SK, ...restWatchlist } = item;

  return {
    id: SK.replace('SELF#', '').replace('SHARED#', ''),
    owned: SK.includes('SELF#'),
    ...restWatchlist,
  };
};
