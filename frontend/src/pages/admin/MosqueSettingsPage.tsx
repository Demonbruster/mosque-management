import { useState, useEffect } from 'react';
import {
  Title,
  Paper,
  Stack,
  TextInput,
  Select,
  Button,
  Group,
  Text,
  Divider,
  Alert,
  LoadingOverlay,
  Box,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconSettings, IconInfoCircle, IconCurrencyDollar } from '@tabler/icons-react';
import { useTenant } from '../../lib/tenant-context';
import { api } from '../../lib/api';

const CURRENCY_OPTIONS = [
  { value: 'INR', label: 'Indian Rupee (₹)' },
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
  { value: 'AED', label: 'UAE Dirham (د.إ)' },
  { value: 'SAR', label: 'Saudi Riyal (ر.س)' },
  { value: 'CAD', label: 'Canadian Dollar (C$)' },
  { value: 'AUD', label: 'Australian Dollar (A$)' },
  { value: 'JPY', label: 'Japanese Yen (¥)' },
];

export function MosqueSettingsPage() {
  const { tenant, refreshTenant, loading: tenantLoading } = useTenant();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    currency: 'INR',
    domain: '',
  });

  useEffect(() => {
    if (tenant) {
      setFormData({
        name: tenant.name,
        currency: tenant.currency || 'INR',
        domain: tenant.domain || '',
      });
    }
  }, [tenant]);

  const handleSave = async () => {
    if (!tenant) return;

    setLoading(true);
    try {
      const res = await api.patch(`/api/tenants/${tenant.id}`, formData);
      if (res.data.success) {
        notifications.show({
          title: 'Settings Updated',
          message: 'Mosque settings have been saved successfully.',
          color: 'green',
        });
        await refreshTenant();
      }
    } catch (error: any) {
      notifications.show({
        title: 'Update Failed',
        message: error.response?.data?.error || 'Failed to update settings',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  if (tenantLoading && !tenant) {
    return <LoadingOverlay visible />;
  }

  return (
    <Box pos="relative" p="md">
      <LoadingOverlay visible={loading} />

      <Stack gap="lg" align="stretch">
        <Group justify="space-between">
          <div>
            <Title order={2}>Mosque Settings</Title>
            <Text c="dimmed" size="sm">
              Manage your mosque&apos;s identity, localization, and currency.
            </Text>
          </div>
          <IconSettings size={32} color="var(--mantine-color-green-filled)" />
        </Group>

        <Paper withBorder p="xl" radius="md" shadow="sm">
          <Stack gap="md">
            <Title order={4}>General Information</Title>
            <Divider />

            <TextInput
              label="Mosque Name"
              placeholder="e.g. Masjid Al-Noor"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <TextInput
              label="Primary Domain / Subdomain"
              placeholder="e.g. alnoor.mosque.system"
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              description="Internal routing identifier"
              disabled
            />

            <Box mt="md">
              <Title order={4} mb="xs">
                Localization
              </Title>
              <Divider mb="lg" />

              <Group align="flex-start">
                <Select
                  label="Primary Currency"
                  placeholder="Select currency"
                  data={CURRENCY_OPTIONS}
                  value={formData.currency}
                  onChange={(val) => setFormData({ ...formData, currency: val || 'INR' })}
                  leftSection={<IconCurrencyDollar size={16} />}
                  style={{ flex: 1 }}
                />
              </Group>

              <Alert icon={<IconInfoCircle size={16} />} color="blue" mt="md" variant="light">
                Changing the currency will update labels and symbols throughout the dashboard and
                reports. Historical data for existing transactions will remain stored with their
                original currency code.
              </Alert>
            </Box>

            <Group justify="flex-end" mt="xl">
              <Button
                variant="filled"
                color="green"
                size="md"
                onClick={handleSave}
                loading={loading}
              >
                Save All Changes
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}
