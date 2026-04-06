// ============================================
// ProjectProgressBar — Reusable Component (ST-26.5)
// ============================================
// Animated progress bar with optional milestone markers.
// ============================================

import { Box, Group, Text, Tooltip, Progress } from '@mantine/core';
import { IconDiamondFilled } from '@tabler/icons-react';

export interface Milestone {
  label: string;
  /** Position (0–100) on the progress bar */
  at: number;
}

interface ProjectProgressBarProps {
  /** Completion percentage (0–100) */
  percentage: number;
  /** Milestones to display */
  milestones?: Milestone[];
  /** Progress bar color */
  color?: string;
  /** Show percentage label */
  showLabel?: boolean;
}

export function ProjectProgressBar({
  percentage,
  milestones = [],
  color = 'green',
  showLabel = true,
}: ProjectProgressBarProps) {
  const pct = Math.min(Math.max(percentage, 0), 100);

  return (
    <Box>
      {/* Percentage label */}
      {showLabel && (
        <Group justify="space-between" mb={4}>
          <Text size="xs" c="dimmed">
            Progress
          </Text>
          <Text size="xs" fw={700} c={pct >= 100 ? 'green' : 'dark'}>
            {pct}%
          </Text>
        </Group>
      )}

      {/* Progress bar with milestones */}
      <Box style={{ position: 'relative' }}>
        <Progress
          value={pct}
          color={color}
          size="lg"
          radius="xl"
          animated={pct > 0 && pct < 100}
          transitionDuration={1000}
        />

        {/* Milestone markers */}
        {milestones.map((ms) => (
          <Tooltip key={ms.label} label={ms.label} withArrow position="top">
            <Box
              style={{
                position: 'absolute',
                left: `${ms.at}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 2,
                cursor: 'pointer',
              }}
            >
              <IconDiamondFilled
                size={14}
                color={pct >= ms.at ? 'var(--mantine-color-green-6)' : '#ccc'}
                style={{
                  filter: pct >= ms.at ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' : 'none',
                }}
              />
            </Box>
          </Tooltip>
        ))}
      </Box>
    </Box>
  );
}
