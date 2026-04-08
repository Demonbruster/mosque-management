// ============================================
// ProjectCard — Public Roadmap Item (TASK-026 + TASK-027)
// ============================================

import React from 'react';
import { Paper, Text, Title, Group, Stack, Badge, ThemeIcon } from '@mantine/core';
import { IconCalendar } from '@tabler/icons-react';
import type { RoadmapProject } from '../../lib/api-projects';
import { ProjectProgressBar } from './ProjectProgressBar';
import { GoalThermometer } from './GoalThermometer';
import { formatINR, formatDateShort } from '../../lib/format-utils';
import { ProjectInchargeDisplay } from './ProjectInchargeDisplay';

interface ProjectCardProps {
  project: RoadmapProject;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const budget = project.estimated_budget ? parseFloat(project.estimated_budget) : 0;
  const spent = project.actual_spend ? parseFloat(project.actual_spend) : 0;

  return (
    <Paper withBorder p="lg" radius="md" shadow="sm" mb="md">
      <Group justify="space-between" align="flex-start" mb="md">
        <Stack gap={4} style={{ flex: 1 }}>
          <Title order={3} fw={800} c="green.9">
            {project.project_name}
          </Title>
          <Text size="sm" c="dimmed" lineClamp={2}>
            {project.description}
          </Text>
        </Stack>

        <Group gap="xs">
          {project.phase === 'Present' && (
            <Badge color="blue" variant="filled">
              Active
            </Badge>
          )}
          {project.phase === 'Past' && (
            <Badge color="gray" variant="light">
              Completed
            </Badge>
          )}
          {project.phase === 'Future' && (
            <Badge color="teal" variant="outline">
              Planned
            </Badge>
          )}
        </Group>
      </Group>

      <Stack gap="xl">
        {/* Progress & Milestones (ST-27.5, ST-27.7) */}
        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="xs" fw={700} tt="uppercase" c="dimmed">
              Timeline & Progress
            </Text>
            <Text size="xs" fw={700} c="green.8">
              {project.completion_percentage}% COMPLETE
            </Text>
          </Group>
          <ProjectProgressBar
            percentage={project.completion_percentage}
            milestones={project.milestones}
          />
        </Stack>

        {/* Financial Progress (if budget exists) */}
        {budget > 0 && <GoalThermometer target={budget} raised={spent} />}

        {/* Footer Meta */}
        <Group
          justify="space-between"
          align="center"
          pt="md"
          style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}
        >
          <Group gap="lg">
            {/* ST-27.8: In-Charge Display */}
            <ProjectInchargeDisplay name={project.incharge_name} variant="compact" />

            <Group gap={6}>
              <ThemeIcon size="xs" color="gray" variant="light" radius="xl">
                <IconCalendar size={10} />
              </ThemeIcon>
              <Text size="xs" c="dimmed">
                {project.phase === 'Past' ? 'Finished ' : 'Target '}
                {formatDateShort(project.target_end_date)}
              </Text>
            </Group>
          </Group>

          <Group gap={4}>
            <Text size="xs" fw={700}>
              BUDGET: {formatINR(budget)}
            </Text>
          </Group>
        </Group>
      </Stack>
    </Paper>
  );
}
