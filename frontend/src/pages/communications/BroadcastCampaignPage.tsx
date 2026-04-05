import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Container,
  Title,
  Card,
  Text,
  Stepper,
  Button,
  Group,
  TextInput,
  MultiSelect,
  Select,
  Loader,
  Badge,
  Textarea,
  Alert,
  Checkbox,
  Stack,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconBroadcast, IconInfoCircle } from '@tabler/icons-react';
import { getSegment } from '../../lib/api-persons';
import { getPersonTags } from '../../lib/api-person-tags';
import {
  createCampaign,
  sendCampaign,
  getTemplates,
  MessageTemplate,
} from '../../lib/api-communications';
import { WhatsAppPreviewPanel } from './components/WhatsAppPreviewPanel';

export default function BroadcastCampaignPage() {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);

  const form = useForm({
    initialValues: {
      name: '',
      segmentFilter: {
        zones: [] as string[],
        tags: [] as string[],
        category: '',
        whatsappOptIn: true,
      },
      templateId: '', // For now, treat as custom message body or actual template map
    },
    validate: {
      name: (value) => (value.trim().length === 0 ? 'Campaign name is required' : null),
      templateId: (value) =>
        active === 2 && value.trim().length === 0 ? 'Message content/template is required' : null,
    },
  });

  const { data: tags } = useQuery({ queryKey: ['person-tags'], queryFn: getPersonTags });
  const tagOptions = (tags || []).map((t) => ({ label: t, value: t }));
  const categoryOptions = [
    { value: '', label: 'Any' },
    { value: 'Member', label: 'Member' },
    { value: 'Non-Member', label: 'Non-Member' },
    { value: 'Staff', label: 'Staff' },
  ];
  const zoneOptions = [
    { value: 'Zone North', label: 'Zone North' },
    { value: 'Zone South', label: 'Zone South' },
    { value: 'Zone East', label: 'Zone East' },
    { value: 'Zone West', label: 'Zone West' },
  ]; // Could be dynamic from households API

  const { data: segment, isFetching: loadingSegment } = useQuery({
    queryKey: ['segment-preview', form.values.segmentFilter],
    queryFn: () => getSegment(form.values.segmentFilter),
    refetchOnWindowFocus: false,
  });

  const createMutation = useMutation({
    mutationFn: createCampaign,
  });

  const { data: templates } = useQuery({ queryKey: ['whatsapp-templates'], queryFn: getTemplates });
  const approvedTemplates = (templates || []).filter((t) => t.approval_status === 'Approved');
  const templateOptions = approvedTemplates.map((t) => ({ value: t.id, label: t.template_name }));

  const selectedTemplate = approvedTemplates.find((t) => t.id === form.values.templateId);

  const sendMutation = useMutation({
    mutationFn: sendCampaign,
    onSuccess: (data) => {
      notifications.show({ title: 'Success', message: data.message, color: 'green' });
      navigate('/communications/campaigns');
    },
    onError: (error: any) => {
      notifications.show({ title: 'Error Dispatching', message: error.message, color: 'red' });
    },
  });

  const nextStep = () => {
    if (active === 0) {
      if (form.validateField('name').hasError) return;
    }
    if (active === 1) {
      // Validate segments - needs at least 1 contact
      if ((segment?.count || 0) === 0) {
        notifications.show({
          title: 'Empty Audience',
          message: 'Please broaden filters',
          color: 'orange',
        });
        return;
      }
    }
    setActive((current) => (current < 3 ? current + 1 : current));
  };

  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  const handleCreateAndDispatch = async () => {
    if (form.validate().hasErrors) return;

    try {
      const campaign = await createMutation.mutateAsync({
        name: form.values.name,
        segmentFilter: form.values.segmentFilter,
        templateId: form.values.templateId,
      });

      // Once created, schedule dispatches
      await sendMutation.mutateAsync(campaign.id);
    } catch (e: any) {
      notifications.show({ title: 'Creation Error', message: e.message, color: 'red' });
    }
  };

  return (
    <Container size="md" py="xl">
      <Group mb="xl">
        <IconBroadcast size={32} color="var(--mantine-color-blue-6)" />
        <Title order={2} c="blue.8">
          New Broadcast Campaign
        </Title>
      </Group>

      <Card withBorder shadow="sm" radius="md" p="xl">
        <Stepper active={active} onStepClick={setActive} allowNextStepsSelect={false}>
          {/* STEP 1 */}
          <Stepper.Step label="Basics" description="Campaign Name">
            <TextInput
              label="Campaign Name"
              description="Internal name to identify this broadcast"
              placeholder="e.g. Ramadan Fundraising 2026"
              mt="md"
              withAsterisk
              {...form.getInputProps('name')}
            />
          </Stepper.Step>

          {/* STEP 2 */}
          <Stepper.Step label="Audience" description="Dynamic Segments">
            <Text fw={500} mb="sm">
              Filter your congregation
            </Text>

            <MultiSelect
              label="Include Tags"
              placeholder="Select tags"
              data={tagOptions}
              mb="md"
              {...form.getInputProps('segmentFilter.tags')}
            />

            <MultiSelect
              label="Mahalla Zones"
              placeholder="Select geographic zones"
              data={zoneOptions}
              mb="md"
              {...form.getInputProps('segmentFilter.zones')}
            />

            <Select
              label="Membership Category"
              data={categoryOptions}
              mb="md"
              {...form.getInputProps('segmentFilter.category')}
            />

            <Checkbox
              label="Target WhatsApp Opted-In Only"
              description="Highly recommended for WhatsApp broadcasts to avoid spam flags"
              mt="lg"
              {...form.getInputProps('segmentFilter.whatsappOptIn', { type: 'checkbox' })}
            />

            <Alert
              icon={<IconInfoCircle size={16} />}
              title="Estimated Audience"
              color="blue"
              mt="xl"
              variant="light"
            >
              <Group>
                {loadingSegment ? (
                  <Loader size="sm" />
                ) : (
                  <Text size="xl" fw={700}>
                    {segment?.count || 0}
                  </Text>
                )}
                <Text>Matched contacts will receive this broadcast.</Text>
              </Group>
            </Alert>
          </Stepper.Step>

          {/* STEP 3 */}
          <Stepper.Step label="Message" description="Approved Template">
            <Stack gap="md" mt="md">
              <Select
                label="Select WhatsApp Template"
                placeholder="Choose an approved template"
                description="Only approved templates can be used for broadcasts."
                data={templateOptions}
                searchable
                nothingFoundMessage="No approved templates found"
                {...form.getInputProps('templateId')}
                withAsterisk
              />

              {selectedTemplate && (
                <WhatsAppPreviewPanel
                  headerText={selectedTemplate.header_text}
                  body={selectedTemplate.template_body}
                  footerText={selectedTemplate.footer_text}
                  buttons={selectedTemplate.cta_buttons}
                  status={selectedTemplate.approval_status}
                />
              )}

              {!selectedTemplate && (
                <Alert icon={<IconInfoCircle size={16} />} title="Meta Compliance" variant="light">
                  You must select a pre-approved template from Meta to initiate a broadcast. Go to{' '}
                  <Button
                    variant="link"
                    size="compact-xs"
                    onClick={() => navigate('/communications/templates')}
                  >
                    Templates
                  </Button>{' '}
                  to manage them.
                </Alert>
              )}
            </Stack>
          </Stepper.Step>

          {/* STEP 4 */}
          <Stepper.Completed>
            <Title order={3} mb="md">
              Review & Dispatch
            </Title>

            <Card withBorder bg="gray.0" mb="md">
              <Text fw={600}>Campaign:</Text> <Text mb="sm">{form.values.name}</Text>
              <Text fw={600}>Target Audience:</Text>{' '}
              <Badge mb="sm">{segment?.count || 0} Contacts</Badge>
              <Text fw={600}>Message Content:</Text>
              <Text style={{ whiteSpace: 'pre-wrap' }}>{form.values.templateId}</Text>
            </Card>

            <Alert color="orange" title="Warning">
              Once you click send, messages will be queued in the background. Please ensure all
              details are correct.
            </Alert>
          </Stepper.Completed>
        </Stepper>

        <Group justify="flex-end" mt="xl">
          {active !== 0 && (
            <Button variant="default" onClick={prevStep}>
              Back
            </Button>
          )}
          {active < 3 ? (
            <Button onClick={nextStep}>Next step</Button>
          ) : (
            <Button
              color="green"
              loading={createMutation.isPending || sendMutation.isPending}
              onClick={handleCreateAndDispatch}
            >
              Confirm & Dispatch Broadcast
            </Button>
          )}
        </Group>
      </Card>
    </Container>
  );
}
