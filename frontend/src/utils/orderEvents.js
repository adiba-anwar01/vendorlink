export const PRODUCT_ORDERED_EVENT = 'productOrdered';

export function dispatchProductOrdered(productId) {
  const event = new CustomEvent(PRODUCT_ORDERED_EVENT, { detail: { productId } });
  window.dispatchEvent(event);
}
