// ============================================
// Meeting Detail Page
// ============================================

import { useEffect } from 'react';
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
  Textarea,
  Stack,
  Loader,
  Alert,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconArrowLeft, IconLock } from '@tabler/icons-react';
import { getMeetingById, updateMeeting } from '../lib/api-meetings';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';

export function MeetingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: meeting,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['meetings', id],
    queryFn: () => getMeetingById(id!),
    enabled: !!id,
  });

  const form = useForm({
    initialValues: {
      minutes_text: '',
    },
  });

  useEffect(() => {
    if (meeting) {
      form.setValues({
        minutes_text: meeting.minutes_text || '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meeting]);

  const updateMutation = useMutation({
    mutationFn: (values: typeof form.values) => {
      return updateMeeting(id!, {
        minutes_text: values.minutes_text,
      });
    },
    onSuccess: () => {
      notifications.show({ title: 'Success', message: 'Minutes saved', color: 'green' });
      queryClient.invalidateQueries({ queryKey: ['meetings', id] });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      notifications.show({
        title: 'Error',
        message: err.response?.data?.error || 'Failed to update meeting',
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

  if (isError || !meeting) {
    return (
      <Container size="xl" py="xl">
        <Alert color="red" variant="light">
          Meeting not found
        </Alert>
      </Container>
    );
  }

  const isLocked = meeting.is_locked;

  return (
    <Container size="xl" py="xl">
      <Group mb="lg">
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate('/meetings')}
        >
          Back to Meetings
        </Button>
      </Group>

      <Paper p="xl" withBorder mb="lg">
        <Group justify="space-between" mb="lg">
          <div>
            <Title order={2}>{meeting.title}</Title>
            <Text c="dimmed">
              {dayjs(meeting.meeting_date).format('MMMM D, YYYY')} • {meeting.meeting_type}
            </Text>
          </div>
          {isLocked ? (
            <Badge color="red" variant="light" size="lg" leftSection={<IconLock size={12} />}>
              Locked (Read-Only)
            </Badge>
          ) : (
            <Badge color="green" variant="light" size="lg">
              Open for Editing
            </Badge>
          )}
        </Group>

        <Group mb="xl">
          <Text size="sm" fw={500}>
            Attendees count: <Badge variant="outline">{meeting.attendees_count || 0}</Badge>
          </Text>
        </Group>

        <form onSubmit={form.onSubmit((v) => updateMutation.mutate(v))}>
          <Stack>
            <Textarea
              label="Meeting Minutes"
              description={
                isLocked
                  ? 'These minutes are locked because a newer meeting of the same type was created.'
                  : 'Record the discussions, decisions, and action items.'
              }
              placeholder="Enter meeting minutes here..."
              minRows={10}
              autosize
              disabled={isLocked}
              {...form.getInputProps('minutes_text')}
            />

            {!isLocked && (
              <Group justify="flex-end">
                <Button type="submit" loading={updateMutation.isPending}>
                  Save Minutes
                </Button>
              </Group>
            )}
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
