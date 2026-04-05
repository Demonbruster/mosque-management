// ============================================
// Flow Builder Page — TASK-020
// ============================================

import { useState, useEffect, useRef } from 'react';
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  TextInput,
  Textarea,
  Select,
  Card,
  ActionIcon,
  Stack,
  Box,
  SimpleGrid,
  Paper,
  Badge,
  rem,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconPlus,
  IconTrash,
  IconGripVertical,
  IconDeviceMobile,
} from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { notifications } from '@mantine/notifications';
import { WhatsAppPreviewPanel } from './components/WhatsAppPreviewPanel';
import { AutomationFlow } from './AutomationsPage';

type FlowStep = {
  id: string;
  type: 'message' | 'question' | 'choice' | 'action' | 'handoff';
  content: string;
  options?: Array<{ label: string; value: string; next_step_id?: string }>;
  next_step_id?: string;
  variable_name?: string;
};

export default function FlowBuilderPage() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [triggerType, setTriggerType] = useState('Keyword');
  const [triggerValue, setTriggerValue] = useState('');
  const [audienceTagName, setAudienceTagName] = useState<string | null>(null);
  const [steps, setSteps] = useState<FlowStep[]>([
    { id: 'start', type: 'message', content: 'Assalamu Alaikum! How can we help you today?' },
  ]);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const isInitialSync = useRef(false);

  const { data: flowData } = useQuery<AutomationFlow>({
    queryKey: ['automation', id],
    queryFn: async () => {
      if (isNew) return null;
      const res = await api.get(`/api/automations/${id}`);
      return res.data;
    },
    enabled: !isNew,
  });

  const { data: tagsData } = useQuery({
    queryKey: ['person-tags'],
    queryFn: async () => {
      const res = await api.get('/api/person-tags');
      return res.data?.data || [];
    },
  });

  useEffect(() => {
    if (flowData && !isInitialSync.current) {
      isInitialSync.current = true;
      // Defer to next tick to avoid cascading render warning from strict lint rules
      setTimeout(() => {
        setName(flowData.name);
        setTriggerType(flowData.trigger_type);
        setTriggerValue(flowData.trigger_value);
        setAudienceTagName(flowData.audience_tag_name || null);
        setSteps(flowData.steps || []);
      }, 0);
    }
  }, [flowData]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name,
        trigger_type: triggerType,
        trigger_value: triggerValue,
        audience_tag_name: audienceTagName,
        steps,
      };
      if (isNew) {
        return api.post('/api/automations', payload);
      } else {
        return api.patch(`/api/automations/${id}`, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'] });
      notifications.show({
        title: 'Success',
        message: 'Automation flow saved successfully.',
        color: 'green',
      });
      navigate('/communications/automations');
    },
  });

  const addStep = () => {
    const newId = `step_${steps.length + 1}`;
    setSteps([...steps, { id: newId, type: 'message', content: 'Next message...' }]);
    setActiveStepIndex(steps.length);
  };

  const updateStep = (index: number, updates: Partial<FlowStep>) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], ...updates };
    setSteps(newSteps);
  };

  const removeStep = (index: number) => {
    if (steps.length === 1) return;
    setSteps(steps.filter((_, i) => i !== index));
    if (activeStepIndex >= steps.length - 1) {
      setActiveStepIndex(Math.max(0, steps.length - 2));
    }
  };

  const activeStep = steps[activeStepIndex];

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="lg">
        <Group>
          <ActionIcon variant="subtle" onClick={() => navigate('/communications/automations')}>
            <IconArrowLeft size={18} />
          </ActionIcon>
          <Title order={2}>{isNew ? 'New Automation' : `Edit: ${name}`}</Title>
        </Group>
        <Button
          color="green"
          loading={saveMutation.isPending}
          onClick={() => saveMutation.mutate()}
        >
          Save Automation
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="xl">
        <Stack gap="xl">
          {/* Configuration Card */}
          <Card withBorder radius="md" padding="lg">
            <Stack gap="md">
              <Title order={4}>General Configuration</Title>
              <TextInput
                label="Automation Name"
                placeholder="e.g., Donation Concierge"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Group grow>
                <Select
                  label="Trigger Type"
                  data={['Keyword', 'Schedule']}
                  value={triggerType}
                  onChange={(val) => setTriggerType(val || 'Keyword')}
                />
                <TextInput
                  label={triggerType === 'Keyword' ? 'Keyword' : 'Cron Schedule'}
                  placeholder={triggerType === 'Keyword' ? 'DONATE' : '0 10 * * 5'}
                  value={triggerValue}
                  onChange={(e) => setTriggerValue(e.target.value)}
                  required
                />
              </Group>

              {triggerType === 'Schedule' && (
                <Select
                  label="Target Audience (Tag)"
                  placeholder="Select a tag to target (Leave empty for all)"
                  data={tagsData?.map((tag: string) => ({ label: tag, value: tag })) || []}
                  value={audienceTagName}
                  onChange={setAudienceTagName}
                  clearable
                />
              )}
            </Stack>
          </Card>

          {/* Steps Editor */}
          <Paper withBorder radius="md" p="0" style={{ overflow: 'hidden' }}>
            <Box bg="gray.0" p="md" style={{ borderBottom: '1px solid #eee' }}>
              <Group justify="space-between">
                <Text fw={600}>Conversation Steps</Text>
                <Button
                  variant="subtle"
                  size="xs"
                  leftSection={<IconPlus size={14} />}
                  onClick={addStep}
                >
                  Add Step
                </Button>
              </Group>
            </Box>

            <Stack gap={0}>
              {steps.map((step, index) => (
                <Box
                  key={step.id}
                  p="sm"
                  style={{
                    borderBottom: '1px solid #eee',
                    backgroundColor: activeStepIndex === index ? '#f8f9fa' : 'white',
                    cursor: 'pointer',
                  }}
                  onClick={() => setActiveStepIndex(index)}
                >
                  <Group gap="sm" wrap="nowrap">
                    <IconGripVertical size={16} color="gray" />
                    <Box style={{ flex: 1 }}>
                      <Group justify="space-between" mb={4}>
                        <Text size="xs" fw={700} c={activeStepIndex === index ? 'green' : 'dimmed'}>
                          STEP {index + 1}: {step.id.toUpperCase()}
                        </Text>
                        {activeStepIndex === index && (
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            size="xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeStep(index);
                            }}
                          >
                            <IconTrash size={12} />
                          </ActionIcon>
                        )}
                      </Group>
                      <Text size="sm" lineClamp={1}>
                        {step.content || '(Empty message)'}
                      </Text>
                    </Box>
                    <Badge size="xs" variant="light" color="gray">
                      {step.type}
                    </Badge>
                  </Group>
                </Box>
              ))}
            </Stack>
          </Paper>

          {/* Active Step Panel */}
          {activeStep && (
            <Card withBorder radius="md">
              <Stack gap="md">
                <Group justify="space-between">
                  <Title order={5}>Editing Step: {activeStep.id}</Title>
                  <Select
                    size="xs"
                    w={140}
                    label="Step Type"
                    data={[
                      { label: 'Message', value: 'message' },
                      { label: 'Choice Menu', value: 'choice' },
                      { label: 'Open Question', value: 'question' },
                      { label: 'Human Handoff', value: 'handoff' },
                    ]}
                    value={activeStep.type}
                    onChange={(val) => updateStep(activeStepIndex, { type: val as any })}
                  />
                </Group>

                <Textarea
                  label="Message Content"
                  placeholder="Type the message to send to the user..."
                  minRows={3}
                  value={activeStep.content}
                  onChange={(e) => updateStep(activeStepIndex, { content: e.target.value })}
                />

                {(activeStep.type === 'question' || activeStep.type === 'choice') && (
                  <TextInput
                    label="Store Response In Variable"
                    placeholder="e.g., amount, selected_fund"
                    value={activeStep.variable_name || ''}
                    onChange={(e) => updateStep(activeStepIndex, { variable_name: e.target.value })}
                    description="This allows you to use {{variable_name}} in later steps."
                  />
                )}

                {activeStep.type === 'choice' && (
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>
                      Choice Options
                    </Text>
                    {activeStep.options?.map((opt, i) => (
                      <Group gap="xs" key={i}>
                        <TextInput
                          placeholder="Label"
                          style={{ flex: 1 }}
                          value={opt.label}
                          onChange={(e) => {
                            const newOpts = [...(activeStep.options || [])];
                            newOpts[i].label = e.target.value;
                            updateStep(activeStepIndex, { options: newOpts });
                          }}
                        />
                        <Select
                          placeholder="Next Step"
                          w={150}
                          data={steps.map((s) => ({ label: s.id, value: s.id }))}
                          value={opt.next_step_id}
                          onChange={(val) => {
                            const newOpts = [...(activeStep.options || [])];
                            newOpts[i].next_step_id = val || undefined;
                            updateStep(activeStepIndex, { options: newOpts });
                          }}
                        />
                        <ActionIcon
                          color="red"
                          variant="subtle"
                          onClick={() => {
                            const newOpts = activeStep.options?.filter((_, idx) => idx !== i);
                            updateStep(activeStepIndex, { options: newOpts });
                          }}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    ))}
                    <Button
                      variant="light"
                      size="xs"
                      onClick={() => {
                        const newOpts = [
                          ...(activeStep.options || []),
                          { label: '', value: '', next_step_id: '' },
                        ];
                        updateStep(activeStepIndex, { options: newOpts });
                      }}
                    >
                      Add Option
                    </Button>
                  </Stack>
                )}

                {activeStep.type !== 'choice' && activeStep.type !== 'handoff' && (
                  <Select
                    label="Default Next Step"
                    placeholder="Select next step ID"
                    clearable
                    data={steps.map((s) => ({ label: s.id, value: s.id }))}
                    value={activeStep.next_step_id}
                    onChange={(val) =>
                      updateStep(activeStepIndex, { next_step_id: val || undefined })
                    }
                  />
                )}
              </Stack>
            </Card>
          )}
        </Stack>

        {/* Preview Column */}
        <Stack gap="lg" style={{ position: 'sticky', top: rem(20) }}>
          <Box>
            <Title order={4} mb="xs">
              Live Preview
            </Title>
            <Text size="sm" c="dimmed" mb="md">
              Real-time rendering of the automation step on a mobile device.
            </Text>

            <WhatsAppPreviewPanel
              body={activeStep?.content || ''}
              headerText={name}
              footerText="Automated Flow — MMS"
              buttons={
                activeStep?.type === 'choice'
                  ? activeStep.options?.map((o) => ({ text: o.label }))
                  : []
              }
            />
          </Box>

          <Card withBorder radius="md" p="md">
            <Group justify="space-between" mb="xs">
              <Text fw={600} size="sm">
                Quick Tips
              </Text>
              <IconDeviceMobile size={16} color="gray" />
            </Group>
            <Stack gap="4">
              <Text size="xs">
                • Use <b>{`{{variable_name}}`}</b> to insert user responses.
              </Text>
              <Text size="xs">• Numeric menus are automatically generated for Choice steps.</Text>
              <Text size="xs">• Handoff steps end the automation and alert staff.</Text>
            </Stack>
          </Card>
        </Stack>
      </SimpleGrid>
    </Container>
  );
}
