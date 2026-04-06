// ============================================
// Life Event Detail Page
// ============================================

import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Title,
  Group,
  Button,
  Paper,
  Text,
  Badge,
  Divider,
  Stack,
  Grid,
  ThemeIcon,
  Loader,
  Alert,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconFileCertificate,
  IconCalendar,
  IconMapPin,
  IconUser,
  IconNotebook,
  IconAlertCircle,
} from '@tabler/icons-react';
import { fetchLifeEvent } from '../lib/api-life-events';
import { getPerson } from '../lib/api-persons';

export function LifeEventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // FETCH EVENT DETAILS
  const {
    data: event,
    isLoading: loadingEvent,
    error: eventError,
  } = useQuery({
    queryKey: ['life_event', id],
    queryFn: () => fetchLifeEvent(id!),
    enabled: !!id,
  });

  // FETCH PERSON A
  const { data: personA, isLoading: loadingPersonA } = useQuery({
    queryKey: ['person', event?.person_a_id],
    queryFn: () => getPerson(event!.person_a_id),
    enabled: !!event?.person_a_id,
  });

  // FETCH PERSON B (optional)
  const { data: personB, isLoading: loadingPersonB } = useQuery({
    queryKey: ['person', event?.person_b_id],
    queryFn: () => getPerson(event!.person_b_id!),
    enabled: !!event?.person_b_id,
  });

  if (loadingEvent)
    return (
      <Container py="xl">
        <Loader />
      </Container>
    );
  if (eventError || !event) {
    return (
      <Container py="xl">
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
          Life event not found or failed to load.
        </Alert>
        <Button variant="outline" mt="md" onClick={() => navigate('/life-events')}>
          Back to Registry
        </Button>
      </Container>
    );
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'Marriage':
        return 'pink';
      case 'Death':
        return 'gray';
      case 'Birth':
        return 'blue';
      case 'Divorce':
        return 'red';
      case 'Conversion':
        return 'teal';
      default:
        return 'green';
    }
  };

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="xl">
        <Group>
          <Button
            variant="subtle"
            color="gray"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate('/life-events')}
          >
            Registry
          </Button>
          <Title order={2}>Event Details</Title>
          <Badge size="xl" color={getEventTypeColor(event.event_type)}>
            {event.event_type}
          </Badge>
        </Group>
        <Button
          leftSection={<IconFileCertificate size={16} />}
          color="green"
          onClick={() => navigate(`/life-events/${id}/certificate`)}
        >
          View Certificate
        </Button>
      </Group>

      <Grid gutter="md">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper withBorder p="xl" radius="md" shadow="sm">
            <Stack gap="lg">
              <div>
                <Text size="xs" fw={700} c="dimmed" lts={1} mb={4}>
                  CERTIFICATE NUMBER
                </Text>
                <Title order={3} c="green.8">
                  {event.certificate_no || 'Pending Allocation'}
                </Title>
              </div>

              <Divider />

              <Group wrap="nowrap" align="flex-start">
                <ThemeIcon variant="light" color="blue" size="lg" radius="md">
                  <IconCalendar size={20} />
                </ThemeIcon>
                <div>
                  <Text fw={600}>Event Date</Text>
                  <Text c="dimmed">
                    {new Date(event.event_date).toLocaleDateString(undefined, {
                      dateStyle: 'full',
                    })}
                  </Text>
                </div>
              </Group>

              <Group wrap="nowrap" align="flex-start">
                <ThemeIcon variant="light" color="orange" size="lg" radius="md">
                  <IconMapPin size={20} />
                </ThemeIcon>
                <div>
                  <Text fw={600}>Location</Text>
                  <Text c="dimmed">{event.location || 'Not Specified'}</Text>
                </div>
              </Group>

              {event.notes && (
                <Group wrap="nowrap" align="flex-start">
                  <ThemeIcon variant="light" color="gray" size="lg" radius="md">
                    <IconNotebook size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fw={600}>Administrative Notes</Text>
                    <Text c="dimmed" style={{ whiteSpace: 'pre-wrap' }}>
                      {event.notes}
                    </Text>
                  </div>
                </Group>
              )}
            </Stack>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="md">
            <Paper withBorder p="lg" radius="md">
              <Text fw={700} size="sm" mb="md">
                ASSOCIATED PERSONS
              </Text>

              <Stack gap="sm">
                {loadingPersonA ? (
                  <Loader size="sm" />
                ) : (
                  personA && (
                    <Paper withBorder p="xs" radius="sm" bg="gray.0">
                      <Group justify="space-between">
                        <Group gap="xs">
                          <ThemeIcon size="sm" variant="subtle" color="blue">
                            <IconUser size={14} />
                          </ThemeIcon>
                          <div>
                            <Text size="sm" fw={600}>
                              {personA.first_name} {personA.last_name}
                            </Text>
                            <Text size="xs" c="dimmed">
                              Primary Participant
                            </Text>
                          </div>
                        </Group>
                        <Button
                          variant="subtle"
                          size="compact-xs"
                          component={Link}
                          to={`/members/${personA.id}`}
                        >
                          View
                        </Button>
                      </Group>
                    </Paper>
                  )
                )}

                {loadingPersonB ? (
                  <Loader size="sm" />
                ) : (
                  personB && (
                    <Paper withBorder p="xs" radius="sm" bg="gray.0">
                      <Group justify="space-between">
                        <Group gap="xs">
                          <ThemeIcon size="sm" variant="subtle" color="pink">
                            <IconUser size={14} />
                          </ThemeIcon>
                          <div>
                            <Text size="sm" fw={600}>
                              {personB.first_name} {personB.last_name}
                            </Text>
                            <Text size="xs" c="dimmed">
                              Secondary Participant
                            </Text>
                          </div>
                        </Group>
                        <Button
                          variant="subtle"
                          size="compact-xs"
                          component={Link}
                          to={`/members/${personB.id}`}
                        >
                          View
                        </Button>
                      </Group>
                    </Paper>
                  )
                )}
              </Stack>
            </Paper>

            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Automatic Updates"
              color="blue"
              variant="light"
            >
              {event.event_type === 'Marriage' &&
                'This registration automatically linked the participants as spouses in the CRM.'}
              {event.event_type === 'Death' &&
                "This registration automatically marked the participant as 'Inactive' in the CRM."}
              {!['Marriage', 'Death'].includes(event.event_type) &&
                'This event has been recorded in the central life registry.'}
            </Alert>
          </Stack>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
