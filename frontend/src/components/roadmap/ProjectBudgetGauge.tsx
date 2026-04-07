import React from 'react';
import { Paper, Title, Text, Stack } from '@mantine/core';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface ProjectBudgetGaugeProps {
  utilization: number;
}

export function ProjectBudgetGauge({ utilization }: ProjectBudgetGaugeProps) {
  // Cap at 100% for the pie visual to avoid breaking the shape, but display actual
  const boundedUtilization = Math.min(utilization, 100);

  const data = [
    { name: 'Used', value: boundedUtilization },
    { name: 'Remaining', value: 100 - boundedUtilization },
  ];

  const getColor = (val: number) => {
    if (val > 100) return 'var(--mantine-color-red-6)';
    if (val > 80) return 'var(--mantine-color-yellow-6)';
    return 'var(--mantine-color-green-6)';
  };

  const chartColor = getColor(utilization);
  const COLORS = [chartColor, 'var(--mantine-color-gray-2)'];

  return (
    <Paper withBorder p="md" radius="md" style={{ height: '100%', position: 'relative' }}>
      <Stack gap={0} justify="center" align="center" style={{ height: '100%' }}>
        <Title order={5} c="dimmed" mb="sm">
          Budget Utilization
        </Title>
        <div style={{ width: '100%', height: 160, position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="75%"
                startAngle={180}
                endAngle={0}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={0}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div
            style={{
              position: 'absolute',
              top: '65%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}
          >
            <Text fw={700} size="xl" c={chartColor}>
              {utilization.toFixed(1)}%
            </Text>
          </div>
        </div>
      </Stack>
    </Paper>
  );
}
