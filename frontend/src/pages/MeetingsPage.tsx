// ============================================
// Meetings Page
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
  Select,
  NumberInput,
  Text,
  Paper,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconPlus, IconEye, IconLock } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { getMeetings, createMeeting } from '../lib/api-meetings';
import type { MeetingType } from '@mms/shared/src/types/governance';
import { notifications } from '@mantine/notifications';

export function MeetingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [filterType, setFilterType] = useState<MeetingType | null>(null);

  const { data: meetings, isLoading } = useQuery({
    queryKey: ['meetings', filterType],
    queryFn: () => getMeetings({ type: filterType || undefined }),
  });

  const form = useForm({
    initialValues: {
      meeting_type: 'Management' as MeetingType,
      meeting_date: new Date(),
      title: '',
      attendees_count: 0,
    },
    validate: {
      meeting_type: (val) => (val ? null : 'Required'),
      meeting_date: (val) => (val ? null : 'Required'),
      title: (val) => (val.length > 0 ? null : 'Required'),
    },
  });

  const createMutation = useMutation({
    mutationFn: (values: typeof form.values) => {
      return createMeeting({
        meeting_type: values.meeting_type,
        meeting_date: dayjs(values.meeting_date).format('YYYY-MM-DD'),
        title: values.title,
        attendees_count: values.attendees_count,
        minutes_text: '',
      });
    },
    onSuccess: (data) => {
      notifications.show({ title: 'Success', message: 'Meeting created', color: 'green' });
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      setIsCreateOpen(false);
      form.reset();
      navigate(`/meetings/${data.id}`);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      notifications.show({
        title: 'Error',
        message: err.response?.data?.error || 'Failed to create meeting',
        color: 'red',
      });
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    createMutation.mutate(values);
  };

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={2}>Meeting Minutes</Title>
          <Text c="dimmed" size="sm">
            Record and manage Jamath, Management, and Panchayath meetings.
          </Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={() => setIsCreateOpen(true)}>
          New Meeting
        </Button>
      </Group>

      <Group mb="md">
        <Select
          placeholder="Filter by type"
          data={['Jamath', 'Management', 'Panchayath']}
          value={filterType}
          onChange={(val) => setFilterType(val as MeetingType | null)}
          clearable
        />
      </Group>

      <Paper withBorder>
        <Table verticalSpacing="sm" striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Date</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Title</Table.Th>
              <Table.Th>Attendees</Table.Th>
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
            ) : meetings?.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={6} align="center">
                  No meetings found
                </Table.Td>
              </Table.Tr>
            ) : (
              meetings?.map((meeting) => (
                <Table.Tr key={meeting.id}>
                  <Table.Td>{dayjs(meeting.meeting_date).format('DD MMM YYYY')}</Table.Td>
                  <Table.Td>
                    <Badge color={meeting.meeting_type === 'Jamath' ? 'blue' : 'green'}>
                      {meeting.meeting_type}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{meeting.title}</Table.Td>
                  <Table.Td>{meeting.attendees_count || '-'}</Table.Td>
                  <Table.Td>
                    {meeting.is_locked ? (
                      <Badge color="red" variant="light" leftSection={<IconLock size={10} />}>
                        Locked
                      </Badge>
                    ) : (
                      <Badge color="gray" variant="light">
                        Open
                      </Badge>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <ActionIcon
                      variant="light"
                      color="blue"
                      onClick={() => navigate(`/meetings/${meeting.id}`)}
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

      <Modal opened={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Meeting">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Select
            label="Meeting Type"
            data={['Jamath', 'Management', 'Panchayath']}
            required
            {...form.getInputProps('meeting_type')}
            mb="sm"
          />
          <TextInput
            label="Title"
            placeholder="E.g., Monthly Management Meeting"
            required
            {...form.getInputProps('title')}
            mb="sm"
          />
          <DateInput
            label="Meeting Date"
            required
            {...form.getInputProps('meeting_date')}
            mb="sm"
          />
          <NumberInput
            label="Attendees Count"
            placeholder="0"
            {...form.getInputProps('attendees_count')}
            mb="md"
          />

          <Group justify="flex-end">
            <Button variant="default" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createMutation.isPending}>
              Create
            </Button>
          </Group>
        </form>
      </Modal>
    </Container>
  );
}
