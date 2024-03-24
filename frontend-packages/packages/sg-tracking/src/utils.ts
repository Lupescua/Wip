/**
 * @internal
 */
export function deductVAT(priceIncVat: number): number {
  const VATPercentage = 1.25;
  const priceExVat = priceIncVat / VATPercentage;

  return Math.round(priceExVat * 100) / 100;
}
