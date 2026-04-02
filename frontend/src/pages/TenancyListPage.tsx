// ============================================
// Tenancy List Page — ST-13.7
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
  Text,
  Loader,
  Stack,
  Paper,
  Select,
} from '@mantine/core';
import { IconPlus, IconEye, IconAlertTriangle } from '@tabler/icons-react';
import { getAgreements, TenancyAgreement, AgreementStatus } from '../lib/api-tenancy';
import { CreateAgreementModal } from './tenancy/CreateAgreementModal';

const STATUS_COLORS: Record<AgreementStatus, string> = {
  Active: 'green',
  Pending: 'yellow',
  Expired: 'gray',
  Terminated: 'red',
};

export function TenancyListPage() {
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const {
    data: agreements,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['tenancy_agreements'],
    queryFn: getAgreements,
  });

  const filtered = statusFilter ? agreements?.filter((a) => a.status === statusFilter) : agreements;

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Stack gap={2}>
          <Title order={2}>Tenancy & Rental Agreements</Title>
          <Text c="dimmed" size="sm">
            Manage mosque property tenants, rent tracking, and deposits.
          </Text>
        </Stack>
        <Group>
          <Button
            variant="light"
            color="orange"
            leftSection={<IconAlertTriangle size={16} />}
            onClick={() => navigate('/tenancy/rent-due')}
          >
            Rent Due Report
          </Button>
          <Button leftSection={<IconPlus size={16} />} onClick={() => setCreateOpen(true)}>
            New Agreement
          </Button>
        </Group>
      </Group>

      <Paper withBorder p="md" mb="md" radius="md">
        <Group>
          <Select
            placeholder="Filter by Status"
            data={['Active', 'Pending', 'Expired', 'Terminated']}
            value={statusFilter}
            onChange={setStatusFilter}
            clearable
            w={200}
          />
          <Text size="sm" c="dimmed">
            {filtered?.length ?? 0} agreement{(filtered?.length ?? 0) !== 1 ? 's' : ''}
          </Text>
        </Group>
      </Paper>

      {isLoading ? (
        <Loader />
      ) : (
        <Table stickyHeader verticalSpacing="md" striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Tenant</Table.Th>
              <Table.Th>Property</Table.Th>
              <Table.Th>Rent / Month</Table.Th>
              <Table.Th>Start Date</Table.Th>
              <Table.Th>End Date</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {!filtered?.length ? (
              <Table.Tr>
                <Table.Td colSpan={7} align="center">
                  <Text c="dimmed" py="xl">
                    No tenancy agreements found.
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              filtered.map((a: TenancyAgreement) => (
                <Table.Tr key={a.id}>
                  <Table.Td>
                    <Text fw={500}>
                      {a.person.first_name} {a.person.last_name}
                    </Text>
                  </Table.Td>
                  <Table.Td>{a.asset.name}</Table.Td>
                  <Table.Td fw={600} c="green">
                    ₹{parseFloat(a.rent_amount).toLocaleString()}
                  </Table.Td>
                  <Table.Td>{a.start_date}</Table.Td>
                  <Table.Td>{a.end_date ?? '—'}</Table.Td>
                  <Table.Td>
                    <Badge color={STATUS_COLORS[a.status]} variant="light">
                      {a.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <ActionIcon
                      variant="light"
                      color="blue"
                      onClick={() => navigate(`/tenancy/${a.id}`)}
                    >
                      <IconEye size={16} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      )}

      <CreateAgreementModal
        opened={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => {
          refetch();
          setCreateOpen(false);
        }}
      />
    </Container>
  );
}
