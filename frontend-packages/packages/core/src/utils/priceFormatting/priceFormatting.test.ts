import '@testing-library/jest-dom';
import { krToDecimalString, oereToDecimalString } from './priceFormatting';

describe('oereToDecimalString', () => {
  it.each([
    [0, '0,00'],
    [5, '0,05'],
    [50, '0,50'],
    [500, '5,00'],
    [995, '9,95'],
    [5000, '50,00']
  ])('should when %d given show %s', (price, formattedPrice) => {
    const result = oereToDecimalString(price);
    expect(result).toEqual(formattedPrice);
  });
});

describe('krToDecimalString', () => {
  it.each([
    [0, '0,00'],
    [0.05, '0,05'],
    [0.5, '0,50'],
    [5, '5,00'],
    [50, '50,00'],
    [500, '500,00'],
    [5000, '5.000,00'],
    [9.95, '9,95']
  ])('should when %d given show %s', (price, formattedPrice) => {
    const result = krToDecimalString(price);
    expect(result).toEqual(formattedPrice);
  });
});
