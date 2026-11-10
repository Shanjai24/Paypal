import express from 'express';
import { createOrder, authorizeOrder, capture, voidAuth } from './paypal.js';

const mode = process.argv[2] || 'capture'; // or "void"
const app = express();

const order = await createOrder('25.00', 'Test SSD 500GB');
const link = order.links.find((l) =>
  ['approve', 'payer-action'].includes(l.rel)
).href;
console.log('\nOpen this link and approve as the sandbox PERSONAL account:\n', link, '\n');

app.get('/return', async (req, res) => {
  try {
    const a = await authorizeOrder(req.query.token);
    const auth = a.purchase_units[0].payments.authorizations[0];
    console.log('Authorized:', auth.id, auth.status);
    const result = mode === 'void' ? await voidAuth(auth.id) : await capture(auth.id);
    console.log(mode === 'void' ? 'VOIDED' : 'CAPTURED', result);
    res.send('Done. Check your terminal.');
  } catch (e) {
    console.error(e.message);
    res.status(500).send('Error, check terminal');
  } finally {
    server.close();
  }
});

const server = app.listen(3000);

