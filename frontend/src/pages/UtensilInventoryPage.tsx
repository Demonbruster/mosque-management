// ============================================
// Utensil Inventory Page — ST-14.7
// ============================================

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Container,
  Title,
  Group,
  Button,
  Table,
  Badge,
  ActionIcon,
  Text,
  Loader,
  Stack,
  Paper,
  Modal,
  TextInput,
  NumberInput,
  Textarea,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconEdit, IconTrash, IconArchive } from '@tabler/icons-react';
import {
  getUtensils,
  createUtensil,
  updateUtensil,
  deleteUtensil,
  UtensilItem,
} from '../lib/api-utensils';
import { IssueUtensilModal } from './utensils/IssueUtensilModal';

export function UtensilInventoryPage() {
  const [issueOpen, setIssueOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<UtensilItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UtensilItem | null>(null);

  const {
    data: utensils,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['utensils'],
    queryFn: getUtensils,
  });

  // ---- Create / Edit form ----
  const form = useForm({
    initialValues: {
      item_name: '',
      description: '',
      stock_quantity: 0,
      rental_price: '',
    },
    validate: {
      item_name: (v) => (v.trim() ? null : 'Item name is required'),
      stock_quantity: (v) => (v >= 0 ? null : 'Stock must be 0 or more'),
    },
  });

  const openCreate = () => {
    setEditItem(null);
    form.reset();
    setCreateOpen(true);
  };

  const openEdit = (item: UtensilItem) => {
    setEditItem(item);
    form.setValues({
      item_name: item.item_name,
      description: item.description ?? '',
      stock_quantity: item.stock_quantity,
      rental_price: item.rental_price ?? '',
    });
    setCreateOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: (values: typeof form.values) =>
      editItem
        ? updateUtensil(editItem.id, {
            item_name: values.item_name,
            description: values.description || undefined,
            stock_quantity: values.stock_quantity,
            rental_price: values.rental_price || null,
          })
        : createUtensil({
            item_name: values.item_name,
            description: values.description || null,
            stock_quantity: values.stock_quantity,
            rental_price: values.rental_price || null,
          }),
    onSuccess: () => {
      notifications.show({
        title: editItem ? 'Updated' : 'Created',
        message: `Item ${editItem ? 'updated' : 'added'} to inventory.`,
        color: 'green',
      });
      form.reset();
      setCreateOpen(false);
      setEditItem(null);
      refetch();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error ?? 'Failed to save item.';
      notifications.show({ title: 'Error', message: msg, color: 'red' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteUtensil(deleteTarget!.id),
    onSuccess: () => {
      notifications.show({
        title: 'Deleted',
        message: 'Item removed from inventory.',
        color: 'green',
      });
      setDeleteTarget(null);
      refetch();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error ?? 'Failed to delete item.';
      notifications.show({ title: 'Cannot Delete', message: msg, color: 'red' });
      setDeleteTarget(null);
    },
  });

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Stack gap={2}>
          <Title order={2}>Utensil & Equipment Inventory</Title>
          <Text c="dimmed" size="sm">
            Manage your cooking utensils and event equipment stock.
          </Text>
        </Stack>
        <Group>
          <Button
            variant="light"
            leftSection={<IconArchive size={16} />}
            onClick={() => setIssueOpen(true)}
          >
            Issue Items
          </Button>
          <Button leftSection={<IconPlus size={16} />} onClick={openCreate}>
            Add Item
          </Button>
        </Group>
      </Group>

      {/* Stats */}
      {utensils && (
        <Group mb="lg" gap="md">
          <Paper withBorder p="md" radius="md" miw={140} ta="center">
            <Text size="xl" fw={800} c="blue">
              {utensils.length}
            </Text>
            <Text size="xs" c="dimmed">
              Item Types
            </Text>
          </Paper>
          <Paper withBorder p="md" radius="md" miw={140} ta="center">
            <Text size="xl" fw={800} c="green">
              {utensils.reduce((s, u) => s + (u.available_quantity ?? u.stock_quantity), 0)}
            </Text>
            <Text size="xs" c="dimmed">
              Available Units
            </Text>
          </Paper>
          <Paper withBorder p="md" radius="md" miw={140} ta="center">
            <Text size="xl" fw={800} c="orange">
              {utensils.reduce((s, u) => s + (u.quantity_out ?? 0), 0)}
            </Text>
            <Text size="xs" c="dimmed">
              Currently Out
            </Text>
          </Paper>
        </Group>
      )}

      {isLoading ? (
        <Loader />
      ) : (
        <Paper withBorder radius="md">
          <Table stickyHeader verticalSpacing="md" striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Item Name</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th>Total Stock</Table.Th>
                <Table.Th>Out</Table.Th>
                <Table.Th>Available</Table.Th>
                <Table.Th>Rental Price</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {!utensils?.length ? (
                <Table.Tr>
                  <Table.Td colSpan={7} ta="center">
                    <Text c="dimmed" py="xl">
                      No items in inventory. Add your first item.
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                utensils.map((item) => {
                  const avail = item.available_quantity ?? item.stock_quantity;
                  return (
                    <Table.Tr key={item.id}>
                      <Table.Td>
                        <Text fw={500}>{item.item_name}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c="dimmed" lineClamp={1}>
                          {item.description ?? '—'}
                        </Text>
                      </Table.Td>
                      <Table.Td>{item.stock_quantity}</Table.Td>
                      <Table.Td>
                        <Badge color={item.quantity_out ? 'orange' : 'gray'} variant="light">
                          {item.quantity_out ?? 0}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={avail > 0 ? 'green' : 'red'} variant="filled">
                          {avail}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        {item.rental_price ? (
                          `₹${parseFloat(item.rental_price).toFixed(2)}`
                        ) : (
                          <Text c="dimmed" size="sm">
                            —
                          </Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <Tooltip label="Edit Item">
                            <ActionIcon variant="light" color="blue" onClick={() => openEdit(item)}>
                              <IconEdit size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Delete Item">
                            <ActionIcon
                              variant="light"
                              color="red"
                              onClick={() => setDeleteTarget(item)}
                              disabled={(item.quantity_out ?? 0) > 0}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  );
                })
              )}
            </Table.Tbody>
          </Table>
        </Paper>
      )}

      {/* Create / Edit Modal */}
      <Modal
        opened={createOpen}
        onClose={() => setCreateOpen(false)}
        title={editItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
        size="md"
      >
        <form onSubmit={form.onSubmit((v) => saveMutation.mutate(v))}>
          <Stack gap="sm">
            <TextInput
              label="Item Name"
              placeholder="e.g. Large Biriyani Pot"
              withAsterisk
              {...form.getInputProps('item_name')}
            />
            <Textarea
              label="Description"
              placeholder="Optional description..."
              rows={2}
              {...form.getInputProps('description')}
            />
            <NumberInput
              label="Stock Quantity"
              description="Total number of this item owned"
              min={0}
              withAsterisk
              {...form.getInputProps('stock_quantity')}
            />
            <NumberInput
              label="Rental Price per Item (₹)"
              description="Used to auto-calculate penalty for missing items"
              min={0}
              prefix="₹"
              decimalScale={2}
              placeholder="0.00"
              value={parseFloat(form.values.rental_price) || ''}
              onChange={(v) => form.setFieldValue('rental_price', v !== '' ? String(v) : '')}
            />
            <Button type="submit" loading={saveMutation.isPending} mt="sm">
              {editItem ? 'Update Item' : 'Add to Inventory'}
            </Button>
          </Stack>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        opened={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Delete"
        size="sm"
      >
        <Stack>
          <Text>
            Are you sure you want to remove <strong>{deleteTarget?.item_name}</strong> from
            inventory? This cannot be undone.
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              color="red"
              loading={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Issue Modal */}
      <IssueUtensilModal
        opened={issueOpen}
        onClose={() => setIssueOpen(false)}
        onSuccess={() => {
          setIssueOpen(false);
          refetch();
        }}
      />
    </Container>
  );
}
