// ============================================
// Dashboard Page
// ============================================

import { Container, Stack } from '@mantine/core';
import { PublicDashboard } from '../components/PublicDashboard';
import { MaintenanceAlertsWidget } from '../components/MaintenanceAlertsWidget';
import { useAuth } from '../lib/auth-context';

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <Stack gap="xl">
      {user && (
        <Container size="xl" mt="md" w="100%">
          <MaintenanceAlertsWidget />
        </Container>
      )}
      <PublicDashboard />
    </Stack>
  );
}
