// ============================================
// MilestoneFormModal — Reusable Component (ST-27.6)
// ============================================
// Modal form for creating or editing a milestone.
// Handles both create and edit modes via optional milestone prop.
// ============================================

import {
  Modal,
  TextInput,
  Textarea,
  NumberInput,
  Select,
  Stack,
  Button,
  Group,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useEffect } from 'react';
import type {
  ProjectMilestone,
  MilestoneStatus,
  CreateMilestonePayload,
} from '../../lib/api-projects';

export interface MilestoneFormValues {
  milestone_name: string;
  description: string;
  status: MilestoneStatus;
  completion_percentage: number;
  target_date: Date | null;
  completion_date: Date | null;
}

interface MilestoneFormModalProps {
  opened: boolean;
  onClose: () => void;
  milestone?: ProjectMilestone | null;
  onSubmit: (payload: CreateMilestonePayload) => void;
  isLoading?: boolean;
}

function toDate(str: string | null | undefined): Date | null {
  if (!str) return null;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

export function MilestoneFormModal({
  opened,
  onClose,
  milestone,
  onSubmit,
  isLoading = false,
}: MilestoneFormModalProps) {
  const isEdit = !!milestone;

  const form = useForm<MilestoneFormValues>({
    initialValues: {
      milestone_name: '',
      description: '',
      status: 'Not_Started',
      completion_percentage: 0,
      target_date: null,
      completion_date: null,
    },
    validate: {
      milestone_name: (v) => (v.trim() ? null : 'Milestone name is required'),
      completion_percentage: (v) => (v >= 0 && v <= 100 ? null : 'Must be 0–100'),
    },
  });

  useEffect(() => {
    if (milestone) {
      form.setValues({
        milestone_name: milestone.milestone_name,
        description: milestone.description ?? '',
        status: milestone.status as MilestoneStatus,
        completion_percentage: milestone.completion_percentage,
        target_date: toDate(milestone.target_date),
        completion_date: toDate(milestone.completion_date),
      });
    } else {
      form.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [milestone, opened]);

  const handleSubmit = (values: MilestoneFormValues) => {
    const payload: CreateMilestonePayload = {
      milestone_name: values.milestone_name.trim(),
      description: values.description || undefined,
      status: values.status,
      completion_percentage: values.completion_percentage,
      target_date: values.target_date ? values.target_date.toISOString().split('T')[0] : undefined,
      completion_date: values.completion_date
        ? values.completion_date.toISOString().split('T')[0]
        : undefined,
    };
    onSubmit(payload);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEdit ? 'Edit Milestone' : 'Add Milestone'}
      size="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="sm">
          <TextInput
            label="Milestone Name"
            placeholder="e.g., Foundation Complete"
            withAsterisk
            {...form.getInputProps('milestone_name')}
          />

          <Textarea
            label="Description"
            placeholder="Describe what this milestone represents…"
            autosize
            minRows={2}
            maxRows={4}
            {...form.getInputProps('description')}
          />

          <Group grow>
            <Select
              label="Status"
              allowDeselect={false}
              data={[
                { value: 'Not_Started', label: '○ Not Started' },
                { value: 'In_Progress', label: '● In Progress' },
                { value: 'Completed', label: '✓ Completed' },
                { value: 'Delayed', label: '⚠ Delayed' },
              ]}
              {...form.getInputProps('status')}
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
            <DateInput
              label="Target Date"
              placeholder="Select target date"
              clearable
              valueFormat="DD MMM YYYY"
              {...form.getInputProps('target_date')}
            />
            <DateInput
              label="Completion Date"
              placeholder="When completed"
              clearable
              valueFormat="DD MMM YYYY"
              {...form.getInputProps('completion_date')}
            />
          </Group>

          <Button type="submit" loading={isLoading} mt="xs" fullWidth>
            {isEdit ? 'Save Changes' : 'Add Milestone'}
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
