import { Container, Title, Text, Button, Center, Stack } from '@mantine/core';
import { IconTool } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

export function PlaceholderPage() {
  const navigate = useNavigate();

  return (
    <Container size="sm" py="xl">
      <Center mih="60vh">
        <Stack align="center" gap="md">
          <IconTool size={64} color="var(--mantine-color-gray-4)" stroke={1.5} />
          <Title order={2} ta="center" c="dimmed">
            Under Construction
          </Title>
          <Text c="dimmed" ta="center" maw={400}>
            This module is currently being built. It will be available in a future update.
          </Text>
          <Button variant="light" color="green" mt="md" onClick={() => navigate('/')}>
            Return to Dashboard
          </Button>
        </Stack>
      </Center>
    </Container>
  );
}
