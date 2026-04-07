import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Title,
  Text,
  Stack,
  Paper,
  Center,
  Loader,
  Group,
  Breadcrumbs,
  Anchor,
} from '@mantine/core';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getProjectFinancialAnalysis } from '../lib/api-projects';

export function ProjectAnalysisReportPage() {
  const { data: analysis, isLoading } = useQuery({
    queryKey: ['project-analysis-report'],
    queryFn: getProjectFinancialAnalysis,
  });

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Stack gap="xs">
          <Breadcrumbs separator="→" mb="xs">
            <Anchor component={Link} to="/admin/projects" size="xs">
              Projects
            </Anchor>
            <Text size="xs" c="dimmed">
              Financial Analysis
            </Text>
          </Breadcrumbs>
          <div>
            <Title order={2} fw={800}>
              Project Analysis Report
            </Title>
            <Text c="dimmed" mt="xs">
              Cross-project budget vs actual spend tracking
            </Text>
          </div>
        </Stack>

        {isLoading ? (
          <Center py={100}>
            <Loader />
          </Center>
        ) : !analysis || analysis.length === 0 ? (
          <Paper withBorder p="xl" radius="md">
            <Text c="dimmed" ta="center">
              No project data found.
            </Text>
          </Paper>
        ) : (
          <Paper withBorder p="lg" radius="md" shadow="sm" style={{ height: 600 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analysis} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="project_name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                />
                <YAxis tickFormatter={(value) => `₹${value / 1000}k`} />
                <Tooltip formatter={(value: any) => `₹ ${Number(value).toLocaleString()}`} />
                <Legend verticalAlign="top" height={36} />
                <Bar
                  dataKey="budget"
                  name="Estimated Budget"
                  fill="var(--mantine-color-blue-4)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="actual_payments"
                  name="Actual Spend"
                  fill="var(--mantine-color-red-5)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="actual_receipts"
                  name="Fundraised Receipts"
                  fill="var(--mantine-color-green-5)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        )}
      </Stack>
    </Container>
  );
}
