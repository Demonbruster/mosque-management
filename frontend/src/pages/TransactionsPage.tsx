/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@tanstack/react-query';
import {
  Title,
  Group,
  Button,
  Table,
  Badge,
  Paper,
  LoadingOverlay,
  Text,
  Tooltip,
} from '@mantine/core';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

export function TransactionsPage() {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const res = await api.get('/api/transactions');
      return res.data.data;
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'green';
      case 'Rejected':
        return 'red';
      case 'Pending':
      default:
        return 'yellow';
    }
  };

  const formatCurrency = (amount: string, currency: string) => {
    return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: currency || 'INR',
    }).format(Number(amount));
  };

  return (
    <div style={{ padding: '24px' }}>
      <Group justify="space-between" mb="lg">
        <Title order={2}>Financial Transactions</Title>
        <Button color="green" component={Link} to="/finance/new">
          + New Entry
        </Button>
      </Group>

      <Paper withBorder shadow="sm" p="md" pos="relative">
        <LoadingOverlay
          visible={isLoading}
          zIndex={1000}
          overlayProps={{ radius: 'sm', blur: 2 }}
        />

        <Table striped highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Date</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Amount</Table.Th>
              <Table.Th>Fund</Table.Th>
              <Table.Th>Donor/Payee</Table.Th>
              <Table.Th>Logged By</Table.Th>
              <Table.Th>Status</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {transactions?.map((txn: any) => (
              <Table.Tr key={txn.id}>
                <Table.Td>{new Date(txn.transaction_date).toLocaleDateString()}</Table.Td>
                <Table.Td>
                  <Badge color={txn.type === 'Income' ? 'teal' : 'orange'} variant="light">
                    {txn.type}
                  </Badge>
                </Table.Td>
                <Table.Td style={{ fontWeight: 600 }}>
                  <Text c={txn.type === 'Income' ? 'teal.7' : 'orange.7'} fw={600}>
                    {txn.type === 'Income' ? '+' : '-'} {formatCurrency(txn.amount, txn.currency)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge color="blue" variant="outline">
                    {txn.fund_name || '—'}
                  </Badge>
                </Table.Td>
                <Table.Td>{txn.donor_name || 'Anonymous / General'}</Table.Td>
                <Table.Td>{txn.entered_by_name || 'Admin'}</Table.Td>
                <Table.Td>
                  {txn.status === 'Rejected' && txn.rejection_reason ? (
                    <Tooltip label={txn.rejection_reason} multiline w={250} withArrow>
                      <Badge color={getStatusColor(txn.status)} style={{ cursor: 'help' }}>
                        {txn.status}
                      </Badge>
                    </Tooltip>
                  ) : (
                    <Badge color={getStatusColor(txn.status)}>{txn.status}</Badge>
                  )}
                </Table.Td>
              </Table.Tr>
            ))}
            {!transactions?.length && !isLoading && (
              <Table.Tr>
                <Table.Td colSpan={7} align="center">
                  No transactions found.
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Paper>
    </div>
  );
}
