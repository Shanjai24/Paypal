'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ThemeProvider,
  CssBaseline,
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  IconButton,
  Chip,
  Stack,
  Button,
  LinearProgress,
} from '@mui/material';
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  History,
  CheckCircle,
  Cancel,
  WarningAmber,
  HelpOutline,
  ArrowForward,
} from '@mui/icons-material';
import Navbar from '../../components/Navbar';
import { darkTheme, Run, getFlagChipProps } from '../../theme';

function formatTime(isoString?: string) {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
      ' (' + d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ')';
  } catch {
    return isoString;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'CAPTURED':
    case 'CAPTURED_BY_HUMAN':
      return (
        <Chip
          icon={<CheckCircle sx={{ color: '#00cf92 !important', fontSize: 16 }} />}
          label={status === 'CAPTURED_BY_HUMAN' ? 'Captured (Human)' : 'Captured'}
          size="small"
          variant="outlined"
          sx={{ borderColor: '#00cf92', color: '#00cf92', fontWeight: 600, fontSize: '0.75rem' }}
        />
      );
    case 'VOIDED':
    case 'VOIDED_BY_HUMAN':
      return (
        <Chip
          icon={<Cancel sx={{ color: '#ef5350 !important', fontSize: 16 }} />}
          label={status === 'VOIDED_BY_HUMAN' ? 'Voided (Human)' : 'Voided'}
          size="small"
          variant="outlined"
          sx={{ borderColor: '#ef5350', color: '#ef5350', fontWeight: 600, fontSize: '0.75rem' }}
        />
      );
    case 'PENDING_HUMAN':
      return (
        <Chip
          icon={<WarningAmber sx={{ color: '#f5a623 !important', fontSize: 16 }} />}
          label="Review Required"
          size="small"
          variant="outlined"
          sx={{ borderColor: '#f5a623', color: '#f5a623', fontWeight: 600, fontSize: '0.75rem' }}
        />
      );
    case 'AWAITING_BUYER_APPROVAL':
      return (
        <Chip
          icon={<HelpOutline sx={{ color: '#9aa8c0 !important', fontSize: 16 }} />}
          label="Awaiting Approval"
          size="small"
          variant="outlined"
          sx={{ borderColor: '#475569', color: '#9aa8c0', fontWeight: 600, fontSize: '0.75rem' }}
        />
      );
    default:
      return (
        <Chip
          label={status}
          size="small"
          variant="outlined"
          sx={{ borderColor: '#475569', color: '#9aa8c0', fontSize: '0.75rem' }}
        />
      );
  }
}

function getDecisionChip(decision?: string) {
  if (!decision) return <Typography variant="caption" sx={{ color: '#9aa8c0' }}>—</Typography>;
  switch (decision) {
    case 'CAPTURE':
      return (
        <Typography variant="body2" sx={{ color: '#00cf92', fontWeight: 600 }}>
          CAPTURE
        </Typography>
      );
    case 'REVIEW':
      return (
        <Typography variant="body2" sx={{ color: '#f5a623', fontWeight: 600 }}>
          REVIEW
        </Typography>
      );
    case 'VOID':
      return (
        <Typography variant="body2" sx={{ color: '#ef5350', fontWeight: 600 }}>
          VOID
        </Typography>
      );
    default:
      return <Typography variant="body2" sx={{ color: '#9aa8c0' }}>{decision}</Typography>;
  }
}

function Row({ run }: { run: Run }) {
  const [open, setOpen] = useState(false);
  const v = run.verdict;

  return (
    <>
      <TableRow
        onClick={() => setOpen(!open)}
        sx={{
          cursor: 'pointer',
          bgcolor: open ? '#141e38' : 'transparent',
          '&:hover': { bgcolor: '#16223e' },
          '& td': { borderColor: '#1e293b', py: 2 },
          transition: 'background-color 0.15s ease',
        }}
      >
        <TableCell sx={{ width: 48, px: 1 }}>
          <IconButton
            aria-label="expand row"
            size="small"
            sx={{ color: '#9aa8c0' }}
            onClick={(e) => {
              e.stopPropagation();
              setOpen(!open);
            }}
          >
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ color: '#9aa8c0', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
          {formatTime(run.createdAt)}
        </TableCell>
        <TableCell>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#e8edf7' }}>
            {run.product?.name || 'Unknown item'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#9aa8c0', display: 'block' }}>
            {run.product?.seller}
          </Typography>
        </TableCell>
        <TableCell sx={{ fontWeight: 600, color: '#e8edf7', whiteSpace: 'nowrap' }}>
          ${run.product?.price?.toFixed(2) ?? '—'}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {getStatusBadge(run.status)}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {v ? (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color:
                    v.confidence >= 85
                      ? '#00cf92'
                      : v.confidence >= 50
                      ? '#f5a623'
                      : '#ef5350',
                }}
              >
                {v.confidence}/100
              </Typography>
            </Stack>
          ) : (
            <Typography variant="caption" sx={{ color: '#9aa8c0' }}>—</Typography>
          )}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {getDecisionChip(v?.decision)}
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0, borderColor: '#1e293b' }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ py: 2.5, px: 3, bgcolor: '#0b1329', my: 1, borderRadius: '6px', border: '1px solid #1e293b' }}>
              <Stack spacing={2}>
                {/* Mandate & Agent Reasoning */}
                <Box>
                  <Typography variant="caption" sx={{ color: '#9aa8c0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                    Human Mandate & Context
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#e8edf7', mt: 0.5 }}>
                    Wanted: <b>"{run.mandate.text}"</b> (Max budget: ${run.mandate.maxPrice}) &middot; Scenario: <b>{run.scenario}</b>
                  </Typography>
                  {run.agentReasoning && (
                    <Typography variant="body2" sx={{ color: '#9aa8c0', fontStyle: 'italic', mt: 0.5 }}>
                      Agent rationale: "{run.agentReasoning}"
                    </Typography>
                  )}
                </Box>

                {/* Verifier Reasons & Flags */}
                {v && (
                  <Box>
                    <Typography variant="caption" sx={{ color: '#9aa8c0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                      Verifier Evaluation & Security Flags
                    </Typography>
                    <Box component="ul" sx={{ pl: 2, m: '6px 0', fontSize: '0.85rem', color: '#e8edf7' }}>
                      {(v.hardViolations || []).concat(v.reasons || []).map((reason, idx) => (
                        <li key={idx} style={{ marginBottom: 4 }}>
                          {reason}
                        </li>
                      ))}
                    </Box>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                      {v.flags?.map((f, i) => (
                        <Chip key={i} label={f} size="small" {...getFlagChipProps(f)} />
                      ))}
                      {run.authId && (
                        <Chip
                          label={`Auth ID: ${run.authId}`}
                          size="small"
                          variant="outlined"
                          sx={{ color: '#9aa8c0', borderColor: '#334155', fontSize: '0.75rem' }}
                        />
                      )}
                    </Stack>
                  </Box>
                )}

                {/* Events Timeline */}
                {run.events && run.events.length > 0 && (
                  <Box>
                    <Typography variant="caption" sx={{ color: '#9aa8c0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, display: 'block', mb: 1 }}>
                      Events Timeline
                    </Typography>
                    <Stack spacing={0.8}>
                      {run.events.map((evt, idx) => (
                        <Stack key={idx} direction="row" spacing={1.5} alignItems="flex-start">
                          <Typography variant="caption" sx={{ color: '#9aa8c0', fontFamily: 'monospace', minWidth: 70, pt: 0.2 }}>
                            {formatTime(evt.t).split(' ')[0]}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#e8edf7', fontSize: '0.85rem' }}>
                            {evt.msg}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function ActivityPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRuns = async () => {
    try {
      const res = await fetch('/api/runs');
      if (res.ok) {
        const data = await res.json();
        setRuns(data.runs || []);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
    const interval = setInterval(fetchRuns, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: '#0a0f1d', pb: 8 }}>
        <Navbar onRefresh={fetchRuns} />

        <Container maxWidth="xl" sx={{ mt: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <History sx={{ color: '#0070ba', fontSize: 28 }} />
              <Typography variant="h5" component="h1" sx={{ fontWeight: 600, color: '#e8edf7' }}>
                Audit Trail
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: '#9aa8c0' }}>
              Complete chronological ledger of autonomous shopping agent actions, PayPal authorizations, and verifier safety decisions.
            </Typography>
          </Box>

          {loading && runs.length === 0 ? (
            <Box sx={{ width: '100%', py: 4 }}>
              <LinearProgress sx={{ bgcolor: '#11192e', '& .MuiLinearProgress-bar': { bgcolor: '#0070ba' } }} />
            </Box>
          ) : runs.length === 0 ? (
            <Paper
              sx={{
                p: 6,
                textAlign: 'center',
                bgcolor: '#11192e',
                border: '1px dashed #1e293b',
                borderRadius: '8px',
              }}
            >
              <Typography variant="h6" sx={{ color: '#e8edf7', fontWeight: 600, mb: 1 }}>
                No runs yet. Dispatch an agent from the dashboard.
              </Typography>
              <Typography variant="body2" sx={{ color: '#9aa8c0', mb: 3 }}>
                Configure a product mandate and launch an agent to see real-time payment audit trails here.
              </Typography>
              <Button
                component={Link}
                href="/"
                variant="contained"
                endIcon={<ArrowForward />}
                sx={{
                  bgcolor: '#0070ba',
                  color: '#fff',
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  '&:hover': { bgcolor: '#005ea6' },
                }}
              >
                Go to Dashboard
              </Button>
            </Paper>
          ) : (
            <TableContainer
              component={Paper}
              sx={{
                bgcolor: '#11192e',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                overflowX: 'auto',
              }}
            >
              <Table aria-label="Audit trail table">
                <TableHead sx={{ bgcolor: '#0a0f1d' }}>
                  <TableRow sx={{ '& th': { borderColor: '#1e293b', color: '#9aa8c0', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' } }}>
                    <TableCell sx={{ width: 48 }} />
                    <TableCell>Time</TableCell>
                    <TableCell>Product & Seller</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Confidence</TableCell>
                    <TableCell>Decision</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {runs.map((run) => (
                    <Row key={run.id} run={run} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}
