/**
 * @public
 */
export function selectedDateInStock(
  selectedDate: string,
  nextInStockDate?: Date
): boolean {
  if (nextInStockDate)
    return (
      nextInStockDate.setHours(0, 0, 0, 0) <= new Date(selectedDate).setHours(0, 0, 0, 0)
    );

  return false;
}
