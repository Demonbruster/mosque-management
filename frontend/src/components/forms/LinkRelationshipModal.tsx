/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Modal, Select, Button, Group, Stack, Text } from '@mantine/core';
import { useForm, schemaResolver } from '@mantine/form';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { api } from '../../lib/api';

const schema = z.object({
  person_id_b: z.string().min(1, { message: 'Please select a related member' }),
  relationship_code: z.enum([
    'Parent',
    'Child',
    'Sibling',
    'Spouse',
    'Grandparent',
    'Grandchild',
    'Uncle',
    'Aunt',
    'Cousin',
    'Other',
  ]),
});

interface LinkRelationshipModalProps {
  opened: boolean;
  onClose: () => void;
  personId: string;
}

export function LinkRelationshipModal({ opened, onClose, personId }: LinkRelationshipModalProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      person_id_b: '',
      relationship_code: 'Parent',
    },
    validate: schemaResolver(schema),
  });

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
    searchResults
      ?.filter((p: Record<string, any>) => p.id !== personId) // Exclude self
      ?.map((p: Record<string, any>) => ({
        value: p.id,
        label: `${p.first_name} ${p.last_name} (${p.phone_number || p.email || p.category})`,
      })) || [];

  // 2. Link Mutation
  const linkMutation = useMutation({
    mutationFn: async (payload: Record<string, any>) => {
      const res = await api.post('/api/person-relationships', {
        ...payload,
        person_id_a: personId,
      });
      return res.data;
    },
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Relationship established successfully',
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['person-relationships', personId] });
      handleClose();
    },
    onError: (error: Error | any) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error || 'Failed to establish relationship',
        color: 'red',
      });
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    linkMutation.mutate(values);
  };

  const handleClose = () => {
    form.reset();
    setSearch('');
    onClose();
  };

  const relationshipOptions = [
    { value: 'Parent', label: 'Parent' },
    { value: 'Child', label: 'Child' },
    { value: 'Sibling', label: 'Sibling' },
    { value: 'Spouse', label: 'Spouse' },
    { value: 'Grandparent', label: 'Grandparent' },
    { value: 'Grandchild', label: 'Grandchild' },
    { value: 'Uncle', label: 'Uncle' },
    { value: 'Aunt', label: 'Aunt' },
    { value: 'Cousin', label: 'Cousin' },
    { value: 'Other', label: 'Other' },
  ];

  return (
    <Modal opened={opened} onClose={handleClose} title="Link Relationship" size="md" padding="lg">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="sm">
          <Select
            label="Select Member"
            placeholder="Search by name, email, or phone..."
            data={searchOptions}
            searchable
            searchValue={search}
            onSearchChange={setSearch}
            clearable
            withAsterisk
            key={form.key('person_id_b')}
            {...form.getInputProps('person_id_b')}
            nothingFoundMessage={
              <Text size="sm" p="xs">
                No member found.
              </Text>
            }
          />

          <Select
            label="Relationship"
            data={relationshipOptions}
            withAsterisk
            key={form.key('relationship_code')}
            {...form.getInputProps('relationship_code')}
          />
        </Stack>

        <Group justify="flex-end" mt="xl">
          <Button variant="default" onClick={handleClose} disabled={linkMutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" color="green" loading={linkMutation.isPending}>
            Link
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
