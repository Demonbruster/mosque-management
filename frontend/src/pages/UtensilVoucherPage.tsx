// ============================================
// Voucher Page — ST-14.6
// Print-ready Issue / Return Voucher
// ============================================

import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Title,
  Button,
  Group,
  Text,
  Stack,
  Paper,
  Divider,
  Badge,
  Loader,
  Center,
  Table,
} from '@mantine/core';
import { IconPrinter, IconArrowLeft } from '@tabler/icons-react';
import { getRentalVoucher } from '../lib/api-utensils';

export function UtensilVoucherPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: voucher,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['utensil_voucher', id],
    queryFn: () => getRentalVoucher(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Center h={400}>
        <Loader />
      </Center>
    );
  }

  if (error || !voucher) {
    return (
      <Container py="xl">
        <Text c="red">Failed to load voucher data.</Text>
        <Button mt="md" variant="light" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Container>
    );
  }

  const { rental, guarantor, generated_at, voucher_type } = voucher;
  const penaltyAmt = parseFloat(rental.penalty_fee ?? '0');

  return (
    <>
      {/* Screen Controls — hidden on print */}
      <Container size="sm" py="md" className="no-print">
        <Group justify="space-between" mb="md">
          <Button
            variant="light"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
          <Button leftSection={<IconPrinter size={16} />} onClick={() => window.print()}>
            Print Voucher
          </Button>
        </Group>
      </Container>

      {/* Printable Voucher Body */}
      <Container size="sm" py="xl" id="voucher-print-area">
        <Paper withBorder p="xl" radius="md">
          <Stack gap="lg">
            {/* Header */}
            <Stack align="center" gap="xs">
              <Title order={2} ta="center">
                MOSQUE MANAGEMENT SYSTEM
              </Title>
              <Title order={4} ta="center" c="dimmed">
                Utensil & Equipment {voucher_type === 'ISSUE' ? 'Issue' : 'Return'} Voucher
              </Title>
              <Badge color={voucher_type === 'ISSUE' ? 'blue' : 'green'} size="xl" variant="filled">
                {voucher_type === 'ISSUE' ? 'ISSUE VOUCHER' : 'RETURN VOUCHER'}
              </Badge>
            </Stack>

            <Divider />

            {/* Rental Details */}
            <Stack gap="xs">
              <Title order={5}>Rental Details</Title>
              <Table withTableBorder withColumnBorders>
                <Table.Tbody>
                  <Table.Tr>
                    <Table.Td fw={600} w="40%">
                      Voucher ID
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" ff="monospace">
                        {rental.id}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td fw={600}>Item</Table.Td>
                    <Table.Td>{rental.item_name}</Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td fw={600}>Quantity Issued</Table.Td>
                    <Table.Td>{rental.quantity} unit(s)</Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td fw={600}>Issue Date</Table.Td>
                    <Table.Td>{rental.issue_date}</Table.Td>
                  </Table.Tr>
                  {voucher_type === 'RETURN' && (
                    <>
                      <Table.Tr>
                        <Table.Td fw={600}>Return Date</Table.Td>
                        <Table.Td>{rental.return_date ?? '—'}</Table.Td>
                      </Table.Tr>
                      <Table.Tr>
                        <Table.Td fw={600}>Quantity Returned</Table.Td>
                        <Table.Td>{rental.quantity_returned ?? rental.quantity} unit(s)</Table.Td>
                      </Table.Tr>
                    </>
                  )}
                </Table.Tbody>
              </Table>
            </Stack>

            {/* Borrower Details */}
            <Stack gap="xs">
              <Title order={5}>Borrower Details</Title>
              <Table withTableBorder withColumnBorders>
                <Table.Tbody>
                  <Table.Tr>
                    <Table.Td fw={600} w="40%">
                      Name
                    </Table.Td>
                    <Table.Td>{rental.borrower_name}</Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td fw={600}>Phone</Table.Td>
                    <Table.Td>{rental.borrower_phone ?? '—'}</Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td fw={600}>Category</Table.Td>
                    <Table.Td>{rental.borrower_category}</Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </Table>
            </Stack>

            {/* Guarantor Details */}
            {guarantor && (
              <Stack gap="xs">
                <Title order={5}>Guarantor Details</Title>
                <Table withTableBorder withColumnBorders>
                  <Table.Tbody>
                    <Table.Tr>
                      <Table.Td fw={600} w="40%">
                        Name
                      </Table.Td>
                      <Table.Td>{guarantor.name}</Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Td fw={600}>Phone</Table.Td>
                      <Table.Td>{guarantor.phone_number ?? '—'}</Table.Td>
                    </Table.Tr>
                  </Table.Tbody>
                </Table>
              </Stack>
            )}

            {/* Damage & Penalty (return voucher only) */}
            {voucher_type === 'RETURN' && (
              <Stack gap="xs">
                <Title order={5}>Penalty Summary</Title>
                <Table withTableBorder withColumnBorders>
                  <Table.Tbody>
                    <Table.Tr>
                      <Table.Td fw={600} w="40%">
                        Damage Description
                      </Table.Td>
                      <Table.Td>{rental.damage_description || 'None'}</Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Td fw={600}>Total Penalty</Table.Td>
                      <Table.Td>
                        <Text fw={700} c={penaltyAmt > 0 ? 'red' : 'green'}>
                          ₹{penaltyAmt.toFixed(2)}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  </Table.Tbody>
                </Table>
              </Stack>
            )}

            {/* Notes */}
            {rental.notes && (
              <Stack gap="xs">
                <Title order={5}>Notes</Title>
                <Text size="sm">{rental.notes}</Text>
              </Stack>
            )}

            <Divider />

            {/* Signature Boxes */}
            <Group grow>
              <Stack align="center" gap="xs">
                <Text size="sm">Borrower Signature</Text>
                <Paper withBorder h={60} w="100%" />
                <Text size="xs" c="dimmed">
                  Date: ___________
                </Text>
              </Stack>
              <Stack align="center" gap="xs">
                <Text size="sm">Issued By (Staff)</Text>
                <Paper withBorder h={60} w="100%" />
                <Text size="xs" c="dimmed">
                  Date: ___________
                </Text>
              </Stack>
            </Group>

            <Divider />

            <Text size="xs" ta="center" c="dimmed">
              Generated: {new Date(generated_at).toLocaleString()}
            </Text>
          </Stack>
        </Paper>
      </Container>

      {/* Print-only styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>
    </>
  );
}
