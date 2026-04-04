import React from 'react';
import {
  Container,
  Title,
  Paper,
  Table,
  Badge,
  Group,
  Text,
  Select,
  Loader,
  Center,
} from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import {
  IconBrandWhatsapp,
  IconCheck,
  IconChecks,
  IconPointFilled,
  IconX,
} from '@tabler/icons-react';
import { getCommunicationLogs } from '../lib/api-communications';

export function CommunicationsLogsPage() {
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null);

  const {
    data: logs,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['communications', 'logs', statusFilter],
    queryFn: () => getCommunicationLogs({ status: statusFilter || undefined }),
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Sent':
        return (
          <Badge color="gray" variant="light" leftSection={<IconCheck size={12} />}>
            Sent
          </Badge>
        );
      case 'Delivered':
        return (
          <Badge color="blue" variant="light" leftSection={<IconChecks size={12} />}>
            Delivered
          </Badge>
        );
      case 'Read':
        return (
          <Badge color="green" variant="filled" leftSection={<IconPointFilled size={12} />}>
            Read
          </Badge>
        );
      case 'Failed':
        return (
          <Badge color="red" variant="filled" leftSection={<IconX size={12} />}>
            Failed
          </Badge>
        );
      default:
        return <Badge color="gray">{status}</Badge>;
    }
  };

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2}>Message Logs</Title>
      </Group>

      <Paper p="md" radius="md" withBorder mb="xl">
        <Group align="flex-end">
          <Select
            label="Filter by Status"
            placeholder="All Statuses"
            data={['Sent', 'Delivered', 'Read', 'Failed']}
            value={statusFilter}
            onChange={setStatusFilter}
            clearable
            w={250}
          />
        </Group>
      </Paper>

      {isLoading ? (
        <Center py="xl">
          <Loader color="green" />
        </Center>
      ) : error ? (
        <Text c="red" ta="center">
          Error loading logs
        </Text>
      ) : logs?.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">
          No communication logs found.
        </Text>
      ) : (
        <Paper radius="md" withBorder>
          <Table stickyHeader verticalSpacing="sm" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Channel</Table.Th>
                <Table.Th>Recipient</Table.Th>
                <Table.Th>Message Snippet</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Sent At</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {logs?.map((log) => (
                <Table.Tr key={log.id}>
                  <Table.Td>
                    <Group gap="xs">
                      {log.channel === 'whatsapp' ? (
                        <IconBrandWhatsapp color="#25D366" size={18} />
                      ) : null}
                      <Text size="sm" tt="capitalize">
                        {log.channel}
                      </Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    {log.person ? (
                      <div>
                        <Text size="sm" fw={500}>
                          {log.person.first_name} {log.person.last_name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {log.person.phone_number}
                        </Text>
                      </div>
                    ) : (
                      <Text size="xs" c="dimmed" fs="italic">
                        External Contact
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" lineClamp={2}>
                      {log.message_body}
                    </Text>
                  </Table.Td>
                  <Table.Td>{getStatusBadge(log.delivery_status)}</Table.Td>
                  <Table.Td>
                    <Text size="sm">{new Date(log.sent_at).toLocaleString()}</Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      )}
    </Container>
  );
}
