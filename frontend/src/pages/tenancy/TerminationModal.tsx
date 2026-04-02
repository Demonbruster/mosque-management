// ============================================
// Termination Modal — ST-13.11
// ============================================

import { useMutation } from '@tanstack/react-query';
import {
  Modal,
  Stack,
  NumberInput,
  Button,
  Textarea,
  Text,
  Alert,
  Divider,
  Paper,
  Group,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconAlertTriangle } from '@tabler/icons-react';
import { terminateAgreement } from '../../lib/api-tenancy';
import { useMemo } from 'react';

interface Props {
  opened: boolean;
  agreementId: string;
  securityDeposit: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function TerminationModal({
  opened,
  agreementId,
  securityDeposit,
  onClose,
  onSuccess,
}: Props) {
  const form = useForm({
    initialValues: {
      deductions: 0,
      notes: '',
    },
    validate: {
      deductions: (v) =>
        v >= 0 && v <= securityDeposit
          ? null
          : `Deductions cannot exceed deposit of ₹${securityDeposit.toLocaleString()}`,
    },
  });

  const refundAmount = useMemo(
    () => Math.max(0, securityDeposit - (form.values.deductions || 0)),
    [securityDeposit, form.values.deductions],
  );

  const mutation = useMutation({
    mutationFn: (values: typeof form.values) =>
      terminateAgreement(agreementId, {
        refund_amount: refundAmount,
        deductions: values.deductions,
        notes: values.notes || undefined,
      }),
    onSuccess: () => {
      notifications.show({
        title: 'Agreement Terminated',
        message: `Deposit refund of ₹${refundAmount.toLocaleString()} has been calculated.`,
        color: 'orange',
      });
      form.reset();
      onSuccess();
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to terminate agreement.',
        color: 'red',
      });
    },
  });

  return (
    <Modal opened={opened} onClose={onClose} title="Terminate Agreement" size="md">
      <form onSubmit={form.onSubmit((v) => mutation.mutate(v))}>
        <Stack gap="sm">
          <Alert color="red" icon={<IconAlertTriangle size={16} />} variant="light">
            This action will permanently terminate the tenancy agreement. This cannot be undone.
          </Alert>

          <Divider label="Security Deposit Calculator" labelPosition="center" />

          <Paper withBorder p="md" radius="md" bg="gray.0">
            <Group justify="space-between" mb="xs">
              <Text size="sm" c="dimmed">
                Original Security Deposit
              </Text>
              <Text fw={700}>₹{securityDeposit.toLocaleString()}</Text>
            </Group>
            <Group justify="space-between" mb="xs">
              <Text size="sm" c="dimmed">
                Deductions
              </Text>
              <Text fw={700} c="red">
                -₹{(form.values.deductions || 0).toLocaleString()}
              </Text>
            </Group>
            <Divider my="xs" />
            <Group justify="space-between">
              <Text fw={600}>Refund Amount</Text>
              <Text fw={800} size="lg" c="green">
                ₹{refundAmount.toLocaleString()}
              </Text>
            </Group>
          </Paper>

          <NumberInput
            label="Deductions from Deposit (₹)"
            description="For unpaid rent, damages, or other charges."
            prefix="₹"
            min={0}
            max={securityDeposit}
            {...form.getInputProps('deductions')}
          />

          <Textarea
            label="Termination Notes"
            placeholder="Reason for termination, condition of property, etc."
            rows={3}
            {...form.getInputProps('notes')}
          />

          <Button type="submit" loading={mutation.isPending} color="red" mt="sm">
            Confirm Termination & Refund ₹{refundAmount.toLocaleString()}
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
