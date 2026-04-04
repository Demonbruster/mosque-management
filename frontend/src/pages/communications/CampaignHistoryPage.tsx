import {
  Container,
  Title,
  Card,
  Text,
  Table,
  Badge,
  Group,
  Loader,
  ActionIcon,
} from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { IconHistory, IconEye } from '@tabler/icons-react';
import { getCampaigns } from '../../lib/api-communications';
import dayjs from 'dayjs';

export default function CampaignHistoryPage() {
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['broadcast-campaigns'],
    queryFn: getCampaigns,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'green';
      case 'Sending':
        return 'blue';
      case 'Scheduled':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  return (
    <Container size="xl" py="xl">
      <Group mb="xl">
        <IconHistory size={32} color="var(--mantine-color-blue-6)" />
        <Title order={2} c="blue.8">
          Campaign History
        </Title>
      </Group>

      <Card withBorder shadow="sm" radius="md">
        {isLoading ? (
          <Group justify="center" py="xl">
            <Loader />
          </Group>
        ) : (
          <Table verticalSpacing="md" striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Created / Sent</Table.Th>
                <Table.Th>Total Target</Table.Th>
                <Table.Th>Metrics</Table.Th>
                <Table.Th></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {!campaigns?.length ? (
                <Table.Tr>
                  <Table.Td colSpan={6} align="center">
                    <Text c="dimmed" my="md">
                      No campaigns found.
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                campaigns.map((camp) => (
                  <Table.Tr key={camp.id}>
                    <Table.Td fw={600}>{camp.name}</Table.Td>
                    <Table.Td>
                      <Badge color={getStatusColor(camp.status)}>{camp.status}</Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{dayjs(camp.created_at).format('MMM D, YYYY HH:mm')}</Text>
                    </Table.Td>
                    <Table.Td>{camp.total_count}</Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Badge variant="dot" color="blue">
                          Sent: {camp.sent_count}
                        </Badge>
                        <Badge variant="dot" color="green">
                          Dlvry: {camp.delivered_count}
                        </Badge>
                        <Badge variant="dot" color="red">
                          Fail: {camp.failed_count}
                        </Badge>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <ActionIcon variant="light" title="View details (coming soon)">
                        <IconEye size={18} />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        )}
      </Card>
    </Container>
  );
}
