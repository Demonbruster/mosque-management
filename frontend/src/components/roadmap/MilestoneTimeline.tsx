// ============================================
// MilestoneTimeline — Reusable Component (ST-27.5)
// ============================================
// Gantt-style horizontal timeline with milestone markers.
// Color-coded by status: green/blue/yellow/red.
// Responsive — collapses to vertical list on mobile.
// ============================================

import React from 'react';
import { Box, Group, Stack, Text, Tooltip, ThemeIcon, Paper } from '@mantine/core';
import { IconCheck, IconAlertTriangle, IconCircle, IconPlayerPlay } from '@tabler/icons-react';
import type { ProjectMilestone } from '../../lib/api-projects';
import { formatDateShort } from '../../lib/format-utils';

interface MilestoneTimelineProps {
  milestones: ProjectMilestone[];
  startDate?: string | null;
  endDate?: string | null;
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

function getStatusIcon(status: string) {
  switch (status) {
    case 'Completed':
      return <IconCheck size={12} />;
    case 'In_Progress':
      return <IconPlayerPlay size={12} />;
    case 'Delayed':
      return <IconAlertTriangle size={12} />;
    default:
      return <IconCircle size={12} />;
  }
}

function calcPosition(date: string | null, start: Date, end: Date): number {
  if (!date) return 0;
  const d = new Date(date).getTime();
  const s = start.getTime();
  const e = end.getTime();
  if (e === s) return 0;
  return Math.min(Math.max(((d - s) / (e - s)) * 100, 2), 98);
}

export function MilestoneTimeline({ milestones, startDate, endDate }: MilestoneTimelineProps) {
  // 1. Capture current date once to satisfy purity linter
  const [now] = React.useState(() => new Date());
  const [defaultEnd] = React.useState(() => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

  const allDates = React.useMemo(() => {
    return milestones.map((ms) => ms.target_date).filter(Boolean) as string[];
  }, [milestones]);

  const timelineStart = React.useMemo(() => {
    if (startDate) return new Date(startDate);
    if (allDates.length > 0) return new Date(allDates[0]);
    return now;
  }, [startDate, allDates, now]);

  const timelineEnd = React.useMemo(() => {
    if (endDate) return new Date(endDate);
    if (allDates.length > 0) return new Date(allDates[allDates.length - 1]);
    return defaultEnd;
  }, [endDate, allDates, defaultEnd]);

  // 2. Unconditional rendering setup
  if (milestones.length === 0) {
    return (
      <Text size="sm" c="dimmed" ta="center" py="md">
        No milestones yet. Add milestones to track project progress.
      </Text>
    );
  }

  return (
    <Stack gap="lg">
      {/* ── Horizontal Gantt (hidden on xs) ── */}
      <Box visibleFrom="sm">
        <Group justify="space-between" mb={4}>
          <Text size="xs" c="dimmed">
            {formatDateShort(startDate || null)}
          </Text>
          <Text size="xs" c="dimmed">
            {formatDateShort(endDate || null)}
          </Text>
        </Group>

        {/* Timeline track */}
        <Box
          style={{
            position: 'relative',
            height: 4,
            backgroundColor: 'var(--mantine-color-gray-2)',
            borderRadius: 2,
            margin: '12px 0 32px',
          }}
        >
          {milestones.map((ms) => {
            const pos = calcPosition(ms.target_date, timelineStart, timelineEnd);
            const color = getStatusColor(ms.status);

            return (
              <Tooltip
                key={ms.id}
                label={
                  <Stack gap={2}>
                    <Text size="xs" fw={700}>
                      {ms.milestone_name}
                    </Text>
                    <Text size="xs">{ms.completion_percentage}% complete</Text>
                    {ms.target_date && (
                      <Text size="xs" c="dimmed">
                        Target: {formatDateShort(ms.target_date)}
                      </Text>
                    )}
                  </Stack>
                }
                withArrow
                position="top"
                multiline
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
                    size="md"
                    color={color}
                    variant={ms.status === 'Completed' ? 'filled' : 'light'}
                    radius="xl"
                    style={{
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                      border: `2px solid var(--mantine-color-${color}-${ms.status === 'Completed' ? '6' : '3'})`,
                    }}
                  >
                    {getStatusIcon(ms.status)}
                  </ThemeIcon>

                  {/* Label below marker */}
                  <Text
                    size="10px"
                    ta="center"
                    fw={600}
                    c={color}
                    style={{
                      position: 'absolute',
                      top: 28,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      whiteSpace: 'nowrap',
                      maxWidth: 80,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {ms.milestone_name}
                  </Text>
                </Box>
              </Tooltip>
            );
          })}

          {/* Today marker */}
          {(() => {
            const todayPos = calcPosition(
              new Date().toISOString().split('T')[0],
              timelineStart,
              timelineEnd,
            );
            return (
              <Box
                style={{
                  position: 'absolute',
                  left: `${todayPos}%`,
                  top: -6,
                  width: 2,
                  height: 16,
                  backgroundColor: 'var(--mantine-color-orange-5)',
                  borderRadius: 1,
                }}
              />
            );
          })()}
        </Box>
      </Box>

      {/* ── Vertical card list (shown on mobile, also on desktop below Gantt) ── */}
      <Stack gap="xs">
        {milestones.map((ms, idx) => {
          const color = getStatusColor(ms.status);
          return (
            <Paper
              key={ms.id}
              withBorder
              p="sm"
              radius="md"
              style={{
                borderLeft: `3px solid var(--mantine-color-${color}-5)`,
                opacity: ms.status === 'Completed' ? 0.85 : 1,
              }}
            >
              <Group justify="space-between" wrap="nowrap" gap="xs">
                <Group gap="xs" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                  <Text size="xs" fw={700} c="dimmed" style={{ minWidth: 20 }}>
                    {idx + 1}.
                  </Text>
                  <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                    <Text size="sm" fw={600} truncate>
                      {ms.milestone_name}
                    </Text>
                    {ms.description && (
                      <Text size="xs" c="dimmed" lineClamp={1}>
                        {ms.description}
                      </Text>
                    )}
                  </Stack>
                </Group>

                <Group gap="xs" wrap="nowrap">
                  {ms.target_date && (
                    <Stack gap={0} align="flex-end">
                      <Text size="10px" c="dimmed">
                        Target
                      </Text>
                      <Text size="xs" fw={600}>
                        {formatDateShort(ms.target_date)}
                      </Text>
                    </Stack>
                  )}
                  <ThemeIcon
                    size="sm"
                    color={color}
                    variant={ms.status === 'Completed' ? 'filled' : 'light'}
                    radius="xl"
                  >
                    {getStatusIcon(ms.status)}
                  </ThemeIcon>
                </Group>
              </Group>

              {/* Progress fill */}
              {ms.completion_percentage > 0 && (
                <Box
                  mt={6}
                  style={{
                    height: 3,
                    backgroundColor: 'var(--mantine-color-gray-2)',
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    style={{
                      height: '100%',
                      width: `${ms.completion_percentage}%`,
                      backgroundColor: `var(--mantine-color-${color}-5)`,
                      borderRadius: 2,
                      transition: 'width 0.6s ease',
                    }}
                  />
                </Box>
              )}
            </Paper>
          );
        })}
      </Stack>

      {/* Legend */}
      <Group gap="md" justify="center">
        {[
          { color: 'green', label: 'Completed' },
          { color: 'blue', label: 'In Progress' },
          { color: 'yellow', label: 'At Risk' },
          { color: 'red', label: 'Delayed' },
          { color: 'gray', label: 'Not Started' },
        ].map(({ color, label }) => (
          <Group key={label} gap={4}>
            <Box
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: `var(--mantine-color-${color}-5)`,
              }}
            />
            <Text size="xs" c="dimmed">
              {label}
            </Text>
          </Group>
        ))}
        <Group gap={4}>
          <Box
            style={{
              width: 2,
              height: 12,
              backgroundColor: 'var(--mantine-color-orange-5)',
              borderRadius: 1,
            }}
          />
          <Text size="xs" c="dimmed">
            Today
          </Text>
        </Group>
      </Group>
    </Stack>
  );
}
