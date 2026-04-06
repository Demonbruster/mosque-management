// ============================================
// ProjectCard — Reusable Component (ST-26.3)
// ============================================
// Renders a single roadmap project. Adapts its display
// based on the project phase (Past / Present / Future).
// ============================================

import { Card, Group, Stack, Text, Badge, Button, ThemeIcon, Divider } from '@mantine/core';
import { IconCheck, IconHeart, IconRocket, IconCalendar } from '@tabler/icons-react';
import type { RoadmapProject } from '../../lib/api-projects';
import { GoalThermometer } from './GoalThermometer';
import { ProjectProgressBar } from './ProjectProgressBar';

interface ProjectCardProps {
  project: RoadmapProject;
  phase: 'Past' | 'Present' | 'Future';
}

function formatINR(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value.toLocaleString('en-IN')}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  });
}

export function ProjectCard({ project, phase }: ProjectCardProps) {
  const budget = parseFloat(project.estimated_budget || '0');
  const spent = parseFloat(project.actual_spend || '0');

  // ── Past Phase — Completed ──
  if (phase === 'Past') {
    return (
      <Card
        id={`project-card-${project.id}`}
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
        style={{
          borderLeft: '4px solid var(--mantine-color-green-6)',
          opacity: 0.95,
        }}
      >
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="xs">
          <div style={{ flex: 1 }}>
            <Group gap="xs" mb={4}>
              <ThemeIcon size="sm" color="green" variant="filled" radius="xl">
                <IconCheck size={12} />
              </ThemeIcon>
              <Text fw={700} size="md">
                {project.project_name}
              </Text>
            </Group>
            {project.description && (
              <Text size="sm" c="dimmed" lineClamp={2} mb="xs">
                {project.description}
              </Text>
            )}
            <Group gap="lg" mt="xs">
              {budget > 0 && (
                <div>
                  <Text size="xs" c="dimmed">
                    Budget
                  </Text>
                  <Text size="sm" fw={600}>
                    {formatINR(budget)}
                  </Text>
                </div>
              )}
              {spent > 0 && (
                <div>
                  <Text size="xs" c="dimmed">
                    Spent
                  </Text>
                  <Text size="sm" fw={600}>
                    {formatINR(spent)}
                  </Text>
                </div>
              )}
              <div>
                <Text size="xs" c="dimmed">
                  Completed
                </Text>
                <Text size="sm" fw={600}>
                  {formatDate(project.target_end_date)}
                </Text>
              </div>
            </Group>
          </div>
          <Badge color="green" variant="light" size="lg" radius="sm">
            ✅ Completed
          </Badge>
        </Group>
      </Card>
    );
  }

  // ── Present Phase — Active with progress + thermometer ──
  if (phase === 'Present') {
    return (
      <Card
        id={`project-card-${project.id}`}
        shadow="md"
        padding="lg"
        radius="md"
        withBorder
        style={{
          borderLeft: '4px solid var(--mantine-color-blue-6)',
        }}
      >
        <Group justify="space-between" align="flex-start" wrap="nowrap" gap="md">
          <Stack gap="sm" style={{ flex: 1 }}>
            <Group gap="xs">
              <ThemeIcon size="sm" color="blue" variant="light" radius="xl">
                <IconRocket size={12} />
              </ThemeIcon>
              <Text fw={700} size="md">
                {project.project_name}
              </Text>
            </Group>

            {project.description && (
              <Text size="sm" c="dimmed" lineClamp={3}>
                {project.description}
              </Text>
            )}

            <ProjectProgressBar
              percentage={project.completion_percentage}
              milestones={[
                { label: 'Planning Done', at: 25 },
                { label: 'Halfway', at: 50 },
                { label: 'Almost There', at: 75 },
              ]}
              color="blue"
            />

            <Group gap="lg" mt={4}>
              {project.start_date && (
                <Group gap={4}>
                  <IconCalendar size={14} color="gray" />
                  <Text size="xs" c="dimmed">
                    Started {formatDate(project.start_date)}
                  </Text>
                </Group>
              )}
              {project.target_end_date && (
                <Group gap={4}>
                  <IconCalendar size={14} color="gray" />
                  <Text size="xs" c="dimmed">
                    Target {formatDate(project.target_end_date)}
                  </Text>
                </Group>
              )}
            </Group>

            <Divider my={4} />

            <Button
              variant="gradient"
              gradient={{ from: 'green', to: 'teal' }}
              size="sm"
              leftSection={<IconHeart size={16} />}
              component="a"
              href="/finance/new"
              fullWidth
            >
              Contribute to This Project
            </Button>
          </Stack>

          {/* Thermometer on the right */}
          {budget > 0 && (
            <GoalThermometer
              raised={spent}
              target={budget}
              label="Funds"
              color="#3498db"
              height={160}
            />
          )}
        </Group>
      </Card>
    );
  }

  // ── Future Phase — Aspirational ──
  return (
    <Card
      id={`project-card-${project.id}`}
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{
        borderLeft: '4px solid var(--mantine-color-orange-5)',
        backgroundImage: 'linear-gradient(135deg, rgba(255,165,0,0.03) 0%, transparent 100%)',
      }}
    >
      <Group gap="xs" mb="xs">
        <ThemeIcon size="sm" color="orange" variant="light" radius="xl">
          <IconRocket size={12} />
        </ThemeIcon>
        <Text fw={700} size="md">
          {project.project_name}
        </Text>
      </Group>

      {project.description && (
        <Text size="sm" c="dimmed" lineClamp={3} mb="sm">
          {project.description}
        </Text>
      )}

      {budget > 0 && (
        <Group gap="xs" mb="sm">
          <Text size="xs" c="dimmed">
            Estimated Budget:
          </Text>
          <Badge color="orange" variant="light" size="lg">
            {formatINR(budget)}
          </Badge>
        </Group>
      )}

      <Button
        variant="light"
        color="orange"
        size="sm"
        leftSection={<IconHeart size={16} />}
        component="a"
        href="/finance/new"
        fullWidth
      >
        Support This Vision
      </Button>
    </Card>
  );
}
