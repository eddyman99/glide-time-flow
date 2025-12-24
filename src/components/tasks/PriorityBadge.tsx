import { Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Priority } from '@/types';

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  high: { label: 'High', className: 'text-priority-high' },
  medium: { label: 'Medium', className: 'text-priority-medium' },
  low: { label: 'Low', className: 'text-priority-low' },
  none: { label: 'None', className: 'text-priority-none' },
};

interface PriorityBadgeProps {
  priority: Priority;
  showLabel?: boolean;
  className?: string;
}

export function PriorityBadge({ priority, showLabel = false, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority];

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Flag className={cn('h-4 w-4', config.className)} />
      {showLabel && (
        <span className={cn('text-sm font-medium', config.className)}>
          {config.label}
        </span>
      )}
    </div>
  );
}
