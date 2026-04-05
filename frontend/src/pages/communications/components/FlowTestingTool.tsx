// ============================================
// Flow Testing Tool component — TASK-020
// ============================================

import { useState, useEffect, useCallback } from 'react';
import {
  Paper,
  Text,
  Stack,
  TextInput,
  ActionIcon,
  Group,
  ScrollArea,
  Avatar,
  Badge,
} from '@mantine/core';
import { IconSend, IconRobot, IconUser, IconRefresh } from '@tabler/icons-react';

type Message = {
  role: 'bot' | 'user';
  content: string;
  timestamp: Date;
};

interface FlowTestingToolProps {
  flow: any;
}

export function FlowTestingTool({ flow }: FlowTestingToolProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentStepId, setCurrentStepId] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<Record<string, any>>({});

  const processStep = useCallback(
    function processStepRecursive(step: any, currentMetadata: any) {
      let content = step.content;

      // Simple variable replacement
      for (const [key, val] of Object.entries(currentMetadata)) {
        content = content.replace(new RegExp(`{{${key}}}`, 'g'), val as string);
      }

      // Add bot message
      const newMsg: Message = {
        role: 'bot',
        content,
        timestamp: new Date(),
      };

      if (step.type === 'choice' && step.options) {
        const optionsText = step.options
          .map((opt: any, i: number) => `${i + 1}. ${opt.label}`)
          .join('\n');
        newMsg.content = `${newMsg.content}\n\n${optionsText}`;
      }

      setMessages((prev) => [...prev, newMsg]);

      // If it's just a message with a direct next step, wait a bit and trigger next
      if (step.type === 'message' && step.next_step_id) {
        setTimeout(() => {
          const nextStep = flow.steps.find((s: any) => s.id === step.next_step_id);
          if (nextStep) {
            setCurrentStepId(nextStep.id);
            processStepRecursive(nextStep, currentMetadata);
          }
        }, 800);
      }
    },
    [flow.steps],
  );

  const resetTest = useCallback(() => {
    setMessages([]);
    setMetadata({});
    if (flow?.steps?.length > 0) {
      setCurrentStepId(flow.steps[0].id);
      processStep(flow.steps[0], {});
    }
  }, [flow, processStep]);

  useEffect(() => {
    resetTest();
  }, [flow, resetTest]);

  const endFlow = useCallback(() => {
    setCurrentStepId(null);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          content: '--- Flow Ended ---',
          timestamp: new Date(),
        },
      ]);
    }, 600);
  }, []);

  const handleSend = () => {
    if (!inputText.trim() || !currentStepId) return;

    const currentStep = flow.steps.find((s: any) => s.id === currentStepId);
    if (!currentStep) return;

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: inputText,
        timestamp: new Date(),
      },
    ]);

    const input = inputText.trim();
    setInputText('');

    // Logic to move to next step
    let nextStepId = currentStep.next_step_id;
    const newMetadata = { ...metadata };

    if (currentStep.type === 'choice' && currentStep.options) {
      const index = parseInt(input, 10) - 1;
      const selected = currentStep.options[index];
      if (selected) {
        if (currentStep.variable_name) newMetadata[currentStep.variable_name] = selected.value;
        nextStepId = selected.next_step_id || currentStep.next_step_id;
      } else {
        // Invalid, repeat
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              role: 'bot',
              content: "I'm sorry, please select one of the valid options above.",
              timestamp: new Date(),
            },
          ]);
        }, 500);
        return;
      }
    } else if (currentStep.type === 'question') {
      if (currentStep.variable_name) newMetadata[currentStep.variable_name] = input;
    }

    setMetadata(newMetadata);

    if (nextStepId) {
      const nextStep = flow.steps.find((s: any) => s.id === nextStepId);
      if (nextStep) {
        setCurrentStepId(nextStepId);
        setTimeout(() => processStep(nextStep, newMetadata), 600);
      } else {
        endFlow();
      }
    } else {
      endFlow();
    }
  };

  return (
    <Stack gap="md" h="100%">
      <Group justify="space-between">
        <Badge variant="dot" color="green">
          Simulation Mode
        </Badge>
        <ActionIcon variant="subtle" onClick={resetTest} title="Reset Test">
          <IconRefresh size={18} />
        </ActionIcon>
      </Group>

      <ScrollArea h={400} offsetScrollbars p="sm" bg="gray.1" style={{ borderRadius: '8px' }}>
        <Stack gap="xs">
          {messages.map((msg, i) => (
            <Group
              key={i}
              justify={msg.role === 'user' ? 'flex-end' : 'flex-start'}
              align="flex-start"
              gap="xs"
            >
              {msg.role === 'bot' && (
                <Avatar size="sm" color="green">
                  <IconRobot size={16} />
                </Avatar>
              )}
              <Paper
                p="xs"
                radius="md"
                shadow="xs"
                bg={msg.role === 'user' ? 'green.1' : 'white'}
                style={{ maxWidth: '80%' }}
              >
                <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                </Text>
                <Text size="10" c="dimmed" ta="right" mt={2}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </Paper>
              {msg.role === 'user' && (
                <Avatar size="sm" color="blue">
                  <IconUser size={16} />
                </Avatar>
              )}
            </Group>
          ))}
        </Stack>
      </ScrollArea>

      <TextInput
        placeholder={currentStepId ? 'Reply here...' : 'Flow ended.'}
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        disabled={!currentStepId}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        rightSection={
          <ActionIcon onClick={handleSend} color="green" disabled={!currentStepId}>
            <IconSend size={18} />
          </ActionIcon>
        }
      />
    </Stack>
  );
}
