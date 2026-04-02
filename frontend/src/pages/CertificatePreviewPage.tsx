// ============================================
// Certificate Preview Page
// ============================================

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Title, Group, Button, Loader, Center, Text, Paper } from '@mantine/core';
import { IconArrowLeft, IconDownload } from '@tabler/icons-react';
import { downloadCertificateBlob } from '../lib/api-life-events';

export function CertificatePreviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    let blobUrl: string;

    const fetchPdf = async () => {
      try {
        setLoading(true);
        const blob = await downloadCertificateBlob(id);
        blobUrl = URL.createObjectURL(blob);
        setPdfUrl(blobUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load certificate');
      } finally {
        setLoading(false);
      }
    };

    fetchPdf();

    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [id]);

  if (loading) {
    return (
      <Center style={{ height: '50vh' }}>
        <Loader />
      </Center>
    );
  }

  if (error) {
    return (
      <Container py="xl">
        <Text c="red" ta="center">
          {error}
        </Text>
        <Center mt="md">
          <Button onClick={() => navigate('/life-events')}>Back to Events</Button>
        </Center>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Group>
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate('/life-events')}
          >
            Back
          </Button>
          <Title order={2}>Certificate Preview</Title>
        </Group>
        <Button
          component="a"
          href={pdfUrl || undefined}
          download={`certificate-${id}.pdf`}
          leftSection={<IconDownload size={16} />}
        >
          Download PDF
        </Button>
      </Group>

      <Paper shadow="sm" p="0" style={{ height: '75vh', overflow: 'hidden' }}>
        {pdfUrl && (
          <iframe
            src={pdfUrl}
            title="Certificate Preview"
            width="100%"
            height="100%"
            style={{ border: 'none' }}
          />
        )}
      </Paper>
    </Container>
  );
}
