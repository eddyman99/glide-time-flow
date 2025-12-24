import { useMemo } from 'react';
import { Plus } from 'lucide-react';
import { DbTask, DbProject, DbWorkspace } from '@/hooks/useSupabaseData';
import { cn } from '@/lib/utils';

interface KanbanBoardNewProps {
  tasks: DbTask[];
  projects: DbProject[];
  workspaces: DbWorkspace[];
  onTaskClick: (task: DbTask) => void;
  onUpdateTask: (id: string, updates: Partial<DbTask>) => Promise<any>;
  onCreateTask: (task: any) => Promise<any>;
}

const COLUMNS = [
  { id: 'backlog', label: 'Backlog', color: 'bg-muted-foreground' },
  { id: 'todo', label: 'To Do', color: 'bg-primary' },
  { id: 'in-progress', label: 'In Progress', color: 'bg-priority-medium' },
  { id: 'completed', label: 'Completed', color: 'bg-priority-low' },
];

export function KanbanBoardNew({
  tasks,
  projects,
  workspaces,
  onTaskClick,
  onUpdateTask,
}: KanbanBoardNewProps) {
  const tasksByStatus = useMemo(() => {
    const map: Record<string, DbTask[]> = {};
    COLUMNS.forEach((col) => {
      map[col.id] = tasks.filter((task) => task.status === col.id);
    });
    return map;
  }, [tasks]);

  const handleDragStart = (e: React.DragEvent, task: DbTask) => {
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      await onUpdateTask(taskId, { 
        status,
        progress: status === 'completed' ? 100 : undefined,
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-priority-high';
      case 'medium': return 'border-l-priority-medium';
      case 'low': return 'border-l-priority-low';
      default: return 'border-l-muted-foreground';
    }
  };

  const getProject = (projectId: string | null) => {
    return projects.find((p) => p.id === projectId);
  };

  return (
    <div className="flex h-full gap-4 overflow-x-auto p-6">
      {COLUMNS.map((column) => (
        <div
          key={column.id}
          className="flex w-72 flex-shrink-0 flex-col rounded-lg bg-muted/30"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          {/* Column Header */}
          <div className="flex items-center gap-2 p-3 border-b border-border">
            <div className={cn('h-2 w-2 rounded-full', column.color)} />
            <span className="text-sm font-semibold text-foreground">
              {column.label}
            </span>
            <span className="ml-auto text-xs text-muted-foreground">
              {tasksByStatus[column.id].length}
            </span>
          </div>

          {/* Tasks */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin">
            {tasksByStatus[column.id].map((task) => {
              const project = getProject(task.project_id);
              
              return (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  onClick={() => onTaskClick(task)}
                  className={cn(
                    'rounded-lg bg-card border border-border p-3 cursor-pointer transition-all hover:shadow-md border-l-2',
                    getPriorityColor(task.priority)
                  )}
                >
                  <p className="text-sm font-medium text-foreground line-clamp-2">
                    {task.title}
                  </p>
                  
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    {project && (
                      <span 
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{ 
                          backgroundColor: `${project.color}20`,
                          color: project.color,
                        }}
                      >
                        <div
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: project.color }}
                        />
                        {project.name}
                      </span>
                    )}
                    
                    {task.duration > 0 && (
                      <span className="text-[10px] text-muted-foreground">
                        {task.duration >= 60 
                          ? `${Math.floor(task.duration / 60)}h${task.duration % 60 > 0 ? ` ${task.duration % 60}m` : ''}`
                          : `${task.duration}m`}
                      </span>
                    )}
                  </div>

                  {task.progress > 0 && task.progress < 100 && (
                    <div className="mt-2">
                      <div className="h-1 w-full rounded-full bg-muted">
                        <div
                          className="h-1 rounded-full bg-primary transition-all"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
