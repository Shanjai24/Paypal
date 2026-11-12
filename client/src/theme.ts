import { createTheme } from '@mui/material/styles';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#0070ba' },
    secondary: { main: '#00cf92' },
    background: { default: '#0a0f1d', paper: '#11192e' },
    text: { primary: '#e8edf7', secondary: '#9aa8c0' },
    success: { main: '#00cf92' },
    warning: { main: '#f5a623' },
    error: { main: '#ef5350' },
  },
  typography: {
    fontFamily: '"IBM Plex Sans", "Inter", system-ui, sans-serif',
    h4: { fontWeight: 600, color: '#e8edf7' },
    h5: { fontWeight: 600, color: '#e8edf7' },
    h6: { fontWeight: 600, color: '#e8edf7' },
    subtitle1: { fontWeight: 500, color: '#e8edf7' },
    subtitle2: { fontWeight: 500, color: '#9aa8c0' },
    body1: { fontWeight: 400, color: '#e8edf7' },
    body2: { fontWeight: 400, color: '#9aa8c0' },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: '1px solid #1e293b',
          backgroundColor: '#11192e',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: '1px solid #1e293b',
          backgroundColor: '#11192e',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 6,
          fontWeight: 600,
          '&:focus-visible': {
            outline: '2px solid #0070ba',
            outlineOffset: '2px',
          },
        },
      },
    },
  },
});

export interface Verdict {
  itemMatch: number;
  sellerTrust: number;
  priceOk: boolean;
  injectionDetected: boolean;
  confidence: number;
  reasons: string[];
  flags: string[];
  hardViolations?: string[];
  decision: 'CAPTURE' | 'REVIEW' | 'VOID';
}

export interface RunEvent {
  t: string;
  msg: string;
}

export interface Run {
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
  events?: RunEvent[];
  createdAt: string;
}

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

export function getFlagChipProps(flag: string) {
  const normalized = flag.toLowerCase().trim();
  if (POSITIVE_FLAGS.has(normalized)) {
    return {
      variant: 'outlined' as const,
      sx: { color: '#00cf92', borderColor: '#00cf92', fontWeight: 500, fontSize: '0.75rem' },
    };
  }
  if (RISK_FLAGS.has(normalized)) {
    return {
      variant: 'outlined' as const,
      sx: { color: '#ef5350', borderColor: '#ef5350', fontWeight: 500, fontSize: '0.75rem' },
    };
  }
  return {
    variant: 'outlined' as const,
    sx: { color: '#9aa8c0', borderColor: '#334155', fontWeight: 500, fontSize: '0.75rem' },
  };
}
