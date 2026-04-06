// ============================================
// Public Financial Dashboard — TASK-011
// ============================================
// Publicly accessible — no authentication required.
// Implements ISAK-35 financial transparency standard.
//
// Features:
//   - ST-11.3: Month/year selector
//   - ST-11.4: Interactive bar chart (income vs expense per fund)
//   - ST-11.5: Fund category pie chart with hover tooltips
//   - ST-11.6: Summary cards (income, expense, net, % change)
//   - ST-11.7: 12-month trend line chart
//   - ST-11.8: Mobile-first responsive layout
//   - ST-11.9: Footer with last-updated + ISAK-35 badge
// ============================================

import { useState, useMemo, useEffect } from 'react';
import {
  Card,
  Title,
  Text,
  SimpleGrid,
  Group,
  Stack,
  Badge,
  Center,
  Loader,
  Alert,
  Container,
  Select,
  Paper,
  ThemeIcon,
  Divider,
  Box,
} from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  IconArrowUpRight,
  IconArrowDownRight,
  IconMinus,
  IconAlertTriangle,
  IconShieldCheck,
  IconCalendar,
  IconChartBar,
  IconChartPie,
  IconChartLine,
  IconCoin,
} from '@tabler/icons-react';
import axios from 'axios';

// ─── Config ──────────────────────────────────────────────

const RAW_API_URL = import.meta.env.VITE_API_URL || '';
const API_URL = RAW_API_URL.endsWith('/') ? RAW_API_URL.slice(0, -1) : RAW_API_URL;
const DEFAULT_TENANT_ID =
  import.meta.env.VITE_PUBLIC_TENANT_ID || '00000000-0000-0000-0000-000000000001';

// ─── Types ───────────────────────────────────────────────

interface MonthlyDataPoint {
  month: number;
  fund_name: string;
  compliance_type: string;
  type: 'Income' | 'Expense';
  total_amount: string;
  transaction_count: number;
}

interface TrendDataPoint {
  year: number;
  month: number;
  type: 'Income' | 'Expense';
  total_amount: string;
  transaction_count: number;
}

interface MonthlyResponse {
  success: boolean;
  data: MonthlyDataPoint[];
  meta: { year: number; last_updated: string | null };
}

interface TrendResponse {
  success: boolean;
  data: TrendDataPoint[];
  meta: { months: number };
}

// ─── Constants ───────────────────────────────────────────

const FUND_COLORS: Record<string, string> = {
  ZAKAT: '#2ecc71',
  SADAQAH: '#3498db',
  WAQF: '#9b59b6',
  GENERAL: '#f39c12',
  FITRAH: '#e74c3c',
  LILLAH: '#1abc9c',
};

const PIE_COLORS = [
  '#2ecc71',
  '#3498db',
  '#9b59b6',
  '#f39c12',
  '#e74c3c',
  '#1abc9c',
  '#e67e22',
  '#16a085',
];

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const INCOME_COLOR = '#27ae60';
const EXPENSE_COLOR = '#e74c3c';

// ─── Helpers ─────────────────────────────────────────────

function formatINR(value: number): string {
  return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatINRCompact(value: number): string {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value.toFixed(0)}`;
}

// ─── Custom Recharts Tooltip ─────────────────────────────

const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <Paper shadow="md" p="sm" withBorder style={{ minWidth: 160 }}>
      <Text fw={600} size="sm" mb={4}>
        {label}
      </Text>
      {payload.map((entry: any) => (
        <Group key={entry.name} justify="space-between" gap="xs">
          <Text size="xs" c={entry.color}>
            {entry.name}
          </Text>
          <Text size="xs" fw={600}>
            {formatINR(entry.value)}
          </Text>
        </Group>
      ))}
    </Paper>
  );
};

const CustomPieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <Paper shadow="md" p="sm" withBorder>
      <Text fw={600} size="sm">
        {entry.name}
      </Text>
      <Text size="xs" c="dimmed">
        {formatINR(entry.value)}
      </Text>
      <Text size="xs" c="dimmed">
        {entry.payload.percent?.toFixed(1)}% of total
      </Text>
    </Paper>
  );
};

const CustomLineTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <Paper shadow="md" p="sm" withBorder style={{ minWidth: 160 }}>
      <Text fw={600} size="sm" mb={4}>
        {label}
      </Text>
      {payload.map((entry: any) => (
        <Group key={entry.name} justify="space-between" gap="xs">
          <Text size="xs" c={entry.color}>
            {entry.name}
          </Text>
          <Text size="xs" fw={600}>
            {formatINR(entry.value)}
          </Text>
        </Group>
      ))}
    </Paper>
  );
};

// ─── Summary Card ────────────────────────────────────────

interface SummaryCardProps {
  label: string;
  value: number;
  prevValue?: number;
  color: string;
  icon: React.ReactNode;
  id: string;
}

function SummaryCard({ label, value, prevValue, color, icon, id }: SummaryCardProps) {
  const pctChange =
    prevValue != null && prevValue !== 0 ? ((value - prevValue) / prevValue) * 100 : null;
  const isUp = pctChange != null && pctChange > 0;
  const isDown = pctChange != null && pctChange < 0;

  return (
    <Card id={id} shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between" align="flex-start">
        <div>
          <Text size="xs" tt="uppercase" fw={700} c="dimmed" lts={0.5}>
            {label}
          </Text>
          <Title order={3} c={color} mt={4}>
            {formatINR(value)}
          </Title>
          {pctChange != null && (
            <Group gap={4} mt={4}>
              <ThemeIcon
                size="xs"
                color={isUp ? 'green' : isDown ? 'red' : 'gray'}
                variant="light"
                radius="xl"
              >
                {isUp ? (
                  <IconArrowUpRight size={10} />
                ) : isDown ? (
                  <IconArrowDownRight size={10} />
                ) : (
                  <IconMinus size={10} />
                )}
              </ThemeIcon>
              <Text size="xs" c={isUp ? 'green' : isDown ? 'red' : 'dimmed'}>
                {isUp ? '+' : ''}
                {pctChange.toFixed(1)}% vs last month
              </Text>
            </Group>
          )}
          {pctChange == null && (
            <Text size="xs" c="dimmed" mt={4}>
              No previous data
            </Text>
          )}
        </div>
        <ThemeIcon size="lg" color={color} variant="light" radius="md">
          {icon}
        </ThemeIcon>
      </Group>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────

export function PublicDashboard() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-indexed

  const [selectedYear, setSelectedYear] = useState<string>(String(currentYear));
  const [resolvedTenant, setResolvedTenant] = useState<{ id: string; name: string } | null>(null);
  const [isResolving, setIsResolving] = useState(true);

  // ── Tenant Resolution ──

  useEffect(() => {
    async function resolveTenant() {
      const hostname = window.location.hostname;

      // Skip if explicitly provided as a hardcoded default (optional)
      // but usually we want hostname resolution to win

      try {
        const resp = await axios.get<{ success: boolean; data: { id: string; name: string } }>(
          `${API_URL}/api/public/tenants/resolve?hostname=${hostname}`,
        );
        if (resp.data.success) {
          setResolvedTenant(resp.data.data);
        }
      } catch (err) {
        console.warn('[PublicDashboard] Hostname resolution failed, using fallback.', err);
      } finally {
        setIsResolving(false);
      }
    }
    resolveTenant();
  }, []);

  const tenantId = resolvedTenant?.id || DEFAULT_TENANT_ID;
  const mosqueName = resolvedTenant?.name || 'Mosque Financials';

  // ── Data Fetching ──

  const {
    data: monthlyResp,
    isLoading: monthlyLoading,
    error: monthlyError,
  } = useQuery<MonthlyResponse>({
    queryKey: ['public-transactions-monthly', selectedYear],
    queryFn: async () => {
      const resp = await axios.get<MonthlyResponse>(
        `${API_URL}/api/public/transactions/summary/monthly?tenant_id=${tenantId}&year=${selectedYear}`,
      );
      return resp.data;
    },
    enabled: !isResolving, // Wait for resolution

    staleTime: 10 * 60 * 1000,
  });

  const { data: trendResp, isLoading: trendLoading } = useQuery<TrendResponse>({
    queryKey: ['public-transactions-trend'],
    queryFn: async () => {
      const resp = await axios.get<TrendResponse>(
        `${API_URL}/api/public/transactions/summary/trend?tenant_id=${tenantId}&months=12`,
      );
      return resp.data;
    },
    enabled: !isResolving,

    staleTime: 10 * 60 * 1000,
  });

  const isLoading = monthlyLoading || trendLoading || isResolving;
  const error = monthlyError;

  // ── Derived Data ──

  // Current month totals
  const { currentIncome, currentExpense, prevIncome, prevExpense } = useMemo(() => {
    const monthly = monthlyResp?.data ?? [];
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;

    const sumBy = (month: number, type: 'Income' | 'Expense') =>
      monthly
        .filter((d) => d.month === month && d.type === type)
        .reduce((s, d) => s + parseFloat(d.total_amount || '0'), 0);

    return {
      currentIncome: sumBy(currentMonth, 'Income'),
      currentExpense: sumBy(currentMonth, 'Expense'),
      prevIncome: sumBy(prevMonth, 'Income'),
      prevExpense: sumBy(prevMonth, 'Expense'),
    };
  }, [monthlyResp, currentMonth]);

  const netSurplus = currentIncome - currentExpense;

  // Bar chart: monthly income vs expense for the year
  const barChartData = useMemo(() => {
    const monthly = monthlyResp?.data ?? [];
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const income = monthly
        .filter((d) => d.month === month && d.type === 'Income')
        .reduce((s, d) => s + parseFloat(d.total_amount || '0'), 0);
      const expense = monthly
        .filter((d) => d.month === month && d.type === 'Expense')
        .reduce((s, d) => s + parseFloat(d.total_amount || '0'), 0);
      return { month: MONTH_NAMES[i], Income: income, Expense: expense };
    });
  }, [monthlyResp]);

  // Pie chart: fund category distribution (income only, selected year)
  const pieData = useMemo(() => {
    const monthly = monthlyResp?.data ?? [];
    const fundMap: Record<string, number> = {};
    monthly
      .filter((d) => d.type === 'Income')
      .forEach((d) => {
        fundMap[d.fund_name] = (fundMap[d.fund_name] || 0) + parseFloat(d.total_amount || '0');
      });
    const total = Object.values(fundMap).reduce((s, v) => s + v, 0);
    return Object.entries(fundMap)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({
        name,
        value,
        percent: total > 0 ? (value / total) * 100 : 0,
      }));
  }, [monthlyResp]);

  // Trend line chart: last 12 months
  const trendData = useMemo(() => {
    const trend = trendResp?.data ?? [];
    const monthMap: Record<string, { label: string; Income: number; Expense: number }> = {};
    trend.forEach((d) => {
      const key = `${d.year}-${String(d.month).padStart(2, '0')}`;
      if (!monthMap[key]) {
        monthMap[key] = {
          label: `${MONTH_NAMES[d.month - 1]} '${String(d.year).slice(2)}`,
          Income: 0,
          Expense: 0,
        };
      }
      monthMap[key][d.type] += parseFloat(d.total_amount || '0');
    });
    return Object.values(monthMap);
  }, [trendResp]);

  // Year options
  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const y = String(currentYear - i);
    return { value: y, label: y };
  });

  // Last updated
  const lastUpdated = monthlyResp?.meta?.last_updated
    ? new Date(monthlyResp.meta.last_updated).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  const isEmpty = !monthlyResp?.data?.length && !trendResp?.data?.length;

  // ── Render ──

  if (isLoading) {
    return (
      <Center h="60vh">
        <Stack align="center" gap="md">
          <Loader color="green" size="lg" />
          <Text c="dimmed" size="sm">
            Loading financial data…
          </Text>
        </Stack>
      </Center>
    );
  }

  if (error) {
    return (
      <Container size="sm" mt="xl">
        <Alert color="yellow" title="Data Unavailable" icon={<IconAlertTriangle size={16} />}>
          Financial data is currently unavailable. Please check back later.
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" py="md">
      <Stack gap="xl">
        {/* ── Header ── */}
        <div>
          <Group justify="space-between" align="flex-start" wrap="wrap" gap="xs">
            <div>
              <Title order={2} id="public-dashboard-title">
                📊 {mosqueName}
              </Title>
              <Text c="dimmed" mt={4} size="sm">
                Financial Transparency Dashboard — {selectedYear}
              </Text>
            </div>
            <Badge
              id="isak35-badge"
              color="green"
              variant="outline"
              size="lg"
              leftSection={<IconShieldCheck size={14} />}
              radius="md"
            >
              ISAK-35 Compliant
            </Badge>
          </Group>
        </div>

        {/* ── ST-11.3: Month/Year Filter ── */}
        <Group id="date-filter-group" align="flex-end" gap="md" wrap="wrap">
          <Select
            id="year-select"
            label="Select Year"
            leftSection={<IconCalendar size={16} />}
            data={yearOptions}
            value={selectedYear}
            onChange={(v) => v && setSelectedYear(v)}
            w={140}
            allowDeselect={false}
          />
          <Text c="dimmed" size="sm" style={{ alignSelf: 'center', paddingBottom: 4 }}>
            Showing full year breakdown for {selectedYear}
          </Text>
        </Group>

        {/* ── ST-11.6: Summary Cards ── */}
        <SimpleGrid id="summary-cards" cols={{ base: 1, xs: 2, md: 4 }} spacing="md">
          <SummaryCard
            id="card-total-income"
            label="Total Income"
            value={currentIncome}
            prevValue={prevIncome}
            color="green"
            icon={<IconArrowUpRight size={18} />}
          />
          <SummaryCard
            id="card-total-expense"
            label="Total Expenses"
            value={currentExpense}
            prevValue={prevExpense}
            color="red"
            icon={<IconArrowDownRight size={18} />}
          />
          <SummaryCard
            id="card-net-surplus"
            label="Net Surplus"
            value={netSurplus}
            color={netSurplus >= 0 ? 'green' : 'red'}
            icon={<IconCoin size={18} />}
          />
          <Card id="card-transaction-count" shadow="sm" padding="lg" radius="md" withBorder>
            <Text size="xs" tt="uppercase" fw={700} c="dimmed" lts={0.5}>
              Transactions
            </Text>
            <Title order={3} mt={4}>
              {monthlyResp?.data.reduce((s, d) => s + d.transaction_count, 0) ?? 0}
            </Title>
            <Text size="xs" c="dimmed" mt={4}>
              Approved this year
            </Text>
          </Card>
        </SimpleGrid>

        {isEmpty && (
          <Card shadow="sm" padding="xl" radius="md" withBorder>
            <Center>
              <Stack align="center" gap="xs">
                <Text size="3rem">🕌</Text>
                <Title order={4}>No Approved Transactions Yet</Title>
                <Text c="dimmed" ta="center" maw={320}>
                  Approved financial records will appear here automatically.
                </Text>
              </Stack>
            </Center>
          </Card>
        )}

        {!isEmpty && (
          <>
            {/* ── ST-11.4: Bar Chart — Income vs Expense per Month ── */}
            <Card id="bar-chart-section" shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="md" wrap="wrap" gap="xs">
                <div>
                  <Group gap="xs">
                    <ThemeIcon size="sm" color="blue" variant="light" radius="sm">
                      <IconChartBar size={14} />
                    </ThemeIcon>
                    <Title order={4}>Monthly Income vs Expenses</Title>
                  </Group>
                  <Text c="dimmed" size="xs" mt={2}>
                    Month-by-month breakdown for {selectedYear}
                  </Text>
                </div>
                <Group gap="xs">
                  <Badge color="green" variant="light" size="sm">
                    ● Income
                  </Badge>
                  <Badge color="red" variant="light" size="sm">
                    ● Expense
                  </Badge>
                </Group>
              </Group>
              <Box id="bar-chart-canvas" h={{ base: 220, sm: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={formatINRCompact} tick={{ fontSize: 11 }} width={55} />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Bar dataKey="Income" fill={INCOME_COLOR} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Expense" fill={EXPENSE_COLOR} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Card>

            {/* ── ST-11.5: Pie Chart — Fund Category Distribution ── */}
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              <Card id="pie-chart-section" shadow="sm" padding="lg" radius="md" withBorder>
                <Group gap="xs" mb="xs">
                  <ThemeIcon size="sm" color="violet" variant="light" radius="sm">
                    <IconChartPie size={14} />
                  </ThemeIcon>
                  <Title order={4}>Fund Distribution</Title>
                </Group>
                <Text c="dimmed" size="xs" mb="md">
                  Income breakdown by fund type ({selectedYear})
                </Text>
                {pieData.length === 0 ? (
                  <Center h={200}>
                    <Text c="dimmed" size="sm">
                      No income data
                    </Text>
                  </Center>
                ) : (
                  <Box id="pie-chart-canvas" h={{ base: 200, sm: 240 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          outerRadius="75%"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) =>
                            (percent ?? 0) > 5 ? `${name} ${(percent ?? 0).toFixed(0)}%` : ''
                          }
                          labelLine={false}
                        >
                          {pieData.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={PIE_COLORS[index % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </Card>

              {/* Fund Category Legend Cards */}
              <Card id="fund-legend-section" shadow="sm" padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Fund Breakdown
                </Title>
                <Stack gap="xs">
                  {pieData.length === 0 ? (
                    <Text c="dimmed" size="sm">
                      No fund data available
                    </Text>
                  ) : (
                    pieData.map((fund, index) => (
                      <Group key={fund.name} justify="space-between" id={`fund-row-${fund.name}`}>
                        <Group gap="xs">
                          <Box
                            w={10}
                            h={10}
                            style={{
                              borderRadius: '50%',
                              backgroundColor: PIE_COLORS[index % PIE_COLORS.length],
                              flexShrink: 0,
                            }}
                          />
                          <Text size="sm" fw={500}>
                            {fund.name}
                          </Text>
                        </Group>
                        <Group gap="xs">
                          <Text size="sm" fw={600}>
                            {formatINR(fund.value)}
                          </Text>
                          <Badge
                            color={FUND_COLORS[fund.name] ? undefined : 'gray'}
                            variant="light"
                            size="xs"
                            style={
                              FUND_COLORS[fund.name]
                                ? {
                                    backgroundColor: `${FUND_COLORS[fund.name]}22`,
                                    color: FUND_COLORS[fund.name],
                                  }
                                : {}
                            }
                          >
                            {fund.percent.toFixed(1)}%
                          </Badge>
                        </Group>
                      </Group>
                    ))
                  )}
                </Stack>
              </Card>
            </SimpleGrid>

            {/* ── ST-11.7: Trend Line Chart — 12-Month Trajectory ── */}
            <Card id="trend-chart-section" shadow="sm" padding="lg" radius="md" withBorder>
              <Group gap="xs" mb="xs">
                <ThemeIcon size="sm" color="teal" variant="light" radius="sm">
                  <IconChartLine size={14} />
                </ThemeIcon>
                <Title order={4}>12-Month Financial Trajectory</Title>
              </Group>
              <Text c="dimmed" size="xs" mb="md">
                Rolling 12-month income and expense trend
              </Text>
              {trendLoading ? (
                <Center h={220}>
                  <Loader size="sm" color="green" />
                </Center>
              ) : trendData.length === 0 ? (
                <Center h={220}>
                  <Text c="dimmed" size="sm">
                    No trend data available
                  </Text>
                </Center>
              ) : (
                <Box id="trend-chart-canvas" h={{ base: 220, sm: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={formatINRCompact} tick={{ fontSize: 11 }} width={55} />
                      <Tooltip content={<CustomLineTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Line
                        type="monotone"
                        dataKey="Income"
                        stroke={INCOME_COLOR}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Expense"
                        stroke={EXPENSE_COLOR}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </Card>
          </>
        )}

        {/* ── ST-11.9: Footer ── */}
        <Divider />
        <Group
          id="dashboard-footer"
          justify="space-between"
          align="center"
          wrap="wrap"
          gap="xs"
          pb="md"
        >
          <Stack gap={2}>
            <Text size="xs" c="dimmed">
              {lastUpdated ? `Last updated: ${lastUpdated}` : 'Data refreshed every 10 minutes'}
            </Text>
            <Text size="xs" c="dimmed">
              Only transactions approved via Maker-Checker workflow are displayed.
            </Text>
          </Stack>
          <Group gap="xs" wrap="wrap">
            <Badge
              variant="outline"
              color="green"
              size="sm"
              leftSection={<IconShieldCheck size={12} />}
              radius="sm"
            >
              ISAK-35 Transparency Standard
            </Badge>
            <Badge variant="outline" color="gray" size="sm" radius="sm">
              Public Read-Only
            </Badge>
          </Group>
        </Group>
      </Stack>
    </Container>
  );
}
