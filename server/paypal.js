import 'dotenv/config';
const BASE = 'https://api-m.sandbox.paypal.com';

async function getToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
  ).toString('base64');
  const r = await fetch(`${BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const d = await r.json();
  if (!r.ok) throw new Error(JSON.stringify(d));
  return d.access_token;
}

async function api(path, body) {
  const token = await getToken();
  const r = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': crypto.randomUUID(),
    },
    body: JSON.stringify(body ?? {}),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`${r.status} ${text}`);
  return text ? JSON.parse(text) : { status: r.status };
}

export const createOrder = (value, description) =>
  api('/v2/checkout/orders', {
    intent: 'AUTHORIZE',
    purchase_units: [
      { description, amount: { currency_code: 'USD', value } },
    ],
    payment_source: {
      paypal: {
        experience_context: {
          return_url: 'http://localhost:3000/return',
          cancel_url: 'http://localhost:3000/cancel',
          user_action: 'PAY_NOW',
        },
      },
    },
  });

export const authorizeOrder = (orderId) =>
  api(`/v2/checkout/orders/${orderId}/authorize`);
export const capture = (authId) =>
  api(`/v2/payments/authorizations/${authId}/capture`);
export const voidAuth = (authId) =>
  api(`/v2/payments/authorizations/${authId}/void`);

