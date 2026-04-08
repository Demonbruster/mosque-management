// ============================================
// Shared Formatting Utilities
// ============================================
// Common formatting functions used across the app.
// Avoids duplication of formatINR / formatDate etc.
// ============================================

/**
 * Format a number as a compacted INR currency string.
 * Examples: 500 → ₹500, 15000 → ₹15.0K, 350000 → ₹3.5L, 12000000 → ₹1.2Cr
 */
export function formatINR(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value.toLocaleString('en-IN')}`;
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
