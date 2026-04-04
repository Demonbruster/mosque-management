// ============================================
// Panchayath Cases Page
// ============================================

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Title,
  Group,
  Button,
  Table,
  Badge,
  ActionIcon,
  Modal,
  TextInput,
  Text,
  Paper,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPlus, IconEye } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { getPanchayathCases, createPanchayathCase } from '../lib/api-panchayath';
import { notifications } from '@mantine/notifications';

export function PanchayathCasesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: cases, isLoading } = useQuery({
    queryKey: ['panchayath-cases'],
    queryFn: () => getPanchayathCases(),
  });

  const form = useForm({
    initialValues: {
      case_id: '',
      complainant_id: '',
      respondent_id: '',
      subject: '',
    },
    validate: {
      case_id: (val: string) => (val ? null : 'Required'),
      complainant_id: (val: string) => (val ? null : 'Required'),
      subject: (val: string) => (val.length > 0 ? null : 'Required'),
    },
  });

  const createMutation = useMutation({
    mutationFn: (values: typeof form.values) => {
      return createPanchayathCase({
        case_id: values.case_id,
        complainant_id: values.complainant_id,
        respondent_id: values.respondent_id || null,
        subject: values.subject,
      });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSuccess: (data: any) => {
      notifications.show({ title: 'Success', message: 'Case created', color: 'green' });
      queryClient.invalidateQueries({ queryKey: ['panchayath-cases'] });
      setIsCreateOpen(false);
      form.reset();
      navigate(`/panchayath/${data.id}`);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      notifications.show({
        title: 'Error',
        message: err.response?.data?.error || 'Failed to create case',
        color: 'red',
      });
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    createMutation.mutate(values);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'gray';
      case 'In_Progress':
        return 'blue';
      case 'Resolved':
        return 'green';
      case 'Dismissed':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={2}>Panchayath Cases</Title>
          <Text c="dimmed" size="sm">
            Manage community disputes and counseling sessions.
          </Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={() => setIsCreateOpen(true)}>
          New Case
        </Button>
      </Group>

      <Paper withBorder>
        <Table verticalSpacing="sm" striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Case ID</Table.Th>
              <Table.Th>Date Opened</Table.Th>
              <Table.Th>Complainant</Table.Th>
              <Table.Th>Subject</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {isLoading ? (
              <Table.Tr>
                <Table.Td colSpan={6} align="center">
                  Loading...
                </Table.Td>
              </Table.Tr>
            ) : cases?.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={6} align="center">
                  No cases found
                </Table.Td>
              </Table.Tr>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              cases?.map((c: any) => (
                <Table.Tr key={c.id}>
                  <Table.Td fw={500}>{c.case_id}</Table.Td>
                  <Table.Td>{dayjs(c.created_at).format('DD MMM YYYY')}</Table.Td>
                  <Table.Td>
                    {c.complainant?.first_name} {c.complainant?.last_name}
                  </Table.Td>
                  <Table.Td>{c.subject}</Table.Td>
                  <Table.Td>
                    <Badge color={getStatusColor(c.status)} variant="light">
                      {c.status.replace('_', ' ')}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <ActionIcon
                      variant="light"
                      color="blue"
                      onClick={() => navigate(`/panchayath/${c.id}`)}
                    >
                      <IconEye size={16} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Paper>

      <Modal opened={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Open New Case">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput label="Case ID" required {...form.getInputProps('case_id')} mb="sm" />
          <TextInput
            label="Complainant Person ID"
            description="Enter Person ID (UUID) temporarily until PersonSelect is mapped"
            required
            {...form.getInputProps('complainant_id')}
            mb="sm"
          />
          <TextInput
            label="Respondent Person ID (Optional)"
            {...form.getInputProps('respondent_id')}
            mb="sm"
          />
          <TextInput
            label="Subject"
            placeholder="Brief description of the dispute"
            required
            {...form.getInputProps('subject')}
            mb="lg"
          />

          <Group justify="flex-end">
            <Button variant="default" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createMutation.isPending}>
              Create Case
            </Button>
          </Group>
        </form>
      </Modal>
    </Container>
  );
}
