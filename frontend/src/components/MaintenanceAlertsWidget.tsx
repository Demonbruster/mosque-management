// ============================================
// Maintenance Alerts Widget
// ============================================

import { useQuery } from '@tanstack/react-query';
import { Card, Text, Title, Badge, Group, Stack, Loader, ActionIcon } from '@mantine/core';
import { IconAlertTriangle, IconSettings, IconExternalLink } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { getMaintenanceAlerts } from '../lib/api-assets';

export function MaintenanceAlertsWidget() {
  const navigate = useNavigate();
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['asset_maintenance_alerts'],
    queryFn: getMaintenanceAlerts,
  });

  if (isLoading) {
    return (
      <Card withBorder shadow="sm" radius="md" p="md">
        <Loader size="sm" />
      </Card>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <Card withBorder shadow="sm" radius="md" p="md">
        <Group mb="xs">
          <IconSettings size={20} color="gray" />
          <Title order={5} c="dimmed">
            Maintenance Status
          </Title>
        </Group>
        <Text size="sm" c="dimmed">
          No assets require maintenance in the next 30 days.
        </Text>
      </Card>
    );
  }

  return (
    <Card
      withBorder
      shadow="sm"
      radius="md"
      p="md"
      style={{ borderColor: 'var(--mantine-color-yellow-6)' }}
    >
      <Group justify="space-between" mb="xs">
        <Group gap="xs" c="yellow.7">
          <IconAlertTriangle size={20} />
          <Title order={5}>Maintenance Due Soon</Title>
        </Group>
        <Badge color="yellow" variant="light">
          {alerts.length}
        </Badge>
      </Group>

      <Stack gap="xs" mt="md">
        {alerts.map((asset) => (
          <Group key={asset.id} justify="space-between" align="center" wrap="nowrap">
            <div>
              <Text size="sm" fw={500} truncate>
                {asset.name}
              </Text>
              <Text size="xs" c="dimmed">
                ID: {asset.unique_asset_id}
              </Text>
            </div>
            <ActionIcon
              variant="light"
              color="blue"
              onClick={() => navigate(`/assets/${asset.id}`)}
            >
              <IconExternalLink size={16} />
            </ActionIcon>
          </Group>
        ))}
      </Stack>
    </Card>
  );
}
