/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Title,
  Group,
  Button,
  Table,
  Badge,
  Paper,
  LoadingOverlay,
  Modal,
  TextInput,
  Select,
  Textarea,
  Stack,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { api } from '../lib/api';

export function FundCategoriesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const form = useForm({
    initialValues: {
      fund_name: '',
      compliance_type: 'GENERAL',
      description: '',
    },
    validate: {
      fund_name: (val) => (val.trim().length > 0 ? null : 'Fund name is required'),
      compliance_type: (val) => (val ? null : 'Compliance type is required'),
    },
  });

  const { data: categories, isLoading } = useQuery({
    queryKey: ['fund-categories'],
    queryFn: async () => {
      const res = await api.get('/api/fund-categories');
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: typeof form.values) => {
      const res = await api.post('/api/fund-categories', values);
      return res.data.data;
    },
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Fund category created successfully',
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['fund-categories'] });
      setIsModalOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error || 'Failed to create fund category',
        color: 'red',
      });
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    createMutation.mutate(values);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Group justify="space-between" mb="lg">
        <Title order={2}>Fund Categories</Title>
        <Button color="green" onClick={() => setIsModalOpen(true)}>
          + Add Category
        </Button>
      </Group>

      <Paper withBorder shadow="sm" p="md" pos="relative">
        <LoadingOverlay
          visible={isLoading}
          zIndex={1000}
          overlayProps={{ radius: 'sm', blur: 2 }}
        />

        <Table striped highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Fund Name</Table.Th>
              <Table.Th>Compliance Type</Table.Th>
              <Table.Th>Description</Table.Th>
              <Table.Th>Status</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {categories?.map((cat: any) => (
              <Table.Tr key={cat.id}>
                <Table.Td style={{ fontWeight: 500 }}>{cat.fund_name}</Table.Td>
                <Table.Td>
                  <Badge color="blue">{cat.compliance_type}</Badge>
                </Table.Td>
                <Table.Td>{cat.description || '—'}</Table.Td>
                <Table.Td>
                  <Badge color={cat.is_active ? 'green' : 'gray'}>
                    {cat.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </Table.Td>
              </Table.Tr>
            ))}
            {!categories?.length && !isLoading && (
              <Table.Tr>
                <Table.Td colSpan={4} align="center">
                  No fund categories found.
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Paper>

      <Modal
        opened={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          form.reset();
        }}
        title={<Title order={4}>Add New Fund Category</Title>}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Fund Name"
              placeholder="e.g. Ramadan Zakat Fund"
              required
              {...form.getInputProps('fund_name')}
            />
            <Select
              label="Compliance Type"
              placeholder="Select type"
              data={['ZAKAT', 'SADAQAH', 'WAQF', 'GENERAL', 'FITRAH', 'LILLAH']}
              required
              {...form.getInputProps('compliance_type')}
            />
            <Textarea
              label="Description"
              placeholder="Brief details about this fund's purpose"
              {...form.getInputProps('description')}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" color="green" loading={createMutation.isPending}>
                Save
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </div>
  );
}
