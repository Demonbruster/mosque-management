// ============================================
// Issue Utensil Modal — ST-14.8
// ============================================

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Modal,
  Stack,
  Select,
  NumberInput,
  Button,
  Textarea,
  Text,
  Alert,
  Badge,
  Group,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { DateInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle } from '@tabler/icons-react';
import { getUtensils, issueRental, UtensilItem } from '../../lib/api-utensils';
import { getPersons, PersonSummary } from '../../lib/api-persons';

interface Props {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function IssueUtensilModal({ opened, onClose, onSuccess }: Props) {
  const [selectedBorrower, setSelectedBorrower] = useState<PersonSummary | null>(null);

  const { data: utensils } = useQuery({
    queryKey: ['utensils_select'],
    queryFn: getUtensils,
    enabled: opened,
  });

  const { data: persons } = useQuery({
    queryKey: ['persons_select'],
    queryFn: () => getPersons(),
    enabled: opened,
  });

  const form = useForm({
    initialValues: {
      utensil_id: '' as string,
      customer_id: '' as string,
      guarantor_id: '' as string,
      quantity: 1,
      issue_date: new Date() as Date | null,
      notes: '',
    },
    validate: {
      utensil_id: (v) => (v ? null : 'Utensil is required'),
      customer_id: (v) => (v ? null : 'Borrower is required'),
      guarantor_id: (_, values) => {
        if (selectedBorrower?.category === 'Non-Member' && !values.guarantor_id) {
          return 'Guarantor is required for Non-Member borrowers';
        }
        return null;
      },
      quantity: (v) => (v > 0 ? null : 'Quantity must be at least 1'),
      issue_date: (v) => (v ? null : 'Issue date is required'),
    },
  });

  const isNonMember = selectedBorrower?.category === 'Non-Member';

  const selectedUtensil = utensils?.find((u) => u.id === form.values.utensil_id);
  const availableQty = selectedUtensil?.available_quantity ?? 0;

  const mutation = useMutation({
    mutationFn: (values: typeof form.values) =>
      issueRental({
        utensil_id: values.utensil_id,
        customer_id: values.customer_id,
        guarantor_id: values.guarantor_id || undefined,
        quantity: values.quantity,
        issue_date: values.issue_date!.toISOString().split('T')[0],
        notes: values.notes || undefined,
      }),
    onSuccess: () => {
      notifications.show({
        title: 'Issued',
        message: 'Utensil successfully issued.',
        color: 'green',
      });
      form.reset();
      setSelectedBorrower(null);
      onSuccess();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error ?? 'Failed to issue utensil.';
      notifications.show({ title: 'Error', message: msg, color: 'red' });
    },
  });

  const utensilOptions =
    utensils?.map((u: UtensilItem) => ({
      value: u.id,
      label: `${u.item_name} (${u.available_quantity ?? u.stock_quantity} available)`,
      disabled: (u.available_quantity ?? u.stock_quantity) === 0,
    })) ?? [];

  const personOptions =
    persons?.map((p: PersonSummary) => ({
      value: p.id,
      label: `${p.first_name} ${p.last_name}${p.phone_number ? ` — ${p.phone_number}` : ''} [${p.category}]`,
    })) ?? [];

  const memberOnlyOptions =
    persons
      ?.filter((p) => p.category === 'Member')
      .map((p: PersonSummary) => ({
        value: p.id,
        label: `${p.first_name} ${p.last_name}${p.phone_number ? ` — ${p.phone_number}` : ''}`,
      })) ?? [];

  const handleBorrowerChange = (val: string | null) => {
    form.setFieldValue('customer_id', val ?? '');
    form.setFieldValue('guarantor_id', '');
    const person = persons?.find((p) => p.id === val) ?? null;
    setSelectedBorrower(person);
  };

  const handleClose = () => {
    form.reset();
    setSelectedBorrower(null);
    onClose();
  };

  return (
    <Modal opened={opened} onClose={handleClose} title="Issue Utensil / Equipment" size="lg">
      <form onSubmit={form.onSubmit((v) => mutation.mutate(v))}>
        <Stack gap="sm">
          {/* Utensil Selection */}
          <Select
            label="Utensil / Equipment"
            placeholder="Select item..."
            data={utensilOptions}
            searchable
            withAsterisk
            {...form.getInputProps('utensil_id')}
          />

          {selectedUtensil && (
            <Group gap="xs">
              <Text size="sm" c="dimmed">
                Stock:
              </Text>
              <Badge color={availableQty > 0 ? 'green' : 'red'} variant="light">
                {availableQty} available / {selectedUtensil.stock_quantity} total
              </Badge>
              {selectedUtensil.rental_price && (
                <Badge color="blue" variant="light">
                  ₹{parseFloat(selectedUtensil.rental_price).toFixed(2)} / item (penalty basis)
                </Badge>
              )}
            </Group>
          )}

          {/* Quantity */}
          <NumberInput
            label="Quantity"
            min={1}
            max={availableQty || undefined}
            withAsterisk
            {...form.getInputProps('quantity')}
          />

          {/* Borrower */}
          <Select
            label="Borrower (Person)"
            placeholder="Search member or non-member..."
            data={personOptions}
            searchable
            withAsterisk
            value={form.values.customer_id || null}
            onChange={handleBorrowerChange}
            error={form.errors.customer_id}
          />

          {/* Guarantor — shown only for Non-Member */}
          {isNonMember && (
            <Alert icon={<IconAlertCircle size={16} />} color="orange" title="Guarantor Required">
              This borrower is a <strong>Non-Member</strong>. A registered member must act as
              guarantor.
            </Alert>
          )}

          {isNonMember && (
            <Select
              label="Guarantor (Member only)"
              placeholder="Select a member as guarantor..."
              data={memberOnlyOptions}
              searchable
              withAsterisk
              {...form.getInputProps('guarantor_id')}
            />
          )}

          {/* Issue Date */}
          <DateInput
            label="Issue Date"
            withAsterisk
            valueFormat="YYYY-MM-DD"
            {...form.getInputProps('issue_date')}
          />

          {/* Notes */}
          <Textarea
            label="Notes"
            rows={3}
            placeholder="Optional remarks..."
            {...form.getInputProps('notes')}
          />

          <Button
            type="submit"
            loading={mutation.isPending}
            mt="sm"
            disabled={selectedUtensil ? availableQty < form.values.quantity : false}
          >
            Issue Utensil
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
