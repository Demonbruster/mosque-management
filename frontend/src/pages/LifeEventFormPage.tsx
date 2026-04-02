// ============================================
// Life Event Registration Form Page
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Button,
  Select,
  TextInput,
  Textarea,
  Stack,
  Loader,
  Group,
  Paper,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { createLifeEvent } from '../lib/api-life-events';
import { getPersons } from '../lib/api-persons';

export function LifeEventFormPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // FETCH PERSONS
  const { data: persons, isLoading: loadingPersons } = useQuery({
    queryKey: ['persons'],
    queryFn: () => getPersons(),
  });

  const personOptions = persons
    ? persons.map((p) => ({
        value: p.id,
        label: `${p.first_name} ${p.last_name} (${p.phone_number || 'No phone'})`,
      }))
    : [];

  // MUTATION: CREATE EVENT
  const createMutation = useMutation({
    mutationFn: createLifeEvent,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['life_events'] });
      notifications.show({
        title: 'Success',
        message: 'Event registered successfully',
        color: 'green',
      });
      navigate(`/life-events/${data.id}`);
    },
    onError: () => {
      notifications.show({ title: 'Error', message: 'Failed to register event', color: 'red' });
    },
  });

  const form = useForm({
    initialValues: {
      event_type: 'Marriage',
      person_a_id: '',
      person_b_id: '',
      event_date: new Date().toISOString().split('T')[0],
      location: 'Mosque Premises',
      notes: '',
    },
    validate: {
      event_type: (val) => (val ? null : 'Required'),
      person_a_id: (val) => (val ? null : 'Required'),
      event_date: (val) => (val ? null : 'Required'),
      // Require person_b if marriage or divorce
      person_b_id: (val, values) => {
        if (['Marriage', 'Divorce'].includes(values.event_type) && !val) {
          return 'Secondary person required for this event type';
        }
        return null;
      },
    },
  });

  const handleCreateSubmit = (values: typeof form.values) => {
    // If not a two-person event, clear person_b_id just in case
    const payload = {
      ...values,
      person_b_id: ['Marriage', 'Divorce'].includes(values.event_type) ? values.person_b_id : null,
      document_urls: [] as string[],
    } as import('../lib/api-life-events').CreateLifeEventInput;
    createMutation.mutate(payload);
  };

  if (loadingPersons) return <Loader mt="xl" />;

  const isTwoPerson = ['Marriage', 'Divorce'].includes(form.values.event_type);

  return (
    <Container size="md" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2}>Register Life Event</Title>
        <Button variant="default" onClick={() => navigate('/life-events')}>
          Cancel
        </Button>
      </Group>

      <Paper shadow="xs" p="xl" withBorder>
        <form onSubmit={form.onSubmit(handleCreateSubmit)}>
          <Stack gap="md">
            <Select
              label="Event Type"
              data={['Marriage', 'Death', 'Birth', 'Divorce', 'Conversion']}
              withAsterisk
              {...form.getInputProps('event_type')}
            />

            <Select
              label={isTwoPerson ? 'Primary Person (e.g. Groom)' : 'Person'}
              data={personOptions}
              searchable
              withAsterisk
              {...form.getInputProps('person_a_id')}
            />

            {isTwoPerson && (
              <Select
                label="Secondary Person (e.g. Bride)"
                data={personOptions}
                searchable
                withAsterisk
                {...form.getInputProps('person_b_id')}
              />
            )}

            <TextInput
              label="Event Date"
              type="date"
              withAsterisk
              {...form.getInputProps('event_date')}
            />

            <TextInput
              label="Location"
              placeholder="e.g. Mosque Premises"
              {...form.getInputProps('location')}
            />

            <Textarea
              label="Additional Notes"
              placeholder="Any specific witnesses, causes, or circumstances"
              {...form.getInputProps('notes')}
              minRows={3}
            />

            <Button type="submit" loading={createMutation.isPending} mt="md">
              Register Record
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
