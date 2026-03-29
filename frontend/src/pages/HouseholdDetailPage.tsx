import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Title, Group, Button, Grid, Paper, Text, Badge, Divider, Table } from '@mantine/core';
import { api } from '../lib/api';

export function HouseholdDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: householdData, isLoading: hLoading } = useQuery({
    queryKey: ['household', id],
    queryFn: async () => {
      const res = await api.get(`/api/households/${id}`);
      return res.data.data;
    },
  });

  const { data: membersData, isLoading: mLoading } = useQuery({
    queryKey: ['household-members', id],
    queryFn: async () => {
      const res = await api.get(`/api/households/${id}/members`);
      return res.data.data;
    },
  });

  if (hLoading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (!householdData) return <div style={{ padding: 24 }}>Household not found.</div>;

  return (
    <div style={{ padding: '24px' }}>
      <Group justify="space-between" mb="lg">
        <Group>
          <Button component={Link} to="/households" variant="default">
            &larr; Back
          </Button>
          <Title order={2}>Household Details</Title>
        </Group>
        <Group>
          <Button variant="outline" color="green">
            Edit Address
          </Button>
        </Group>
      </Group>

      <Grid gutter="xl">
        <Grid.Col span={4}>
          <Paper withBorder p="md" radius="md">
            <Title order={4} mb="sm">
              Address Info
            </Title>
            <Divider mb="sm" />
            <Text fw={500} mb="xs">
              {householdData.address_line_1}
            </Text>
            {householdData.address_line_2 && <Text mb="xs">{householdData.address_line_2}</Text>}
            <Text size="sm" c="dimmed">
              {householdData.city}, {householdData.state} {householdData.postal_code}
            </Text>
            <Text size="sm" c="dimmed" mb="sm">
              {householdData.country}
            </Text>

            <Text size="sm" c="dimmed">
              Mahalla Zone
            </Text>
            <Badge color="green" mt={4}>
              {householdData.mahalla_zone || 'None'}
            </Badge>
          </Paper>
        </Grid.Col>

        <Grid.Col span={8}>
          <Paper withBorder p="md" radius="md">
            <Group justify="space-between" mb="sm">
              <Title order={4}>Linked Members</Title>
              <Button size="xs" color="green">
                + Add Member to Household
              </Button>
            </Group>
            <Divider mb="md" />

            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Role</Table.Th>
                  <Table.Th>Since</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {mLoading ? (
                  <Table.Tr>
                    <Table.Td colSpan={4}>Loading members...</Table.Td>
                  </Table.Tr>
                ) : (
                  membersData?.map((member: any) => (
                    <Table.Tr key={member.link_id}>
                      <Table.Td style={{ fontWeight: 500 }}>
                        {member.first_name} {member.last_name}
                      </Table.Td>
                      <Table.Td>
                        <Badge color={member.household_role === 'Head' ? 'violet' : 'gray'}>
                          {member.household_role}
                        </Badge>
                      </Table.Td>
                      <Table.Td>{new Date(member.start_date).toLocaleDateString()}</Table.Td>
                      <Table.Td>
                        <Group gap="sm">
                          <Button
                            size="compact-xs"
                            variant="light"
                            component={Link}
                            to={`/members/${member.person_id}`}
                          >
                            Profile
                          </Button>
                          <Button size="compact-xs" variant="light" color="red">
                            Remove
                          </Button>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))
                )}
                {!mLoading && !membersData?.length && (
                  <Table.Tr>
                    <Table.Td colSpan={4} align="center">
                      No members currently in this household.
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
