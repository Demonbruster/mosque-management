import { useQuery } from '@tanstack/react-query';
import {
  Title,
  Group,
  Button,
  Paper,
  Table,
  Badge,
  ActionIcon,
  Grid,
  Card,
  Text,
} from '@mantine/core';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

export function HouseholdsPage() {
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
          <Button color="green">+ Add Household</Button>
        </Group>
      </Group>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <Grid>
          {householdsData?.map((household: any) => (
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }} key={household.id}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Text fw={500} size="lg" mb="xs">
                  {household.address_line_1}
                </Text>
                {household.address_line_2 && (
                  <Text size="sm" c="dimmed" mb="xs">
                    {household.address_line_2}
                  </Text>
                )}

                <Group justify="space-between" mt="md" mb="xs">
                  <Text size="sm" c="dimmed">
                    City: {household.city || 'N/A'}
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
    </div>
  );
}
