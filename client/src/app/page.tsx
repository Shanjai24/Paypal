'use client';

import React, { useEffect, useState } from 'react';
import {
  ThemeProvider,
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
} from '@mui/material';
import {
  ShoppingCart,
  WarningAmber,
  CheckCircle,
  Cancel,
  HelpOutline,
  BugReport,
  ThumbUp,
  ThumbDown,
} from '@mui/icons-material';
import Navbar from '../components/Navbar';
import { darkTheme, Run, getFlagChipProps } from '../theme';

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
        return <Chip icon={<CheckCircle sx={{ color: '#00cf92 !important', fontSize: 16 }} />} label="Auto Captured" size="small" variant="outlined" sx={{ color: '#00cf92', borderColor: '#00cf92', fontWeight: 600 }} />;
      case 'CAPTURED_BY_HUMAN':
        return <Chip icon={<CheckCircle sx={{ color: '#00cf92 !important', fontSize: 16 }} />} label="Human Approved" size="small" variant="outlined" sx={{ color: '#00cf92', borderColor: '#00cf92', fontWeight: 600 }} />;
      case 'VOIDED':
        return <Chip icon={<Cancel sx={{ color: '#ef5350 !important', fontSize: 16 }} />} label="Auto Voided" size="small" variant="outlined" sx={{ color: '#ef5350', borderColor: '#ef5350', fontWeight: 600 }} />;
      case 'VOIDED_BY_HUMAN':
        return <Chip icon={<Cancel sx={{ color: '#ef5350 !important', fontSize: 16 }} />} label="Human Rejected" size="small" variant="outlined" sx={{ color: '#ef5350', borderColor: '#ef5350', fontWeight: 600 }} />;
      case 'PENDING_HUMAN':
        return <Chip icon={<WarningAmber sx={{ color: '#f5a623 !important', fontSize: 16 }} />} label="Needs Human Review" size="small" variant="outlined" sx={{ color: '#f5a623', borderColor: '#f5a623', fontWeight: 600 }} />;
      case 'AWAITING_BUYER_APPROVAL':
        return <Chip icon={<HelpOutline sx={{ color: '#9aa8c0 !important', fontSize: 16 }} />} label="Awaiting Sandbox Approval" size="small" variant="outlined" sx={{ color: '#9aa8c0', borderColor: '#475569', fontWeight: 600 }} />;
      default:
        return <Chip label={status} size="small" variant="outlined" sx={{ color: '#9aa8c0', borderColor: '#475569' }} />;
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: '#0a0f1d', pb: 6 }}>
        {/* Shared Top Navigation */}
        <Navbar onRefresh={fetchRuns} />

        <Container maxWidth="xl" sx={{ mt: 4 }}>
          <Grid container spacing={3}>
            {/* Left Control Column */}
            <Grid item xs={12} md={4}>
              <Card sx={{ border: '1px solid #1e293b', position: 'sticky', top: 80, bgcolor: '#11192e' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#e8edf7' }}>
                    <ShoppingCart sx={{ color: '#0070ba' }} /> Agent Mandate
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#9aa8c0', mb: 3 }}>
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
                      size="large"
                      onClick={handleRunAgent}
                      disabled={loading}
                      sx={{ py: 1.5, fontWeight: 700, bgcolor: '#0070ba', '&:hover': { bgcolor: '#005ea6' } }}
                    >
                      {loading ? 'Agent Shopping & Ordering...' : 'Dispatch AI Agent'}
                    </Button>
                  </Stack>

                  <Divider sx={{ my: 3, borderColor: '#1e293b' }} />

                  <Typography variant="subtitle2" sx={{ color: '#9aa8c0', fontWeight: 600 }} gutterBottom>
                    Autonomous Safety Protocol:
                  </Typography>
                  <Box sx={{ fontSize: '0.8rem', color: '#9aa8c0', lineHeight: 1.6 }}>
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
                  { label: 'Auto Captured', val: runs.filter((r) => r.status.startsWith('CAPTURED')).length, color: '#00cf92' },
                  { label: 'Blocked & Voided', val: runs.filter((r) => r.status.startsWith('VOIDED')).length, color: '#ef5350' },
                  { label: 'Pending Human', val: runs.filter((r) => r.status === 'PENDING_HUMAN').length, color: '#f5a623' },
                ].map((s, idx) => (
                  <Grid item xs={6} sm={3} key={idx}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#11192e', border: '1px solid #1e293b', borderRadius: '8px' }}>
                      <Typography variant="h4" fontWeight={800} sx={{ color: s.color }}>
                        {s.val}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#9aa8c0' }}>
                        {s.label}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              {/* Runs Feed */}
              {runs.length === 0 ? (
                <Paper sx={{ p: 6, textAlign: 'center', bgcolor: '#11192e', border: '1px dashed #1e293b', borderRadius: '8px' }}>
                  <Typography variant="h6" sx={{ color: '#e8edf7', fontWeight: 600 }}>
                    No runs recorded yet
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#9aa8c0', mt: 1 }}>
                    Select a scenario on the left and click <b>Dispatch AI Agent</b> to begin.
                  </Typography>
                </Paper>
              ) : (
                <Stack spacing={3}>
                  {runs.map((run) => (
                    <Card key={run.id} sx={{ border: '1px solid #1e293b', bgcolor: '#11192e', borderRadius: '8px' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
                          <Box>
                            <Typography variant="h6" fontWeight={700} sx={{ color: '#e8edf7' }}>
                              {run.product.name} — ${run.product.price}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#9aa8c0' }}>
                              Seller: <b>{run.product.seller}</b>
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#9aa8c0' }}>
                              Mandate: "{run.mandate.text}" (Cap: ${run.mandate.maxPrice}) &middot; Scenario: {run.scenario}
                            </Typography>
                          </Box>
                          <Box>{getStatusChip(run.status)}</Box>
                        </Stack>

                        {/* Agent Reasoning */}
                        {run.agentReasoning && (
                          <Box sx={{ mt: 2, p: 1.5, bgcolor: '#0b1329', borderRadius: '6px', border: '1px solid #1e293b' }}>
                            <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 600, display: 'block', mb: 0.5 }}>
                              AI Agent Reasoning:
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#e8edf7' }}>
                              "{run.agentReasoning}"
                            </Typography>
                          </Box>
                        )}

                        {/* Confidence Gate Meter */}
                        {run.verdict && (
                          <Box sx={{ mt: 3 }}>
                            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                              <Typography variant="caption" sx={{ color: '#9aa8c0', fontWeight: 600 }}>
                                Safety Confidence Score:
                              </Typography>
                              <Typography
                                variant="caption"
                                fontWeight={800}
                                sx={{
                                  color:
                                    run.verdict.confidence >= thresholds.capture
                                      ? '#00cf92'
                                      : run.verdict.confidence >= thresholds.review
                                      ? '#f5a623'
                                      : '#ef5350',
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
                                      ? '#00cf92'
                                      : run.verdict.confidence >= thresholds.review
                                      ? '#f5a623'
                                      : '#ef5350',
                                },
                              }}
                            />
                            <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5, fontSize: '0.7rem', color: '#9aa8c0' }}>
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
                              <Alert severity="error" icon={<BugReport />} sx={{ mb: 1, bgcolor: '#2a1215', color: '#ef5350', border: '1px solid #ef5350' }}>
                                <AlertTitle sx={{ fontWeight: 700 }}>Prompt Injection Detected!</AlertTitle>
                                Untrusted page content attempted to hijack the shopping agent instructions. Payment authorization halted.
                              </Alert>
                            )}

                            {/* Reasons list */}
                            <Box component="ul" sx={{ pl: 2, m: 0, fontSize: '0.85rem', color: '#e8edf7' }}>
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
                                <Chip label={`Auth ID: ${run.authId}`} size="small" variant="outlined" sx={{ color: '#9aa8c0', borderColor: '#334155', fontSize: '0.75rem' }} />
                              )}
                            </Stack>
                          </Box>
                        )}

                        {/* Human Review Action Buttons */}
                        {run.status === 'PENDING_HUMAN' && (
                          <Box sx={{ mt: 3, p: 2, bgcolor: '#1e2238', borderRadius: '6px', border: '1px solid #f5a623' }}>
                            <Typography variant="subtitle2" sx={{ color: '#f5a623', fontWeight: 700, mb: 1 }}>
                              Human Review Required:
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 2, color: '#e8edf7' }}>
                              The verifier rated confidence at {run.verdict?.confidence} due to ambiguity (e.g. refurbished condition or unverified merchant). As the human supervisor, do you want to approve and capture, or reject and void?
                            </Typography>
                            <Stack direction="row" spacing={2}>
                              <Button
                                variant="contained"
                                sx={{ bgcolor: '#00cf92', color: '#0a0f1d', fontWeight: 700, '&:hover': { bgcolor: '#00b37e' } }}
                                startIcon={<ThumbUp />}
                                onClick={() => handleDecision(run.id, true)}
                              >
                                Approve & Capture Funds
                              </Button>
                              <Button
                                variant="outlined"
                                sx={{ color: '#ef5350', borderColor: '#ef5350', fontWeight: 700, '&:hover': { bgcolor: 'rgba(239, 83, 80, 0.1)' } }}
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
