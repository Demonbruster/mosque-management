// ============================================
// MilestoneSortableList — Reusable Component (ST-27.6)
// ============================================
// Display a drag-and-drop sortable list of milestones.
// Uses @dnd-kit/sortable for reordering.
// ============================================

import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Group, Stack, Text, ActionIcon, Paper, Box } from '@mantine/core';
import { IconGripVertical, IconEdit, IconTrash } from '@tabler/icons-react';
import type { ProjectMilestone } from '../../lib/api-projects';
import { MilestoneStatusBadge } from './MilestoneStatusBadge';
import { formatDateShort } from '../../lib/format-utils';

interface SortableMilestoneItemProps {
  milestone: ProjectMilestone;
  onEdit: (ms: ProjectMilestone) => void;
  onDelete: (id: string) => void;
}

function SortableMilestoneItem({ milestone, onEdit, onDelete }: SortableMilestoneItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: milestone.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      withBorder
      p="sm"
      radius="md"
      shadow={isDragging ? 'md' : 'xs'}
    >
      <Group wrap="nowrap">
        <Box {...attributes} {...listeners} style={{ cursor: 'grab' }}>
          <IconGripVertical size={18} color="var(--mantine-color-dimmed)" />
        </Box>

        <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
          <Text size="sm" fw={600} truncate>
            {milestone.milestone_name}
          </Text>
          <Group gap="xs">
            <MilestoneStatusBadge
              status={milestone.status}
              targetDate={milestone.target_date}
              size="xs"
            />
            {milestone.target_date && (
              <Text size="xs" c="dimmed">
                Target: {formatDateShort(milestone.target_date)}
              </Text>
            )}
            <Text size="xs" fw={700} c="teal">
              {milestone.completion_percentage}%
            </Text>
          </Group>
        </Stack>

        <Group gap={4}>
          <ActionIcon variant="light" color="orange" onClick={() => onEdit(milestone)} size="sm">
            <IconEdit size={14} />
          </ActionIcon>
          <ActionIcon variant="light" color="red" onClick={() => onDelete(milestone.id)} size="sm">
            <IconTrash size={14} />
          </ActionIcon>
        </Group>
      </Group>
    </Paper>
  );
}

interface MilestoneSortableListProps {
  milestones: ProjectMilestone[];
  onReorder: (ids: string[]) => void;
  onEdit: (ms: ProjectMilestone) => void;
  onDelete: (id: string) => void;
}

export function MilestoneSortableList({
  milestones,
  onReorder,
  onEdit,
  onDelete,
}: MilestoneSortableListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = milestones.findIndex((ms) => ms.id === active.id);
      const newIndex = milestones.findIndex((ms) => ms.id === over.id);

      const newOrderedList = arrayMove(milestones, oldIndex, newIndex);
      onReorder(newOrderedList.map((ms) => ms.id));
    }
  };

  if (milestones.length === 0) {
    return (
      <Paper withBorder p="xl" radius="md" style={{ borderStyle: 'dashed' }}>
        <Text ta="center" c="dimmed">
          No milestones defined. Create your first milestone to get started.
        </Text>
      </Paper>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={milestones.map((ms) => ms.id)} strategy={verticalListSortingStrategy}>
        <Stack gap="xs">
          {milestones.map((ms) => (
            <SortableMilestoneItem key={ms.id} milestone={ms} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </Stack>
      </SortableContext>
    </DndContext>
  );
}
