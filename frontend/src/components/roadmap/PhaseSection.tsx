// ============================================
// PhaseSection — Reusable Component (ST-26.3)
// ============================================
// Renders a phase group (Past / Present / Future) with
// header, timeline connector, and project cards.
// ============================================

import { Box, Group, SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import type { ReactNode } from 'react';
import type { RoadmapProject } from '../../lib/api-projects';
import { ProjectCard } from './ProjectCard';

interface PhaseSectionProps {
  phase: 'Past' | 'Present' | 'Future';
  projects: RoadmapProject[];
  icon: ReactNode;
  color: string;
  title: string;
  subtitle: string;
}

export function PhaseSection({ phase, projects, icon, color, title, subtitle }: PhaseSectionProps) {
  if (projects.length === 0) return null;

  return (
    <Box id={`phase-${phase.toLowerCase()}`}>
      {/* Phase header */}
      <Group gap="sm" mb="md" align="center">
        <ThemeIcon size="xl" color={color} variant="light" radius="xl">
          {icon}
        </ThemeIcon>
        <Stack gap={2}>
          <Title order={3} c={color}>
            {title}
          </Title>
          <Text size="sm" c="dimmed">
            {subtitle}
          </Text>
        </Stack>
      </Group>

      {/* Project cards grid */}
      <SimpleGrid cols={{ base: 1, sm: phase === 'Present' ? 1 : 2 }} spacing="md">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </SimpleGrid>
    </Box>
  );
}
