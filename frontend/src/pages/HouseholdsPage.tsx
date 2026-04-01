/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Title, Group, Button, Card, Text, Badge, ActionIcon, Grid } from '@mantine/core';
import { IconEdit } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { HouseholdFormModal } from '../components/forms/HouseholdFormModal';

export function HouseholdsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState<any>(null);

  const handleOpenModal = (household?: any) => {
    setSelectedHousehold(household || null);
    setIsModalOpen(true);
  };
  const { data: householdsData, isLoading } = useQuery({
    queryKey: ['households'],
    queryFn: async () => {
      const res = await api.get('/api/households');
      return res.data.data;
    },
  });

  return (
    <div style={{ padding: '24px' }}>
      <Group justify="space-between" mb="lg">
        <Title order={2}>Households</Title>
        <Group>
          <Button color="green" onClick={() => handleOpenModal()}>
            + Add Household
          </Button>
        </Group>
      </Group>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <Grid>
          {householdsData?.map((household: Record<string, any>) => (
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }} key={household.id}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between" align="flex-start" mb="xs">
                  <Text fw={500} size="lg">
                    {household.address_line_1}
                  </Text>
                  <ActionIcon
                    variant="subtle"
                    color="blue"
                    onClick={() => handleOpenModal(household)}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                </Group>
                {household.address_line_2 && (
                  <Text size="sm" c="dimmed" mb="xs">
                    {household.country && (
                      <Text size="sm" c="dimmed" mb="sm">
                        {household.country}
                      </Text>
                    )}
                    {household.address_line_2}
                  </Text>
                )}

                <Group justify="space-between" mt="md" mb="xs">
                  <Text size="sm" c="dimmed">
                    {household.city}, {household.state} {household.postal_code}
                  </Text>
                  {household.mahalla_zone && (
                    <Badge color="green" variant="light">
                      {household.mahalla_zone}
                    </Badge>
                  )}
                </Group>

                <Button
                  color="green"
                  fullWidth
                  mt="md"
                  radius="md"
                  component={Link}
                  to={`/households/${household.id}`}
                >
                  View Household Context
                </Button>
              </Card>
            </Grid.Col>
          ))}
          {!householdsData?.length && <div style={{ padding: '20px' }}>No households found.</div>}
        </Grid>
      )}

      <HouseholdFormModal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={selectedHousehold}
      />
    </div>
  );
}
