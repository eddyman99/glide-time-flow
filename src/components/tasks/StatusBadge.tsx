import { Circle, Clock, CheckCircle2, CircleDashed } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaskStatus } from '@/types';

const statusConfig: Record<TaskStatus, { label: string; icon: React.ElementType; className: string }> = {
  backlog: { label: 'Backlog', icon: CircleDashed, className: 'text-muted-foreground' },
  todo: { label: 'To Do', icon: Circle, className: 'text-muted-foreground' },
  'in-progress': { label: 'In Progress', icon: Clock, className: 'text-primary' },
  completed: { label: 'Completed', icon: CheckCircle2, className: 'text-priority-low' },
};

interface StatusBadgeProps {
  status: TaskStatus;
  showLabel?: boolean;
  className?: string;
}

export function StatusBadge({ status, showLabel = false, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <Icon className={cn('h-4 w-4', config.className)} />
      {showLabel && (
        <span className="text-sm text-foreground">
          {config.label}
        </span>
      )}
    </div>
  );
}
