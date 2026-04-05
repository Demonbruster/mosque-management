// ============================================
// Automations Page — TASK-020
// ============================================

import { useState } from 'react';
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Card,
  Badge,
  ActionIcon,
  Table,
  Menu,
  rem,
  Switch,
  Tooltip,
  Modal,
} from '@mantine/core';
import {
  IconPlus,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconPlayerPlay,
  IconRobot,
  IconClock,
  IconMessageCircle2,
} from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { FlowTestingTool } from './components/FlowTestingTool';

export interface AutomationFlow {
  id: string;
  name: string;
  description: string;
  trigger_type: 'Keyword' | 'Schedule';
  trigger_value: string;
  is_active: boolean;
  is_system: boolean;
  steps: any[];
  audience_tag_name?: string | null;
}

export function AutomationsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<AutomationFlow | null>(null);

  const { data: flows, isLoading } = useQuery<AutomationFlow[]>({
    queryKey: ['automations'],
    queryFn: async () => {
      const res = await api.get('/api/automations');
      return res.data;
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      return api.patch(`/api/automations/${id}`, { is_active });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'] });
      notifications.show({
        title: 'Status Updated',
        message: 'Automation flow status has been updated.',
        color: 'green',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/api/automations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'] });
      notifications.show({
        title: 'Deleted',
        message: 'Automation flow has been deleted.',
        color: 'red',
      });
    },
  });

  if (isLoading)
    return (
      <Container py="xl">
        <Title order={2}>Loading Automations...</Title>
      </Container>
    );

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={2} fw={700}>
            Automated Workflows
          </Title>
          <Text c="dimmed">Manage WhatsApp chatbots and scheduled conversation flows.</Text>
        </div>
        <Button
          leftSection={<IconPlus size={18} />}
          color="green"
          onClick={() => navigate('/communications/automations/new')}
        >
          Create Automation
        </Button>
      </Group>

      <Card withBorder padding="0" radius="md">
        <Table verticalSpacing="md" highlightOnHover>
          <Table.Thead bg="gray.0">
            <Table.Tr>
              <Table.Th>Name & Trigger</Table.Th>
              <Table.Th w={150}>Type</Table.Th>
              <Table.Th w={120}>Steps</Table.Th>
              <Table.Th w={120}>Status</Table.Th>
              <Table.Th w={100} ta="right">
                Actions
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {flows?.map((flow) => (
              <Table.Tr key={flow.id}>
                <Table.Td>
                  <Group gap="sm">
                    <ActionIcon
                      variant="light"
                      color={flow.is_system ? 'blue' : 'green'}
                      radius="xl"
                      size="lg"
                    >
                      {flow.trigger_type === 'Schedule' ? (
                        <IconClock size={20} />
                      ) : (
                        <IconMessageCircle2 size={20} />
                      )}
                    </ActionIcon>
                    <div>
                      <Text fw={600} size="sm">
                        {flow.name}
                        {flow.is_system && (
                          <Badge size="xs" ml="xs" variant="light" color="blue">
                            System
                          </Badge>
                        )}
                      </Text>
                      <Text size="xs" c="dimmed">
                        Trigger:{' '}
                        <Badge color="gray" variant="dot" size="xs">
                          {flow.trigger_value}
                        </Badge>
                      </Text>
                    </div>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Badge color={flow.trigger_type === 'Keyword' ? 'cyan' : 'orange'} size="sm">
                    {flow.trigger_type}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{flow.steps?.length || 0} steps</Text>
                </Table.Td>
                <Table.Td>
                  <Switch
                    checked={flow.is_active}
                    onChange={(event) =>
                      toggleMutation.mutate({ id: flow.id, is_active: event.currentTarget.checked })
                    }
                    size="sm"
                    disabled={toggleMutation.isPending}
                  />
                </Table.Td>
                <Table.Td>
                  <Group gap="4" justify="flex-end">
                    <Tooltip label="Test Conversation">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={() => {
                          setSelectedFlow(flow);
                          setTestModalOpen(true);
                        }}
                      >
                        <IconPlayerPlay size={16} />
                      </ActionIcon>
                    </Tooltip>

                    <Menu shadow="md" width={160} position="bottom-end">
                      <Menu.Target>
                        <ActionIcon variant="subtle" color="gray">
                          <IconDotsVertical size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={<IconEdit style={{ width: rem(14), height: rem(14) }} />}
                          onClick={() => navigate(`/communications/automations/${flow.id}`)}
                        >
                          Edit Flow
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item
                          color="red"
                          leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this flow?')) {
                              deleteMutation.mutate(flow.id);
                            }
                          }}
                          disabled={flow.is_system}
                        >
                          Delete
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
            {!flows?.length && (
              <Table.Tr>
                <Table.Td colSpan={5} ta="center" py="xl">
                  <IconRobot size={40} color="gray" style={{ opacity: 0.5 }} />
                  <Text c="dimmed" mt="sm">
                    No automation flows found. Create your first chatbot sequence!
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Card>

      <Modal
        opened={testModalOpen}
        onClose={() => setTestModalOpen(false)}
        title={`Test Flow: ${selectedFlow?.name}`}
        size="lg"
      >
        <FlowTestingTool flow={selectedFlow} />
      </Modal>
    </Container>
  );
}
