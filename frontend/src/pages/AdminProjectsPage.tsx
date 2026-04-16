// ============================================
// AdminProjectsPage — Roadmap & Project Lifecycle Management
// ============================================
// Internal administrative view for managing projects.
// Features: List, Create, Edit, Move Phase, View Details.
// ST-27.4: Project in-charge support.
// ST-27.8: Link to Project Detail Page.
// ============================================

import React, { useState } from 'react';
import {
  Container,
  Group,
  Stack,
  Text,
  Title,
  Button,
  ActionIcon,
  Table,
  Badge,
  Menu,
  Box,
  rem,
  SegmentedControl,
  Paper,
  Tooltip,
  Loader,
} from '@mantine/core';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  IconPlus,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconExternalLink,
  IconArrowRight,
  IconTrophy,
  IconEye,
  IconUser,
} from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  updateProjectPhase,
  ProjectPhase,
  RoadmapProject,
  CreateProjectPayload,
} from '../lib/api-projects';
import { queryClient } from '../lib/api';
import { notifications } from '@mantine/notifications';
import { ProjectFormModal } from '../components/roadmap/ProjectFormModal';
import { formatCurrency, formatDateShort } from '../lib/format-utils';
import { useTenant } from '../lib/tenant-context';

export function AdminProjectsPage() {
  const { tenant } = useTenant();
  const currency = tenant?.currency || 'INR';
  const navigate = useNavigate();
  const [phase, setPhase] = useState<ProjectPhase | 'all'>('all');
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedProject, setSelectedProject] = useState<RoadmapProject | null>(null);

  // ─── Queries ──────────────────────────────────────────

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects', phase],
    queryFn: () => getProjects(phase === 'all' ? undefined : phase),
  });

  // ─── Mutations ────────────────────────────────────────

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setModalOpened(false);
      setSelectedProject(null);
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
    mutationFn: createProject,
    ...mutationOptions,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<CreateProjectPayload>) =>
      updateProject(selectedProject?.id || '', payload),
    ...mutationOptions,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    ...mutationOptions,
  });

  const phaseMutation = useMutation({
    mutationFn: ({ id, newPhase }: { id: string; newPhase: ProjectPhase }) =>
      updateProjectPhase(id, newPhase),
    ...mutationOptions,
  });

  // ─── Handlers ─────────────────────────────────────────

  const handleCreateClick = () => {
    setSelectedProject(null);
    setModalOpened(true);
  };

  const handleEditClick = (project: RoadmapProject) => {
    setSelectedProject(project);
    setModalOpened(true);
  };

  const handleDeleteClick = (id: string) => {
    if (confirm('Are you sure you want to delete this project roadmap entry?')) {
      deleteMutation.mutate(id);
    }
  };

  const handlePhaseChange = (id: string, newPhase: ProjectPhase) => {
    phaseMutation.mutate({ id, newPhase });
  };

  const handleSubmit = (payload: CreateProjectPayload) => {
    if (selectedProject) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleViewDetails = (id: string) => {
    navigate(`/admin/projects/${id}`);
  };

  // ─── UI ───────────────────────────────────────────────

  return (
    <Container size="xl" py="md">
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between">
          <Stack gap={0}>
            <Title order={1} fw={800}>
              Project Roadmap
            </Title>
            <Text c="dimmed" size="sm">
              Manage mosque infrastructure projects and capital campaigns
            </Text>
          </Stack>
          <Group>
            <Button
              variant="outline"
              leftSection={<IconExternalLink size={16} />}
              component={Link}
              to="/roadmap"
              target="_blank"
            >
              Public Roadmap
            </Button>
            <Button leftSection={<IconPlus size={16} />} onClick={handleCreateClick}>
              Initiate Project
            </Button>
          </Group>
        </Group>

        {/* Phase Filter & Stats Toggle */}
        <Paper withBorder p="xs" radius="md">
          <Group justify="space-between">
            <SegmentedControl
              value={phase}
              onChange={(v) => setPhase(v as 'all' | 'Future' | 'Present' | 'Past')}
              data={[
                { label: 'All Projects', value: 'all' },
                { label: 'Planning', value: 'Future' },
                { label: 'Active', value: 'Present' },
                { label: 'Completed', value: 'Past' },
              ]}
              color="green"
            />
            <Text size="xs" c="dimmed" fw={500}>
              Showing {projects.length} entries
            </Text>
          </Group>
        </Paper>

        {/* Projects Table */}
        <Box pos="relative">
          <Table.ScrollContainer minWidth={800}>
            <Table verticalSpacing="sm" highlightOnHover striped withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Project Name</Table.Th>
                  <Table.Th>Phase</Table.Th>
                  <Table.Th>Progress</Table.Th>
                  <Table.Th>Budget / Spent</Table.Th>
                  <Table.Th>Project In-Charge</Table.Th>
                  <Table.Th>Target Date</Table.Th>
                  <Table.Th ta="right">Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {projects.map((project) => {
                  const budget = project.estimated_budget
                    ? parseFloat(project.estimated_budget)
                    : 0;
                  const spent = project.actual_spend ? parseFloat(project.actual_spend) : 0;

                  return (
                    <Table.Tr key={project.id}>
                      <Table.Td>
                        <Stack gap={2}>
                          <Group gap="xs">
                            <Text fw={700} c="green.9">
                              {project.project_name}
                            </Text>
                            <ActionIcon
                              variant="subtle"
                              size="xs"
                              color="blue"
                              onClick={() => handleViewDetails(project.id)}
                            >
                              <IconEye size={12} />
                            </ActionIcon>
                          </Group>
                          <Text size="11px" c="dimmed" lineClamp={1}>
                            {project.description || 'No description'}
                          </Text>
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={
                            project.phase === 'Present'
                              ? 'blue'
                              : project.phase === 'Past'
                                ? 'gray'
                                : 'teal'
                          }
                          variant="light"
                          size="sm"
                        >
                          {project.phase}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <Text
                            size="sm"
                            fw={700}
                            c={project.completion_percentage === 100 ? 'green' : 'blue'}
                          >
                            {project.completion_percentage}%
                          </Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Stack gap={0}>
                          <Text size="sm" fw={500}>
                            {budget > 0 ? formatCurrency(budget, currency) : '—'}
                          </Text>
                          <Text size="xs" c="dimmed">
                            Spent: {spent > 0 ? formatCurrency(spent, currency) : '—'}
                          </Text>
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Group gap={6} wrap="nowrap">
                          <IconUser size={14} color="var(--mantine-color-dimmed)" />
                          <Text size="sm" truncate style={{ maxWidth: 150 }}>
                            {project.incharge_name || '—'}
                          </Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{formatDateShort(project.target_end_date)}</Text>
                      </Table.Td>
                      <Table.Td ta="right">
                        <Group gap={4} justify="flex-end">
                          <Tooltip label="View Project Details / Milestones">
                            <Button
                              variant="subtle"
                              size="compact-xs"
                              onClick={() => handleViewDetails(project.id)}
                              leftSection={<IconTrophy size={14} />}
                            >
                              Details
                            </Button>
                          </Tooltip>

                          <Menu shadow="md" width={200} position="bottom-end">
                            <Menu.Target>
                              <ActionIcon variant="subtle" color="gray">
                                <IconDotsVertical size={16} />
                              </ActionIcon>
                            </Menu.Target>

                            <Menu.Dropdown>
                              <Menu.Label>Manage Lifecycle</Menu.Label>
                              <Menu.Item
                                leftSection={
                                  <IconEye style={{ width: rem(14), height: rem(14) }} />
                                }
                                onClick={() => handleViewDetails(project.id)}
                              >
                                View Milestones
                              </Menu.Item>
                              <Menu.Item
                                leftSection={
                                  <IconEdit style={{ width: rem(14), height: rem(14) }} />
                                }
                                onClick={() => handleEditClick(project)}
                              >
                                Edit Metadata
                              </Menu.Item>

                              <Menu.Divider />
                              <Menu.Label>Transition Phase</Menu.Label>
                              {project.phase !== 'Future' && (
                                <Menu.Item
                                  leftSection={
                                    <IconArrowRight style={{ width: rem(14), height: rem(14) }} />
                                  }
                                  onClick={() => handlePhaseChange(project.id, 'Future')}
                                >
                                  Move to Planning
                                </Menu.Item>
                              )}
                              {project.phase !== 'Present' && (
                                <Menu.Item
                                  leftSection={
                                    <IconArrowRight style={{ width: rem(14), height: rem(14) }} />
                                  }
                                  onClick={() => handlePhaseChange(project.id, 'Present')}
                                >
                                  Move to Active
                                </Menu.Item>
                              )}
                              {project.phase !== 'Past' && (
                                <Menu.Item
                                  leftSection={
                                    <IconTrophy style={{ width: rem(14), height: rem(14) }} />
                                  }
                                  onClick={() => handlePhaseChange(project.id, 'Past')}
                                >
                                  Mark Completed
                                </Menu.Item>
                              )}

                              <Menu.Divider />
                              <Menu.Item
                                color="red"
                                leftSection={
                                  <IconTrash style={{ width: rem(14), height: rem(14) }} />
                                }
                                onClick={() => handleDeleteClick(project.id)}
                              >
                                Delete Entry
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>

          {projects.length === 0 && !isLoading && (
            <Paper withBorder p="xl" mt="md" radius="md">
              <Stack align="center" gap="sm">
                <IconTrophy size={48} color="var(--mantine-color-gray-3)" />
                <Text fw={700} c="dimmed">
                  No projects found for the selected phase.
                </Text>
                <Button variant="light" onClick={handleCreateClick}>
                  Initiate Your First Project
                </Button>
              </Stack>
            </Paper>
          )}

          {isLoading && (
            <Group justify="center" p="xl">
              <Loader />
            </Group>
          )}
        </Box>

        {/* Create/Edit Modal */}
        <ProjectFormModal
          opened={modalOpened}
          onClose={() => setModalOpened(false)}
          project={selectedProject}
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </Stack>
    </Container>
  );
}
