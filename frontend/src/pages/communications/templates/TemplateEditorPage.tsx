import React, { useEffect, useState } from 'react';
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Stack,
  TextInput,
  Textarea,
  Select,
  Grid,
  Paper,
  ActionIcon,
  Badge,
  rem,
  MultiSelect,
  Box,
} from '@mantine/core';
import { IconChevronLeft, IconPlus, IconTrash, IconInfoCircle } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getTemplate,
  createTemplate,
  updateTemplate,
  MessageTemplate,
} from '../../../lib/api-communications';
import { notifications } from '@mantine/notifications';
import { WhatsAppPreviewPanel } from '../components/WhatsAppPreviewPanel';

const TemplateEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [form, setForm] = useState<Partial<MessageTemplate>>({
    template_name: '',
    template_body: '',
    header_text: '',
    footer_text: '',
    category: 'MARKETING',
    language: 'en_US',
    variables: [],
    cta_buttons: [],
    approval_status: 'Draft',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isNew && id) {
      setLoading(true);
      getTemplate(id as string)
        .then(setForm)
        .catch((error) => {
          notifications.show({ title: 'Error', message: 'Could not load template', color: 'red' });
          navigate('/communications/templates');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isNew]);

  const handleSave = async () => {
    if (!form.template_name || !form.template_body) {
      notifications.show({
        title: 'Missing Info',
        message: 'Template name and body are required',
        color: 'orange',
      });
      return;
    }

    try {
      setLoading(true);
      if (isNew) {
        await createTemplate(form);
        notifications.show({
          title: 'Success',
          message: 'Template created as Draft',
          color: 'green',
        });
      } else {
        await updateTemplate(id as string, form);
        notifications.show({ title: 'Success', message: 'Template updated', color: 'green' });
      }
      navigate('/communications/templates');
    } catch (error) {
      notifications.show({ title: 'Error', message: 'Failed to save template', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  const addVariable = (varName: string) => {
    if (varName && !form.variables?.includes(varName)) {
      setForm({ ...form, variables: [...(form.variables || []), varName] });
    }
  };

  const addCTA = () => {
    setForm({
      ...form,
      cta_buttons: [
        ...(form.cta_buttons || []),
        { type: 'URL', text: 'Visit Website', url: 'https://' },
      ],
    });
  };

  const removeCTA = (idx: number) => {
    const updated = [...(form.cta_buttons || [])];
    updated.splice(idx, 1);
    setForm({ ...form, cta_buttons: updated });
  };

  const insertVariableAtCursor = (varName: string) => {
    const body = form.template_body || '';
    setForm({ ...form, template_body: body + `{{${varName}}}` });
    addVariable(varName);
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Group>
          <ActionIcon variant="subtle" onClick={() => navigate('/communications/templates')}>
            <IconChevronLeft size={20} />
          </ActionIcon>
          <Title order={2}>{isNew ? 'Create New Template' : 'Edit Template'}</Title>
          {!isNew && <Badge color="gray">{form.approval_status}</Badge>}
        </Group>

        <Grid gutter="xl">
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Stack gap="md">
              <Paper withBorder p="md" radius="md">
                <Stack gap="sm">
                  <TextInput
                    label="Template Name"
                    placeholder="e.g. event_invitation_v1"
                    description="Lowercase, no spaces. Used to identify the template in Meta."
                    value={form.template_name}
                    onChange={(e) => setForm({ ...form, template_name: e.currentTarget.value })}
                    required
                    disabled={form.approval_status !== 'Draft'}
                  />

                  <Select
                    label="Category"
                    data={['MARKETING', 'UTILITY', 'AUTHENTICATION']}
                    value={form.category}
                    onChange={(val) => setForm({ ...form, category: val as any })}
                    disabled={form.approval_status !== 'Draft'}
                  />

                  <Select
                    label="Language"
                    data={[
                      { value: 'en_US', label: 'English (US)' },
                      { value: 'ml_IN', label: 'Malayalam' },
                      { value: 'ar_SA', label: 'Arabic' },
                    ]}
                    value={form.language}
                    onChange={(val) => setForm({ ...form, language: val as string })}
                    disabled={form.approval_status !== 'Draft'}
                  />
                </Stack>
              </Paper>

              <Paper withBorder p="md" radius="md">
                <Stack gap="sm">
                  <TextInput
                    label="Header (Optional)"
                    placeholder="e.g. Assalamu Alaikum"
                    value={form.header_text}
                    onChange={(e) => setForm({ ...form, header_text: e.currentTarget.value })}
                    disabled={form.approval_status !== 'Draft'}
                  />

                  <Textarea
                    label="Message Body"
                    placeholder="Hello {{first_name}}, you are invited to..."
                    minRows={6}
                    value={form.template_body}
                    onChange={(e) => setForm({ ...form, template_body: e.currentTarget.value })}
                    required
                    disabled={form.approval_status !== 'Draft'}
                  />

                  <Group gap="xs">
                    <Text size="xs" fw={500}>
                      Quick variables:
                    </Text>
                    <Button
                      variant="light"
                      size="compact-xs"
                      onClick={() => insertVariableAtCursor('first_name')}
                    >
                      first_name
                    </Button>
                    <Button
                      variant="light"
                      size="compact-xs"
                      onClick={() => insertVariableAtCursor('last_name')}
                    >
                      last_name
                    </Button>
                    <Button
                      variant="light"
                      size="compact-xs"
                      onClick={() => insertVariableAtCursor('donation_amount')}
                    >
                      donation_amount
                    </Button>
                  </Group>

                  <TextInput
                    label="Footer (Optional)"
                    placeholder="e.g. Mosque Management Committee"
                    value={form.footer_text}
                    onChange={(e) => setForm({ ...form, footer_text: e.currentTarget.value })}
                    disabled={form.approval_status !== 'Draft'}
                  />
                </Stack>
              </Paper>

              <Paper withBorder p="md" radius="md">
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text size="sm" fw={500}>
                      Buttons (CTAs)
                    </Text>
                    <Button
                      variant="subtle"
                      size="xs"
                      leftSection={<IconPlus size={14} />}
                      onClick={addCTA}
                      disabled={
                        form.approval_status !== 'Draft' || (form.cta_buttons?.length || 0) >= 3
                      }
                    >
                      Add Button
                    </Button>
                  </Group>

                  {form.cta_buttons?.map((btn, idx) => (
                    <Paper key={idx} withBorder p="xs" radius="xs" bg="gray.0">
                      <Group align="flex-end" gap="xs">
                        <Select
                          label="Type"
                          data={['URL', 'PHONE_NUMBER', 'QUICK_REPLY']}
                          value={btn.type}
                          size="xs"
                          onChange={(v) => {
                            const updated = [...(form.cta_buttons || [])];
                            updated[idx].type = v;
                            setForm({ ...form, cta_buttons: updated });
                          }}
                          disabled={form.approval_status !== 'Draft'}
                        />
                        <TextInput
                          label="Button Text"
                          placeholder="e.g. Click Here"
                          value={btn.text}
                          size="xs"
                          onChange={(e) => {
                            const updated = [...(form.cta_buttons || [])];
                            updated[idx].text = e.currentTarget.value;
                            setForm({ ...form, cta_buttons: updated });
                          }}
                          disabled={form.approval_status !== 'Draft'}
                        />
                        <ActionIcon
                          color="red"
                          variant="subtle"
                          onClick={() => removeCTA(idx)}
                          disabled={form.approval_status !== 'Draft'}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              </Paper>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 5 }}>
            <Box style={{ position: 'sticky', top: rem(20) }}>
              <WhatsAppPreviewPanel
                headerText={form.header_text}
                body={form.template_body || ''}
                footerText={form.footer_text}
                buttons={form.cta_buttons}
                status={form.approval_status}
              />

              <Stack mt="xl">
                <Button
                  fullWidth
                  size="md"
                  onClick={handleSave}
                  loading={loading}
                  disabled={form.approval_status !== 'Draft'}
                >
                  {isNew ? 'Create Template' : 'Save Changes'}
                </Button>
                <Button
                  fullWidth
                  variant="outline"
                  onClick={() => navigate('/communications/templates')}
                >
                  Cancel
                </Button>
              </Stack>
            </Box>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
};

export default TemplateEditorPage;
