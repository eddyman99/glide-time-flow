import { format } from 'date-fns';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { DbTask, DbProject, DbProfile } from '@/hooks/useSupabaseData';
import { cn } from '@/lib/utils';

interface TaskListNewProps {
  tasks: DbTask[];
  projects: DbProject[];
  profiles: DbProfile[];
  onTaskClick: (task: DbTask) => void;
}

export function TaskListNew({ tasks, projects, profiles, onTaskClick }: TaskListNewProps) {
  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-priority-high';
      case 'medium': return 'text-priority-medium';
      case 'low': return 'text-priority-low';
      default: return 'text-muted-foreground';
    }
  };

  const getProject = (projectId: string | null) => {
    return projects.find((p) => p.id === projectId);
  };

  const getAssignee = (assigneeId: string | null) => {
    return profiles.find((p) => p.user_id === assigneeId);
  };

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Circle className="h-12 w-12 text-muted-foreground/30" />
        <h3 className="mt-4 text-lg font-medium text-foreground">No tasks yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Create your first task to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {tasks.map((task) => {
        const project = getProject(task.project_id);
        const assignee = getAssignee(task.assignee_id);
        const isCompleted = task.status === 'completed';

        return (
          <div
            key={task.id}
            onClick={() => onTaskClick(task)}
            className={cn(
              'flex items-center gap-4 rounded-lg border border-border bg-card p-4 cursor-pointer transition-all hover:bg-accent/50',
              isCompleted && 'opacity-60'
            )}
          >
            {/* Status Icon */}
            <div className={getPriorityClass(task.priority)}>
              {isCompleted ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </div>

            {/* Task Info */}
            <div className="flex-1 min-w-0">
              <p className={cn(
                'font-medium text-foreground truncate',
                isCompleted && 'line-through'
              )}>
                {task.title}
              </p>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                {project && (
                  <span className="flex items-center gap-1">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    {project.name}
                  </span>
                )}
                {task.due_date && (
                  <span>{format(new Date(task.due_date), 'MMM d')}</span>
                )}
                {task.duration > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {task.duration >= 60 
                      ? `${Math.floor(task.duration / 60)}h`
                      : `${task.duration}m`}
                  </span>
                )}
              </div>
            </div>

            {/* Assignee */}
            {assignee && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                {(assignee.full_name || assignee.email).charAt(0).toUpperCase()}
              </div>
            )}

            {/* Progress */}
            {task.progress > 0 && task.progress < 100 && (
              <div className="w-16">
                <div className="h-1.5 w-full rounded-full bg-muted">
                  <div
                    className="h-1.5 rounded-full bg-primary"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
