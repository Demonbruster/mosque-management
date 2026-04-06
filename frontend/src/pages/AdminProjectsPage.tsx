// ============================================
// Admin Projects Page — TASK-026  (ST-26.8)
// ============================================
// Admin-only CRUD interface for managing roadmap projects.
// Supports create, edit, phase change, and delete.
// ============================================

import { useState } from 'react';
import {
  Container,
  Title,
  Group,
  Button,
  Table,
  Badge,
  ActionIcon,
  Menu,
  Loader,
  Text,
  Select,
  Stack,
  Progress,
} from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconArrowRight,
  IconDotsVertical,
} from '@tabler/icons-react';
import {
  getProjects,
  createProject,
  updateProject,
  updateProjectPhase,
  deleteProject,
} from '../lib/api-projects';
import type { RoadmapProject, ProjectPhase, CreateProjectPayload } from '../lib/api-projects';
import { ProjectFormModal } from '../components/roadmap/ProjectFormModal';
import type { ProjectFormValues } from '../components/roadmap/ProjectFormModal';

function formatINR(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value.toLocaleString('en-IN')}`;
}

function getPhaseColor(phase: ProjectPhase): string {
  switch (phase) {
    case 'Past':
      return 'green';
    case 'Present':
      return 'blue';
    case 'Future':
      return 'orange';
    default:
      return 'gray';
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function AdminProjectsPage() {
  const queryClient = useQueryClient();
  const [phaseFilter, setPhaseFilter] = useState<string | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [editingProject, setEditingProject] = useState<RoadmapProject | null>(null);

  // ── Data fetching ──
  const { data: projects, isLoading } = useQuery({
    queryKey: ['admin-projects', phaseFilter],
    queryFn: () => getProjects(phaseFilter as ProjectPhase | undefined),
  });

  // ── Mutations ──
  const createMutation = useMutation({
    mutationFn: (payload: CreateProjectPayload) => createProject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      notifications.show({
        title: 'Success',
        message: 'Project created.',
        color: 'green',
      });
      closeModal();
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to create project.',
        color: 'red',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateProjectPayload> }) =>
      updateProject(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      notifications.show({
        title: 'Updated',
        message: 'Project updated.',
        color: 'green',
      });
      closeModal();
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to update project.',
        color: 'red',
      });
    },
  });

  const phaseMutation = useMutation({
    mutationFn: ({ id, phase }: { id: string; phase: ProjectPhase }) =>
      updateProjectPhase(id, phase),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      notifications.show({
        title: 'Phase Changed',
        message: 'Project phase updated.',
        color: 'blue',
      });
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to change phase.',
        color: 'red',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      notifications.show({
        title: 'Deleted',
        message: 'Project removed.',
        color: 'red',
      });
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete project.',
        color: 'red',
      });
    },
  });

  // ── Helpers ──
  const closeModal = () => {
    setModalOpened(false);
    setEditingProject(null);
  };

  const openCreate = () => {
    setEditingProject(null);
    setModalOpened(true);
  };

  const openEdit = (project: RoadmapProject) => {
    setEditingProject(project);
    setModalOpened(true);
  };

  const handleDelete = (project: RoadmapProject) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${project.project_name}"? This action cannot be undone.`,
    );
    if (confirmed) {
      deleteMutation.mutate(project.id);
    }
  };

  const handleFormSubmit = (values: ProjectFormValues) => {
    // Convert Date objects to ISO strings
    const payload: CreateProjectPayload = {
      project_name: values.project_name,
      description: values.description || undefined,
      phase: values.phase,
      estimated_budget: values.estimated_budget || undefined,
      actual_spend: values.actual_spend || undefined,
      completion_percentage: values.completion_percentage,
      start_date: values.start_date ? values.start_date.toISOString().split('T')[0] : undefined,
      target_end_date: values.target_end_date
        ? values.target_end_date.toISOString().split('T')[0]
        : undefined,
      notes: values.notes || undefined,
    };

    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Stack gap={2}>
          <Title order={2}>Roadmap Project Manager</Title>
          <Text size="sm" c="dimmed">
            Manage mosque development projects across Past, Present, and Future phases.
          </Text>
        </Stack>
        <Group>
          <Select
            placeholder="Filter by Phase"
            data={[
              { value: 'Past', label: '✅ Past' },
              { value: 'Present', label: '🚀 Present' },
              { value: 'Future', label: '🌟 Future' },
            ]}
            value={phaseFilter}
            onChange={setPhaseFilter}
            clearable
            w={160}
          />
          <Button leftSection={<IconPlus size={16} />} onClick={openCreate}>
            New Project
          </Button>
        </Group>
      </Group>

      {isLoading ? (
        <Loader />
      ) : (
        <Table stickyHeader verticalSpacing="md" striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Project Name</Table.Th>
              <Table.Th>Phase</Table.Th>
              <Table.Th>Budget</Table.Th>
              <Table.Th>Spent</Table.Th>
              <Table.Th>Completion</Table.Th>
              <Table.Th>Dates</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {projects?.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={7} align="center">
                  <Text c="dimmed" py="xl">
                    No projects found. Create your first project to get started.
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              projects?.map((project: RoadmapProject) => {
                const budget = parseFloat(project.estimated_budget || '0');
                const spent = parseFloat(project.actual_spend || '0');

                return (
                  <Table.Tr key={project.id}>
                    <Table.Td>
                      <Text fw={600} size="sm">
                        {project.project_name}
                      </Text>
                      {project.description && (
                        <Text size="xs" c="dimmed" lineClamp={1}>
                          {project.description}
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Badge color={getPhaseColor(project.phase)} variant="light">
                        {project.phase}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{budget > 0 ? formatINR(budget) : '—'}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{spent > 0 ? formatINR(spent) : '—'}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Progress
                          value={project.completion_percentage}
                          color={getPhaseColor(project.phase)}
                          size="sm"
                          w={60}
                          radius="xl"
                        />
                        <Text size="xs" fw={600}>
                          {project.completion_percentage}%
                        </Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" c="dimmed">
                        {formatDate(project.start_date)} → {formatDate(project.target_end_date)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={4}>
                        <ActionIcon
                          variant="light"
                          color="blue"
                          size="sm"
                          onClick={() => openEdit(project)}
                        >
                          <IconEdit size={14} />
                        </ActionIcon>

                        {/* Phase transition menu */}
                        <Menu shadow="md" width={180} position="bottom-end">
                          <Menu.Target>
                            <ActionIcon variant="light" color="gray" size="sm">
                              <IconDotsVertical size={14} />
                            </ActionIcon>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Label>Move to Phase</Menu.Label>
                            {(['Past', 'Present', 'Future'] as ProjectPhase[])
                              .filter((p) => p !== project.phase)
                              .map((targetPhase) => (
                                <Menu.Item
                                  key={targetPhase}
                                  leftSection={<IconArrowRight size={14} />}
                                  onClick={() =>
                                    phaseMutation.mutate({
                                      id: project.id,
                                      phase: targetPhase,
                                    })
                                  }
                                >
                                  Move to {targetPhase}
                                </Menu.Item>
                              ))}
                            <Menu.Divider />
                            <Menu.Item
                              color="red"
                              leftSection={<IconTrash size={14} />}
                              onClick={() => handleDelete(project)}
                            >
                              Delete
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                );
              })
            )}
          </Table.Tbody>
        </Table>
      )}

      {/* Create / Edit Modal */}
      <ProjectFormModal
        opened={modalOpened}
        onClose={closeModal}
        project={editingProject}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </Container>
  );
}
