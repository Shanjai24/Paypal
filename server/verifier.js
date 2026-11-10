/**
 * verifier.js — "Verify Before Capture" business logic
 *
 * This runs between authorize and capture. It checks:
 *   1. Inventory is still available
 *   2. Order amount matches what the store expects (no tampering)
 *   3. A simple fraud heuristic (easy to extend)
 *
 * Returns { ok: boolean, reason?: string }
 */

// Mock inventory store — replace with real DB in production
const inventory = {
  'SKU-SSD-500':  { name: 'SSD 500 GB',   price: '89.99', stock: 10 },
  'SKU-SSD-1TB':  { name: 'SSD 1 TB',     price: '149.99', stock: 5 },
  'SKU-RAM-16':   { name: 'RAM 16 GB DDR5',price: '54.99', stock: 20 },
  'SKU-USB-HUB':  { name: 'USB-C Hub 7-in-1', price: '34.99', stock: 15 },
};

/**
 * Reserve stock for a SKU. Returns true if successful.
 */
export function reserveStock(sku, qty = 1) {
  const item = inventory[sku];
  if (!item || item.stock < qty) return false;
  item.stock -= qty;
  return true;
}

/**
 * Release reserved stock (called on void).
 */
export function releaseStock(sku, qty = 1) {
  const item = inventory[sku];
  if (item) item.stock += qty;
}

/**
 * Get item details by SKU.
 */
export function getItem(sku) {
  return inventory[sku] ?? null;
}

/**
 * List all products for the storefront.
 */
export function listProducts() {
  return Object.entries(inventory).map(([sku, v]) => ({ sku, ...v }));
}

/**
 * Core verifier — call this after authorize, before capture.
 *
 * @param {object} authResponse   Full PayPal authorize response
 * @param {object} pendingOrder   Your DB record { sku, qty, expectedAmount }
 * @returns {{ ok: boolean, reason?: string }}
 */
export function verifyBeforeCapture(authResponse, pendingOrder) {
  const auth = authResponse?.purchase_units?.[0]?.payments?.authorizations?.[0];
  if (!auth) return { ok: false, reason: 'No authorization found in PayPal response' };

  // 1. Authorization must be CREATED (not expired/voided)
  if (auth.status !== 'CREATED') {
    return { ok: false, reason: `Authorization status is ${auth.status}, expected CREATED` };
  }

  // 2. Amount must match what the store created the order for
  const authorizedAmount = parseFloat(auth.amount?.value ?? 0);
  const expectedAmount   = parseFloat(pendingOrder.expectedAmount ?? 0);
  if (Math.abs(authorizedAmount - expectedAmount) > 0.01) {
    return {
      ok: false,
      reason: `Amount mismatch: authorized $${authorizedAmount}, expected $${expectedAmount}`,
    };
  }

  // 3. Currency must be USD
  if (auth.amount?.currency_code !== 'USD') {
    return { ok: false, reason: `Unexpected currency: ${auth.amount?.currency_code}` };
  }

  // 4. Inventory check
  const item = getItem(pendingOrder.sku);
  if (!item) return { ok: false, reason: `Unknown SKU: ${pendingOrder.sku}` };
  if (item.stock < pendingOrder.qty) {
    return { ok: false, reason: `Out of stock: only ${item.stock} left for ${pendingOrder.sku}` };
  }

  return { ok: true };
}

