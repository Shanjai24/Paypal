'use client';

import React from 'react';
import Link from 'next/link';
import {
  ThemeProvider,
  CssBaseline,
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Stack,
  Button,
  Divider,
} from '@mui/material';
import {
  ShoppingCart,
  Lock,
  FactCheck,
  Gavel,
  CheckCircle,
  WarningAmber,
  Cancel,
  ArrowForward,
} from '@mui/icons-material';
import Navbar from '../../components/Navbar';
import { darkTheme } from '../../theme';

export default function HowItWorksPage() {
  const steps = [
    {
      num: 1,
      title: 'Agent picks an item',
      icon: <ShoppingCart sx={{ color: '#0070ba', fontSize: 24 }} />,
      text: 'The autonomous shopping agent scrapes store pages, reviews specifications, and selects a product that matches your mandate and budget cap.',
    },
    {
      num: 2,
      title: 'PayPal AUTHORIZE holds the funds',
      icon: <Lock sx={{ color: '#0070ba', fontSize: 24 }} />,
      text: 'The agent initiates an order with PayPal AUTHORIZE intent. The buyer approves the hold in PayPal. Funds are held on the payment method, but the buyer is not charged.',
    },
    {
      num: 3,
      title: 'Verifier checks the order',
      icon: <FactCheck sx={{ color: '#0070ba', fontSize: 24 }} />,
      text: 'An independent AI verifier inspects the held order, raw store text, and agent reasoning. It validates specs and seller trust while scanning for hidden prompt-injection attacks.',
    },
    {
      num: 4,
      title: 'Decision: capture, human review, or void',
      icon: <Gavel sx={{ color: '#0070ba', fontSize: 24 }} />,
      text: 'Based on the verifier confidence score and hard security rules, the payment is captured automatically, routed to a human for approval, or voided with zero cost.',
    },
  ];

  const thresholds = [
    {
      range: '85 and above',
      label: 'Capture',
      color: '#00cf92',
      icon: <CheckCircle sx={{ color: '#00cf92', fontSize: 22 }} />,
      description:
        'High confidence. The item exact matches user specs, the merchant is verified, price is within budget, and store content is clean. Payment is captured automatically.',
    },
    {
      range: '50 to 84',
      label: 'Human Review',
      color: '#f5a623',
      icon: <WarningAmber sx={{ color: '#f5a623', fontSize: 22 }} />,
      description:
        'Medium confidence. Ambiguous conditions detected, such as refurbished status or an unrated seller. Funds remain held while awaiting 1-click human approval.',
    },
    {
      range: 'Below 50 or Injection',
      label: 'Void',
      color: '#ef5350',
      icon: <Cancel sx={{ color: '#ef5350', fontSize: 22 }} />,
      description:
        'High risk or rule violation. Prompt injection detected, price exceeds the mandate budget, or verifier timed out (fail-closed). The authorization is voided immediately.',
    },
  ];

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: '#0a0f1d', pb: 8 }}>
        <Navbar />

        <Container maxWidth="lg" sx={{ mt: 5 }}>
          {/* Header */}
          <Box sx={{ mb: 5, textAlign: 'center' }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: '#e8edf7', mb: 1.5 }}>
              How It Works
            </Typography>
            <Typography variant="body1" sx={{ color: '#9aa8c0', maxWidth: 680, mx: 'auto' }}>
              Verify Before Capture introduces a pre-settlement safety gate between autonomous AI shopping agents and final payment collection.
            </Typography>
          </Box>

          {/* Vertical 4-Step Flow */}
          <Paper
            sx={{
              p: { xs: 3, sm: 5 },
              bgcolor: '#11192e',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              mb: 5,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#e8edf7', mb: 3 }}>
              The 4-Step Payment Safety Protocol
            </Typography>

            <Stack spacing={4}>
              {steps.map((s, idx) => (
                <Stack
                  key={s.num}
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2.5}
                  alignItems={{ xs: 'flex-start', sm: 'flex-start' }}
                  sx={{
                    position: 'relative',
                    pb: idx < steps.length - 1 ? 3 : 0,
                    borderBottom: idx < steps.length - 1 ? '1px solid #1e293b' : 'none',
                  }}
                >
                  {/* Step Number Circle */}
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      bgcolor: '#0a0f1d',
                      border: '2px solid #0070ba',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0070ba',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      flexShrink: 0,
                    }}
                  >
                    {s.num}
                  </Box>

                  {/* Step Details */}
                  <Box sx={{ flexGrow: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.8 }}>
                      {s.icon}
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#e8edf7' }}>
                        {s.title}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ color: '#9aa8c0', lineHeight: 1.6 }}>
                      {s.text}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Paper>

          {/* 3-Column Decision Thresholds */}
          <Box sx={{ mb: 5 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#e8edf7', mb: 1 }}>
              Decision Gate Thresholds
            </Typography>
            <Typography variant="body2" sx={{ color: '#9aa8c0', mb: 3 }}>
              Every held order is scored from 0 to 100 based on specification match, seller trust, and adversarial injection indicators.
            </Typography>

            <Grid container spacing={3}>
              {thresholds.map((t, idx) => (
                <Grid item xs={12} md={4} key={idx}>
                  <Paper
                    sx={{
                      p: 3,
                      height: '100%',
                      bgcolor: '#11192e',
                      border: '1px solid #1e293b',
                      borderTop: `3px solid ${t.color}`,
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                      <Typography variant="caption" sx={{ color: '#9aa8c0', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>
                        Score: {t.range}
                      </Typography>
                      {t.icon}
                    </Stack>

                    <Typography variant="h6" sx={{ color: t.color, fontWeight: 600, mb: 1.5 }}>
                      {t.label}
                    </Typography>

                    <Typography variant="body2" sx={{ color: '#9aa8c0', lineHeight: 1.6, flexGrow: 1 }}>
                      {t.description}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Footer Call to Action */}
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              bgcolor: '#11192e',
              border: '1px solid #1e293b',
              borderRadius: '8px',
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#e8edf7', mb: 1 }}>
              Ready to see it in action?
            </Typography>
            <Typography variant="body2" sx={{ color: '#9aa8c0', mb: 2.5 }}>
              Try the Clean Store, Ambiguous, or Poisoned Page scenarios on the live dashboard.
            </Typography>
            <Button
              component={Link}
              href="/"
              variant="contained"
              endIcon={<ArrowForward />}
              sx={{
                bgcolor: '#0070ba',
                color: '#fff',
                px: 3.5,
                py: 1,
                fontWeight: 600,
                '&:hover': { bgcolor: '#005ea6' },
              }}
            >
              Open Dashboard
            </Button>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

