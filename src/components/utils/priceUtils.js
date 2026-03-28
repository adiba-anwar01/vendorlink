/**
 * Formats a numeric price as Indian Rupees (INR).
 * e.g. formatPrice(1499)  → "₹1,499"
 *      formatPrice(25000) → "₹25,000"
 */
export const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
