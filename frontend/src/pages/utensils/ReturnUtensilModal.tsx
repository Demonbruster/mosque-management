// ============================================
// Return Utensil Modal — ST-14.9
// ============================================

import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Modal,
  Stack,
  NumberInput,
  Textarea,
  Button,
  Text,
  Group,
  Paper,
  Divider,
  Badge,
  Alert,
} from '@mantine/core';

import { useForm } from '@mantine/form';
import { DateInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { IconAlertTriangle, IconArrowBack } from '@tabler/icons-react';
import { processReturn, OutstandingRental } from '../../lib/api-utensils';

interface Props {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  rental: OutstandingRental | null;
}

export function ReturnUtensilModal({ opened, onClose, onSuccess, rental }: Props) {
  const rentalPrice = parseFloat(rental?.rental_price ?? '0');

  const form = useForm({
    initialValues: {
      quantity_returned: rental?.quantity ?? 0,
      damage_description: '',
      additional_penalty: 0,
      return_date: new Date() as Date | null,
      notes: '',
    },
    validate: {
      quantity_returned: (v) => {
        if (v == null || v < 0) return 'Must be 0 or more';
        if (rental && v > rental.quantity)
          return `Cannot exceed issued quantity (${rental.quantity})`;
        return null;
      },
      return_date: (v) => (v ? null : 'Return date is required'),
    },
  });

  // Reset form when rental changes
  useEffect(() => {
    if (rental) {
      form.setValues({
        quantity_returned: rental.quantity,
        damage_description: '',
        additional_penalty: 0,
        return_date: new Date(),
        notes: '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rental?.id]);

  // Auto-compute penalty preview
  const missingQty = Math.max(0, (rental?.quantity ?? 0) - (form.values.quantity_returned ?? 0));
  const missingPenalty = missingQty * rentalPrice;
  const damagePenalty = form.values.additional_penalty ?? 0;
  const totalPenalty = missingPenalty + damagePenalty;

  const mutation = useMutation({
    mutationFn: (values: typeof form.values) =>
      processReturn(rental!.id, {
        quantity_returned: values.quantity_returned ?? rental!.quantity,
        damage_description: values.damage_description || undefined,
        additional_penalty: values.additional_penalty || undefined,
        return_date: values.return_date?.toISOString().split('T')[0],
        notes: values.notes || undefined,
      }),
    onSuccess: () => {
      notifications.show({
        title: 'Returned',
        message: 'Utensil return processed successfully.',
        color: 'green',
      });
      form.reset();
      onSuccess();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error ?? 'Failed to process return.';
      notifications.show({ title: 'Error', message: msg, color: 'red' });
    },
  });

  if (!rental) return null;

  return (
    <Modal opened={opened} onClose={onClose} title="Process Utensil Return" size="lg">
      <Stack gap="md">
        {/* Rental Summary */}
        <Paper withBorder p="md" radius="md" bg="gray.0">
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="sm" fw={600}>
                Item
              </Text>
              <Text size="sm">{rental.item_name}</Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm" fw={600}>
                Borrower
              </Text>
              <Text size="sm">
                {rental.borrower_name}
                {rental.borrower_phone && (
                  <Text span c="dimmed" size="xs" ml={4}>
                    ({rental.borrower_phone})
                  </Text>
                )}
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm" fw={600}>
                Issued Quantity
              </Text>
              <Badge variant="light">{rental.quantity} units</Badge>
            </Group>
            <Group justify="space-between">
              <Text size="sm" fw={600}>
                Issue Date
              </Text>
              <Text size="sm">{rental.issue_date}</Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm" fw={600}>
                Days Out
              </Text>
              <Badge color={rental.overdue_days > 7 ? 'red' : 'orange'} variant="light">
                {rental.overdue_days} day{rental.overdue_days !== 1 ? 's' : ''}
              </Badge>
            </Group>
            {rental.guarantor && (
              <Group justify="space-between">
                <Text size="sm" fw={600}>
                  Guarantor
                </Text>
                <Text size="sm">
                  {rental.guarantor.guarantor_name}
                  {rental.guarantor.guarantor_phone && (
                    <Text span c="dimmed" size="xs" ml={4}>
                      ({rental.guarantor.guarantor_phone})
                    </Text>
                  )}
                </Text>
              </Group>
            )}
          </Stack>
        </Paper>

        <form onSubmit={form.onSubmit((v) => mutation.mutate(v))}>
          <Stack gap="sm">
            {/* Return date */}
            <DateInput
              label="Return Date"
              withAsterisk
              valueFormat="YYYY-MM-DD"
              {...form.getInputProps('return_date')}
            />

            {/* Quantity returned */}
            <NumberInput
              label="Quantity Returned"
              description={`Issued: ${rental.quantity} units. Enter how many are being returned.`}
              min={0}
              max={rental.quantity}
              withAsterisk
              {...form.getInputProps('quantity_returned')}
            />

            {/* Damage notes */}
            <Textarea
              label="Damage Description"
              placeholder="Describe any damage to returned items..."
              rows={3}
              {...form.getInputProps('damage_description')}
            />

            {/* Additional penalty */}
            <NumberInput
              label="Additional Damage Penalty (₹)"
              description="Amount to charge for damage beyond the missing items penalty"
              min={0}
              prefix="₹"
              {...form.getInputProps('additional_penalty')}
            />

            {/* Penalty Preview */}
            <Divider />
            <Paper withBorder p="sm" radius="md" bg={totalPenalty > 0 ? 'red.0' : 'green.0'}>
              <Stack gap="xs">
                <Text size="sm" fw={700} c={totalPenalty > 0 ? 'red' : 'green'}>
                  Penalty Calculation
                </Text>
                <Group justify="space-between">
                  <Text size="sm">
                    Missing items ({missingQty} × ₹{rentalPrice.toFixed(2)})
                  </Text>
                  <Text size="sm" fw={600}>
                    ₹{missingPenalty.toFixed(2)}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Damage penalty</Text>
                  <Text size="sm" fw={600}>
                    ₹{damagePenalty.toFixed(2)}
                  </Text>
                </Group>
                <Divider />
                <Group justify="space-between">
                  <Text size="sm" fw={700}>
                    Total Penalty
                  </Text>
                  <Text size="lg" fw={800} c={totalPenalty > 0 ? 'red' : 'green'}>
                    ₹{totalPenalty.toFixed(2)}
                  </Text>
                </Group>
              </Stack>
            </Paper>

            {totalPenalty > 0 && (
              <Alert
                icon={<IconAlertTriangle size={16} />}
                color="orange"
                title="Penalty to Collect"
              >
                Collect <strong>₹{totalPenalty.toFixed(2)}</strong> from the borrower before
                completing the return.
              </Alert>
            )}

            {/* Notes */}
            <Textarea
              label="Internal Notes"
              placeholder="Optional internal remarks..."
              rows={2}
              {...form.getInputProps('notes')}
            />

            <Button
              type="submit"
              loading={mutation.isPending}
              leftSection={<IconArrowBack size={16} />}
              color={totalPenalty > 0 ? 'orange' : 'green'}
            >
              {totalPenalty > 0
                ? `Confirm Return + Collect ₹${totalPenalty.toFixed(2)}`
                : 'Confirm Return'}
            </Button>
          </Stack>
        </form>
      </Stack>
    </Modal>
  );
}
