import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import { createOrder, authorizeOrder, capture, voidAuth } from './paypal.js';
import { getCatalog, pageText, renderStore } from './store.js';
import { chooseProduct, verify, THRESHOLDS } from './verifier.js';

const app = express();
app.use(express.json());

// CORS for Next.js frontend on port 3000
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

const FILE = 'runs.json';
let runs = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, 'utf8')) : [];
const save = () => fs.writeFileSync(FILE, JSON.stringify(runs, null, 2));
const log = (run, msg) => { run.events.push({ t: new Date().toISOString(), msg }); save(); };

// Mock store pages (HTML)
app.get('/store/:scenario', (req, res) => res.send(renderStore(req.params.scenario)));

// 1. Agent reads store, picks product, creates AUTHORIZE order
app.post('/api/run', async (req, res) => {
  try {
    const { text, maxPrice, scenario = 'clean' } = req.body;
    const mandate = { text, maxPrice: Number(maxPrice) };
    const catalog = getCatalog(scenario);
    const pages = catalog.map(pageText);
    const pick = await chooseProduct(mandate, pages);
    const product = catalog.find((p) => p.id === pick.productId) ?? catalog[0];
    const order = await createOrder(product.price.toFixed(2), product.name);
    const approveUrl = order.links.find((l) => ['approve', 'payer-action'].includes(l.rel)).href;
    const run = {
      id: order.id, scenario, mandate,
      product: { id: product.id, name: product.name, price: product.price, seller: product.seller },
      agentReasoning: pick.reasoning, pageContext: pages.join('\n'),
      status: 'AWAITING_BUYER_APPROVAL', events: [], createdAt: new Date().toISOString(),
    };
    runs.unshift(run);
    log(run, `Agent chose "${product.name}" at $${product.price}`);
    res.json({ approveUrl });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 2. PayPal redirect → authorize → verify → capture / review / void
app.get('/return', async (req, res) => {
  const run = runs.find((r) => r.id === req.query.token);
  if (!run) return res.redirect('http://localhost:3000/');
  try {
    const a = await authorizeOrder(run.id);
    const auth = a.purchase_units[0].payments.authorizations[0];
    run.authId = auth.id;
    run.authorizedAmount = Number(auth.amount.value);
    log(run, `Authorized $${auth.amount.value}: funds held, not charged`);

    run.verdict = await verify({
      mandate: run.mandate,
      order: { description: run.product.name, amount: run.authorizedAmount, seller: run.product.seller },
      pageContext: run.pageContext,
      agentReasoning: run.agentReasoning,
    });
    log(run, `Verifier: confidence ${run.verdict.confidence}, decision ${run.verdict.decision}`);

    if (run.verdict.decision === 'CAPTURE') {
      await capture(auth.id); run.status = 'CAPTURED'; log(run, 'Payment captured automatically');
    } else if (run.verdict.decision === 'REVIEW') {
      run.status = 'PENDING_HUMAN'; log(run, 'Waiting for human approval');
    } else {
      await voidAuth(auth.id); run.status = 'VOIDED'; log(run, 'Authorization voided: buyer never charged');
    }
  } catch (e) {
    run.status = 'ERROR'; log(run, 'Error: ' + e.message.slice(0, 200));
  }
  save();
  res.redirect('http://localhost:3000/');
});

app.get('/cancel', (req, res) => res.redirect('http://localhost:3000/'));

// 3. Human-in-the-loop decision for medium confidence
app.post('/api/runs/:id/decision', async (req, res) => {
  const run = runs.find((r) => r.id === req.params.id);
  if (!run || run.status !== 'PENDING_HUMAN') return res.status(400).json({ error: 'Not awaiting approval' });
  try {
    if (req.body.approve) { await capture(run.authId); run.status = 'CAPTURED_BY_HUMAN'; log(run, 'Human approved: captured'); }
    else { await voidAuth(run.authId); run.status = 'VOIDED_BY_HUMAN'; log(run, 'Human rejected: voided'); }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/runs', (req, res) => res.json({ thresholds: THRESHOLDS, runs: runs.map(({ pageContext, ...r }) => r) }));

app.listen(3001, () => console.log('API server: http://localhost:3001'));

