import React, { useState } from 'react';
import {
  Modal,
  Stepper,
  Button,
  Group,
  Text,
  Stack,
  Textarea,
  Alert,
  Loader,
  Badge,
} from '@mantine/core';
import { useQuery, useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconAlertCircle, IconCurrencyDollar, IconReceipt2 } from '@tabler/icons-react';
import {
  closeProject,
  getProjectFinancialSummary,
  getProjectTransactions, // Needs to be cast to find any pending txns
} from '../../lib/api-projects';
import { queryClient } from '../../lib/api';

interface ProjectClosureWizardProps {
  projectId: string;
  opened: boolean;
  onClose: () => void;
}

export function ProjectClosureWizard({ projectId, opened, onClose }: ProjectClosureWizardProps) {
  const [active, setActive] = useState(0);
  const [delayReason, setDelayReason] = useState('');
  const [closureNotes, setClosureNotes] = useState('');

  // 1. Fetch data for financial validation
  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['project-financial-summary', projectId],
    queryFn: () => getProjectFinancialSummary(projectId),
    enabled: opened,
  });

  const { data: transactions = [], isLoading: isLoadingTxns } = useQuery({
    queryKey: ['project-transactions-closure', projectId],
    queryFn: () =>
      getProjectTransactions(projectId) as Promise<
        Array<{ status?: string; [key: string]: unknown }>
      >,
    enabled: opened,
  });

  const pendingTransactions = transactions.filter((t) => t.status === 'Pending');
  const hasPending = pendingTransactions.length > 0;

  // 2. Closure Mutation
  const closureMutation = useMutation({
    mutationFn: () =>
      closeProject(projectId, {
        delay_reason: delayReason,
        closure_notes: closureNotes,
      }),
    onSuccess: () => {
      notifications.show({
        title: 'Project Closed',
        message: 'The project has been successfully securely closed.',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      onClose();
      setActive(0);
    },
    onError: (err: { response?: { data?: { error?: string } } }) => {
      notifications.show({
        title: 'Closure Failed',
        message: err.response?.data?.error || 'Unknown error occurred.',
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    },
  });

  const nextStep = () => setActive((current) => (current < 3 ? current + 1 : current));
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  const handleClose = () => {
    setActive(0);
    setDelayReason('');
    setClosureNotes('');
    onClose();
  };

  const handleConfirmClose = () => {
    closureMutation.mutate();
  };

  const isLoading = isLoadingSummary || isLoadingTxns;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={<Text fw={600}>Close Project Workspace</Text>}
      size="lg"
      closeOnClickOutside={false}
    >
      <Stepper active={active} onStepClick={setActive} allowNextStepsSelect={false} size="sm">
        {/* STEP 1: Financial Verification */}
        <Stepper.Step
          label="Financials"
          description="Verify open txns"
          icon={<IconCurrencyDollar size={18} />}
        >
          <Stack gap="md" mt="md">
            {isLoading ? (
              <Group justify="center" p="xl">
                <Loader />
              </Group>
            ) : (
              <>
                {hasPending ? (
                  <Alert
                    icon={<IconAlertCircle size={16} />}
                    title="Action Required: Pending Transactions"
                    color="red"
                    variant="light"
                  >
                    You have <b>{pendingTransactions.length}</b> pending transaction(s). You must
                    approve or reject them before closing this project.
                  </Alert>
                ) : (
                  <Alert
                    icon={<IconCheck size={16} />}
                    title="All Clear"
                    color="green"
                    variant="light"
                  >
                    No pending transactions found. You may proceed.
                  </Alert>
                )}

                <Group gap="apart" mt="sm">
                  <Text size="sm" fw={500}>
                    Actual Spend (Approved Expenses):
                  </Text>
                  <Badge size="lg" color="blue" variant="filled">
                    ₹ {summary?.total_payments?.toFixed(2) || '0.00'}
                  </Badge>
                </Group>
                <Group gap="apart">
                  <Text size="sm" fw={500}>
                    Estimated Budget:
                  </Text>
                  <Text size="sm" fw={600} color="dimmed">
                    ₹ {summary?.estimated_budget?.toFixed(2) || '0.00'}
                  </Text>
                </Group>
              </>
            )}

            <Group justify="right" mt="xl">
              <Button disabled={isLoading || hasPending} onClick={nextStep}>
                Next Step
              </Button>
            </Group>
          </Stack>
        </Stepper.Step>

        {/* STEP 2: Documentation */}
        <Stepper.Step
          label="Documentation"
          description="Notes & Delays"
          icon={<IconReceipt2 size={18} />}
        >
          <Stack gap="md" mt="md">
            <Textarea
              label="Delay Reason (Optional)"
              description="If the project exceeded its target completion date, briefly explain why."
              placeholder="e.g., Extended procurement timeline..."
              minRows={3}
              value={delayReason}
              onChange={(e) => setDelayReason(e.currentTarget.value)}
            />

            <Textarea
              label="Final Closure Notes"
              description="Provide any final summary notes or remarks to be archived with this project."
              placeholder="e.g., Project delivered successfully under budget."
              minRows={4}
              value={closureNotes}
              onChange={(e) => setClosureNotes(e.currentTarget.value)}
            />

            <Group justify="space-between" mt="xl">
              <Button variant="default" onClick={prevStep}>
                Back
              </Button>
              <Button onClick={nextStep}>Review & Confirm</Button>
            </Group>
          </Stack>
        </Stepper.Step>

        {/* STEP 3: Confirmation */}
        <Stepper.Step label="Confirm" description="Finalize closure" icon={<IconCheck size={18} />}>
          <Stack gap="md" mt="md">
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Irreversible Action"
              color="red"
              variant="filled"
            >
              Closing a project is permanent. The phase will be updated to &quot;Past&quot;, and no
              new milestones or transactions can be mapped to it. Please confirm your action.
            </Alert>

            <Group justify="space-between" mt="xl">
              <Button variant="default" onClick={prevStep}>
                Go Back
              </Button>
              <Button color="red" onClick={handleConfirmClose} loading={closureMutation.isPending}>
                Confirm Closure
              </Button>
            </Group>
          </Stack>
        </Stepper.Step>
      </Stepper>
    </Modal>
  );
}
