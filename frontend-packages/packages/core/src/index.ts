export { IPagedCollection, ISearchAPI } from './ISearchAPI';
export { ISuggestionAPI, IIndex } from './ISuggestionAPI';

export { IAuthenticationService } from './IAuthenticationService';

export {
  oereToDecimalString,
  krToDecimalString
} from './utils/priceFormatting/priceFormatting';
export {
  getDateRange,
  getAsShortDate,
  isToday,
  getNextDaysDate,
  getDateTxt,
  dateDigitsToStringFormat
} from './utils/dateUtils/dateUtils';
export { selectedDateInStock } from './utils/productUtils/productUtils';

export { JestTypedDescribe } from './utilityTypes/JestTypedDescribe';
