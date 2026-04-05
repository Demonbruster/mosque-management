import React, { useEffect, useState } from 'react';
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Card,
  Badge,
  ActionIcon,
  SimpleGrid,
  Menu,
  rem,
  Tooltip,
  Alert,
  Loader,
} from '@mantine/core';
import {
  IconPlus,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconSend,
  IconInfoCircle,
  IconAlertCircle,
  IconCheck,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import {
  getTemplates,
  deleteTemplate,
  submitTemplate,
  MessageTemplate,
} from '../../../lib/api-communications';
import { notifications } from '@mantine/notifications';

const TemplateManagerPage: React.FC = () => {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      notifications.show({
        title: 'Error',
        message: 'Could not load templates',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteTemplate(id);
        notifications.show({
          title: 'Deleted',
          message: 'Template removed successfully',
          color: 'green',
        });
        fetchTemplates();
      } catch (error) {
        notifications.show({
          title: 'Error',
          message: 'Failed to delete template',
          color: 'red',
        });
      }
    }
  };

  const handleSubmit = async (id: string) => {
    try {
      await submitTemplate(id);
      notifications.show({
        title: 'Submitted',
        message: 'Template sent for Meta approval!',
        color: 'blue',
      });
      fetchTemplates();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Submission failed',
        color: 'red',
      });
    }
  };

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Stack align="center" py="xl">
          <Loader size="xl" />
          <Text>Loading WhatsApp templates...</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={2}>WhatsApp Template Management</Title>
            <Text c="dimmed">
              Create and manage pre-approved message templates for business-initiated communication.
            </Text>
          </div>
          <Button
            leftSection={<IconPlus size={18} />}
            onClick={() => navigate('/communications/templates/new')}
            variant="filled"
            color="blue"
          >
            New Template
          </Button>
        </Group>

        {templates.length === 0 ? (
          <Card withBorder p="xl" radius="md">
            <Stack align="center" py="xl">
              <IconInfoCircle size={48} color="lightgray" />
              <Title order={4}>No Templates Found</Title>
              <Text c="dimmed">
                Get started by creating your first WhatsApp template for broadcasts.
              </Text>
              <Button variant="light" onClick={() => navigate('/communications/templates/new')}>
                Create First Template
              </Button>
            </Stack>
          </Card>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {templates.map((template) => (
              <Card key={template.id} withBorder shadow="sm" radius="md" padding="md">
                <Stack justify="space-between" h="100%">
                  <div>
                    <Group justify="space-between" mb="xs">
                      <Badge
                        color={
                          template.approval_status === 'Approved'
                            ? 'green'
                            : template.approval_status === 'Rejected'
                              ? 'red'
                              : template.approval_status === 'Submitted'
                                ? 'blue'
                                : 'gray'
                        }
                      >
                        {template.approval_status}
                      </Badge>
                      <Menu position="bottom-end" shadow="md">
                        <Menu.Target>
                          <ActionIcon variant="subtle" color="gray">
                            <IconDotsVertical size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            leftSection={<IconEdit style={{ width: rem(14), height: rem(14) }} />}
                            onClick={() => navigate(`/communications/templates/${template.id}`)}
                            disabled={
                              template.approval_status === 'Approved' ||
                              template.approval_status === 'Submitted'
                            }
                          >
                            Edit
                          </Menu.Item>
                          <Menu.Item
                            leftSection={<IconSend style={{ width: rem(14), height: rem(14) }} />}
                            onClick={() => handleSubmit(template.id)}
                            disabled={template.approval_status !== 'Draft'}
                            color="blue"
                          >
                            Submit for Approval
                          </Menu.Item>
                          <Menu.Divider />
                          <Menu.Item
                            leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                            color="red"
                            onClick={() => handleDelete(template.id)}
                          >
                            Delete
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>
                    <Title order={5} mb={4}>
                      {template.template_name}
                    </Title>
                    <Text size="sm" c="dimmed" lineClamp={3}>
                      {template.template_body}
                    </Text>
                  </div>

                  <Group
                    justify="space-between"
                    mt="md"
                    pt="xs"
                    style={{ borderTop: '1px solid #eee' }}
                  >
                    <Text size="xs" c="dimmed">
                      {template.category} • {template.language}
                    </Text>
                    {template.rejection_reason && (
                      <Tooltip label={template.rejection_reason}>
                        <ActionIcon variant="light" color="red" size="sm">
                          <IconAlertCircle size={14} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </Group>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        )}

        <Alert
          icon={<IconInfoCircle size={16} />}
          title="Meta Approval Process"
          color="blue"
          variant="light"
          radius="md"
        >
          <Text size="sm">
            Templates must be approved by Meta before they can be used for broadcasting. Approval
            typically takes from 2 minutes to 24 hours. Approved templates cannot be edited.
          </Text>
        </Alert>
      </Stack>
    </Container>
  );
};

export default TemplateManagerPage;
