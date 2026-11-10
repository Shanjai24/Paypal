# PayPal Authorize / Capture / Void — Sandbox Proof

> A minimal but production-pattern Node.js server that demonstrates the **Authorize → Capture** and **Authorize → Void** payment flows using the PayPal Orders v2 REST API.

---

## Table of Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Running the Tests](#running-the-tests)
- [Expected Output](#expected-output)
- [API Reference](#api-reference)
- [Security Notes](#security-notes)

---

## Overview

PayPal's **Authorize & Capture** pattern separates the _approval_ of a payment from the _collection_ of funds. This is critical for businesses that need to:

- Verify stock availability before charging a customer
- Hold funds during a review/approval process
- Release (void) a hold if the order cannot be fulfilled

This project implements that pattern end-to-end in the **PayPal Sandbox** environment.

---

## How It Works

```
Buyer clicks Pay
      │
      ▼
createOrder()  ──► PayPal returns approval URL
      │
      ▼
Buyer approves on sandbox.paypal.com
      │
      ▼
authorizeOrder()  ──► Funds are HELD (not charged)
      │
      ├──► capture()   ──► Funds COLLECTED  ✅
      │
      └──► voidAuth()  ──► Hold RELEASED     ❌ (order cancelled)
```

---

## Project Structure

```
verify-before-capture/
├── server/
│   ├── paypal.js      # PayPal REST API helpers (getToken, createOrder, authorize, capture, void)
│   ├── test.js        # Express server + test runner (capture or void mode)
│   ├── .env           # API credentials (never commit this)
│   ├── package.json
│   └── node_modules/
└── README.md
```

---

## Prerequisites

| Requirement | Version |
|---|---|
| Node.js | v18+ (v24 recommended) |
| PayPal Developer Account | [developer.paypal.com](https://developer.paypal.com) |
| PayPal Sandbox App | Created under Apps & Credentials |
| Sandbox Personal Account | Country: **United States** (required for USD) |

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/verify-before-capture.git
cd verify-before-capture/server
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file inside the `server/` directory:

```env
PAYPAL_CLIENT_ID=your_sandbox_client_id_here
PAYPAL_SECRET=your_sandbox_secret_here
```

> **Where to find these:**
> 1. Go to [developer.paypal.com → Apps & Credentials](https://developer.paypal.com/dashboard/applications/sandbox)
> 2. Click your app (or create one)
> 3. Copy the **Client ID** and **Secret**

> ⚠️ **Never commit your `.env` file.** Add it to `.gitignore`.

---

## Running the Tests

> The server listens on `http://localhost:3000`. Make sure port 3000 is free.

### Test 1 — Authorize → Capture

```bash
node test.js capture
```

### Test 2 — Authorize → Void

```bash
node test.js void
```

**For each test:**

1. The terminal prints a sandbox approval URL
2. Open the URL in an **Incognito / Private** browser window
3. Log in with your **sandbox Personal (buyer) account**
4. Click **"Complete Purchase"**
5. The browser redirects to `localhost:3000/return` and the terminal prints the result

---

## Expected Output

### Capture

```
Open this link and approve as the sandbox PERSONAL account:
 https://www.sandbox.paypal.com/checkoutnow?token=XXXXXXXXXXXX

Authorized: 8WE98555HV827643U CREATED
CAPTURED {
  id: '5UW137710S509920W',
  status: 'COMPLETED',
  links: [ ... ]
}
```

### Void

```
Open this link and approve as the sandbox PERSONAL account:
 https://www.sandbox.paypal.com/checkoutnow?token=XXXXXXXXXXXX

Authorized: 0JT56372AY913874V CREATED
VOIDED { status: 204 }
```

---

## API Reference

| Function | PayPal Endpoint | Description |
|---|---|---|
| `createOrder(value, description)` | `POST /v2/checkout/orders` | Creates a new order with `AUTHORIZE` intent |
| `authorizeOrder(orderId)` | `POST /v2/checkout/orders/:id/authorize` | Authorizes (holds) funds after buyer approval |
| `capture(authId)` | `POST /v2/payments/authorizations/:id/capture` | Captures (collects) the authorized funds |
| `voidAuth(authId)` | `POST /v2/payments/authorizations/:id/void` | Voids (releases) the authorization hold |

---

## Security Notes

- `.env` must be listed in `.gitignore` — **never push credentials to GitHub**
- This project uses the **Sandbox** environment only (`api-m.sandbox.paypal.com`)
- For production, replace the base URL with `api-m.paypal.com` and use Live credentials
- Each API call generates a unique `PayPal-Request-Id` via `crypto.randomUUID()` to ensure idempotency

---

## License

ISC

