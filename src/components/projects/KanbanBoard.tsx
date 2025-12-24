import { useState } from 'react';
import { Plus, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { Task, TaskStatus } from '@/types';
import { PriorityBadge } from '@/components/tasks/PriorityBadge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'backlog', title: 'Backlog', color: 'bg-muted-foreground' },
  { id: 'todo', title: 'To Do', color: 'bg-muted-foreground' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-primary' },
  { id: 'completed', title: 'Completed', color: 'bg-priority-low' },
];

interface KanbanBoardProps {
  projectId?: string;
}

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const { tasks, updateTaskStatus, projects } = useStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const filteredTasks = projectId 
    ? tasks.filter((t) => t.projectId === projectId)
    : tasks;

  const getColumnTasks = (status: TaskStatus) =>
    filteredTasks.filter((t) => t.status === status);

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== status) {
      updateTaskStatus(draggedTask.id, status);
    }
    setDraggedTask(null);
  };

  const project = projectId ? projects.find((p) => p.id === projectId) : null;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      {project && (
        <div className="flex items-center gap-3 border-b border-border px-6 py-4">
          <div
            className="h-4 w-4 rounded-full"
            style={{ backgroundColor: project.color }}
          />
          <h2 className="text-xl font-semibold text-foreground">{project.name}</h2>
          <span className="text-sm text-muted-foreground">
            {filteredTasks.length} tasks
          </span>
        </div>
      )}

      {/* Kanban Columns */}
      <div className="flex flex-1 gap-4 overflow-x-auto p-6">
        {columns.map((column) => {
          const columnTasks = getColumnTasks(column.id);
          
          return (
            <div
              key={column.id}
              className="flex w-80 flex-shrink-0 flex-col"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn('h-2 w-2 rounded-full', column.color)} />
                  <h3 className="font-medium text-foreground">{column.title}</h3>
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground">
                    {columnTasks.length}
                  </span>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Cards */}
              <div className="flex-1 space-y-2 overflow-y-auto scrollbar-thin">
                {columnTasks.map((task, index) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    className={cn(
                      'group cursor-grab rounded-lg border border-border bg-card p-4 shadow-sm transition-all',
                      'hover:border-primary/30 hover:shadow-md',
                      'active:cursor-grabbing active:shadow-lg',
                      'animate-fade-in-up'
                    )}
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-card-foreground leading-snug">
                        {task.title}
                      </h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>

                    {task.labels.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {task.labels.map((label) => (
                          <span
                            key={label.id}
                            className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
                            style={{ 
                              backgroundColor: `${label.color}20`, 
                              color: label.color 
                            }}
                          >
                            {label.name}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <PriorityBadge priority={task.priority} />
                        {task.dueDate && (
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(task.dueDate), 'MMM d')}
                          </span>
                        )}
                      </div>
                      {task.assignee && (
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-primary/10 text-[10px] text-primary">
                            {task.assignee.name.split(' ').map((n) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>

                    {task.progress > 0 && task.progress < 100 && (
                      <div className="mt-3">
                        <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {columnTasks.length === 0 && (
                  <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-border">
                    <p className="text-sm text-muted-foreground">Drop tasks here</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <CreateTaskModal open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
}
