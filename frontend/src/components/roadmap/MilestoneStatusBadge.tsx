// ============================================
// MilestoneStatusBadge — Reusable Component (ST-27.7)
// ============================================
// Maps milestone status to a colour-coded badge.
// Computes "At Risk" (yellow) when target date is within 7 days.
// ============================================

import { Badge } from '@mantine/core';
import type { MilestoneStatus } from '../../lib/api-projects';

interface MilestoneStatusBadgeProps {
  status: MilestoneStatus | string;
  targetDate?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

function isAtRisk(targetDate: string | null | undefined): boolean {
  if (!targetDate) return false;
  const today = new Date();
  const target = new Date(targetDate);
  const diffMs = target.getTime() - today.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 7;
}

export function MilestoneStatusBadge({
  status,
  targetDate,
  size = 'sm',
}: MilestoneStatusBadgeProps) {
  // Determine effective display: at-risk overrides In_Progress
  const isRisk = status === 'In_Progress' && isAtRisk(targetDate);

  if (status === 'Completed') {
    return (
      <Badge size={size} color="green" variant="filled">
        ✓ Completed
      </Badge>
    );
  }

  if (status === 'Delayed') {
    return (
      <Badge size={size} color="red" variant="filled">
        ⚠ Delayed
      </Badge>
    );
  }

  if (isRisk) {
    return (
      <Badge size={size} color="yellow" variant="filled">
        ⏰ At Risk
      </Badge>
    );
  }

  if (status === 'In_Progress') {
    return (
      <Badge size={size} color="blue" variant="light">
        ● In Progress
      </Badge>
    );
  }

  // Not_Started
  return (
    <Badge size={size} color="gray" variant="outline">
      ○ Not Started
    </Badge>
  );
}
