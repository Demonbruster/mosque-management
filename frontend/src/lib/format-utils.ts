// ============================================
// Shared Formatting Utilities
// ============================================
// Common formatting functions used across the app.
// Avoids duplication of formatINR / formatDate etc.
// ============================================

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'د.إ',
  SAR: 'ر.س',
  CAD: 'C$',
  AUD: 'A$',
  JPY: '¥',
};

/**
 * Format a number as a currency string based on the provided currency code.
 * Supports short formatting (K, L, Cr for INR; K, M, B for others).
 */
export function formatCurrency(value: number, currencyCode: string = 'INR'): string {
  const symbol = CURRENCY_SYMBOLS[currencyCode] || currencyCode;

  if (currencyCode === 'INR') {
    if (value >= 10000000) return `${symbol}${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `${symbol}${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `${symbol}${(value / 1000).toFixed(1)}K`;
    return `${symbol}${value.toLocaleString('en-IN')}`;
  }

  // Western formatting (K, M, B)
  if (value >= 1000000000) return `${symbol}${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `${symbol}${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${symbol}${(value / 1000).toFixed(1)}K`;

  return `${symbol}${value.toLocaleString(currencyCode === 'USD' ? 'en-US' : undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Get the symbol for a currency code.
 */
export function getCurrencySymbol(currencyCode: string = 'INR'): string {
  return CURRENCY_SYMBOLS[currencyCode] || currencyCode;
}

/**
 * Backward compatibility for formatINR
 * @deprecated Use formatCurrency instead
 */
export function formatINR(value: number): string {
  return formatCurrency(value, 'INR');
}

/**
 * Format a date string to a short display format.
 * Example: "2026-04-01" → "Apr 2026"
 */
export function formatDateShort(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format a date string to a medium display format.
 * Example: "2026-04-01" → "01 Apr 2026"
 */
export function formatDateMedium(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
