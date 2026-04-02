// ============================================
// Record Rent Payment Modal
// ============================================

import { useMutation } from '@tanstack/react-query';
import {
  Modal,
  Stack,
  NumberInput,
  Select,
  Button,
  Textarea,
  Group,
  Text,
  Divider,
  Alert,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { DateInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { recordRentPayment, PaymentMethod, MONTHS } from '../../lib/api-tenancy';

interface Props {
  opened: boolean;
  agreementId: string;
  rentAmount: number;
  onClose: () => void;
  onSuccess: () => void;
}

const now = new Date();
const MONTH_OPTIONS = MONTHS.map((m, i) => ({ value: String(i + 1), label: m }));
const YEAR_OPTIONS = [-1, 0, 1].map((offset) => {
  const y = now.getFullYear() + offset;
  return { value: String(y), label: String(y) };
});

const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'Cash', label: 'Cash' },
  { value: 'UPI', label: 'UPI' },
  { value: 'Google_Pay', label: 'Google Pay' },
  { value: 'Bank_Transfer', label: 'Bank Transfer' },
  { value: 'Cheque', label: 'Cheque' },
];

export function RecordRentModal({ opened, agreementId, rentAmount, onClose, onSuccess }: Props) {
  const form = useForm({
    initialValues: {
      amount_paid: rentAmount,
      discount_amount: 0,
      discount_reason: '',
      payment_date: new Date() as Date | null,
      payment_method: 'Cash' as PaymentMethod,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      notes: '',
    },
    validate: {
      amount_paid: (v) => (v >= 0 ? null : 'Amount must be ≥ 0'),
      payment_date: (v) => (v ? null : 'Payment date is required'),
      month: (v) => (v >= 1 && v <= 12 ? null : 'Select a month'),
    },
  });

  const mutation = useMutation({
    mutationFn: (values: typeof form.values) =>
      recordRentPayment(agreementId, {
        amount_paid: values.amount_paid,
        discount_amount: values.discount_amount > 0 ? values.discount_amount : undefined,
        discount_reason: values.discount_reason || undefined,
        payment_date: values.payment_date!.toISOString().split('T')[0],
        payment_method: values.payment_method,
        month: values.month,
        year: values.year,
        notes: values.notes || undefined,
      }),
    onSuccess: () => {
      notifications.show({
        title: 'Recorded',
        message: 'Rent payment recorded successfully.',
        color: 'green',
      });
      form.reset();
      onSuccess();
    },
    onError: () => {
      notifications.show({ title: 'Error', message: 'Failed to record payment.', color: 'red' });
    },
  });

  const netAmount = form.values.amount_paid - (form.values.discount_amount || 0);

  return (
    <Modal opened={opened} onClose={onClose} title="Record Rent Payment" size="md">
      <form onSubmit={form.onSubmit((v) => mutation.mutate(v))}>
        <Stack gap="sm">
          <Alert color="blue" variant="light">
            Standard rent: <strong>₹{rentAmount.toLocaleString()}</strong>
          </Alert>

          <Group grow>
            <Select
              label="Month"
              data={MONTH_OPTIONS}
              value={String(form.values.month)}
              onChange={(v) => form.setFieldValue('month', parseInt(v!))}
            />
            <Select
              label="Year"
              data={YEAR_OPTIONS}
              value={String(form.values.year)}
              onChange={(v) => form.setFieldValue('year', parseInt(v!))}
            />
          </Group>

          <NumberInput
            label="Amount Paid (₹)"
            prefix="₹"
            withAsterisk
            min={0}
            {...form.getInputProps('amount_paid')}
          />

          <Divider label="Optional Discount" labelPosition="center" />

          <Group grow>
            <NumberInput
              label="Discount Amount (₹)"
              prefix="₹"
              min={0}
              description="Admin-approved rent discount"
              {...form.getInputProps('discount_amount')}
            />
          </Group>
          {form.values.discount_amount > 0 && (
            <Textarea
              label="Discount Reason"
              placeholder="Reason for applying discount (required for audit)"
              withAsterisk
              rows={2}
              {...form.getInputProps('discount_reason')}
            />
          )}

          <Divider label="Payment Info" labelPosition="center" />

          <Group grow>
            <DateInput
              label="Payment Date"
              withAsterisk
              valueFormat="YYYY-MM-DD"
              {...form.getInputProps('payment_date')}
            />
            <Select
              label="Payment Method"
              data={PAYMENT_METHOD_OPTIONS}
              {...form.getInputProps('payment_method')}
            />
          </Group>

          <Textarea label="Notes" rows={2} {...form.getInputProps('notes')} />

          {form.values.discount_amount > 0 && (
            <Text size="sm" c="dimmed">
              Net collection after discount: <strong>₹{netAmount.toLocaleString()}</strong>
            </Text>
          )}

          <Button type="submit" loading={mutation.isPending} mt="sm">
            Record Payment
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
