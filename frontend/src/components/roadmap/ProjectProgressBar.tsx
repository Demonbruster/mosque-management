// ============================================
// ProjectProgressBar — Reusable Component (TASK-026 + TASK-027)
// ============================================
// Display a progress bar with milestone indicators.
// Indicators are color-coded by milestone status.
// ============================================

import React from 'react';
import { Box, Tooltip, Progress, Group, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconCheck, IconAlertTriangle, IconCircle } from '@tabler/icons-react';
import type { ProjectMilestone } from '../../lib/api-projects';

interface ProjectProgressBarProps {
  percentage: number;
  milestones?: ProjectMilestone[];
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'Completed':
      return 'green';
    case 'In_Progress':
      return 'blue';
    case 'Delayed':
      return 'red';
    default:
      return 'gray';
  }
}

export function ProjectProgressBar({ percentage, milestones = [] }: ProjectProgressBarProps) {
  // Sort milestones by order if available
  const sortedMilestones = [...milestones].sort(
    (a, b) => (a.sort_order || 0) - (b.sort_order || 0),
  );

  return (
    <Box mt="md" mb="xl">
      <Box style={{ position: 'relative', height: 16 }}>
        {/* Main Progress Track */}
        <Progress
          value={percentage}
          size={16}
          radius="xl"
          color="green"
          striped
          animated={percentage > 0 && percentage < 100}
        />

        {/* Milestone Indicators (Markers along the track) */}
        {sortedMilestones.map((ms, index) => {
          // If we have many milestones, position them based on index as a proxy for progress
          // unless we have specific completion percentages for each.
          // For now, let's distribute them evenly but ideally it should be completion-based.
          const pos =
            ms.completion_percentage !== undefined
              ? ms.completion_percentage
              : (index + 1) * (100 / (sortedMilestones.length + 1));

          const color = getStatusColor(ms.status);

          return (
            <Tooltip
              key={ms.id}
              label={
                <Stack gap={2}>
                  <Text size="xs" fw={700}>
                    {ms.milestone_name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {ms.status.replace('_', ' ')} • {ms.completion_percentage}%
                  </Text>
                </Stack>
              }
              withArrow
              position="top"
            >
              <Box
                style={{
                  position: 'absolute',
                  left: `${pos}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  cursor: 'pointer',
                  zIndex: 2,
                }}
              >
                <ThemeIcon
                  size="xs"
                  color={color}
                  variant={ms.status === 'Completed' ? 'filled' : 'light'}
                  radius="xl"
                  style={{
                    boxShadow: '0 0 0 2px white',
                    transition: 'transform 0.2s',
                  }}
                >
                  {ms.status === 'Completed' ? (
                    <IconCheck size={8} />
                  ) : ms.status === 'Delayed' ? (
                    <IconAlertTriangle size={8} />
                  ) : (
                    <IconCircle size={8} />
                  )}
                </ThemeIcon>
              </Box>
            </Tooltip>
          );
        })}
      </Box>

      {/* Legend below bar for clear labels */}
      {sortedMilestones.length > 0 && (
        <Group mt="md" gap="sm" justify="space-between" wrap="nowrap">
          {sortedMilestones.slice(0, 3).map(
            (
              ms, // Show first 3 only to avoid clutter on small screens
            ) => (
              <Group key={ms.id} gap={4} wrap="nowrap">
                <Box
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: `var(--mantine-color-${getStatusColor(ms.status)}-5)`,
                  }}
                />
                <Text size="10px" fw={500} c="dimmed" truncate style={{ maxWidth: 80 }}>
                  {ms.milestone_name}
                </Text>
              </Group>
            ),
          )}
          {sortedMilestones.length > 3 && (
            <Text size="10px" c="dimmed" fw={500}>
              +{sortedMilestones.length - 3} more
            </Text>
          )}
        </Group>
      )}
    </Box>
  );
}
