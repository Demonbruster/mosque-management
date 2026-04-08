// ============================================
// ProjectInchargeDisplay — Reusable Component (ST-27.8)
// ============================================
// Displays the project in-charge person's name and contact.
// Used in both the admin detail page and public roadmap card.
// ============================================

import { Group, Stack, Text, ThemeIcon, Anchor } from '@mantine/core';
import { IconUser, IconPhone } from '@tabler/icons-react';

interface ProjectInchargeDisplayProps {
  name: string | null | undefined;
  phone?: string | null;
  email?: string | null;
  /** 'compact' for roadmap card, 'full' for detail page */
  variant?: 'compact' | 'full';
}

export function ProjectInchargeDisplay({
  name,
  phone,
  email,
  variant = 'compact',
}: ProjectInchargeDisplayProps) {
  if (!name) return null;

  if (variant === 'compact') {
    return (
      <Group gap={6} wrap="nowrap">
        <ThemeIcon size="xs" color="gray" variant="light" radius="xl">
          <IconUser size={10} />
        </ThemeIcon>
        <Text size="xs" c="dimmed" truncate>
          {name}
        </Text>
      </Group>
    );
  }

  return (
    <Stack gap={4}>
      <Group gap={6}>
        <ThemeIcon size="sm" color="teal" variant="light" radius="xl">
          <IconUser size={12} />
        </ThemeIcon>
        <Text size="sm" fw={600}>
          {name}
        </Text>
      </Group>

      {phone && (
        <Group gap={6} ml={26}>
          <IconPhone size={12} color="var(--mantine-color-dimmed)" />
          <Anchor href={`tel:${phone}`} size="xs" c="dimmed">
            {phone}
          </Anchor>
        </Group>
      )}

      {email && (
        <Text size="xs" c="dimmed" ml={26}>
          {email}
        </Text>
      )}
    </Stack>
  );
}
