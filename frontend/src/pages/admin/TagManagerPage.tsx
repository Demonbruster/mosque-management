import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Title,
  Card,
  Text,
  Button,
  Table,
  Badge,
  Group,
  Modal,
  TextInput,
  MultiSelect,
  LoadingOverlay,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconTags, IconPlus, IconTrash } from '@tabler/icons-react';
import { getPersonTags, bulkAddPersonTag, bulkRemovePersonTag } from '../../lib/api-person-tags';
import { getPersons } from '../../lib/api-persons';

export default function TagManagerPage() {
  const queryClient = useQueryClient();
  const [opened, setOpened] = useState(false);

  const form = useForm({
    initialValues: {
      tag: '',
      personIds: [] as string[],
    },
    validate: {
      tag: (value) => (value.trim().length === 0 ? 'Tag name is required' : null),
      personIds: (value) => (value.length === 0 ? 'Select at least one person' : null),
    },
  });

  const { data: tags, isLoading: loadingTags } = useQuery({
    queryKey: ['person-tags'],
    queryFn: getPersonTags,
  });

  const { data: persons, isLoading: loadingPersons } = useQuery({
    queryKey: ['persons-all'],
    queryFn: () => getPersons(),
  });

  const personOptions = (persons || []).map((p) => ({
    value: p.id,
    label: `${p.first_name} ${p.last_name} (${p.phone_number || 'No phone'})`,
  }));

  const addMutation = useMutation({
    mutationFn: bulkAddPersonTag,
    onSuccess: (data) => {
      notifications.show({
        title: 'Success',
        message: `Tag added to ${data.addedCount} persons`,
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['person-tags'] });
      setOpened(false);
      form.reset();
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to add tag',
        color: 'red',
      });
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    addMutation.mutate({ personIds: values.personIds, tag: values.tag.trim().toLowerCase() });
  };

  return (
    <Container size="xl" py="xl" pos="relative">
      <LoadingOverlay visible={loadingTags || loadingPersons} />

      <Group justify="space-between" mb="xl">
        <div>
          <Title order={2} c="blue.8">
            <Group gap="sm">
              <IconTags size={28} />
              Tag Management
            </Group>
          </Title>
          <Text c="dimmed" size="sm" mt="xs">
            Create tags and bulk assign them to congregation members.
          </Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={() => setOpened(true)}>
          New Assignment
        </Button>
      </Group>

      <Card withBorder shadow="sm" radius="md">
        <Table verticalSpacing="sm" striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Tag Name</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {!tags?.length ? (
              <Table.Tr>
                <Table.Td colSpan={2} align="center">
                  <Text c="dimmed" my="md">
                    No tags found. Create one by assigning it to a member.
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              tags.map((tag) => (
                <Table.Tr key={tag}>
                  <Table.Td>
                    <Badge size="lg" color="blue" variant="light">
                      {tag}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    {/* Potential quick delete or view operations */}
                    <Button variant="subtle" size="xs">
                      View Members
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Card>

      <Modal opened={opened} onClose={() => setOpened(false)} title="Bulk Tag Members" size="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Tag Name"
            placeholder="e.g. volunteer, ramadan_donor"
            description="Use lowercase and underscores for consistency"
            mb="md"
            withAsterisk
            {...form.getInputProps('tag')}
          />
          <MultiSelect
            label="Select Members"
            placeholder="Search and select persons"
            data={personOptions}
            searchable
            clearable
            maxDropdownHeight={300}
            mb="xl"
            withAsterisk
            {...form.getInputProps('personIds')}
          />
          <Group justify="flex-end">
            <Button variant="light" onClick={() => setOpened(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={addMutation.isPending}>
              Assign Tag
            </Button>
          </Group>
        </form>
      </Modal>
    </Container>
  );
}
