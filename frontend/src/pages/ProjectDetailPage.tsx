// ============================================
// ProjectDetailPage — Admin Project View (TASK-027)
// ============================================
// Detailed view for managing a project's milestones,
// tracking progress, and assigning project in-charge.
// ============================================

import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Container,
  Group,
  Stack,
  Text,
  Title,
  Button,
  Breadcrumbs,
  Anchor,
  Paper,
  Grid,
  Loader,
  Badge,
  Divider,
  Tabs,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconArrowLeft,
  IconPlus,
  IconTrophy,
  IconUser,
  IconTimeline,
  IconListCheck,
  IconCalendarEvent,
} from '@tabler/icons-react';
import {
  getProjectById,
  getMilestones,
  createMilestone,
  updateMilestone,
  reorderMilestones,
  deleteMilestone,
  ProjectMilestone,
  CreateMilestonePayload,
} from '../lib/api-projects';
import { queryClient } from '../lib/api';
import { ProjectInchargeDisplay } from '../components/roadmap/ProjectInchargeDisplay';
import { MilestoneTimeline } from '../components/roadmap/MilestoneTimeline';
import { MilestoneFormModal } from '../components/roadmap/MilestoneFormModal';
import { MilestoneSortableList } from '../components/roadmap/MilestoneSortableList';
import { ProjectFinancialsTab } from '../components/roadmap/ProjectFinancialsTab';
import { formatDateMedium } from '../lib/format-utils';

export function ProjectDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<ProjectMilestone | null>(null);

  // ─── Queries ──────────────────────────────────────────

  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => getProjectById(id),
    enabled: !!id,
  });

  const { data: milestones = [] } = useQuery({
    queryKey: ['milestones', id],
    queryFn: () => getMilestones(id),
    enabled: !!id,
  });

  // ─── Mutations ────────────────────────────────────────

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['milestones', id] });
      setModalOpened(false);
      setSelectedMilestone(null);
    },
    onError: (err: { response?: { data?: { error?: string } } }) => {
      notifications.show({
        title: 'Error',
        message: err.response?.data?.error || 'Operation failed',
        color: 'red',
      });
    },
  };

  const createMutation = useMutation({
    mutationFn: (payload: CreateMilestonePayload) => createMilestone(id, payload),
    ...mutationOptions,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<CreateMilestonePayload>) =>
      updateMilestone(id, selectedMilestone?.id || '', payload),
    ...mutationOptions,
  });

  const deleteMutation = useMutation({
    mutationFn: (milestoneId: string) => deleteMilestone(id, milestoneId),
    ...mutationOptions,
  });

  const reorderMutation = useMutation({
    mutationFn: (msIds: string[]) => reorderMilestones(id, msIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones', id] });
    },
  });

  // ─── Handlers ─────────────────────────────────────────

  const handleCreateClick = () => {
    setSelectedMilestone(null);
    setModalOpened(true);
  };

  const handleEditClick = (ms: ProjectMilestone) => {
    setSelectedMilestone(ms);
    setModalOpened(true);
  };

  const handleDeleteClick = (milestoneId: string) => {
    if (confirm('Are you sure you want to delete this milestone?')) {
      deleteMutation.mutate(milestoneId);
    }
  };

  const handleSubmit = (payload: CreateMilestonePayload) => {
    if (selectedMilestone) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  // ─── UI ───────────────────────────────────────────────

  if (isProjectLoading) {
    return (
      <Container size="lg" py="xl">
        <Loader size="md" />
      </Container>
    );
  }

  if (!project) {
    return (
      <Container size="lg" py="xl">
        <Text c="dimmed">Project not found</Text>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        {/* Navigation & Header */}
        <Stack gap="xs">
          <Breadcrumbs separator="→" mb="xs">
            <Anchor component={Link} to="/admin/projects" size="xs">
              Projects
            </Anchor>
            <Text size="xs" c="dimmed">
              Project Details
            </Text>
          </Breadcrumbs>

          <Group justify="space-between">
            <Stack gap={0}>
              <Title order={2} fw={800}>
                {project.project_name}
              </Title>
              <Text size="sm" c="dimmed">
                Phase: {project.phase} • {project.completion_percentage}% complete
              </Text>
            </Stack>
            <Group>
              <Button
                variant="light"
                leftSection={<IconArrowLeft size={16} />}
                component={Link}
                to="/admin/projects"
              >
                Back to List
              </Button>
              <Button leftSection={<IconPlus size={16} />} onClick={handleCreateClick}>
                Add Milestone
              </Button>
            </Group>
          </Group>
        </Stack>

        {/* Tabs for Overview & Financials */}
        <Tabs defaultValue="overview">
          <Tabs.List mb="md">
            <Tabs.Tab value="overview" leftSection={<IconTimeline size={16} />}>
              Overview & Milestones
            </Tabs.Tab>
            <Tabs.Tab value="financials" leftSection={<IconListCheck size={16} />}>
              Financials
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview">
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, md: 8 }}>
                <Stack gap="md">
                  {/* Gantt Timeline */}
                  <Paper withBorder p="lg" radius="md" shadow="sm">
                    <Group mb="lg" gap="xs">
                      <IconTimeline size={20} color="var(--mantine-color-blue-6)" />
                      <Title order={4}>Project Timeline</Title>
                    </Group>
                    <MilestoneTimeline
                      milestones={milestones}
                      startDate={project.start_date}
                      endDate={project.target_end_date}
                    />
                  </Paper>

                  {/* Milestone List */}
                  <Paper withBorder p="lg" radius="md" shadow="sm">
                    <Group mb="lg" justify="space-between">
                      <Group gap="xs">
                        <IconListCheck size={20} color="var(--mantine-color-teal-6)" />
                        <Title order={4}>Milestones & Tasks</Title>
                      </Group>
                    </Group>
                    <MilestoneSortableList
                      milestones={milestones}
                      onReorder={(ids) => reorderMutation.mutate(ids)}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteClick}
                    />
                  </Paper>
                </Stack>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 4 }}>
                <Stack gap="md">
                  {/* Project In-Charge */}
                  <Paper withBorder p="lg" radius="md" shadow="sm">
                    <Group mb="lg" gap="xs">
                      <IconUser size={20} color="var(--mantine-color-green-6)" />
                      <Title order={4}>Project In-Charge</Title>
                    </Group>
                    {project.incharge_name ? (
                      <ProjectInchargeDisplay
                        name={project.incharge_name}
                        phone={project.incharge_phone}
                        email={project.incharge_email}
                        variant="full"
                      />
                    ) : (
                      <Text size="sm" c="dimmed" fs="italic">
                        No person assigned as in-charge.
                      </Text>
                    )}
                  </Paper>

                  {/* Quick Details */}
                  <Paper withBorder p="lg" radius="md" shadow="sm">
                    <Group mb="lg" gap="xs">
                      <IconCalendarEvent size={20} color="var(--mantine-color-orange-6)" />
                      <Title order={4}>Key Dates</Title>
                    </Group>
                    <Stack gap="xs">
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Start Date
                        </Text>
                        <Text size="sm" fw={600}>
                          {formatDateMedium(project.start_date)}
                        </Text>
                      </Group>
                      <Divider variant="dashed" />
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Target End
                        </Text>
                        <Text size="sm" fw={600} color="red">
                          {formatDateMedium(project.target_end_date)}
                        </Text>
                      </Group>
                      <Divider variant="dashed" />
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Current Progress
                        </Text>
                        <Badge color="blue" variant="light">
                          {project.completion_percentage}%
                        </Badge>
                      </Group>
                    </Stack>
                  </Paper>

                  {/* Project Notes */}
                  <Paper withBorder p="lg" radius="md" shadow="sm">
                    <Group mb="lg" gap="xs">
                      <IconTrophy size={20} color="var(--mantine-color-yellow-6)" />
                      <Title order={4}>Notes</Title>
                    </Group>
                    <Text size="sm">{project.notes || 'No project notes available.'}</Text>
                  </Paper>
                </Stack>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>

          <Tabs.Panel value="financials">
            <ProjectFinancialsTab projectId={id} />
          </Tabs.Panel>
        </Tabs>

        {/* Milestone Modal */}
        <MilestoneFormModal
          opened={modalOpened}
          onClose={() => setModalOpened(false)}
          milestone={selectedMilestone}
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </Stack>
    </Container>
  );
}
