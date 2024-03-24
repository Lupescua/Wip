/**
 * @public
 * Generates an array of dates ranging from a start date and an end date.
 * @param steps - optionally limit the range to only include every \<step\> day. eg. every 7th day to get weeks.
 * @returns the date in a short format such as "14/06/2021"
 */
export function getDateRange(startDate: Date, endDate: Date, steps: number = 1): Date[] {
  const dateArray = [];
  const currentDate = new Date(startDate);

  while (currentDate <= new Date(endDate)) {
    dateArray.push(new Date(currentDate));
    // Use UTC date to prevent problems with time zones and DST
    currentDate.setUTCDate(currentDate.getUTCDate() + steps);
  }

  return dateArray;
}

/**
 * @public
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * @public
 * @param date - either a Date or a number or string that can be converted to a Date
 * @returns the date in a short format such as "14/06/2021"
 */
export function getAsShortDate(date: Date | number | string): string {
  const dateToFormat =
    typeof date === 'number' || typeof date === 'string' ? new Date(date) : date;

  return dateToFormat.toLocaleDateString();
}

/**
 * @public
 */
export function getNextDaysDate(): {
  today: Date;
  tomorrow: Date;
  dayAfterTomorrow: Date;
} {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

  return { today, tomorrow, dayAfterTomorrow };
}

/**
 * @public
 */
export function getDateTxt(date: Date): string {
  const dateLowercase = date.toLocaleDateString('da-dk', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  const dateCapFirstLetter = dateLowercase
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.substring(1))
    .join(' ');
  return dateCapFirstLetter;
}

/**
 * @public
 */
export function dateDigitsToStringFormat(date: number): Date {
  // Date - TODO when stock service is ready - clean up
  return new Date(date.toString().replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
}
