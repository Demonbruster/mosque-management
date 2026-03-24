// ============================================
// Public Financial Dashboard
// ============================================
// Displays aggregated financial data by fund category.
// Publicly accessible — no authentication required.
// Fetches from GET /api/transactions/summary.

import {
  Card,
  Title,
  Text,
  SimpleGrid,
  Group,
  RingProgress,
  Stack,
  Badge,
  Center,
  Loader,
  Alert,
  Container,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

interface FundSummary {
  fund_category: string;
  total_amount: string;
  transaction_count: number;
}

const FUND_COLORS: Record<string, string> = {
  ZAKAT: "#2ecc71",
  SADAQAH: "#3498db",
  WAQF: "#9b59b6",
  GENERAL: "#f39c12",
  FITRAH: "#e74c3c",
  LILLAH: "#1abc9c",
};

const FUND_ICONS: Record<string, string> = {
  ZAKAT: "💎",
  SADAQAH: "🤲",
  WAQF: "🏛️",
  GENERAL: "📋",
  FITRAH: "🌙",
  LILLAH: "❤️",
};

// Default tenant for public dashboard — replace with config
const DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000001";

export function PublicDashboard() {
  const {
    data: summary,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["transactions", "summary"],
    queryFn: async () => {
      const resp = await api.get<{ success: boolean; data: FundSummary[] }>(
        `/api/transactions/summary?tenant_id=${DEFAULT_TENANT_ID}`
      );
      return resp.data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const totalAmount = summary?.reduce(
    (sum, item) => sum + parseFloat(item.total_amount || "0"),
    0
  ) || 0;

  if (isLoading) {
    return (
      <Center h="60vh">
        <Loader color="green" size="lg" />
      </Center>
    );
  }

  if (error) {
    return (
      <Container size="sm" mt="xl">
        <Alert color="yellow" title="Data Unavailable">
          Financial data is currently unavailable. Please check back later.
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="lg">
      <Stack gap="lg">
        {/* Header */}
        <div>
          <Title order={2}>📊 Public Financial Dashboard</Title>
          <Text c="dimmed" mt={4}>
            Transparency in community fund management
          </Text>
        </div>

        {/* Total Card */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" align="center">
            <div>
              <Text c="dimmed" size="sm" tt="uppercase" fw={700}>
                Total Approved Collections
              </Text>
              <Title order={1} c="green.7">
                ₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </Title>
            </div>
            <RingProgress
              size={100}
              thickness={10}
              roundCaps
              sections={
                summary?.map((item) => ({
                  value:
                    totalAmount > 0
                      ? (parseFloat(item.total_amount) / totalAmount) * 100
                      : 0,
                  color: FUND_COLORS[item.fund_category] || "#95a5a6",
                })) || []
              }
            />
          </Group>
        </Card>

        {/* Fund Category Cards */}
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
          {summary?.map((item) => (
            <Card key={item.fund_category} shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text fw={600}>
                  {FUND_ICONS[item.fund_category]} {item.fund_category}
                </Text>
                <Badge color={FUND_COLORS[item.fund_category]} variant="light">
                  {item.transaction_count} transactions
                </Badge>
              </Group>
              <Title order={3}>
                ₹{parseFloat(item.total_amount).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </Title>
              <Text c="dimmed" size="sm" mt={4}>
                {totalAmount > 0
                  ? `${((parseFloat(item.total_amount) / totalAmount) * 100).toFixed(1)}% of total`
                  : "—"}
              </Text>
            </Card>
          ))}
        </SimpleGrid>

        {/* Empty state */}
        {(!summary || summary.length === 0) && (
          <Card shadow="sm" padding="xl" radius="md" withBorder>
            <Center>
              <Stack align="center" gap="xs">
                <Text size="xl">🕌</Text>
                <Title order={4}>No Financial Data Yet</Title>
                <Text c="dimmed">
                  Transaction data will appear here once approved.
                </Text>
              </Stack>
            </Center>
          </Card>
        )}
      </Stack>
    </Container>
  );
}
