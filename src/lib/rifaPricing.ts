import { RifaPricingCalculation } from '../types/rifa';

export const PRICE_UNIT = 5000;
export const PRICE_PROMO_3 = 12000;

/**
 * Calculates the best total price for a given number of tickets:
 * - 1 ticket: $5.000
 * - 2 tickets: $10.000
 * - 3 tickets (promo pack): $12.000 (Ahorro $3.000)
 * - 4 tickets: $17.000
 * - 6 tickets: $24.000 (Ahorro $6.000)
 */
export function calculateRifaPrice(count: number): RifaPricingCalculation {
  if (count <= 0) {
    return {
      count: 0,
      promoPacks: 0,
      individualCount: 0,
      total: 0,
      regularTotal: 0,
      discount: 0,
    };
  }

  const promoPacks = Math.floor(count / 3);
  const individualCount = count % 3;

  const total = promoPacks * PRICE_PROMO_3 + individualCount * PRICE_UNIT;
  const regularTotal = count * PRICE_UNIT;
  const discount = regularTotal - total;

  let savingsMessage = '';
  if (discount > 0) {
    savingsMessage = `¡Ahorrás $${formatNumber(discount)} con la promo 3x$${formatNumber(PRICE_PROMO_3)}!`;
  } else if (individualCount === 2) {
    savingsMessage = `¡Sumá 1 número más por solo $${formatNumber(PRICE_PROMO_3 - 2 * PRICE_UNIT)} adicionales!`;
  }

  return {
    count,
    promoPacks,
    individualCount,
    total,
    regularTotal,
    discount,
    savingsMessage,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('es-AR').format(num);
}
