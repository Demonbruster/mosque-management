import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Title,
  Table,
  Button,
  Group,
  Modal,
  TextInput,
  Select,
  PasswordInput,
  Text,
  Badge,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { api } from '../lib/api';

type User = {
  uid: string;
  email: string;
  name?: string;
  role: string;
};

export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<string>('member');

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['admin_users'],
    queryFn: async () => {
      const { data } = await api.get('/admin/users');
      return data;
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async (userData: any) => {
      const { data } = await api.post('/admin/users/invite', userData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_users'] });
      close();
      setEmail('');
      setPassword('');
      setName('');
      setRole('member');
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ uid, newRole }: { uid: string; newRole: string }) => {
      const { data } = await api.patch(`/admin/users/${uid}/role`, { role: newRole });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_users'] });
    },
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    inviteMutation.mutate({ email, password, name, role });
  };

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="lg">
        <Title order={2}>User Administration</Title>
        <Button onClick={open}>Invite User</Button>
      </Group>

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>Role</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {loadingText(isLoading)}
          {users.map((user) => (
            <Table.Tr key={user.uid}>
              <Table.Td>{user.name || '-'}</Table.Td>
              <Table.Td>{user.email}</Table.Td>
              <Table.Td>
                <Badge
                  color={
                    user.role === 'admin'
                      ? 'red'
                      : user.role === 'imam'
                        ? 'blue'
                        : user.role === 'treasurer'
                          ? 'yellow'
                          : 'green'
                  }
                >
                  {user.role}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Select
                  value={user.role}
                  onChange={(val) => {
                    if (val) updateRoleMutation.mutate({ uid: user.uid, newRole: val });
                  }}
                  data={[
                    { value: 'admin', label: 'Admin' },
                    { value: 'imam', label: 'Imam' },
                    { value: 'treasurer', label: 'Treasurer' },
                    { value: 'member', label: 'Member' },
                  ]}
                  style={{ width: '120px' }}
                />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal opened={opened} onClose={close} title="Invite New User" centered>
        <form onSubmit={handleInvite}>
          <TextInput
            label="Name"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            mb="sm"
          />
          <TextInput
            label="Email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            mb="sm"
          />
          <PasswordInput
            label="Temporary Password"
            placeholder="Min 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            mb="sm"
          />
          <Select
            label="Role"
            value={role}
            onChange={(val) => setRole(val || 'member')}
            data={[
              { value: 'admin', label: 'Admin' },
              { value: 'imam', label: 'Imam' },
              { value: 'treasurer', label: 'Treasurer' },
              { value: 'member', label: 'Member' },
            ]}
            required
            mb="xl"
          />
          <Button type="submit" fullWidth loading={inviteMutation.isPending}>
            Create User & Set Role
          </Button>
        </form>
      </Modal>
    </Container>
  );
}

function loadingText(isLoading: boolean) {
  if (isLoading) {
    return (
      <Table.Tr>
        <Table.Td colSpan={4}>
          <Text ta="center">Loading users...</Text>
        </Table.Td>
      </Table.Tr>
    );
  }
  return null;
}
