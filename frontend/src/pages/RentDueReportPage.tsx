// ============================================
// Rent Due Report Page — ST-13.10
// ============================================

import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Group,
  Text,
  Loader,
  Stack,
  Paper,
  Table,
  Badge,
  Button,
  Anchor,
  Alert,
  ThemeIcon,
} from '@mantine/core';
import { IconArrowLeft, IconAlertTriangle, IconBrandWhatsapp, IconEye } from '@tabler/icons-react';
import { getRentDueReport, MONTHS } from '../lib/api-tenancy';

export function RentDueReportPage() {
  const navigate = useNavigate();
  const now = new Date();
  const curMonth = now.getMonth() + 1;
  const curYear = now.getFullYear();

  const { data: overdue, isLoading } = useQuery({
    queryKey: ['rent_due_report'],
    queryFn: getRentDueReport,
  });

  const handleWhatsApp = (phone: string | null, tenantName: string, rent: string) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, '');
    const intlPhone = cleanPhone.startsWith('0') ? `91${cleanPhone.slice(1)}` : cleanPhone;
    const message = encodeURIComponent(
      `Assalamu Alaikum ${tenantName},\n\nThis is a reminder that your rent of ₹${parseFloat(rent).toLocaleString()} for ${MONTHS[curMonth - 1]} ${curYear} is due. Please arrange for payment at the earliest convenience.\n\nJazakAllah Khair,\nMosque Management`,
    );
    window.open(`https://wa.me/${intlPhone}?text=${message}`, '_blank');
  };

  return (
    <Container size="xl" py="xl">
      <Group mb="xl" justify="space-between">
        <Stack gap={2}>
          <Anchor onClick={() => navigate('/tenancy')} c="dimmed" size="sm">
            <Group gap={4}>
              <IconArrowLeft size={14} /> Back to Agreements
            </Group>
          </Anchor>
          <Title order={2}>Rent Due Report</Title>
          <Text c="dimmed" size="sm">
            Showing tenants with overdue rent for {MONTHS[curMonth - 1]} {curYear}.
          </Text>
        </Stack>
      </Group>

      {!isLoading && overdue?.length === 0 && (
        <Alert color="green" icon={<IconAlertTriangle size={16} />} radius="md" mb="xl">
          All active tenants are paid up for this month. No overdue rents found. 🎉
        </Alert>
      )}

      {isLoading ? (
        <Loader />
      ) : (
        <Paper withBorder radius="md">
          <Table stickyHeader verticalSpacing="md" striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Tenant</Table.Th>
                <Table.Th>Property</Table.Th>
                <Table.Th>Monthly Rent</Table.Th>
                <Table.Th>Last Payment</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {overdue?.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td>
                    <Stack gap={0}>
                      <Text fw={600}>{item.person_name}</Text>
                      <Text size="xs" c="dimmed">
                        {item.phone_number ?? 'No phone'}
                      </Text>
                    </Stack>
                  </Table.Td>
                  <Table.Td>{item.property_name}</Table.Td>
                  <Table.Td c="green" fw={700}>
                    ₹{parseFloat(item.rent_amount).toLocaleString()}
                  </Table.Td>
                  <Table.Td>
                    {item.last_payment
                      ? `${MONTHS[item.last_payment.month - 1]} ${item.last_payment.year}`
                      : 'Never paid'}
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      color="red"
                      variant="light"
                      leftSection={
                        <ThemeIcon size="xs" color="red" variant="transparent">
                          <IconAlertTriangle size={10} />
                        </ThemeIcon>
                      }
                    >
                      Overdue
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Button
                        size="xs"
                        variant="light"
                        color="blue"
                        leftSection={<IconEye size={14} />}
                        onClick={() => navigate(`/tenancy/${item.id}`)}
                      >
                        View
                      </Button>
                      {item.phone_number && (
                        <Button
                          size="xs"
                          variant="light"
                          color="green"
                          leftSection={<IconBrandWhatsapp size={14} />}
                          onClick={() =>
                            handleWhatsApp(item.phone_number, item.person_name, item.rent_amount)
                          }
                        >
                          WhatsApp
                        </Button>
                      )}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      )}
    </Container>
  );
}
