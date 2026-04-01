/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Title,
  Group,
  Button,
  Table,
  Badge,
  TextInput,
  Paper,
  LoadingOverlay,
  Pagination,
  ActionIcon,
} from '@mantine/core';
import { IconEdit } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { MemberFormModal } from '../components/forms/MemberFormModal';

export function MembersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const handleOpenModal = (member?: any) => {
    setSelectedMember(member || null);
    setIsModalOpen(true);
  };

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['persons-search', search],
    queryFn: async () => {
      const res = await api.get(`/api/persons/search?q=${search}`);
      return res.data;
    },
    enabled: search.length >= 2,
  });

  const { data: pagedData, isLoading: isPaging } = useQuery({
    queryKey: ['persons', page, limit],
    queryFn: async () => {
      const res = await api.get(`/api/persons?page=${page}&limit=${limit}`);
      return res.data;
    },
    enabled: search.length < 2,
  });

  const isLoading = isSearching || isPaging;
  const currentData = search.length >= 2 ? searchResults?.data : pagedData?.data;
  const meta = search.length >= 2 ? { totalPages: 1 } : pagedData?.meta;

  return (
    <div style={{ padding: '24px' }}>
      <Group justify="space-between" mb="lg">
        <Title order={2}>Community Members</Title>
        <Group>
          <Button color="green">Import CSV</Button>
          <Button color="green" onClick={() => handleOpenModal()}>
            + Add Member
          </Button>
        </Group>
      </Group>

      <Paper withBorder shadow="sm" p="md" pos="relative">
        <LoadingOverlay
          visible={isLoading}
          zIndex={1000}
          overlayProps={{ radius: 'sm', blur: 2 }}
        />

        <TextInput
          placeholder="Search by name, phone, or email..."
          value={search}
          onChange={(event) => {
            setSearch(event.currentTarget.value);
            setPage(1);
          }}
          mb="md"
          radius="md"
        />

        <Table striped highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Contact</Table.Th>
              <Table.Th>Category</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {currentData?.map((person: Record<string, any>) => (
              <Table.Tr key={person.id}>
                <Table.Td style={{ fontWeight: 500 }}>
                  {person.first_name} {person.last_name}
                </Table.Td>
                <Table.Td>{person.phone_number || person.email || 'N/A'}</Table.Td>
                <Table.Td>
                  <Badge color={person.category === 'Member' ? 'blue' : 'gray'}>
                    {person.category}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Button variant="light" size="xs" component={Link} to={`/members/${person.id}`}>
                      View
                    </Button>
                    <ActionIcon
                      variant="subtle"
                      color="blue"
                      onClick={() => handleOpenModal(person)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
            {!currentData?.length && (
              <Table.Tr>
                <Table.Td colSpan={4} align="center">
                  No members found.
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>

        {search.length < 2 && meta && meta.totalPages > 1 && (
          <Group justify="center" mt="md">
            <Pagination total={meta.totalPages} value={page} onChange={setPage} color="green" />
          </Group>
        )}
      </Paper>

      <MemberFormModal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={selectedMember}
      />
    </div>
  );
}
