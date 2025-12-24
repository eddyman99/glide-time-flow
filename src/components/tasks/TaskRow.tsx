import { format } from 'date-fns';
import { MoreHorizontal, Calendar, Clock } from 'lucide-react';
import { Task } from '@/types';
import { cn } from '@/lib/utils';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useStore } from '@/store/useStore';

interface TaskRowProps {
  task: Task;
  onClick?: () => void;
}

export function TaskRow({ task, onClick }: TaskRowProps) {
  const { updateTaskStatus, projects } = useStore();
  const project = projects.find((p) => p.id === task.projectId);
  
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  const handleCheckboxChange = (checked: boolean) => {
    updateTaskStatus(task.id, checked ? 'completed' : 'todo');
  };

  return (
    <div
      className={cn(
        'group flex items-center gap-4 rounded-lg border border-transparent px-4 py-3 transition-all',
        'hover:border-border hover:bg-muted/30',
        task.status === 'completed' && 'opacity-60'
      )}
    >
      <Checkbox
        checked={task.status === 'completed'}
        onCheckedChange={handleCheckboxChange}
        className="h-5 w-5"
      />

      <div className="flex flex-1 cursor-pointer items-center gap-4" onClick={onClick}>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p
              className={cn(
                'truncate font-medium text-foreground',
                task.status === 'completed' && 'line-through'
              )}
            >
              {task.title}
            </p>
            {task.labels.map((label) => (
              <span
                key={label.id}
                className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                style={{ backgroundColor: `${label.color}20`, color: label.color }}
              >
                {label.name}
              </span>
            ))}
          </div>
          {project && (
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: project.color }}
              />
              {project.name}
            </div>
          )}
        </div>

        <StatusBadge status={task.status} />

        <PriorityBadge priority={task.priority} />

        {task.dueDate && (
          <div
            className={cn(
              'flex items-center gap-1.5 text-sm',
              isOverdue ? 'text-destructive' : 'text-muted-foreground'
            )}
          >
            <Calendar className="h-4 w-4" />
            {format(new Date(task.dueDate), 'MMM d')}
          </div>
        )}

        {task.duration && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {task.duration >= 60 
              ? `${Math.floor(task.duration / 60)}h ${task.duration % 60 ? `${task.duration % 60}m` : ''}` 
              : `${task.duration}m`}
          </div>
        )}

        {task.assignee && (
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-primary/10 text-xs text-primary">
              {task.assignee.name.split(' ').map((n) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </div>
  );
}
