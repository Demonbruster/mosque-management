// ============================================
// Assets Listing Page
// ============================================

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Group,
  Button,
  Table,
  Badge,
  ActionIcon,
  Modal,
  TextInput,
  Textarea,
  Select,
  NumberInput,
  Stack,
  Loader,
  Text,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconEye, IconTrash } from '@tabler/icons-react';
import { getAssets, createAsset, FixedAsset } from '../lib/api-assets';

export function AssetsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [filterFundSource, setFilterFundSource] = useState<string | null>(null);

  // FETCH ASSETS
  const { data: assets, isLoading } = useQuery({
    queryKey: ['fixed_assets', filterFundSource],
    queryFn: () => getAssets(filterFundSource ? { fund_source: filterFundSource } : undefined),
  });

  // MUTATION: CREATE ASSET
  const createMutation = useMutation({
    mutationFn: createAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixed_assets'] });
      notifications.show({ title: 'Success', message: 'Asset created.', color: 'green' });
      setIsCreateOpen(false);
      form.reset();
    },
    onError: () => {
      notifications.show({ title: 'Error', message: 'Failed to create asset.', color: 'red' });
    },
  });

  const form = useForm({
    initialValues: {
      name: '',
      description: '',
      condition: 'Good',
      fund_source: '',
      purchase_price: 0,
      unique_asset_id: '',
    },
    validate: {
      name: (val) => (val ? null : 'Name is required'),
    },
  });

  const handleCreateSubmit = (values: any) => {
    createMutation.mutate(values);
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Excellent':
        return 'teal';
      case 'Good':
        return 'blue';
      case 'Fair':
        return 'orange';
      case 'Poor':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2}>Fixed Asset Management</Title>
        <Group>
          <Select
            placeholder="Filter by Fund Source"
            data={['Zakat', 'General', 'Waqf', 'Donation']}
            value={filterFundSource}
            onChange={setFilterFundSource}
            clearable
          />
          <Button leftSection={<IconPlus size={16} />} onClick={() => setIsCreateOpen(true)}>
            Add Asset
          </Button>
        </Group>
      </Group>

      {isLoading ? (
        <Loader />
      ) : (
        <Table stickyHeader verticalSpacing="md" striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Asset ID</Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Condition</Table.Th>
              <Table.Th>Fund Source</Table.Th>
              <Table.Th>Purchase Price</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {assets?.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={6} align="center">
                  <Text c="dimmed">No assets found.</Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              assets?.map((asset: FixedAsset) => (
                <Table.Tr key={asset.id}>
                  <Table.Td>
                    <Text fw={500}>{asset.unique_asset_id}</Text>
                  </Table.Td>
                  <Table.Td>{asset.name}</Table.Td>
                  <Table.Td>
                    <Badge color={getConditionColor(asset.condition)}>{asset.condition}</Badge>
                  </Table.Td>
                  <Table.Td>{asset.fund_source || 'N/A'}</Table.Td>
                  <Table.Td>₹{asset.purchase_price?.toLocaleString() || '0'}</Table.Td>
                  <Table.Td>
                    <Group gap="sm">
                      <ActionIcon
                        variant="light"
                        color="blue"
                        onClick={() => navigate(`/assets/${asset.id}`)}
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      )}

      {/* CREATE ASSET MODAL */}
      <Modal
        opened={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Register New Asset"
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleCreateSubmit)}>
          <Stack gap="sm">
            <TextInput
              label="Asset Name"
              placeholder="e.g., Heavy Duty Generator"
              withAsterisk
              {...form.getInputProps('name')}
            />
            <TextInput
              label="Unique Asset ID (Optional)"
              description="Will be auto-generated if left blank."
              {...form.getInputProps('unique_asset_id')}
            />
            <Textarea label="Description" {...form.getInputProps('description')} />

            <Group grow>
              <Select
                label="Condition"
                data={['Excellent', 'Good', 'Fair', 'Poor']}
                {...form.getInputProps('condition')}
              />
              <Select
                label="Fund Source"
                data={['Zakat', 'General', 'Waqf', 'Donation']}
                {...form.getInputProps('fund_source')}
              />
            </Group>

            <NumberInput
              label="Purchase Price"
              prefix="₹"
              {...form.getInputProps('purchase_price')}
            />

            <Button type="submit" loading={createMutation.isPending} mt="md">
              Register Asset
            </Button>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}
