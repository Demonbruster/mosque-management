import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Paper,
  Grid,
  Title,
  Text,
  Stack,
  Card,
  Group,
  ThemeIcon,
  Loader,
  Center,
  Table,
  Badge,
} from '@mantine/core';
import { IconReceipt, IconBusinessplan, IconScaleOutline, IconCalendar } from '@tabler/icons-react';
import { getProjectFinancialSummary, getProjectTransactions } from '../../lib/api-projects';
import { ProjectBudgetGauge } from './ProjectBudgetGauge';
import { formatDateMedium } from '../../lib/format-utils';

interface ProjectFinancialsTabProps {
  projectId: string;
}

export function ProjectFinancialsTab({ projectId }: ProjectFinancialsTabProps) {
  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['project-financial-summary', projectId],
    queryFn: () => getProjectFinancialSummary(projectId),
    enabled: !!projectId,
  });

  const { data: transactions, isLoading: isLoadingTxns } = useQuery({
    queryKey: ['project-transactions', projectId],
    queryFn: () => getProjectTransactions(projectId),
    enabled: !!projectId,
  });

  if (isLoadingSummary || isLoadingTxns) {
    return (
      <Center py="xl">
        <Loader size="md" />
      </Center>
    );
  }

  if (!summary) {
    return (
      <Paper withBorder p="xl" radius="md">
        <Text c="dimmed" ta="center">
          No financial data available for this project.
        </Text>
      </Paper>
    );
  }

  return (
    <Stack gap="lg">
      <Grid gutter="md">
        <Grid.Col span={{ base: 12, md: 4 }}>
          <ProjectBudgetGauge utilization={summary.budget_utilization} />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 8 }}>
          <Grid gutter="md">
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Card withBorder radius="md" padding="md">
                <Group wrap="nowrap">
                  <ThemeIcon size={48} radius="md" color="green" variant="light">
                    <IconReceipt size={24} />
                  </ThemeIcon>
                  <div>
                    <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                      Total Receipts
                    </Text>
                    <Text size="xl" fw={700}>
                      ₹ {summary.total_receipts?.toLocaleString()}
                    </Text>
                  </div>
                </Group>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Card withBorder radius="md" padding="md">
                <Group wrap="nowrap">
                  <ThemeIcon size={48} radius="md" color="orange" variant="light">
                    <IconBusinessplan size={24} />
                  </ThemeIcon>
                  <div>
                    <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                      Total Payments
                    </Text>
                    <Text size="xl" fw={700} c="orange.7">
                      ₹ {summary.total_payments?.toLocaleString()}
                    </Text>
                  </div>
                </Group>
              </Card>
            </Grid.Col>

            <Grid.Col span={12}>
              <Card withBorder radius="md" padding="md">
                <Group justify="space-between">
                  <Group wrap="nowrap">
                    <ThemeIcon size={48} radius="md" color="blue" variant="light">
                      <IconScaleOutline size={24} />
                    </ThemeIcon>
                    <div>
                      <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                        Project Balance (Receipts vs Payments)
                      </Text>
                      <Text size="xl" fw={700} c={summary.balance >= 0 ? 'green.8' : 'red.7'}>
                        ₹ {summary.balance?.toLocaleString()}
                      </Text>
                    </div>
                  </Group>
                  <Stack gap={0} align="flex-end">
                    <Text size="xs" c="dimmed">
                      Estimated Budget
                    </Text>
                    <Text size="md" fw={700}>
                      ₹ {summary.estimated_budget?.toLocaleString()}
                    </Text>
                  </Stack>
                </Group>
              </Card>
            </Grid.Col>
          </Grid>
        </Grid.Col>
      </Grid>

      <Paper withBorder p="md" radius="md">
        <Group mb="md" gap="xs">
          <IconReceipt size={20} color="var(--mantine-color-blue-6)" />
          <Title order={4}>Project Transactions ({transactions?.length || 0})</Title>
        </Group>

        {!transactions || transactions.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            No transactions linked to this project yet.
          </Text>
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Date</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Fund</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th style={{ textAlign: 'right' }}>Amount (INR)</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {transactions.map((txn: any) => (
                <Table.Tr key={txn.id}>
                  <Table.Td>
                    <Group gap="xs">
                      <IconCalendar size={14} color="gray" />
                      {formatDateMedium(txn.transaction_date)}
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={txn.type === 'Income' ? 'green' : 'orange'} variant="dot">
                      {txn.type}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{txn.fund_name}</Table.Td>
                  <Table.Td>{txn.description}</Table.Td>
                  <Table.Td>
                    {txn.status === 'Approved' ? (
                      <Badge color="green" size="sm" variant="light">
                        Approved
                      </Badge>
                    ) : (
                      <Badge color="gray" size="sm" variant="light">
                        {txn.status}
                      </Badge>
                    )}
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'right', fontWeight: 600 }}>
                    ₹ {Number(txn.amount).toLocaleString()}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Paper>
    </Stack>
  );
}
