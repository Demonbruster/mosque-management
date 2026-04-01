/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Modal, Select, Button, Group, Stack, TextInput, Text, Alert } from '@mantine/core';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { IconAlertTriangle } from '@tabler/icons-react';
import { api } from '../../lib/api';
import { MemberFormModal } from './MemberFormModal';

const schema = z.object({
  person_id: z.string().min(1, { message: 'Please select a member' }),
  household_role: z.enum(['Head', 'Spouse', 'Dependent', 'Child', 'Other']),
  start_date: z.string().min(1, { message: 'Start date is required' }),
});

interface AddMemberToHouseholdModalProps {
  opened: boolean;
  onClose: () => void;
  householdId: string;
  currentMembers: any[];
}

export function AddMemberToHouseholdModal({
  opened,
  onClose,
  householdId,
  currentMembers,
}: AddMemberToHouseholdModalProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isMemberFormOpen, setIsMemberFormOpen] = useState(false);

  const hasHead = currentMembers?.some((m) => m.household_role === 'Head');

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      person_id: '',
      household_role: hasHead ? 'Dependent' : 'Head',
      start_date: new Date().toISOString().split('T')[0],
    },
    validate: zodResolver(schema),
  });

  // Watch for changes on the form to run validation check
  const selectedPersonId = form.getValues().person_id;

  // 1. Search Persons Query
  const { data: searchResults } = useQuery({
    queryKey: ['persons-search', search],
    queryFn: async () => {
      const res = await api.get(`/api/persons/search?q=${search}`);
      return res.data.data;
    },
    enabled: opened && search.length >= 2,
  });

  const searchOptions =
    searchResults?.map((p: Record<string, any>) => ({
      value: p.id,
      label: `${p.first_name} ${p.last_name} (${p.phone_number || p.email || p.category})`,
    })) || [];

  // If a created member just arrived, force an option into the map so
  // Mantine Select finds it valid without searching again
  const [forcedOptions, setForcedOptions] = useState<Record<string, any>[]>([]);

  // 2. Fetch person's history to warn if already in a household
  const { data: personHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['person-household-history', selectedPersonId],
    queryFn: async () => {
      const res = await api.get(`/api/persons/${selectedPersonId}/household-history`);
      return res.data.data;
    },
    enabled: !!selectedPersonId,
  });

  // Validate Active link status
  const activeLink = personHistory?.find((h: Record<string, any>) => h.is_active === true);
  const isAlreadyLinked = !!activeLink;

  // 3. Link Mutation
  const linkMutation = useMutation({
    mutationFn: async (payload: Record<string, any>) => {
      const res = await api.post('/api/person-household-links', {
        ...payload,
        household_id: householdId,
      });
      return res.data;
    },
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Member linked to household successfully',
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['household-members', householdId] });
      handleClose();
    },
    onError: (error: Error | any) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error || 'Failed to link member',
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
    onClose();
  };

  // Callback from the MemberFormModal upon successful creation
  const onNewMemberCreated = (newPerson: Record<string, any>) => {
    const label = `${newPerson.first_name} ${newPerson.last_name}`;
    setForcedOptions([{ value: newPerson.id, label }]);
    form.setFieldValue('person_id', newPerson.id);
  };

  const roleData = [
    { value: 'Head', label: 'Head of Household (Leader)', disabled: hasHead },
    { value: 'Spouse', label: 'Spouse' },
    { value: 'Dependent', label: 'Dependent' },
  ];

  return (
    <>
      <Modal
        opened={opened}
        onClose={handleClose}
        title="Add Member to Household"
        size="md"
        padding="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="sm">
            <Select
              label="Select Member"
              placeholder="Search by name, email, or phone..."
              data={[...forcedOptions, ...searchOptions]}
              searchable
              searchValue={search}
              onSearchChange={setSearch}
              clearable
              withAsterisk
              key={form.key('person_id')}
              {...form.getInputProps('person_id')}
              nothingFoundMessage={
                <Text size="sm" p="xs">
                  No member found.{' '}
                  <Button
                    variant="transparent"
                    size="xs"
                    p={0}
                    onClick={() => setIsMemberFormOpen(true)}
                  >
                    Create new member
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
                This person is already linked to another household (
                <strong>{activeLink.address_line_1}</strong>). You must navigate to that
                person&apos;s profile and remove their active household link before adding them
                here.
              </Alert>
            )}

            <Select
              label="Household Role"
              data={roleData}
              withAsterisk
              description={hasHead ? 'This household already has a Head.' : ''}
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
            <Button variant="subtle" color="blue" onClick={() => setIsMemberFormOpen(true)}>
              + Create New CRM Member
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

      {/* Embed the Member Form Modal so we can seamlessly create and link new members! */}
      <MemberFormModal
        opened={isMemberFormOpen}
        onClose={() => setIsMemberFormOpen(false)}
        initialData={null}
        onSuccessCallback={onNewMemberCreated}
      />
    </>
  );
}
