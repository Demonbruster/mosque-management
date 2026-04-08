/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react';
import { Modal, TextInput, Textarea, Button, Group, Stack } from '@mantine/core';
import { useForm, schemaResolver } from '@mantine/form';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { api } from '../../lib/api';
import type { CreateHouseholdInput, Household } from '@mms/shared';

// Form validation schema using Zod
const schema = z.object({
  address_line_1: z.string().min(5, { message: 'Address must be at least 5 characters long' }),
  address_line_2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  mahalla_zone: z.string().optional(),
  notes: z.string().optional(),
});

interface HouseholdFormModalProps {
  opened: boolean;
  onClose: () => void;
  initialData: Household | null;
}

export function HouseholdFormModal({ opened, onClose, initialData }: HouseholdFormModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!initialData;

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      address_line_1: '',
      address_line_2: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      mahalla_zone: '',
      notes: '',
    },
    validate: schemaResolver(schema),
  });

  useEffect(() => {
    if (opened) {
      if (initialData) {
        form.setValues({
          address_line_1: initialData.address_line_1 || '',
          address_line_2: initialData.address_line_2 || '',
          city: initialData.city || '',
          state: initialData.state || '',
          postal_code: initialData.postal_code || '',
          country: initialData.country || '',
          mahalla_zone: initialData.mahalla_zone || '',
          notes: initialData.notes || '',
        });
      } else {
        form.reset();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, initialData]);

  const createMutation = useMutation({
    mutationFn: async (data: CreateHouseholdInput) => {
      const res = await api.post('/api/households', data);
      return res.data;
    },
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Household created successfully',
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['households'] });
      onClose();
    },
    onError: (error: Error | any) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error || 'Failed to create household',
        color: 'red',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<CreateHouseholdInput>) => {
      const res = await api.put(`/api/households/${initialData?.id}`, data);
      return res.data;
    },
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Household updated successfully',
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['households'] });
      queryClient.invalidateQueries({ queryKey: ['household', initialData?.id] });
      onClose();
    },
    onError: (error: Error | any) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error || 'Failed to update household',
        color: 'red',
      });
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    const payload = {
      address_line_1: values.address_line_1,
      address_line_2: values.address_line_2 || null,
      city: values.city || null,
      state: values.state || null,
      postal_code: values.postal_code || null,
      country: values.country || null,
      mahalla_zone: values.mahalla_zone || null,
      notes: values.notes || null,
    };

    if (isEditing) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload as CreateHouseholdInput);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditing ? 'Edit Household' : 'Add New Household'}
      size="lg"
      padding="xl"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="sm">
          <TextInput
            label="Address Line 1"
            placeholder="123 Main St"
            withAsterisk
            key={form.key('address_line_1')}
            {...form.getInputProps('address_line_1')}
          />

          <TextInput
            label="Address Line 2"
            placeholder="Apt 4B"
            key={form.key('address_line_2')}
            {...form.getInputProps('address_line_2')}
          />

          <Group grow>
            <TextInput
              label="City"
              placeholder="Springfield"
              key={form.key('city')}
              {...form.getInputProps('city')}
            />
            <TextInput
              label="State/Province"
              placeholder="IL"
              key={form.key('state')}
              {...form.getInputProps('state')}
            />
          </Group>

          <Group grow>
            <TextInput
              label="Postal Code"
              placeholder="62701"
              key={form.key('postal_code')}
              {...form.getInputProps('postal_code')}
            />
            <TextInput
              label="Country"
              placeholder="USA"
              key={form.key('country')}
              {...form.getInputProps('country')}
            />
          </Group>

          <TextInput
            label="Mahalla/Zone"
            placeholder="North Side"
            key={form.key('mahalla_zone')}
            {...form.getInputProps('mahalla_zone')}
          />

          <Textarea
            label="Notes"
            placeholder="Any additional information..."
            rows={3}
            key={form.key('notes')}
            {...form.getInputProps('notes')}
          />
        </Stack>

        <Group justify="flex-end" mt="xl">
          <Button variant="default" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" color="green" loading={isPending}>
            {isEditing ? 'Save Changes' : 'Create Household'}
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
