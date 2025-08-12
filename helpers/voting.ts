export const getRankedChoiceWinner = (votes: string[][]): string => {
  const candidates = votes.reduce((c, voteList) => {
    voteList.forEach((v) => c.add(v));
    return c;
  }, new Set());
  const majority = votes.length / 2;
  let results: Record<string, number>;
  while (true) {
    results = votes.reduce(
      (r, voteList) => {
        for (let i = 0; i < votes[0].length; i++) {
          if (candidates.has(voteList[i])) {
            r[voteList[i]] = (r[voteList[i]] || 0) + 1;
            return r;
          }
        }
        return r;
      },
      {} as Record<string, number>,
    );

    const { min, max } = Object.entries(results).reduce(
      ({ min, max }, [movieId, count]) => {
        if (count < min.count) {
          min = { candidates: [movieId], count };
        } else if (count === min.count) {
          min = { candidates: [...min.candidates, movieId], count };
        }

        if (count > max.count) {
          max = { candidates: [movieId], count };
        } else if (count === max.count) {
          max = { candidates: [...max.candidates, movieId], count };
        }

        return { min, max };
      },
      {
        min: { candidates: [] as string[], count: Infinity },
        max: { candidates: [] as string[], count: -Infinity },
      },
    );

    if (max.count > majority) {
      return max.candidates[0];
    }

    if (min.candidates.length === candidates.size) {
      if (min.candidates.length > 2) {
        candidates.delete(
          min.candidates[Math.floor(Math.random() * min.candidates.length)],
        );
      } else {
        return min.candidates[Math.round(Math.random())];
      }
    } else {
      min.candidates.forEach((c) => {
        candidates.delete(c);
      });
    }
  }
};
