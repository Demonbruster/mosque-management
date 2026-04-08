/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Title, Group, Button, Grid, Paper, Text, Badge, Divider, Table } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { api } from '../lib/api';
import { AddMemberToHouseholdModal } from '../components/forms/AddMemberToHouseholdModal';
import { HouseholdFormModal } from '../components/forms/HouseholdFormModal';

export function HouseholdDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isEditHouseholdOpen, setIsEditHouseholdOpen] = useState(false);

  const deleteLinkMutation = useMutation({
    mutationFn: async (linkId: string) => {
      const res = await api.delete(`/api/person-household-links/${linkId}`);
      return res.data;
    },
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Member removed from household',
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['household-members', id] });
    },
    onError: (error: Error | any) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error || 'Failed to remove member',
        color: 'red',
      });
    },
  });

  const handleRemove = (linkId: string) => {
    if (window.confirm('Are you sure you want to remove this member from the household?')) {
      deleteLinkMutation.mutate(linkId);
    }
  };

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

  const deleteHouseholdMutation = useMutation({
    mutationFn: async () => {
      const res = await api.delete(`/api/households/${id}`);
      return res.data;
    },
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Household deleted successfully',
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['households'] });
      navigate('/households');
    },
    onError: (error: Error | any) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error || 'Failed to delete household',
        color: 'red',
      });
    },
  });

  const handleDeleteHousehold = () => {
    if (
      window.confirm(
        'Are you sure you want to delete this household? This action cannot be undone.',
      )
    ) {
      deleteHouseholdMutation.mutate();
    }
  };

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
          <Button variant="outline" color="green" onClick={() => setIsEditHouseholdOpen(true)}>
            Edit Household
          </Button>
          <Button
            variant="light"
            color="red"
            onClick={handleDeleteHousehold}
            loading={deleteHouseholdMutation.isPending}
          >
            Delete
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
              <Button size="xs" color="green" onClick={() => setIsLinkModalOpen(true)}>
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
                  membersData?.map((member: Record<string, any>) => (
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
                          <Button
                            size="compact-xs"
                            variant="light"
                            color="red"
                            onClick={() => handleRemove(member.link_id)}
                            loading={deleteLinkMutation.isPending}
                          >
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

      <AddMemberToHouseholdModal
        opened={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        householdId={id!}
        currentMembers={membersData || []}
      />

      <HouseholdFormModal
        opened={isEditHouseholdOpen}
        onClose={() => setIsEditHouseholdOpen(false)}
        initialData={householdData}
      />
    </div>
  );
}
