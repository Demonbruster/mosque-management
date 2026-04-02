// ============================================
// Tenancy Detail Page — ST-13.8
// ============================================

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Title,
  Group,
  Button,
  Badge,
  Text,
  Loader,
  Stack,
  Paper,
  Grid,
  Table,
  Divider,
  Anchor,
  ThemeIcon,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconCash,
  IconX,
  IconBuildingEstate,
  IconUser,
  IconCalendar,
} from '@tabler/icons-react';
import { getAgreementById, AgreementStatus, MONTHS } from '../lib/api-tenancy';
import { RecordRentModal } from './tenancy/RecordRentModal';
import { TerminationModal } from './tenancy/TerminationModal';

const STATUS_COLORS: Record<AgreementStatus, string> = {
  Active: 'green',
  Pending: 'yellow',
  Expired: 'gray',
  Terminated: 'red',
};

export function TenancyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [rentOpen, setRentOpen] = useState(false);
  const [terminateOpen, setTerminateOpen] = useState(false);

  const {
    data: agreement,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['tenancy_agreement', id],
    queryFn: () => getAgreementById(id!),
    enabled: !!id,
  });

  if (isLoading) return <Loader m="xl" />;
  if (!agreement)
    return (
      <Text p="xl" c="red">
        Agreement not found.
      </Text>
    );

  const isActive = agreement.status === 'Active';

  return (
    <Container size="xl" py="xl">
      <Group mb="xl" justify="space-between">
        <Group>
          <Anchor onClick={() => navigate('/tenancy')} c="dimmed" size="sm">
            <Group gap={4}>
              <IconArrowLeft size={14} /> Back to Agreements
            </Group>
          </Anchor>
        </Group>
        {isActive && (
          <Group>
            <Button leftSection={<IconCash size={16} />} onClick={() => setRentOpen(true)}>
              Record Rent Payment
            </Button>
            <Button
              variant="light"
              color="red"
              leftSection={<IconX size={16} />}
              onClick={() => setTerminateOpen(true)}
            >
              Terminate Agreement
            </Button>
          </Group>
        )}
      </Group>

      <Title order={2} mb="xs">
        Agreement — {agreement.person.first_name} {agreement.person.last_name}
      </Title>
      <Text c="dimmed" size="sm" mb="xl">
        {agreement.asset.name}
      </Text>

      <Grid mb="xl">
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper withBorder p="lg" radius="md" h="100%">
            <Stack gap="xs">
              <Group gap="xs">
                <ThemeIcon variant="light" color="blue" radius="md">
                  <IconUser size={16} />
                </ThemeIcon>
                <Text fw={600}>Tenant</Text>
              </Group>
              <Text size="lg" fw={700}>
                {agreement.person.first_name} {agreement.person.last_name}
              </Text>
              <Text size="sm" c="dimmed">
                {agreement.person.phone_number ?? 'No phone on record'}
              </Text>
            </Stack>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper withBorder p="lg" radius="md" h="100%">
            <Stack gap="xs">
              <Group gap="xs">
                <ThemeIcon variant="light" color="green" radius="md">
                  <IconBuildingEstate size={16} />
                </ThemeIcon>
                <Text fw={600}>Property</Text>
              </Group>
              <Text size="lg" fw={700}>
                {agreement.asset.name}
              </Text>
              <Badge color={STATUS_COLORS[agreement.status]} variant="light" size="lg">
                {agreement.status}
              </Badge>
            </Stack>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper withBorder p="lg" radius="md" h="100%">
            <Stack gap="xs">
              <Group gap="xs">
                <ThemeIcon variant="light" color="orange" radius="md">
                  <IconCalendar size={16} />
                </ThemeIcon>
                <Text fw={600}>Financial Terms</Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Monthly Rent
                </Text>
                <Text fw={700} size="lg" c="green">
                  ₹{parseFloat(agreement.rent_amount).toLocaleString()}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Security Deposit
                </Text>
                <Text fw={600}>
                  {agreement.security_deposit
                    ? `₹${parseFloat(agreement.security_deposit).toLocaleString()}`
                    : '—'}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Start Date
                </Text>
                <Text>{agreement.start_date}</Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  End Date
                </Text>
                <Text>{agreement.end_date ?? 'Open-ended'}</Text>
              </Group>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>

      <Paper withBorder radius="md" p="lg">
        <Title order={4} mb="md">
          Rent Payment History
        </Title>
        <Divider mb="md" />
        {!agreement.payments?.length ? (
          <Text c="dimmed" ta="center" py="xl">
            No payments recorded yet. Use &quot;Record Rent Payment&quot; to log the first payment.
          </Text>
        ) : (
          <Table striped highlightOnHover verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Period</Table.Th>
                <Table.Th>Payment Date</Table.Th>
                <Table.Th>Method</Table.Th>
                <Table.Th>Amount Paid</Table.Th>
                <Table.Th>Discount</Table.Th>
                <Table.Th>Notes</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {agreement.payments.map((p) => (
                <Table.Tr key={p.id}>
                  <Table.Td fw={500}>
                    {MONTHS[p.month - 1]} {p.year}
                  </Table.Td>
                  <Table.Td>{p.payment_date}</Table.Td>
                  <Table.Td>
                    <Badge variant="outline" size="sm">
                      {p.payment_method.replace('_', ' ')}
                    </Badge>
                  </Table.Td>
                  <Table.Td c="green" fw={600}>
                    ₹{parseFloat(p.amount_paid).toLocaleString()}
                  </Table.Td>
                  <Table.Td>
                    {p.discount_amount && parseFloat(p.discount_amount) > 0 ? (
                      <Badge color="orange" variant="light">
                        -₹{parseFloat(p.discount_amount).toLocaleString()}
                      </Badge>
                    ) : (
                      '—'
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {p.notes ?? '—'}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Paper>

      <RecordRentModal
        opened={rentOpen}
        agreementId={id!}
        rentAmount={parseFloat(agreement.rent_amount)}
        onClose={() => setRentOpen(false)}
        onSuccess={() => {
          refetch();
          setRentOpen(false);
        }}
      />
      <TerminationModal
        opened={terminateOpen}
        agreementId={id!}
        securityDeposit={parseFloat(agreement.security_deposit ?? '0')}
        onClose={() => setTerminateOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['tenancy_agreements'] });
          navigate('/tenancy');
        }}
      />
    </Container>
  );
}
