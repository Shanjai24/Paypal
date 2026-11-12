'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Box, Stack, Typography, Button, IconButton, Tooltip } from '@mui/material';
import { Security, Storefront, OpenInNew, Refresh } from '@mui/icons-material';

interface NavbarProps {
  onRefresh?: () => void;
}

export default function Navbar({ onRefresh }: NavbarProps) {
  const pathname = usePathname();

  const navLinks = [
    { label: 'Dashboard', href: '/' },
    { label: 'Audit trail', href: '/activity' },
    { label: 'How it works', href: '/how-it-works' },
  ];

  return (
    <Box
      component="header"
      sx={{
        bgcolor: '#0a0f1d',
        borderBottom: '1px solid #1e293b',
        py: 2,
        px: { xs: 2, sm: 4 },
        position: 'sticky',
        top: 0,
        zIndex: 1100,
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
        gap={2}
      >
        {/* App Title & Brand */}
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Security sx={{ fontSize: 32, color: '#0070ba' }} />
          <Box>
            <Typography
              variant="h6"
              component="span"
              sx={{
                fontWeight: 600,
                color: '#e8edf7',
                letterSpacing: '-0.3px',
                display: 'block',
                lineHeight: 1.2,
              }}
            >
              Verify Before Capture
            </Typography>
            <Typography variant="caption" sx={{ color: '#9aa8c0', display: { xs: 'none', sm: 'block' } }}>
              AI Shopping Agent Guard with PayPal Two-Stage Authorization
            </Typography>
          </Box>
        </Stack>

        {/* Navigation Links */}
        <Stack
          direction="row"
          spacing={1}
          component="nav"
          aria-label="Main Navigation"
          sx={{
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Button
                key={link.href}
                component={Link}
                href={link.href}
                size="small"
                sx={{
                  px: 2,
                  py: 0.8,
                  borderRadius: '6px',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#e8edf7' : '#9aa8c0',
                  bgcolor: isActive ? '#11192e' : 'transparent',
                  border: isActive ? '1px solid #1e293b' : '1px solid transparent',
                  borderBottom: isActive ? '2px solid #0070ba' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: '#11192e',
                    color: '#e8edf7',
                  },
                }}
              >
                {link.label}
              </Button>
            );
          })}
        </Stack>

        {/* Secondary Actions */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button
            variant="outlined"
            size="small"
            startIcon={<Storefront sx={{ fontSize: 18 }} />}
            endIcon={<OpenInNew sx={{ fontSize: 14 }} />}
            href="/store/poisoned"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              borderColor: '#1e293b',
              color: '#9aa8c0',
              bgcolor: '#11192e',
              '&:hover': {
                borderColor: '#0070ba',
                color: '#e8edf7',
                bgcolor: '#11192e',
              },
            }}
          >
            Inspect Store
          </Button>

          {onRefresh && (
            <Tooltip title="Refresh runs">
              <IconButton
                onClick={onRefresh}
                size="small"
                sx={{
                  border: '1px solid #1e293b',
                  bgcolor: '#11192e',
                  color: '#9aa8c0',
                  '&:hover': {
                    color: '#e8edf7',
                    borderColor: '#0070ba',
                  },
                }}
              >
                <Refresh fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
