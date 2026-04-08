/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Modal, Select, Button, Group, Stack, TextInput, Text, Alert } from '@mantine/core';
import { useForm, schemaResolver } from '@mantine/form';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { IconAlertTriangle } from '@tabler/icons-react';
import { api } from '../../lib/api';
import { HouseholdFormModal } from './HouseholdFormModal';
import { Household } from '@mms/shared';

const schema = z.object({
  household_id: z.string().min(1, { message: 'Please select a household' }),
  household_role: z.enum(['Head', 'Spouse', 'Dependent', 'Child', 'Other']),
  start_date: z.string().min(1, { message: 'Start date is required' }),
});

interface AddPersonToHouseholdModalProps {
  opened: boolean;
  onClose: () => void;
  personId: string;
}

export function AddPersonToHouseholdModal({
  opened,
  onClose,
  personId,
}: AddPersonToHouseholdModalProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isHouseholdFormOpen, setIsHouseholdFormOpen] = useState(false);

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      household_id: '',
      household_role: 'Dependent',
      start_date: new Date().toISOString().split('T')[0],
    },
    validate: schemaResolver(schema),
  });

  // 1. Search Households Query
  const { data: searchResults } = useQuery({
    queryKey: ['households-search', search],
    queryFn: async () => {
      const res = await api.get(`/api/households/search?q=${search}`);
      return res.data.data;
    },
    enabled: opened && search.length >= 2,
  });

  const searchOptions =
    searchResults?.map((h: Record<string, any>) => ({
      value: h.id,
      label: `${h.address_line_1} ${h.mahalla_zone ? `(${h.mahalla_zone})` : ''}`,
    })) || [];

  const [forcedOptions, setForcedOptions] = useState<Record<string, any>[]>([]);

  // 2. Fetch person's history to warn if already in an active household
  const { data: personHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['person-history', personId], // matching MemberDetailPage queryKey
    queryFn: async () => {
      const res = await api.get(`/api/persons/${personId}/household-history`);
      return res.data.data;
    },
    enabled: !!personId && opened,
  });

  // Validate Active link status
  const activeLink = personHistory?.find((h: Record<string, any>) => h.is_active === true);
  const isAlreadyLinked = !!activeLink;

  // 3. Link Mutation
  const linkMutation = useMutation({
    mutationFn: async (payload: Record<string, any>) => {
      const res = await api.post('/api/person-household-links', {
        ...payload,
        person_id: personId,
      });
      return res.data;
    },
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Member linked to household successfully',
        color: 'green',
      });
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['person-history', personId] });
      queryClient.invalidateQueries({ queryKey: ['person', personId] });
      handleClose();
    },
    onError: (error: Error | any) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error || 'Failed to link household',
        color: 'red',
      });
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    // Extra validation
    if (isAlreadyLinked) {
      notifications.show({
        title: 'Validation Error',
        message: 'Member is already linked to another active household. Remove them first.',
        color: 'red',
      });
      return;
    }
    linkMutation.mutate(values);
  };

  const handleClose = () => {
    form.reset();
    setSearch('');
    // Clear the forced options just in case
    setForcedOptions([]);
    // Using setTimeout to reset after animation closes fully if needed
    onClose();
  };

  const handleNewHouseholdCreated = () => {
    setIsHouseholdFormOpen(false);
    // Since creating a household doesn't return the full newly created object easily via a success callback in the current implementation of HouseholdFormModal,
    // we would ideally query the newest created household or ask the user to safely search for it.
    // For now, prompt them to search it.
    notifications.show({
      title: 'Note',
      message: 'Please search for the address of the household you just created.',
      color: 'blue',
    });
  };

  const roleData = [
    { value: 'Head', label: 'Head of Household (Leader)' },
    { value: 'Spouse', label: 'Spouse' },
    { value: 'Dependent', label: 'Dependent' },
  ];

  return (
    <>
      <Modal
        opened={opened}
        onClose={handleClose}
        title="Add to Existing Household"
        size="md"
        padding="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="sm">
            <Select
              label="Search Household"
              placeholder="Search by address or mahalla..."
              data={[...forcedOptions, ...searchOptions]}
              searchable
              searchValue={search}
              onSearchChange={setSearch}
              clearable
              withAsterisk
              key={form.key('household_id')}
              {...form.getInputProps('household_id')}
              nothingFoundMessage={
                <Text size="sm" p="xs">
                  No household found.{' '}
                  <Button
                    variant="transparent"
                    size="xs"
                    p={0}
                    onClick={() => setIsHouseholdFormOpen(true)}
                  >
                    Create new household
                  </Button>
                </Text>
              }
            />

            {isAlreadyLinked && (
              <Alert
                icon={<IconAlertTriangle size={16} />}
                title="Warning"
                color="red"
                variant="light"
              >
                This person is already linked to an active household (
                <strong>{activeLink.address_line_1}</strong>). You must modify or end their active
                household link before adding them to a new one.
              </Alert>
            )}

            <Select
              label="Household Role"
              data={roleData}
              withAsterisk
              key={form.key('household_role')}
              {...form.getInputProps('household_role')}
            />

            <TextInput
              label="Start Date"
              type="date"
              withAsterisk
              key={form.key('start_date')}
              {...form.getInputProps('start_date')}
            />
          </Stack>

          <Group justify="space-between" mt="xl">
            <Button variant="subtle" color="blue" onClick={() => setIsHouseholdFormOpen(true)}>
              + Create New Household
            </Button>
            <Group>
              <Button variant="default" onClick={handleClose} disabled={linkMutation.isPending}>
                Cancel
              </Button>
              <Button
                type="submit"
                color="green"
                loading={linkMutation.isPending}
                disabled={isAlreadyLinked || isLoadingHistory}
              >
                Add to Household
              </Button>
            </Group>
          </Group>
        </form>
      </Modal>

      <HouseholdFormModal
        opened={isHouseholdFormOpen}
        onClose={handleNewHouseholdCreated}
        initialData={null}
      />
    </>
  );
}
