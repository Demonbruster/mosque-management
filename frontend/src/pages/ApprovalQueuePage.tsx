/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Title,
  Group,
  Table,
  Badge,
  Paper,
  LoadingOverlay,
  Text,
  Button,
  Modal,
  Textarea,
  Stack,
  ActionIcon,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX, IconEye } from '@tabler/icons-react';
import { api } from '../lib/api';

export function ApprovalQueuePage() {
  const queryClient = useQueryClient();
  const [selectedTxn, setSelectedTxn] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // 1. Fetch pending transactions
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions', 'pending'],
    queryFn: async () => {
      const res = await api.get('/api/transactions/pending');
      return res.data.data;
    },
  });

  // 2. Approve Mutation
  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch(`/api/transactions/${id}/approve`);
      return res.data;
    },
    onSuccess: () => {
      notifications.show({
        title: 'Transaction Approved',
        message: 'The transaction has been approved and logged.',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      closeModal();
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Approval Failed',
        message: error.response?.data?.error || 'Maker cannot approve their own transaction.',
        color: 'red',
        icon: <IconX size={16} />,
      });
    },
  });

  // 3. Reject Mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await api.patch(`/api/transactions/${id}/reject`, {
        rejection_reason: reason,
      });
      return res.data;
    },
    onSuccess: () => {
      notifications.show({
        title: 'Transaction Rejected',
        message: 'The transaction has been rejected.',
        color: 'orange',
        icon: <IconCheck size={16} />,
      });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      closeModal();
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Rejection Failed',
        message: error.response?.data?.error || 'Maker cannot reject their own transaction.',
        color: 'red',
        icon: <IconX size={16} />,
      });
    },
  });

  const formatCurrency = (amount: string, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
    }).format(Number(amount));
  };

  const openReviewModal = (txn: any) => {
    setSelectedTxn(txn);
    setIsRejecting(false);
    setRejectionReason('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTxn(null);
    setIsRejecting(false);
    setRejectionReason('');
  };

  const handleApprove = () => {
    if (selectedTxn) {
      approveMutation.mutate(selectedTxn.id);
    }
  };

  const handleRejectSubmit = () => {
    if (selectedTxn) {
      if (!rejectionReason.trim()) {
        notifications.show({
          title: 'Error',
          message: 'Please provide a reason for rejection.',
          color: 'red',
        });
        return;
      }
      rejectMutation.mutate({ id: selectedTxn.id, reason: rejectionReason });
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Group justify="space-between" mb="lg">
        <Title order={2}>Maker-Checker Verification Queue</Title>
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
              <Table.Th>Maker (Logged By)</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>Action</Table.Th>
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
                <Table.Td>
                  <Text fw={500} size="sm">
                    {txn.entered_by_name || 'Admin'}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge color="yellow">{txn.status}</Badge>
                </Table.Td>
                <Table.Td style={{ textAlign: 'center' }}>
                  <ActionIcon
                    color="blue"
                    variant="light"
                    title="Review Transaction"
                    onClick={() => openReviewModal(txn)}
                  >
                    <IconEye size={18} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))}
            {!transactions?.length && !isLoading && (
              <Table.Tr>
                <Table.Td colSpan={8} align="center" py="xl">
                  <Text c="dimmed">No pending transactions require verification.</Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Paper>

      {/* Verification Modal */}
      <Modal
        opened={isModalOpen}
        onClose={closeModal}
        title="Verify Transaction"
        size="lg"
        overlayProps={{ blur: 3 }}
      >
        {selectedTxn && (
          <Stack gap="md">
            <Paper withBorder p="md" bg="gray.0">
              <Group grow align="flex-start">
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                    Transaction Type
                  </Text>
                  <Text fw={500} mb="sm">
                    {selectedTxn.type}
                  </Text>

                  <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                    Fund Category
                  </Text>
                  <Text fw={500} mb="sm">
                    {selectedTxn.fund_name}
                  </Text>

                  <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                    Payment Method
                  </Text>
                  <Text fw={500}>{selectedTxn.payment_method}</Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                    Amount
                  </Text>
                  <Text
                    fw={700}
                    size="xl"
                    c={selectedTxn.type === 'Income' ? 'teal.7' : 'orange.7'}
                    mb="sm"
                  >
                    {formatCurrency(selectedTxn.amount, selectedTxn.currency)}
                  </Text>

                  <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                    Maker
                  </Text>
                  <Text fw={500} mb="sm">
                    {selectedTxn.entered_by_name}
                  </Text>

                  <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                    Date Logged
                  </Text>
                  <Text fw={500}>{new Date(selectedTxn.transaction_date).toLocaleString()}</Text>
                </div>
              </Group>

              {selectedTxn.description && (
                <div style={{ marginTop: '16px' }}>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                    Description
                  </Text>
                  <Text size="sm">{selectedTxn.description}</Text>
                </div>
              )}
            </Paper>

            {isRejecting ? (
              <Paper withBorder p="md" bg="red.0" style={{ borderColor: '#ffc9c9' }}>
                <Textarea
                  label="Reason for Rejection"
                  placeholder="E.g., Amount mismatch, missing physical cheque, etc."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.currentTarget.value)}
                  withAsterisk
                  minRows={3}
                  data-autofocus
                />
                <Group justify="flex-end" mt="md">
                  <Button variant="subtle" color="gray" onClick={() => setIsRejecting(false)}>
                    Cancel Rejection
                  </Button>
                  <Button
                    color="red"
                    onClick={handleRejectSubmit}
                    loading={rejectMutation.isPending}
                  >
                    Confirm Reject
                  </Button>
                </Group>
              </Paper>
            ) : (
              <Group justify="flex-end" mt="md">
                <Button variant="outline" color="red" onClick={() => setIsRejecting(true)}>
                  Reject
                </Button>
                <Button color="green" onClick={handleApprove} loading={approveMutation.isPending}>
                  Verify & Approve
                </Button>
              </Group>
            )}
          </Stack>
        )}
      </Modal>
    </div>
  );
}
