// ============================================
// Asset Detail Page
// ============================================

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Title,
  Group,
  Button,
  Badge,
  Text,
  Card,
  Grid,
  Loader,
  Modal,
  Select,
  Textarea,
  Stack,
  Alert,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { IconTrash, IconArrowLeft, IconAlertCircle } from '@tabler/icons-react';
import { getAssetById, disposeAsset } from '../lib/api-assets';

export function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDisposeOpen, setIsDisposeOpen] = useState(false);
  const [disposalMethod, setDisposalMethod] = useState<string | null>('Sold');
  const [disposalDate, setDisposalDate] = useState<Date | null>(new Date());
  const [disposalReason, setDisposalReason] = useState('');

  const {
    data: asset,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['fixed_assets', id],
    queryFn: () => getAssetById(id!),
    enabled: !!id,
  });

  const disposeMutation = useMutation({
    mutationFn: (payload: any) => disposeAsset(id!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixed_assets'] });
      notifications.show({
        title: 'Success',
        message: 'Asset disposed successfully.',
        color: 'green',
      });
      navigate('/assets');
    },
    onError: () => {
      notifications.show({ title: 'Error', message: 'Failed to dispose asset.', color: 'red' });
    },
  });

  const handleDispose = () => {
    if (!disposalMethod || !disposalDate) return;
    disposeMutation.mutate({
      disposal_method: disposalMethod,
      disposal_date: disposalDate.toISOString().split('T')[0],
      reason: disposalReason,
    });
  };

  if (isLoading)
    return (
      <Container py="xl">
        <Loader />
      </Container>
    );
  if (error || !asset)
    return (
      <Container py="xl">
        <Alert color="red">Asset not found or access denied.</Alert>
      </Container>
    );

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Group>
          <Button
            variant="subtle"
            color="gray"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate('/assets')}
          >
            Back
          </Button>
          <Title order={2}>{asset.name}</Title>
          <Badge>{asset.condition}</Badge>
          {!asset.is_active && <Badge color="red">Disposed</Badge>}
        </Group>
        {asset.is_active && (
          <Button
            color="red"
            leftSection={<IconTrash size={16} />}
            onClick={() => setIsDisposeOpen(true)}
          >
            Dispose Asset
          </Button>
        )}
      </Group>

      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder mb="md">
            <Title order={4} mb="md">
              Asset Information
            </Title>
            <Grid>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">
                  Unique ID
                </Text>
                <Text fw={500}>{asset.unique_asset_id}</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">
                  Fund Source
                </Text>
                <Text>{asset.fund_source || 'N/A'}</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">
                  Purchase Price
                </Text>
                <Text>₹{asset.purchase_price?.toLocaleString() || '0'}</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">
                  Acquisition Date
                </Text>
                <Text>
                  {asset.acquisition_date
                    ? new Date(asset.acquisition_date).toLocaleDateString()
                    : 'N/A'}
                </Text>
              </Grid.Col>
              <Grid.Col span={12}>
                <Text size="sm" c="dimmed">
                  Description
                </Text>
                <Text>{asset.description || 'No description provided.'}</Text>
              </Grid.Col>
            </Grid>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder mb="md">
            <Title order={4} mb="md">
              Lifecycle & Maintenance
            </Title>
            <Stack gap="xs">
              <Text size="sm" c="dimmed">
                Warranty Expiry
              </Text>
              <Text mb="sm">
                {asset.warranty_expiry
                  ? new Date(asset.warranty_expiry).toLocaleDateString()
                  : 'N/A'}
              </Text>

              <Text size="sm" c="dimmed">
                AMC Expiry
              </Text>
              <Text>
                {asset.amc_expiry ? new Date(asset.amc_expiry).toLocaleDateString() : 'N/A'}
              </Text>

              <Text size="sm" c="dimmed">
                AMC Vendor
              </Text>
              <Text>{asset.amc_vendor || 'N/A'}</Text>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Disposal Audit View if inactive */}
      {!asset.is_active && (
        <Card shadow="sm" padding="lg" radius="md" withBorder style={{ borderColor: 'red' }}>
          <Group gap="xs" mb="sm" c="red">
            <IconAlertCircle size={20} />
            <Title order={4}>Disposal Record</Title>
          </Group>
          <Text>
            <strong>Method:</strong> {asset.disposal_method}
          </Text>
          <Text>
            <strong>Date:</strong>{' '}
            {asset.disposal_date ? new Date(asset.disposal_date).toLocaleDateString() : 'N/A'}
          </Text>
          <Text mt="md" style={{ whiteSpace: 'pre-wrap' }}>
            <strong>Notes:</strong>
            <br />
            {asset.notes}
          </Text>
        </Card>
      )}

      {/* DISPOSE ASSET MODAL */}
      <Modal
        opened={isDisposeOpen}
        onClose={() => setIsDisposeOpen(false)}
        title="Dispose Asset"
        color="red"
      >
        <Stack gap="md">
          <Text size="sm">
            This action marks the asset as disposed and removes it from active inventory tracking.
          </Text>
          <Select
            label="Disposal Method"
            data={['Sold', 'Donated', 'Scrapped', 'Returned']}
            value={disposalMethod}
            onChange={setDisposalMethod}
            required
          />
          <DateInput
            label="Disposal Date"
            value={disposalDate}
            onChange={(val) => setDisposalDate(val ? new Date(val) : null)}
            required
          />
          <Textarea
            label="Reason / Notes"
            placeholder="Reason for disposal..."
            value={disposalReason}
            onChange={(e) => setDisposalReason(e.currentTarget.value)}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setIsDisposeOpen(false)}>
              Cancel
            </Button>
            <Button color="red" loading={disposeMutation.isPending} onClick={handleDispose}>
              Confirm Disposal
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
