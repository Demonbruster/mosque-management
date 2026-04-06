// ============================================
// ProjectFormModal — Reusable Component (ST-26.8)
// ============================================
// Modal form for creating or editing a roadmap project.
// Supports both create (no project prop) and edit modes.
// ============================================

import {
  Modal,
  TextInput,
  Textarea,
  Select,
  NumberInput,
  Stack,
  Button,
  Group,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useEffect } from 'react';
import type { RoadmapProject, ProjectPhase } from '../../lib/api-projects';

export interface ProjectFormValues {
  project_name: string;
  description: string;
  phase: ProjectPhase;
  estimated_budget: string;
  actual_spend: string;
  completion_percentage: number;
  start_date: Date | null;
  target_end_date: Date | null;
  notes: string;
}

interface ProjectFormModalProps {
  opened: boolean;
  onClose: () => void;
  /** If provided, form enters edit mode */
  project?: RoadmapProject | null;
  /** Called on successful form submission */
  onSubmit: (values: ProjectFormValues) => void;
  /** Whether the submit action is loading */
  isLoading?: boolean;
}

function toDate(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

export function ProjectFormModal({
  opened,
  onClose,
  project,
  onSubmit,
  isLoading = false,
}: ProjectFormModalProps) {
  const isEdit = !!project;

  const form = useForm<ProjectFormValues>({
    initialValues: {
      project_name: '',
      description: '',
      phase: 'Future',
      estimated_budget: '',
      actual_spend: '',
      completion_percentage: 0,
      start_date: null,
      target_end_date: null,
      notes: '',
    },
    validate: {
      project_name: (val) => (val.trim() ? null : 'Project name is required'),
      completion_percentage: (val) => (val >= 0 && val <= 100 ? null : 'Must be 0–100'),
    },
  });

  // Pre-fill form when in edit mode
  useEffect(() => {
    if (project) {
      form.setValues({
        project_name: project.project_name,
        description: project.description || '',
        phase: project.phase,
        estimated_budget: project.estimated_budget || '',
        actual_spend: project.actual_spend || '',
        completion_percentage: project.completion_percentage,
        start_date: toDate(project.start_date),
        target_end_date: toDate(project.target_end_date),
        notes: project.notes || '',
      });
    } else {
      form.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, opened]);

  const handleSubmit = (values: ProjectFormValues) => {
    onSubmit(values);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEdit ? 'Edit Project' : 'New Roadmap Project'}
      size="lg"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="sm">
          <TextInput
            label="Project Name"
            placeholder="e.g., New Masjid Wing Construction"
            withAsterisk
            {...form.getInputProps('project_name')}
          />

          <Textarea
            label="Description"
            placeholder="Describe the project vision and scope…"
            autosize
            minRows={2}
            maxRows={5}
            {...form.getInputProps('description')}
          />

          <Group grow>
            <Select
              label="Phase"
              data={[
                { value: 'Past', label: '✅ Past (Completed)' },
                { value: 'Present', label: '🚀 Present (Active)' },
                { value: 'Future', label: '🌟 Future (Planned)' },
              ]}
              allowDeselect={false}
              {...form.getInputProps('phase')}
            />

            <NumberInput
              label="Completion %"
              min={0}
              max={100}
              suffix="%"
              {...form.getInputProps('completion_percentage')}
            />
          </Group>

          <Group grow>
            <TextInput
              label="Estimated Budget"
              placeholder="e.g., 500000"
              description="In INR"
              {...form.getInputProps('estimated_budget')}
            />
            <TextInput
              label="Actual Spend"
              placeholder="e.g., 150000"
              description="In INR"
              {...form.getInputProps('actual_spend')}
            />
          </Group>

          <Group grow>
            <DateInput
              label="Start Date"
              placeholder="Select start date"
              clearable
              valueFormat="DD MMM YYYY"
              {...form.getInputProps('start_date')}
            />
            <DateInput
              label="Target End Date"
              placeholder="Select target date"
              clearable
              valueFormat="DD MMM YYYY"
              {...form.getInputProps('target_end_date')}
            />
          </Group>

          <Textarea
            label="Notes"
            placeholder="Any additional notes…"
            autosize
            minRows={2}
            {...form.getInputProps('notes')}
          />

          <Button type="submit" loading={isLoading} mt="md" fullWidth>
            {isEdit ? 'Save Changes' : 'Create Project'}
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
