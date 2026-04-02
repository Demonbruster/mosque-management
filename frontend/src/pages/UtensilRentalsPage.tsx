// ============================================
// Utensil Rentals Dashboard — ST-14.10
// Outstanding Rentals + All Rentals tabs
// ============================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
  Tabs,
  Tooltip,
  Alert,
  ThemeIcon,
} from '@mantine/core';
import {
  IconPackage,
  IconArrowBack,
  IconPrinter,
  IconAlertTriangle,
  IconCircleCheck,
  IconPlus,
} from '@tabler/icons-react';
import {
  getOutstandingRentals,
  getAllRentals,
  OutstandingRental,
  UtensilRental,
} from '../lib/api-utensils';
import { IssueUtensilModal } from './utensils/IssueUtensilModal';
import { ReturnUtensilModal } from './utensils/ReturnUtensilModal';

export function UtensilRentalsPage() {
  const navigate = useNavigate();
  const [issueOpen, setIssueOpen] = useState(false);
  const [returnTarget, setReturnTarget] = useState<OutstandingRental | null>(null);

  const {
    data: outstanding,
    isLoading: outstandingLoading,
    refetch: refetchOutstanding,
  } = useQuery({
    queryKey: ['utensil_rentals_outstanding'],
    queryFn: getOutstandingRentals,
  });

  const {
    data: allRentals,
    isLoading: allLoading,
    refetch: refetchAll,
  } = useQuery({
    queryKey: ['utensil_rentals_all'],
    queryFn: () => getAllRentals(),
  });

  const overdueCount = outstanding?.filter((r) => r.overdue_days > 7).length ?? 0;

  const handleSuccess = () => {
    setIssueOpen(false);
    setReturnTarget(null);
    refetchOutstanding();
    refetchAll();
  };

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Stack gap={2}>
          <Title order={2}>Utensil & Equipment Rentals</Title>
          <Text c="dimmed" size="sm">
            Track issued items, process returns, and manage outstanding rentals.
          </Text>
        </Stack>
        <Group>
          <Button
            variant="light"
            leftSection={<IconPackage size={16} />}
            onClick={() => navigate('/utensils')}
          >
            Manage Inventory
          </Button>
          <Button leftSection={<IconPlus size={16} />} onClick={() => setIssueOpen(true)}>
            Issue Items
          </Button>
        </Group>
      </Group>

      {/* Stats Row */}
      <Group mb="lg" gap="md">
        <Paper withBorder p="md" radius="md" miw={150} ta="center">
          <Text size="xl" fw={800} c="orange">
            {outstanding?.length ?? 0}
          </Text>
          <Text size="xs" c="dimmed">
            Items Out
          </Text>
        </Paper>
        <Paper withBorder p="md" radius="md" miw={150} ta="center">
          <Text size="xl" fw={800} c="red">
            {overdueCount}
          </Text>
          <Text size="xs" c="dimmed">
            Overdue (&gt;7 days)
          </Text>
        </Paper>
        <Paper withBorder p="md" radius="md" miw={150} ta="center">
          <Text size="xl" fw={800} c="dimmed">
            {allRentals?.length ?? 0}
          </Text>
          <Text size="xs" c="dimmed">
            Total Rentals
          </Text>
        </Paper>
      </Group>

      {overdueCount > 0 && (
        <Alert
          icon={<IconAlertTriangle size={16} />}
          color="red"
          title={`${overdueCount} overdue rental${overdueCount !== 1 ? 's' : ''} (over 7 days)`}
          mb="md"
        >
          Contact borrowers and guarantors immediately for collection.
        </Alert>
      )}

      <Tabs defaultValue="outstanding">
        <Tabs.List mb="md">
          <Tabs.Tab
            value="outstanding"
            leftSection={
              <ThemeIcon size="xs" color="orange" variant="transparent">
                <IconAlertTriangle size={14} />
              </ThemeIcon>
            }
          >
            Outstanding ({outstanding?.length ?? 0})
          </Tabs.Tab>
          <Tabs.Tab
            value="all"
            leftSection={
              <ThemeIcon size="xs" color="green" variant="transparent">
                <IconCircleCheck size={14} />
              </ThemeIcon>
            }
          >
            All Rentals
          </Tabs.Tab>
        </Tabs.List>

        {/* ── Outstanding Tab ── */}
        <Tabs.Panel value="outstanding">
          {outstandingLoading ? (
            <Loader />
          ) : (
            <Paper withBorder radius="md">
              <Table stickyHeader verticalSpacing="md" striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Item</Table.Th>
                    <Table.Th>Qty</Table.Th>
                    <Table.Th>Borrower</Table.Th>
                    <Table.Th>Guarantor</Table.Th>
                    <Table.Th>Issue Date</Table.Th>
                    <Table.Th>Days Out</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {!outstanding?.length ? (
                    <Table.Tr>
                      <Table.Td colSpan={7} ta="center">
                        <Stack align="center" py="xl" gap="xs">
                          <IconCircleCheck size={32} color="green" />
                          <Text c="dimmed">All items have been returned. Nothing outstanding.</Text>
                        </Stack>
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    outstanding.map((rental) => (
                      <Table.Tr key={rental.id} bg={rental.overdue_days > 7 ? 'red.0' : undefined}>
                        <Table.Td>
                          <Text fw={500}>{rental.item_name}</Text>
                          {rental.rental_price && (
                            <Text size="xs" c="dimmed">
                              ₹{parseFloat(rental.rental_price).toFixed(2)}/item
                            </Text>
                          )}
                        </Table.Td>
                        <Table.Td>
                          <Badge variant="light">{rental.quantity}</Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{rental.borrower_name}</Text>
                          {rental.borrower_phone && (
                            <Text size="xs" c="dimmed">
                              {rental.borrower_phone}
                            </Text>
                          )}
                          <Badge size="xs" variant="dot" color="blue" mt={2}>
                            {rental.borrower_category}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          {rental.guarantor ? (
                            <Stack gap={0}>
                              <Text size="sm">{rental.guarantor.guarantor_name}</Text>
                              {rental.guarantor.guarantor_phone && (
                                <Text size="xs" c="dimmed">
                                  {rental.guarantor.guarantor_phone}
                                </Text>
                              )}
                            </Stack>
                          ) : (
                            <Text c="dimmed" size="sm">
                              —
                            </Text>
                          )}
                        </Table.Td>
                        <Table.Td>{rental.issue_date}</Table.Td>
                        <Table.Td>
                          <Badge
                            color={
                              rental.overdue_days > 7
                                ? 'red'
                                : rental.overdue_days > 3
                                  ? 'orange'
                                  : 'green'
                            }
                            variant="light"
                          >
                            {rental.overdue_days}d
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <Tooltip label="Process Return">
                              <ActionIcon
                                variant="light"
                                color="green"
                                onClick={() => setReturnTarget(rental)}
                              >
                                <IconArrowBack size={16} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Print Voucher">
                              <ActionIcon
                                variant="light"
                                color="gray"
                                onClick={() => navigate(`/utensil-rentals/${rental.id}/voucher`)}
                              >
                                <IconPrinter size={16} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))
                  )}
                </Table.Tbody>
              </Table>
            </Paper>
          )}
        </Tabs.Panel>

        {/* ── All Rentals Tab ── */}
        <Tabs.Panel value="all">
          {allLoading ? (
            <Loader />
          ) : (
            <Paper withBorder radius="md">
              <Table stickyHeader verticalSpacing="md" striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Item</Table.Th>
                    <Table.Th>Borrower</Table.Th>
                    <Table.Th>Qty</Table.Th>
                    <Table.Th>Issue Date</Table.Th>
                    <Table.Th>Return Date</Table.Th>
                    <Table.Th>Penalty</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {!allRentals?.length ? (
                    <Table.Tr>
                      <Table.Td colSpan={8} ta="center">
                        <Text c="dimmed" py="xl">
                          No rental history yet.
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    allRentals.map((rental: UtensilRental) => (
                      <Table.Tr key={rental.id}>
                        <Table.Td>
                          <Text fw={500} size="sm">
                            {rental.item_name}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{rental.borrower_name}</Text>
                        </Table.Td>
                        <Table.Td>{rental.quantity}</Table.Td>
                        <Table.Td>{rental.issue_date}</Table.Td>
                        <Table.Td>{rental.return_date ?? '—'}</Table.Td>
                        <Table.Td>
                          {parseFloat(rental.penalty_fee) > 0 ? (
                            <Text size="sm" c="red" fw={600}>
                              ₹{parseFloat(rental.penalty_fee).toFixed(2)}
                            </Text>
                          ) : (
                            <Text size="sm" c="dimmed">
                              ₹0
                            </Text>
                          )}
                        </Table.Td>
                        <Table.Td>
                          <Badge color={rental.is_returned ? 'green' : 'orange'} variant="light">
                            {rental.is_returned ? 'Returned' : 'Out'}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Tooltip label="Print Voucher">
                            <ActionIcon
                              variant="light"
                              color="gray"
                              onClick={() => navigate(`/utensil-rentals/${rental.id}/voucher`)}
                            >
                              <IconPrinter size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </Table.Td>
                      </Table.Tr>
                    ))
                  )}
                </Table.Tbody>
              </Table>
            </Paper>
          )}
        </Tabs.Panel>
      </Tabs>

      <IssueUtensilModal
        opened={issueOpen}
        onClose={() => setIssueOpen(false)}
        onSuccess={handleSuccess}
      />

      <ReturnUtensilModal
        opened={!!returnTarget}
        onClose={() => setReturnTarget(null)}
        onSuccess={handleSuccess}
        rental={returnTarget}
      />
    </Container>
  );
}
