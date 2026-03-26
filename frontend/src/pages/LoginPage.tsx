// ============================================
// Login Page
// ============================================

import { useState } from 'react';
import {
  Container,
  Paper,
  Title,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Text,
  Alert,
  Center,
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already signed in
  if (user) {
    navigate('/', { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/');
    } catch (err: Error | unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Sign in failed. Please check your credentials.');
      } else {
        setError('Sign in failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center h="70vh">
      <Container size={420} w="100%">
        <Title ta="center" order={2}>
          🕌 Mosque Management System
        </Title>
        <Text c="dimmed" size="sm" ta="center" mt={5} mb={30}>
          Sign in to access administration
        </Text>

        <Paper withBorder shadow="md" p={30} radius="md">
          <form onSubmit={handleSubmit}>
            <Stack>
              {error && (
                <Alert color="red" variant="light">
                  {error}
                </Alert>
              )}
              <TextInput
                id="login-email"
                label="Email"
                placeholder="admin@mosque.org"
                required
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
              />
              <PasswordInput
                id="login-password"
                label="Password"
                placeholder="Your password"
                required
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
              />
              <Button id="login-submit" type="submit" fullWidth color="green" loading={loading}>
                Sign In
              </Button>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Center>
  );
}
