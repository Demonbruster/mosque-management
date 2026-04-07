// ============================================
// ProjectFormModal — Create/Edit Project (TASK-026 + TASK-027)
// ============================================

import React, { useEffect, useState } from 'react';
import { Modal, TextInput, Textarea, Select, Stack, Button, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import type { RoadmapProject, CreateProjectPayload } from '../../lib/api-projects';
import { getPersons, PersonSummary } from '../../lib/api-persons';
import { useQuery } from '@tanstack/react-query';

interface ProjectFormModalProps {
  opened: boolean;
  onClose: () => void;
  project?: RoadmapProject | null;
  onSubmit: (payload: CreateProjectPayload) => void;
  isLoading?: boolean;
}

export function ProjectFormModal({
  opened,
  onClose,
  project,
  onSubmit,
  isLoading = false,
}: ProjectFormModalProps) {
  const isEdit = !!project;
  const [searchTerm, setSearchTerm] = useState('');

  // ST-27.4: Fetch persons for in-charge dropdown
  const { data: persons = [] } = useQuery({
    queryKey: ['persons-search', searchTerm],
    queryFn: () => getPersons(searchTerm),
    enabled: opened,
  });

  const form = useForm<CreateProjectPayload>({
    initialValues: {
      project_name: '',
      description: '',
      phase: 'Future',
      estimated_budget: '',
      actual_spend: '',
      start_date: '',
      target_end_date: '',
      project_incharge: null,
      notes: '',
    },
    validate: {
      project_name: (v) => (v.trim() ? null : 'Project name is required'),
    },
  });

  useEffect(() => {
    if (project) {
      form.setValues({
        project_name: project.project_name,
        description: project.description || '',
        phase: project.phase,
        estimated_budget: project.estimated_budget || '',
        actual_spend: project.actual_spend || '',
        start_date: project.start_date || '',
        target_end_date: project.target_end_date || '',
        project_incharge: project.project_incharge,
        notes: project.notes || '',
      });
    } else {
      form.reset();
    }
  }, [project, opened, form]);

  const handleSubmit = (values: CreateProjectPayload) => {
    onSubmit({
      ...values,
      // Ensure empty strings are null for backend
      estimated_budget: values.estimated_budget || undefined,
      actual_spend: values.actual_spend || undefined,
      start_date: values.start_date || undefined,
      target_end_date: values.target_end_date || undefined,
    });
  };

  const personData = persons.map((p: PersonSummary) => ({
    value: p.id,
    label: `${p.first_name} ${p.last_name || ''} (${p.phone_number || 'No phone'})`,
  }));

  // If we are editing and have an incharge, but they aren't in the current search results,
  // we might want to manually add them to the list so they remain selected.
  if (
    project?.project_incharge &&
    project.incharge_name &&
    !personData.find((p) => p.value === project.project_incharge)
  ) {
    personData.push({
      value: project.project_incharge,
      label: project.incharge_name,
    });
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEdit ? 'Edit Project' : 'Initiate New Project'}
      size="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="sm">
          <TextInput
            label="Project Name"
            placeholder="e.g., Masjid Renovation Phase 1"
            withAsterisk
            {...form.getInputProps('project_name')}
          />

          <Textarea
            label="Description"
            placeholder="High-level goal of the project..."
            autosize
            minRows={2}
            {...form.getInputProps('description')}
          />

          <Select
            label="Current Phase"
            data={[
              { value: 'Future', label: 'Future / Planning' },
              { value: 'Present', label: 'Current / In-Progress' },
              { value: 'Past', label: 'Past / Completed' },
            ]}
            {...form.getInputProps('phase')}
          />

          <Group grow>
            <TextInput
              label="Estimated Budget"
              placeholder="e.g. 500000"
              {...form.getInputProps('estimated_budget')}
            />
            <TextInput
              label="Actual Spend"
              placeholder="e.g. 450000"
              {...form.getInputProps('actual_spend')}
            />
          </Group>

          <Group grow>
            <TextInput label="Start Date" type="date" {...form.getInputProps('start_date')} />
            <TextInput
              label="Target End Date"
              type="date"
              {...form.getInputProps('target_end_date')}
            />
          </Group>

          {/* ST-27.4: Project In-Charge Dropdown */}
          <Select
            label="Project In-Charge"
            placeholder="Search for a person..."
            searchable
            clearable
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            data={personData}
            {...form.getInputProps('project_incharge')}
          />

          <Textarea
            label="Internal Notes"
            placeholder="Any administrator notes..."
            autosize
            minRows={2}
            {...form.getInputProps('notes')}
          />

          <Button type="submit" loading={isLoading} mt="md" fullWidth>
            {isEdit ? 'Save Project Changes' : 'Create Roadmap Entry'}
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
