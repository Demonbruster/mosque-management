// ============================================
// Create Agreement Modal — ST-13.9
// ============================================

import { useMutation, useQuery } from '@tanstack/react-query';
import { Modal, Stack, NumberInput, Select, Button, Textarea, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { DateInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { createAgreement } from '../../lib/api-tenancy';
import { getPersons } from '../../lib/api-persons';
import { getAssets } from '../../lib/api-assets';

interface Props {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateAgreementModal({ opened, onClose, onSuccess }: Props) {
  const { data: persons } = useQuery({
    queryKey: ['persons_select'],
    queryFn: () => getPersons(),
    enabled: opened,
  });

  const { data: assets } = useQuery({
    queryKey: ['assets_select'],
    queryFn: () => getAssets(),
    enabled: opened,
  });

  const form = useForm({
    initialValues: {
      person_id: '',
      asset_id: '',
      rent_amount: 0,
      security_deposit: 0,
      start_date: new Date() as Date | null,
      end_date: null as Date | null,
      notes: '',
    },
    validate: {
      person_id: (v) => (v ? null : 'Tenant is required'),
      asset_id: (v) => (v ? null : 'Property is required'),
      rent_amount: (v) => (v > 0 ? null : 'Rent must be greater than 0'),
      start_date: (v) => (v ? null : 'Start date is required'),
    },
  });

  const mutation = useMutation({
    mutationFn: (values: typeof form.values) =>
      createAgreement({
        person_id: values.person_id,
        asset_id: values.asset_id,
        rent_amount: values.rent_amount as any,
        security_deposit: values.security_deposit as any,
        start_date: values.start_date?.toISOString().split('T')[0] as any,
        end_date: values.end_date
          ? (values.end_date.toISOString().split('T')[0] as any)
          : undefined,
        notes: values.notes || undefined,
      }),
    onSuccess: () => {
      notifications.show({
        title: 'Created',
        message: 'Tenancy agreement created.',
        color: 'green',
      });
      form.reset();
      onSuccess();
    },
    onError: () => {
      notifications.show({ title: 'Error', message: 'Failed to create agreement.', color: 'red' });
    },
  });

  const personOptions =
    persons?.map((p: any) => ({
      value: p.id,
      label: `${p.first_name} ${p.last_name}${p.phone_number ? ` (${p.phone_number})` : ''}`,
    })) ?? [];

  const assetOptions =
    assets?.map((a: any) => ({
      value: a.id,
      label: a.name,
    })) ?? [];

  return (
    <Modal opened={opened} onClose={onClose} title="New Tenancy Agreement" size="lg">
      <form onSubmit={form.onSubmit((v) => mutation.mutate(v))}>
        <Stack gap="sm">
          <Select
            label="Tenant (Person)"
            placeholder="Search for a member..."
            data={personOptions}
            searchable
            withAsterisk
            {...form.getInputProps('person_id')}
          />
          <Select
            label="Property (Fixed Asset)"
            placeholder="Select a property asset..."
            data={assetOptions}
            searchable
            withAsterisk
            {...form.getInputProps('asset_id')}
          />
          <Group grow>
            <NumberInput
              label="Monthly Rent (₹)"
              prefix="₹"
              withAsterisk
              min={1}
              {...form.getInputProps('rent_amount')}
            />
            <NumberInput
              label="Security Deposit (₹)"
              prefix="₹"
              min={0}
              {...form.getInputProps('security_deposit')}
            />
          </Group>
          <Group grow>
            <DateInput
              label="Start Date"
              withAsterisk
              valueFormat="YYYY-MM-DD"
              {...form.getInputProps('start_date')}
            />
            <DateInput
              label="End Date (Optional)"
              valueFormat="YYYY-MM-DD"
              clearable
              {...form.getInputProps('end_date')}
            />
          </Group>
          <Textarea label="Notes" rows={3} {...form.getInputProps('notes')} />
          <Button type="submit" loading={mutation.isPending} mt="sm">
            Create Agreement
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
