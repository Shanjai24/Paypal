'use client';

import React, { useEffect, useState } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Button,
  Chip,
  LinearProgress,
  Divider,
  Alert,
  AlertTitle,
  Paper,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Security,
  ShoppingCart,
  WarningAmber,
  CheckCircle,
  Cancel,
  HelpOutline,
  Storefront,
  OpenInNew,
  Refresh,
  BugReport,
  ThumbUp,
  ThumbDown,
} from '@mui/icons-material';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#0070ba' }, // PayPal Blue
    secondary: { main: '#00cf92' },
    background: { default: '#0a0f1d', paper: '#11192e' },
  },
  typography: {
    fontFamily: '"IBM Plex Sans", "Inter", system-ui, sans-serif',
  },
});

const POSITIVE_FLAGS = new Set([
  'verified_seller',
  'exact_spec_match',
  'within_budget',
  'price_ok',
  'spec_match',
  'trusted_seller',
  'clean_page',
]);

const RISK_FLAGS = new Set([
  'prompt_injection',
  'price_cap_exceeded',
  'budget_exceeded',
  'unknown_seller',
  'unverified_seller',
  'unrated_seller',
  'refurbished',
  'refurbished_item',
  'spec_mismatch',
  'capacity_mismatch',
  'verifier_error',
]);

function getFlagChipProps(flag: string) {
  const normalized = flag.toLowerCase().trim();
  if (POSITIVE_FLAGS.has(normalized)) {
    return { color: 'success' as const, variant: 'outlined' as const };
  }
  if (RISK_FLAGS.has(normalized)) {
    return { color: 'error' as const, variant: 'outlined' as const };
  }
  return {
    variant: 'outlined' as const,
    sx: { color: '#94a3b8', borderColor: '#475569' },
  };
}

interface Verdict {
  itemMatch: number;
  sellerTrust: number;
  priceOk: boolean;
  injectionDetected: boolean;
  confidence: number;
  reasons: string[];
  flags: string[];
  hardViolations: string[];
  decision: 'CAPTURE' | 'REVIEW' | 'VOID';
}

interface Run {
  id: string;
  scenario: string;
  mandate: { text: string; maxPrice: number };
  product: { id: string; name: string; price: number; seller: string };
  agentReasoning: string;
  authId?: string;
  authorizedAmount?: number;
  status:
    | 'AWAITING_BUYER_APPROVAL'
    | 'CAPTURED'
    | 'CAPTURED_BY_HUMAN'
    | 'VOIDED'
    | 'VOIDED_BY_HUMAN'
    | 'PENDING_HUMAN'
    | 'ERROR';
  verdict?: Verdict;
  createdAt: string;
}

export default function DashboardPage() {
  const [scenario, setScenario] = useState('clean');
  const [text, setText] = useState('500GB SSD');
  const [maxPrice, setMaxPrice] = useState('60');
  const [loading, setLoading] = useState(false);
  const [runs, setRuns] = useState<Run[]>([]);
  const [thresholds, setThresholds] = useState({ capture: 85, review: 50 });

  const fetchRuns = async () => {
    try {
      const res = await fetch('/api/runs');
      if (res.ok) {
        const data = await res.json();
        setRuns(data.runs || []);
        if (data.thresholds) setThresholds(data.thresholds);
      }
    } catch (e) {
      console.error('Fetch runs error', e);
    }
  };

  useEffect(() => {
    fetchRuns();
    const interval = setInterval(fetchRuns, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleRunAgent = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, maxPrice: Number(maxPrice), scenario }),
      });
      const data = await res.json();
      if (data.error) {
        alert('Failed to launch agent: ' + data.error);
        setLoading(false);
        return;
      }
      if (data.approveUrl) {
        window.location.href = data.approveUrl;
      }
    } catch (err: any) {
      alert('Error launching agent: ' + err.message);
      setLoading(false);
    }
  };

  const handleDecision = async (id: string, approve: boolean) => {
    try {
      await fetch(`/api/runs/${id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approve }),
      });
      fetchRuns();
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'CAPTURED':
        return <Chip icon={<CheckCircle />} label="Auto Captured" color="success" />;
      case 'CAPTURED_BY_HUMAN':
        return <Chip icon={<CheckCircle />} label="Human Approved" color="success" />;
      case 'VOIDED':
        return <Chip icon={<Cancel />} label="Auto Voided / Blocked" color="error" />;
      case 'VOIDED_BY_HUMAN':
        return <Chip icon={<Cancel />} label="Human Rejected" color="error" />;
      case 'PENDING_HUMAN':
        return <Chip icon={<WarningAmber />} label="Needs Human Review" color="warning" />;
      case 'AWAITING_BUYER_APPROVAL':
        return <Chip icon={<HelpOutline />} label="Awaiting Sandbox Approval" color="info" />;
      default:
        return <Chip label={status} />;
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', pb: 6 }}>
        {/* Top Header */}
        <Box sx={{ bgcolor: '#0b1329', borderBottom: '1px solid #1e293b', py: 3, px: 4 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Security sx={{ fontSize: 36, color: '#0070ba' }} />
              <Box>
                <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: '-0.5px' }}>
                  Verify Before Capture
                </Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                  AI Shopping Agent Guard with PayPal Two-Stage Authorize & Capture Protocol
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<Storefront />}
                endIcon={<OpenInNew />}
                href="/store/poisoned"
                target="_blank"
                size="small"
              >
                Inspect Mock Store
              </Button>
              <IconButton onClick={fetchRuns} color="inherit">
                <Refresh />
              </IconButton>
            </Stack>
          </Stack>
        </Box>

        <Container maxWidth="xl" sx={{ mt: 4 }}>
          <Grid container spacing={3}>
            {/* Left Control Column */}
            <Grid item xs={12} md={4}>
              <Card sx={{ border: '1px solid #1e293b', position: 'sticky', top: 20 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShoppingCart color="primary" /> Agent Mandate
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Configure the human instructions and simulate attack/edge scenarios.
                  </Typography>

                  <Stack spacing={2.5}>
                    <TextField
                      select
                      fullWidth
                      label="Store Scenario"
                      value={scenario}
                      onChange={(e) => setScenario(e.target.value)}
                      size="small"
                      helperText={
                        scenario === 'poisoned'
                          ? 'Contains hidden prompt-injection payload'
                          : scenario === 'ambiguous'
                          ? 'Refurbished item from unverified seller'
                          : 'Normal authentic store catalog'
                      }
                    >
                      <MenuItem value="clean">Clean Store (Legitimate items)</MenuItem>
                      <MenuItem value="ambiguous">Ambiguous (Refurbished, unrated seller)</MenuItem>
                      <MenuItem value="poisoned">Poisoned Page (Prompt Injection Attack)</MenuItem>
                    </TextField>

                    <TextField
                      fullWidth
                      label="User Mandate"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      size="small"
                      placeholder="e.g. 500GB SSD"
                    />

                    <TextField
                      fullWidth
                      type="number"
                      label="Budget Cap (USD)"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      size="small"
                    />

                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      onClick={handleRunAgent}
                      disabled={loading}
                      sx={{ py: 1.5, fontWeight: 700 }}
                    >
                      {loading ? 'Agent Shopping & Ordering...' : 'Dispatch AI Agent'}
                    </Button>
                  </Stack>

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Autonomous Safety Protocol:
                  </Typography>
                  <Box sx={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.6 }}>
                    1. <b>Agent</b> selects item & triggers PayPal <code>AUTHORIZE</code> (funds held, buyer not charged).<br />
                    2. <b>Independent LLM + Hard Rules Verifier</b> analyzes order, prompt injection flags, and trust.<br />
                    3. <b>Decision Gate</b>:
                    <ul style={{ paddingLeft: 16, margin: '4px 0' }}>
                      <li>Score ≥ <b>{thresholds.capture}</b>: Auto-Capture payment</li>
                      <li>Score <b>{thresholds.review}-{thresholds.capture - 1}</b>: Human-In-The-Loop review</li>
                      <li>Score &lt; <b>{thresholds.review}</b> or Injection: Auto-Void authorization</li>
                    </ul>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Right Execution Feed */}
            <Grid item xs={12} md={8}>
              {/* Summary Stats */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                  { label: 'Total Agent Orders', val: runs.length, color: '#38bdf8' },
                  { label: 'Auto Captured', val: runs.filter((r) => r.status.startsWith('CAPTURED')).length, color: '#4ade80' },
                  { label: 'Blocked & Voided', val: runs.filter((r) => r.status.startsWith('VOIDED')).length, color: '#f87171' },
                  { label: 'Pending Human', val: runs.filter((r) => r.status === 'PENDING_HUMAN').length, color: '#fbbf24' },
                ].map((s, idx) => (
                  <Grid item xs={6} sm={3} key={idx}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#11192e', border: '1px solid #1e293b' }}>
                      <Typography variant="h4" fontWeight={800} sx={{ color: s.color }}>
                        {s.val}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {s.label}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              {/* Runs Feed */}
              {runs.length === 0 ? (
                <Paper sx={{ p: 6, textAlign: 'center', bgcolor: '#11192e', border: '1px dashed #334155' }}>
                  <Typography variant="h6" color="text.secondary">
                    No runs recorded yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Select a scenario on the left and click <b>Dispatch AI Agent</b> to begin.
                  </Typography>
                </Paper>
              ) : (
                <Stack spacing={3}>
                  {runs.map((run) => (
                    <Card key={run.id} sx={{ border: '1px solid #1e293b', bgcolor: '#11192e' }}>
                      <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
                          <Box>
                            <Typography variant="h6" fontWeight={700}>
                              {run.product.name} — ${run.product.price}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                              Seller: <b>{run.product.seller}</b>
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                              Mandate: "{run.mandate.text}" (Cap: ${run.mandate.maxPrice}) &middot; Scenario: {run.scenario}
                            </Typography>
                          </Box>
                          <Box>{getStatusChip(run.status)}</Box>
                        </Stack>

                        {/* Agent Reasoning */}
                        {run.agentReasoning && (
                          <Box sx={{ mt: 2, p: 1.5, bgcolor: '#0b1329', borderRadius: 1, border: '1px solid #1e293b' }}>
                            <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 600, display: 'block', mb: 0.5 }}>
                              AI Agent Reasoning:
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                              "{run.agentReasoning}"
                            </Typography>
                          </Box>
                        )}

                        {/* Confidence Gate Meter */}
                        {run.verdict && (
                          <Box sx={{ mt: 3 }}>
                            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                                Safety Confidence Score:
                              </Typography>
                              <Typography
                                variant="caption"
                                fontWeight={800}
                                sx={{
                                  color:
                                    run.verdict.confidence >= thresholds.capture
                                      ? '#4ade80'
                                      : run.verdict.confidence >= thresholds.review
                                      ? '#fbbf24'
                                      : '#f87171',
                                }}
                              >
                                {run.verdict.confidence} / 100 ({run.verdict.decision})
                              </Typography>
                            </Stack>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(100, Math.max(0, run.verdict.confidence))}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                bgcolor: '#1e293b',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor:
                                    run.verdict.confidence >= thresholds.capture
                                      ? '#4ade80'
                                      : run.verdict.confidence >= thresholds.review
                                      ? '#fbbf24'
                                      : '#f87171',
                                },
                              }}
                            />
                            <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5, fontSize: '0.7rem', color: '#64748b' }}>
                              <span>0 (Auto-Void)</span>
                              <span>{thresholds.review} (Review Gate)</span>
                              <span>{thresholds.capture} (Auto-Capture)</span>
                              <span>100</span>
                            </Stack>
                          </Box>
                        )}

                        {/* Flags & Prompt Injection Alert */}
                        {run.verdict && (
                          <Box sx={{ mt: 2 }}>
                            {run.verdict.injectionDetected && (
                              <Alert severity="error" icon={<BugReport />} sx={{ mb: 1 }}>
                                <AlertTitle sx={{ fontWeight: 700 }}>Prompt Injection Detected!</AlertTitle>
                                Untrusted page content attempted to hijack the shopping agent instructions. Payment authorization halted.
                              </Alert>
                            )}

                            {/* Reasons list */}
                            <Box component="ul" sx={{ pl: 2, m: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
                              {(run.verdict.hardViolations || []).concat(run.verdict.reasons || []).map((r, i) => (
                                <li key={i}>{r}</li>
                              ))}
                            </Box>

                            {/* Tag Chips */}
                            <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} flexWrap="wrap">
                              {run.verdict.flags?.map((f, i) => (
                                <Chip key={i} label={f} size="small" {...getFlagChipProps(f)} />
                              ))}
                              {run.authId && (
                                <Chip label={`Auth ID: ${run.authId}`} size="small" variant="outlined" sx={{ color: '#64748b' }} />
                              )}
                            </Stack>
                          </Box>
                        )}

                        {/* Human Review Action Buttons */}
                        {run.status === 'PENDING_HUMAN' && (
                          <Box sx={{ mt: 3, p: 2, bgcolor: '#1e2238', borderRadius: 1, border: '1px solid #fbbf24' }}>
                            <Typography variant="subtitle2" sx={{ color: '#fbbf24', fontWeight: 700, mb: 1 }}>
                              Human Review Required:
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 2, color: '#e2e8f0' }}>
                              The verifier rated confidence at {run.verdict?.confidence} due to ambiguity (e.g. refurbished condition or unverified merchant). As the human supervisor, do you want to approve and capture, or reject and void?
                            </Typography>
                            <Stack direction="row" spacing={2}>
                              <Button
                                variant="contained"
                                color="success"
                                startIcon={<ThumbUp />}
                                onClick={() => handleDecision(run.id, true)}
                              >
                                Approve & Capture Funds
                              </Button>
                              <Button
                                variant="outlined"
                                color="error"
                                startIcon={<ThumbDown />}
                                onClick={() => handleDecision(run.id, false)}
                              >
                                Reject & Void Authorization
                              </Button>
                            </Stack>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

