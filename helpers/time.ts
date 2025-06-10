export const timeBetweenDates = (start: Date, end: Date): string => {
  const msInHour = 1000 * 60 * 60;
  const msInDay = msInHour * 24;

  const diffMs = end.getTime() - start.getTime();

  if (diffMs < 0) {
    return '';
  }

  if (diffMs < msInHour) {
    return 'less than one hour';
  } else if (diffMs < msInDay) {
    const hours = diffMs / msInHour;
    return `${Math.floor(hours)} hour(s)`;
  } else {
    const days = diffMs / msInDay;
    return `${Math.floor(days)} day(s)`;
  }
};
