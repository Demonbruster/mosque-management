// ============================================
// Life Events Listing Page
// ============================================

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Group,
  Button,
  Table,
  Badge,
  ActionIcon,
  Select,
  Loader,
  Text,
  Tooltip,
} from '@mantine/core';
import { IconPlus, IconEye, IconFileCertificate } from '@tabler/icons-react';
import { fetchLifeEvents, LifeEventRecord } from '../lib/api-life-events';

export function LifeEventsPage() {
  const navigate = useNavigate();
  const [filterEventType, setFilterEventType] = useState<string | null>(null);

  // FETCH EVENTS
  const { data: events, isLoading } = useQuery({
    queryKey: ['life_events', filterEventType],
    queryFn: () => fetchLifeEvents(filterEventType ? { event_type: filterEventType } : undefined),
  });

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
        return 'gray';
    }
  };

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2}>Life Events & Registry</Title>
        <Group>
          <Select
            placeholder="Filter by Event Type"
            data={['Marriage', 'Death', 'Birth', 'Divorce', 'Conversion']}
            value={filterEventType}
            onChange={setFilterEventType}
            clearable
          />
          <Button leftSection={<IconPlus size={16} />} onClick={() => navigate('/life-events/new')}>
            Register Event
          </Button>
        </Group>
      </Group>

      {isLoading ? (
        <Loader />
      ) : (
        <Table stickyHeader verticalSpacing="md" striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Certificate No</Table.Th>
              <Table.Th>Event Type</Table.Th>
              <Table.Th>Date</Table.Th>
              <Table.Th>Location</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {events?.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={5} align="center">
                  <Text c="dimmed">No life events found.</Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              events?.map((ev: LifeEventRecord) => (
                <Table.Tr key={ev.id}>
                  <Table.Td>
                    <Text fw={500}>{ev.certificate_no || 'Pending'}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={getEventTypeColor(ev.event_type)}>{ev.event_type}</Badge>
                  </Table.Td>
                  <Table.Td>{new Date(ev.event_date).toDateString()}</Table.Td>
                  <Table.Td>{ev.location || 'N/A'}</Table.Td>
                  <Table.Td>
                    <Group gap="sm">
                      <Tooltip label="View Details">
                        <ActionIcon
                          variant="light"
                          color="blue"
                          onClick={() => navigate(`/life-events/${ev.id}`)}
                        >
                          <IconEye size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="View Certificate">
                        <ActionIcon
                          variant="light"
                          color="green"
                          onClick={() => navigate(`/life-events/${ev.id}/certificate`)}
                        >
                          <IconFileCertificate size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      )}
    </Container>
  );
}
