// ============================================
// Case Detail Page
// ============================================

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Title,
  Group,
  Button,
  Paper,
  Text,
  Badge,
  Timeline,
  Modal,
  Textarea,
  Stack,
  Loader,
  Alert,
  Select,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconArrowLeft, IconMessageCircle } from '@tabler/icons-react';
import {
  getPanchayathCaseById,
  updatePanchayathCase,
  createPanchayathSession,
} from '../lib/api-panchayath';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';

export function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);

  const {
    data: pCase,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['panchayath-cases', id],
    queryFn: () => getPanchayathCaseById(id!),
    enabled: !!id,
  });

  const sessionForm = useForm({
    initialValues: {
      session_date: new Date(),
      notes: '',
      next_steps: '',
    },
    validate: {
      session_date: (val) => (val ? null : 'Required'),
      notes: (val) => (val.length > 0 ? null : 'Required'),
    },
  });

  const resolveForm = useForm({
    initialValues: {
      status: 'Resolved',
      resolution_notes: '',
    },
  });

  const sessionMutation = useMutation({
    mutationFn: (values: typeof sessionForm.values) => {
      return createPanchayathSession(id!, {
        session_date: dayjs(values.session_date).format('YYYY-MM-DD'),
        notes: values.notes,
        next_steps: values.next_steps,
      });
    },
    onSuccess: () => {
      notifications.show({ title: 'Success', message: 'Session added', color: 'green' });
      queryClient.invalidateQueries({ queryKey: ['panchayath-cases', id] });
      setIsSessionModalOpen(false);
      sessionForm.reset();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      notifications.show({
        title: 'Error',
        message: err.response?.data?.error || 'Failed to add session',
        color: 'red',
      });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: (values: typeof resolveForm.values) => {
      return updatePanchayathCase(id!, {
        status: values.status as 'Open' | 'In_Progress' | 'Resolved' | 'Dismissed',
        resolution_notes: values.resolution_notes,
      });
    },
    onSuccess: () => {
      notifications.show({ title: 'Success', message: 'Case updated', color: 'green' });
      queryClient.invalidateQueries({ queryKey: ['panchayath-cases', id] });
      setIsResolveModalOpen(false);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      notifications.show({
        title: 'Error',
        message: err.response?.data?.error || 'Failed to update case',
        color: 'red',
      });
    },
  });

  if (isLoading) {
    return (
      <Container size="xl" py="xl" style={{ display: 'flex', justifyContent: 'center' }}>
        <Loader />
      </Container>
    );
  }

  if (isError || !pCase) {
    return (
      <Container size="xl" py="xl">
        <Alert color="red" variant="light">
          Case not found
        </Alert>
      </Container>
    );
  }

  const isClosed = pCase.status === 'Resolved' || pCase.status === 'Dismissed';

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
      <Group mb="lg">
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate('/panchayath')}
        >
          Back to Cases
        </Button>
      </Group>

      <Paper p="xl" withBorder mb="lg">
        <Group justify="space-between" mb="md">
          <div>
            <Title order={2}>Case: {pCase.case_id}</Title>
            <Text c="dimmed" size="lg">
              {pCase.subject}
            </Text>
          </div>
          <Badge color={getStatusColor(pCase.status)} variant="light" size="xl">
            {pCase.status.replace('_', ' ')}
          </Badge>
        </Group>

        <Group mt="lg" gap="xl">
          <div>
            <Text size="sm" c="dimmed">
              Date Opened
            </Text>
            <Text fw={500}>{dayjs(pCase.created_at).format('DD MMM YYYY')}</Text>
          </div>
          <div>
            <Text size="sm" c="dimmed">
              Complainant
            </Text>
            <Text fw={500}>
              {pCase.complainant?.first_name} {pCase.complainant?.last_name}
            </Text>
          </div>
          {pCase.respondent && (
            <div>
              <Text size="sm" c="dimmed">
                Respondent
              </Text>
              <Text fw={500}>
                {pCase.respondent.first_name} {pCase.respondent.last_name}
              </Text>
            </div>
          )}
        </Group>

        {isClosed && pCase.resolution_notes && (
          <Alert
            mt="xl"
            color={pCase.status === 'Resolved' ? 'green' : 'gray'}
            title="Resolution Notes"
          >
            {pCase.resolution_notes}
          </Alert>
        )}

        {!isClosed && (
          <Group mt="xl">
            <Button variant="outline" color="blue" onClick={() => setIsSessionModalOpen(true)}>
              Record Session
            </Button>
            <Button variant="filled" color="green" onClick={() => setIsResolveModalOpen(true)}>
              Resolve / Close Case
            </Button>
          </Group>
        )}
      </Paper>

      <Title order={3} mb="md">
        Session Timeline
      </Title>

      {pCase.sessions && pCase.sessions.length > 0 ? (
        <Paper p="xl" withBorder>
          <Timeline active={pCase.sessions.length - 1} bulletSize={24} lineWidth={2}>
            {pCase.sessions.map((session) => (
              <Timeline.Item
                key={session.id}
                bullet={<IconMessageCircle size={12} />}
                title={dayjs(session.session_date).format('MMMM D, YYYY')}
              >
                <Text c="dimmed" size="sm" mt={4}>
                  {session.notes}
                </Text>
                {session.next_steps && (
                  <Text size="sm" mt={8} fw={500}>
                    Next Steps:{' '}
                    <Text component="span" fw="normal" c="dimmed">
                      {session.next_steps}
                    </Text>
                  </Text>
                )}
              </Timeline.Item>
            ))}
          </Timeline>
        </Paper>
      ) : (
        <Text c="dimmed">No sessions recorded yet.</Text>
      )}

      {/* Record Session Modal */}
      <Modal
        opened={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        title="Record Counseling Session"
      >
        <form onSubmit={sessionForm.onSubmit((v) => sessionMutation.mutate(v))}>
          <Stack>
            <DateInput
              label="Session Date"
              required
              {...sessionForm.getInputProps('session_date')}
            />
            <Textarea
              label="Session Notes"
              placeholder="What was discussed?"
              minRows={4}
              required
              {...sessionForm.getInputProps('notes')}
            />
            <Textarea
              label="Next Steps / Action Items"
              placeholder="What needs to be done next?"
              minRows={2}
              {...sessionForm.getInputProps('next_steps')}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={() => setIsSessionModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={sessionMutation.isPending}>
                Save Session
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Resolve Case Modal */}
      <Modal
        opened={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        title="Close Case"
      >
        <form onSubmit={resolveForm.onSubmit((v) => resolveMutation.mutate(v))}>
          <Stack>
            <Select
              label="Closing Status"
              data={['Resolved', 'Dismissed']}
              required
              {...resolveForm.getInputProps('status')}
            />
            <Textarea
              label="Resolution Notes"
              description="Record the final outcome. This will be permanently attached to the case."
              placeholder="Final verdict or reason for dismissal..."
              minRows={5}
              required
              {...resolveForm.getInputProps('resolution_notes')}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={() => setIsResolveModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={resolveMutation.isPending} color="green">
                Confirm Action
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}
