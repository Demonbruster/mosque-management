// ============================================
// Public Roadmap Page — TASK-026  (ST-26.3, ST-26.6)
// ============================================
// Publicly accessible — no authentication required.
// Displays mosque development projects in a visual
// Past → Present → Future timeline layout.
//
// Features:
//   - Phase sections with icons and colour coding
//   - Goal thermometers for active projects
//   - Progress bars with milestone markers
//   - CTA buttons linking to donation flow
//   - Fully responsive (mobile-first)
// ============================================

import { useState } from 'react';
import {
  Container,
  Title,
  Text,
  Stack,
  Center,
  Loader,
  Alert,
  Group,
  Badge,
  Divider,
  Paper,
  SegmentedControl,
  Box,
} from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import {
  IconHistory,
  IconRocket,
  IconStars,
  IconAlertTriangle,
  IconBuildingCommunity,
} from '@tabler/icons-react';
import { getPublicRoadmap } from '../lib/api-projects';
import type { GroupedRoadmap } from '../lib/api-projects';
import { PhaseSection } from '../components/roadmap/PhaseSection';

type PhaseFilter = 'all' | 'Past' | 'Present' | 'Future';

export function PublicRoadmapPage() {
  const [filter, setFilter] = useState<PhaseFilter>('all');

  const {
    data: roadmap,
    isLoading,
    error,
  } = useQuery<GroupedRoadmap>({
    queryKey: ['public-roadmap'],
    queryFn: () => getPublicRoadmap(),
    staleTime: 5 * 60 * 1000,
  });

  const totalProjects =
    (roadmap?.past.length ?? 0) + (roadmap?.present.length ?? 0) + (roadmap?.future.length ?? 0);

  // ── Loading state ──
  if (isLoading) {
    return (
      <Center h="60vh">
        <Stack align="center" gap="md">
          <Loader color="green" size="lg" />
          <Text c="dimmed" size="sm">
            Loading roadmap…
          </Text>
        </Stack>
      </Center>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <Container size="sm" mt="xl">
        <Alert color="yellow" title="Roadmap Unavailable" icon={<IconAlertTriangle size={16} />}>
          The roadmap data is currently unavailable. Please check back later.
        </Alert>
      </Container>
    );
  }

  // ── Empty state ──
  if (totalProjects === 0) {
    return (
      <Container size="sm" py="xl">
        <Center mih="50vh">
          <Stack align="center" gap="md">
            <Text size="4rem">🕌</Text>
            <Title order={3} ta="center">
              Roadmap Coming Soon
            </Title>
            <Text c="dimmed" ta="center" maw={400}>
              Our mosque development roadmap is being prepared. Check back soon to see our past
              achievements, current projects, and future vision!
            </Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  return (
    <Container size="xl" py="md">
      <Stack gap="xl">
        {/* ── Header ── */}
        <Paper
          p="xl"
          radius="lg"
          style={{
            background:
              'linear-gradient(135deg, rgba(27,122,78,0.08) 0%, rgba(52,152,219,0.06) 50%, rgba(255,165,0,0.04) 100%)',
          }}
        >
          <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
            <Stack gap={4}>
              <Group gap="xs">
                <IconBuildingCommunity size={28} color="var(--mantine-color-green-7)" />
                <Title order={2} id="roadmap-title">
                  Mosque Development Roadmap
                </Title>
              </Group>
              <Text c="dimmed" size="sm" maw={500}>
                See our journey — from completed milestones to current projects and future
                aspirations. Your contributions make it all possible.
              </Text>
            </Stack>
            <Group gap="xs" wrap="wrap">
              <Badge color="green" variant="light" size="lg">
                {roadmap?.past.length ?? 0} Completed
              </Badge>
              <Badge color="blue" variant="light" size="lg">
                {roadmap?.present.length ?? 0} Active
              </Badge>
              <Badge color="orange" variant="light" size="lg">
                {roadmap?.future.length ?? 0} Planned
              </Badge>
            </Group>
          </Group>
        </Paper>

        {/* ── Phase filter ── */}
        <Group justify="center">
          <SegmentedControl
            id="phase-filter"
            value={filter}
            onChange={(val) => setFilter(val as PhaseFilter)}
            data={[
              { value: 'all', label: 'All Phases' },
              { value: 'Past', label: '✅ Past' },
              { value: 'Present', label: '🚀 Present' },
              { value: 'Future', label: '🌟 Future' },
            ]}
            radius="xl"
            size="sm"
          />
        </Group>

        {/* ── Timeline: Past ── */}
        {(filter === 'all' || filter === 'Past') && (
          <PhaseSection
            phase="Past"
            projects={roadmap?.past ?? []}
            icon={<IconHistory size={22} />}
            color="green"
            title="Completed Projects"
            subtitle="Alhamdulillah — milestones we've achieved together"
          />
        )}

        {filter === 'all' && (roadmap?.past.length ?? 0) > 0 && (
          <Box px="xl">
            <Divider
              size="sm"
              color="gray.3"
              label={
                <Badge color="gray" variant="light" size="sm">
                  ↓ Now ↓
                </Badge>
              }
              labelPosition="center"
            />
          </Box>
        )}

        {/* ── Timeline: Present ── */}
        {(filter === 'all' || filter === 'Present') && (
          <PhaseSection
            phase="Present"
            projects={roadmap?.present ?? []}
            icon={<IconRocket size={22} />}
            color="blue"
            title="Current Projects"
            subtitle="Projects actively being worked on — your support accelerates progress"
          />
        )}

        {filter === 'all' && (roadmap?.present.length ?? 0) > 0 && (
          <Box px="xl">
            <Divider
              size="sm"
              color="gray.3"
              label={
                <Badge color="gray" variant="light" size="sm">
                  ↓ Vision ↓
                </Badge>
              }
              labelPosition="center"
            />
          </Box>
        )}

        {/* ── Timeline: Future ── */}
        {(filter === 'all' || filter === 'Future') && (
          <PhaseSection
            phase="Future"
            projects={roadmap?.future ?? []}
            icon={<IconStars size={22} />}
            color="orange"
            title="Future Vision"
            subtitle="Aspirational projects awaiting community support"
          />
        )}

        {/* ── Footer ── */}
        <Divider />
        <Group
          id="roadmap-footer"
          justify="space-between"
          align="center"
          wrap="wrap"
          gap="xs"
          pb="md"
        >
          <Text size="xs" c="dimmed">
            Community roadmap — all figures reflect verified project data.
          </Text>
          <Badge variant="outline" color="gray" size="sm" radius="sm">
            Public Read-Only
          </Badge>
        </Group>
      </Stack>
    </Container>
  );
}
