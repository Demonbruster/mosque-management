/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react';
import { Modal, TextInput, Select, Checkbox, Textarea, Button, Group, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { api } from '../../lib/api';
import type { CreatePersonInput, UpdatePersonInput, Person } from '@mms/shared';

// Form validation schema using Zod
const schema = z.object({
  first_name: z.string().min(2, { message: 'First name should have at least 2 letters' }),
  last_name: z.string().min(2, { message: 'Last name should have at least 2 letters' }),
  email: z.string().email({ message: 'Invalid email' }).or(z.literal('')),
  phone_number: z.string().optional(),
  dob: z.string().optional(), // Date of Birth string YYYY-MM-DD
  gender: z.enum(['male', 'female', 'other', '']).optional(),
  category: z.enum(['Member', 'Non-Member', 'Dependent', 'Staff', 'Hifl']),
  whatsapp_opt_in: z.boolean().default(false),
  national_id: z.string().optional(),
  notes: z.string().optional(),
  is_active: z.boolean().default(true),
});

interface MemberFormModalProps {
  opened: boolean;
  onClose: () => void;
  // If editing an existing member, pass the member data
  initialData: Person | null;
  onSuccessCallback?: (person: Record<string, any>) => void;
}

export function MemberFormModal({
  opened,
  onClose,
  initialData,
  onSuccessCallback,
}: MemberFormModalProps) {
  const queryClient = useQueryClient();

  const isEditing = !!initialData;

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      dob: '',
      gender: '' as 'male' | 'female' | 'other' | '',
      category: 'Member',
      whatsapp_opt_in: false,
      national_id: '',
      notes: '',
      is_active: true,
    },
    validate: zodResolver(schema),
  });

  // Effect to reset form when opened changes (or when initialData arrives)
  useEffect(() => {
    if (opened) {
      if (initialData) {
        form.setValues({
          first_name: initialData.first_name || '',
          last_name: initialData.last_name || '',
          email: initialData.email || '',
          phone_number: initialData.phone_number || '',
          dob: initialData.dob || '',
          gender: initialData.gender || '',
          category: initialData.category || 'Member',
          whatsapp_opt_in: initialData.whatsapp_opt_in || false,
          national_id: initialData.national_id || '',
          notes: initialData.notes || '',
          is_active: initialData.is_active !== undefined ? initialData.is_active : true,
        });
      } else {
        form.reset();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, initialData]); // Omit form from dep array to avoid loops

  const createMutation = useMutation({
    mutationFn: async (data: CreatePersonInput) => {
      const res = await api.post('/api/persons', data);
      return res.data;
    },
    onSuccess: (data) => {
      notifications.show({
        title: 'Success',
        message: 'Member added successfully',
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['persons'] });
      queryClient.invalidateQueries({ queryKey: ['persons-search'] });
      onClose();
      if (onSuccessCallback) {
        onSuccessCallback(data);
      }
    },
    onError: (error: Error | any) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error || 'Failed to add member',
        color: 'red',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UpdatePersonInput) => {
      const res = await api.put(`/api/persons/${initialData?.id}`, data);
      return res.data;
    },
    onSuccess: (data) => {
      notifications.show({
        title: 'Success',
        message: 'Member updated successfully',
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['persons'] });
      queryClient.invalidateQueries({ queryKey: ['persons-search'] });
      onClose();
      if (onSuccessCallback) {
        onSuccessCallback(data);
      }
    },
    onError: (error: Error | any) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error || 'Failed to update member',
        color: 'red',
      });
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    // Clean up empty strings to null where applicable based on API expectations
    const payload = {
      ...values,
      email: values.email || null,
      phone_number: values.phone_number || null,
      dob: values.dob || null,
      gender: values.gender === '' ? null : values.gender,
      national_id: values.national_id || null,
      notes: values.notes || null,
    } as CreatePersonInput | UpdatePersonInput;

    if (isEditing) {
      updateMutation.mutate(payload as UpdatePersonInput);
    } else {
      createMutation.mutate(payload as CreatePersonInput);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditing ? 'Edit Member' : 'Add New Member'}
      size="lg"
      padding="xl"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="sm">
          <Group grow>
            <TextInput
              label="First Name"
              placeholder="Ali"
              withAsterisk
              key={form.key('first_name')}
              {...form.getInputProps('first_name')}
            />
            <TextInput
              label="Last Name"
              placeholder="Ahmed"
              withAsterisk
              key={form.key('last_name')}
              {...form.getInputProps('last_name')}
            />
          </Group>

          <Group grow>
            <TextInput
              label="Email"
              placeholder="ali@example.com"
              type="email"
              key={form.key('email')}
              {...form.getInputProps('email')}
            />
            <TextInput
              label="Phone Number"
              placeholder="+1234567890"
              key={form.key('phone_number')}
              {...form.getInputProps('phone_number')}
            />
          </Group>

          <Group grow>
            <TextInput
              label="Date of Birth"
              type="date"
              key={form.key('dob')}
              {...form.getInputProps('dob')}
            />
            <Select
              label="Gender"
              data={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: '', label: 'Other/Prefer not to say' },
              ]}
              key={form.key('gender')}
              {...form.getInputProps('gender')}
            />
          </Group>

          <Group grow>
            <Select
              label="Category"
              data={['Member', 'Non-Member', 'Dependent', 'Staff', 'Hifl']}
              withAsterisk
              key={form.key('category')}
              {...form.getInputProps('category')}
            />
            <TextInput
              label="National ID"
              placeholder="Optional ID"
              key={form.key('national_id')}
              {...form.getInputProps('national_id')}
            />
          </Group>

          <Textarea
            label="Notes"
            placeholder="Any additional information..."
            rows={3}
            key={form.key('notes')}
            {...form.getInputProps('notes')}
          />

          <Group mt="xs">
            <Checkbox
              label="Opt-in to WhatsApp Communications"
              key={form.key('whatsapp_opt_in')}
              {...form.getInputProps('whatsapp_opt_in', { type: 'checkbox' })}
            />
            <Checkbox
              label="Active Profile"
              key={form.key('is_active')}
              {...form.getInputProps('is_active', { type: 'checkbox' })}
            />
          </Group>
        </Stack>

        <Group justify="flex-end" mt="xl">
          <Button variant="default" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" color="green" loading={isPending}>
            {isEditing ? 'Save Changes' : 'Add Member'}
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
