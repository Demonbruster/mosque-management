/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Title,
  Paper,
  Button,
  Group,
  TextInput,
  NumberInput,
  Select,
  Textarea,
  SegmentedControl,
  Stack,
  Text,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { api } from '../lib/api';
import { useTenant } from '../lib/tenant-context';
import { getCurrencySymbol } from '../lib/format-utils';

export function NewTransactionPage() {
  const navigate = useNavigate();

  const { data: funds } = useQuery({
    queryKey: ['fund-categories'],
    queryFn: async () => {
      const res = await api.get('/api/fund-categories');
      return res.data.data;
    },
  });

  const { data: projects } = useQuery({
    queryKey: ['active-projects'],
    queryFn: async () => {
      const res = await api.get('/api/projects');
      return res.data.data.filter((p: any) => p.phase !== 'Past');
    },
  });

  const form = useForm({
    initialValues: {
      type: 'Income',
      amount: '',
      fund_id: '',
      payment_method: 'Cash',
      donor_name: '',
      description: '',
      notes: '',
      project_id: null,
      transaction_date: new Date(),
    },
    validate: {
      amount: (value) => (Number(value) > 0 ? null : 'Amount must be greater than 0'),
      fund_id: (value) =>
        value ? null : 'Fund category is strictly required per Shariah compliance',
    },
  });

  const { tenant } = useTenant();
  const currentCurrency = tenant?.currency || 'INR';
  const currencySymbol = getCurrencySymbol(currentCurrency);

  const createMutation = useMutation({
    mutationFn: async (values: typeof form.values) => {
      const payload = {
        ...values,
        currency: currentCurrency,
        transaction_date: values.transaction_date.toISOString(),
      };
      const res = await api.post('/api/transactions', payload);
      return res.data;
    },
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Transaction saved successfully as Pending',
        color: 'green',
      });
      navigate('/finance');
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Failed to save',
        message: error.response?.data?.error || error.message,
        color: 'red',
      });
    },
  });

  const fundOptions =
    funds?.map((f: any) => ({
      value: f.id,
      label: `${f.fund_name} (${f.compliance_type})`,
    })) || [];

  const projectOptions =
    projects?.map((p: any) => ({
      value: p.id,
      label: p.project_name,
    })) || [];

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={2}>Manual Financial Entry</Title>
          <Text c="dimmed" size="sm">
            Record a new offline income or expense transaction.
          </Text>
        </div>
      </Group>

      <Paper withBorder shadow="sm" p="xl" radius="md">
        <form onSubmit={form.onSubmit((values) => createMutation.mutate(values))}>
          <Stack gap="md">
            <div>
              <Text size="sm" fw={500} mb={4}>
                Entry Type
              </Text>
              <SegmentedControl
                color={form.values.type === 'Income' ? 'teal' : 'orange'}
                data={['Income', 'Expense']}
                fullWidth
                size="md"
                {...form.getInputProps('type')}
              />
            </div>

            <Group grow align="flex-start">
              <NumberInput
                label={`Amount (${currentCurrency})`}
                placeholder="0.00"
                min={0}
                prefix={`${currencySymbol} `}
                decimalScale={2}
                hideControls
                required
                {...form.getInputProps('amount')}
              />

              <Select
                label="Fund Category"
                placeholder="Select Shariah Fund"
                data={fundOptions}
                required
                searchable
                error={form.errors.fund_id}
                {...form.getInputProps('fund_id')}
              />
            </Group>

            <Group grow align="flex-start">
              <Select
                label="Payment Method"
                placeholder="Choose method"
                data={['Cash', 'Google_Pay', 'Bank_Transfer', 'UPI', 'Cheque']}
                required
                {...form.getInputProps('payment_method')}
              />

              <DatePickerInput
                label="Transaction Date"
                placeholder="Pick date"
                required
                maxDate={new Date()}
                {...form.getInputProps('transaction_date')}
              />
            </Group>

            <TextInput
              label={form.values.type === 'Income' ? 'Donor Name' : 'Payee Name'}
              description="Name of the person or entity (Optional)"
              placeholder="e.g. John Doe / Anon"
              {...form.getInputProps('donor_name')}
            />

            <TextInput
              label="Description / Title"
              placeholder="Brief description of the entry"
              required
              {...form.getInputProps('description')}
            />

            <Select
              label="Link to Project (Optional)"
              description="Track revenue/spend against a strategic roadmap project"
              placeholder="Select project"
              data={projectOptions}
              searchable
              clearable
              {...form.getInputProps('project_id')}
            />

            <Textarea
              label="Additional Notes"
              placeholder="Reference numbers, cheque details, or internal notes"
              minRows={3}
              {...form.getInputProps('notes')}
            />

            <Group justify="flex-end" mt="xl">
              <Button variant="default" onClick={() => navigate('/finance')}>
                Cancel
              </Button>
              <Button type="submit" color="green" loading={createMutation.isPending}>
                Save Transaction
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </div>
  );
}
