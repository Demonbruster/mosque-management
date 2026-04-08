// ============================================
// GoalThermometer — Reusable Component (ST-26.4)
// ============================================
// Visual thermometer showing funds raised vs target.
// Used in the public roadmap to inspire donations.
// ============================================

import { Box, Text, Stack, Tooltip } from '@mantine/core';

interface GoalThermometerProps {
  /** Amount raised so far */
  raised: number;
  /** Target amount */
  target: number;
  /** Optional label above the thermometer */
  label?: string;
  /** Thermometer fill color (CSS color) */
  color?: string;
  /** Height of thermometer in px */
  height?: number;
}

function formatINR(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value.toLocaleString('en-IN')}`;
}

export function GoalThermometer({
  raised,
  target,
  label,
  color = '#2ecc71',
  height = 180,
}: GoalThermometerProps) {
  const pct = target > 0 ? Math.min((raised / target) * 100, 100) : 0;
  const isComplete = pct >= 100;

  return (
    <Stack align="center" gap={6}>
      {label && (
        <Text size="xs" fw={600} c="dimmed" tt="uppercase" lts={0.5}>
          {label}
        </Text>
      )}

      {/* Target amount at top */}
      <Text size="xs" fw={700} c="dark">
        {formatINR(target)}
      </Text>

      {/* Thermometer body */}
      <Tooltip
        label={`${formatINR(raised)} of ${formatINR(target)} (${pct.toFixed(1)}%)`}
        withArrow
        position="right"
      >
        <Box
          style={{
            position: 'relative',
            width: 36,
            height,
            borderRadius: 18,
            backgroundColor: '#f0f0f0',
            border: '2px solid #e0e0e0',
            overflow: 'hidden',
          }}
        >
          {/* Fill */}
          <Box
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: `${pct}%`,
              backgroundColor: isComplete ? '#27ae60' : color,
              borderRadius: '0 0 16px 16px',
              transition: 'height 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />

          {/* Percentage indicator */}
          <Box
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1,
            }}
          >
            <Text
              size="xs"
              fw={800}
              c={pct > 50 ? 'white' : 'dark'}
              style={{ textShadow: pct > 50 ? '0 1px 2px rgba(0,0,0,0.3)' : 'none' }}
            >
              {pct.toFixed(0)}%
            </Text>
          </Box>
        </Box>
      </Tooltip>

      {/* Raised amount at bottom */}
      <Text size="xs" fw={600} c={color}>
        {formatINR(raised)}
      </Text>
      <Text size="10px" c="dimmed">
        raised
      </Text>
    </Stack>
  );
}
