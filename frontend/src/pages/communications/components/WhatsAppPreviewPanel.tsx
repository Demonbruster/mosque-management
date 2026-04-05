import React from 'react';
import { Paper, Text, Box, Stack, Badge, Group } from '@mantine/core';
import { IconCheck, IconChecks } from '@tabler/icons-react';

interface WhatsAppPreviewProps {
  headerText?: string;
  body: string;
  footerText?: string;
  buttons?: any[];
  status?: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
}

export const WhatsAppPreviewPanel: React.FC<WhatsAppPreviewProps> = ({
  headerText,
  body,
  footerText,
  buttons,
  status,
}) => {
  return (
    <Stack gap="xs">
      <Group justify="space-between">
        <Text size="sm" fw={500} c="dimmed">
          WhatsApp Preview
        </Text>
        {status && (
          <Badge
            color={
              status === 'Approved'
                ? 'green'
                : status === 'Rejected'
                  ? 'red'
                  : status === 'Submitted'
                    ? 'blue'
                    : 'gray'
            }
          >
            {status}
          </Badge>
        )}
      </Group>

      <Box
        style={(theme) => ({
          backgroundColor: '#e5ddd5', // WhatsApp background color
          backgroundImage:
            'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
          backgroundSize: 'contain',
          padding: theme.spacing.xl,
          borderRadius: theme.radius.md,
          minHeight: '300px',
          display: 'flex',
          flexDirection: 'column',
        })}
      >
        <Paper
          p="xs"
          radius="md"
          shadow="xs"
          style={{
            maxWidth: '85%',
            alignSelf: 'flex-start',
            backgroundColor: '#ffffff',
            position: 'relative',
          }}
        >
          {headerText && (
            <Text fw={700} size="sm" mb={4} c="dark.4">
              {headerText}
            </Text>
          )}

          <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
            {body || 'Type your message body...'}
          </Text>

          {footerText && (
            <Text size="xs" c="dimmed" mt={4}>
              {footerText}
            </Text>
          )}

          <Group justify="flex-end" gap={4} mt={4}>
            <Text size="xs" c="dimmed">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <IconChecks size={14} color="#34b7f1" />
          </Group>
        </Paper>

        {buttons && buttons.length > 0 && (
          <Stack gap={4} mt={8} style={{ maxWidth: '85%' }}>
            {buttons.map((btn, idx) => (
              <Paper
                key={idx}
                p="xs"
                radius="md"
                shadow="xs"
                style={{
                  backgroundColor: '#ffffff',
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
              >
                <Text size="sm" fw={500} color="blue">
                  {btn.text || 'Button'}
                </Text>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>
    </Stack>
  );
};
