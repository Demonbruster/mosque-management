import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Title, Group, Button, Grid, Paper, Text, Badge, Divider, Table } from '@mantine/core';
import { api } from '../lib/api';

export function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: personData, isLoading: personLoading } = useQuery({
    queryKey: ['person', id],
    queryFn: async () => {
      const res = await api.get(`/api/persons/${id}`);
      return res.data.data;
    },
  });

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['person-history', id],
    queryFn: async () => {
      const res = await api.get(`/api/persons/${id}/household-history`);
      return res.data.data;
    },
  });

  const { data: relationshipsData, isLoading: relationsLoading } = useQuery({
    queryKey: ['person-relationships', id],
    queryFn: async () => {
      const res = await api.get(`/api/person-relationships/${id}`);
      return res.data.data;
    },
  });

  if (personLoading) return <div>Loading...</div>;
  if (!personData) return <div>Person not found.</div>;

  return (
    <div style={{ padding: '24px' }}>
      <Group justify="space-between" mb="lg">
        <Group>
          <Button component={Link} to="/members" variant="default">
            &larr; Back
          </Button>
          <Title order={2}>
            {personData.first_name} {personData.last_name}
          </Title>
          <Badge color="blue">{personData.category}</Badge>
        </Group>
        <Group>
          <Button variant="outline" color="green">
            Edit Profile
          </Button>
        </Group>
      </Group>

      <Grid gutter="xl">
        <Grid.Col span={4}>
          <Paper withBorder p="md" radius="md">
            <Title order={4} mb="sm">
              Personal Info
            </Title>
            <Divider mb="sm" />
            <Text size="sm" c="dimmed">
              Email
            </Text>
            <Text mb="sm">{personData.email || 'N/A'}</Text>
            <Text size="sm" c="dimmed">
              Phone
            </Text>
            <Text mb="sm">{personData.phone_number || 'N/A'}</Text>
            <Text size="sm" c="dimmed">
              Gender
            </Text>
            <Text mb="sm">{personData.gender || 'N/A'}</Text>
            <Text size="sm" c="dimmed">
              WhatsApp Opt-in
            </Text>
            <Badge color={personData.whatsapp_opt_in ? 'green' : 'gray'}>
              {personData.whatsapp_opt_in ? 'Yes' : 'No'}
            </Badge>
          </Paper>

          <Paper withBorder p="md" radius="md" mt="md">
            <Group justify="space-between" mb="sm">
              <Title order={4}>Relationships</Title>
              <Button size="xs" variant="light">
                + Link
              </Button>
            </Group>
            <Divider mb="sm" />
            {relationsLoading ? (
              <Text size="sm">Loading...</Text>
            ) : relationshipsData?.length > 0 ? (
              <ul style={{ paddingLeft: '20px', margin: 0 }}>
                {relationshipsData.map((rel: any) => (
                  <li key={rel.id}>
                    <Text size="sm">
                      {rel.person_id_a === id
                        ? `Linked to ${rel.person_id_b}`
                        : `Linked from ${rel.person_id_a}`}{' '}
                      (<b>{rel.relationship_code}</b>)
                    </Text>
                  </li>
                ))}
              </ul>
            ) : (
              <Text size="sm" c="dimmed">
                No relationships defined.
              </Text>
            )}
          </Paper>
        </Grid.Col>

        <Grid.Col span={8}>
          <Paper withBorder p="md" radius="md">
            <Group justify="space-between" mb="sm">
              <Title order={4}>Household History</Title>
              <Button size="xs" variant="light">
                + Add to Household
              </Button>
            </Group>
            <Divider mb="md" />

            <Table striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Household</Table.Th>
                  <Table.Th>Role</Table.Th>
                  <Table.Th>Date Joined</Table.Th>
                  <Table.Th>Date Left</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {historyLoading ? (
                  <Table.Tr>
                    <Table.Td colSpan={5}>Loading...</Table.Td>
                  </Table.Tr>
                ) : (
                  historyData?.map((hist: any) => (
                    <Table.Tr key={hist.link_id}>
                      <Table.Td>
                        {hist.address_line_1} {hist.mahalla_zone ? `(${hist.mahalla_zone})` : ''}
                      </Table.Td>
                      <Table.Td>{hist.role}</Table.Td>
                      <Table.Td>{new Date(hist.start_date).toLocaleDateString()}</Table.Td>
                      <Table.Td>
                        {hist.end_date ? new Date(hist.end_date).toLocaleDateString() : '-'}
                      </Table.Td>
                      <Table.Td>
                        {hist.is_active ? (
                          <Badge color="green">Active</Badge>
                        ) : (
                          <Badge color="gray">Past</Badge>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Button
                          size="compact-xs"
                          component={Link}
                          to={`/households/${hist.household_id}`}
                          variant="light"
                        >
                          View
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  ))
                )}
                {!historyLoading && !historyData?.length && (
                  <Table.Tr>
                    <Table.Td colSpan={6} align="center">
                      No households linked.
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Paper>
        </Grid.Col>
      </Grid>
    </div>
  );
}
