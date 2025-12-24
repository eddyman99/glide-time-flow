import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DbTask, DbProject } from '@/hooks/useSupabaseData';

interface DashboardNewProps {
  tasks: DbTask[];
  projects: DbProject[];
  onTaskClick: (task: DbTask) => void;
  onCreateTask: () => void;
}

export function DashboardNew({ tasks, projects, onTaskClick, onCreateTask }: DashboardNewProps) {
  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress');
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const highPriorityTasks = tasks.filter((t) => t.priority === 'high' && t.status !== 'completed');

  const stats = [
    { label: 'Total Tasks', value: tasks.length, color: 'bg-primary' },
    { label: 'To Do', value: todoTasks.length, color: 'bg-priority-medium' },
    { label: 'In Progress', value: inProgressTasks.length, color: 'bg-workspace-blue' },
    { label: 'Completed', value: completedTasks.length, color: 'bg-priority-low' },
  ];

  return (
    <div className="h-full overflow-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <Button onClick={onCreateTask}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${stat.color}`} />
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
            <p className="mt-2 text-3xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* High Priority Tasks */}
      {highPriorityTasks.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">High Priority</h2>
          <div className="space-y-2">
            {highPriorityTasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                onClick={() => onTaskClick(task)}
                className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 cursor-pointer hover:bg-accent/50 transition-colors border-l-2 border-l-priority-high"
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground">{task.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {task.duration}m · {task.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Tasks */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent Tasks</h2>
        <div className="space-y-2">
          {tasks.slice(0, 10).map((task) => {
            const project = projects.find((p) => p.id === task.project_id);
            return (
              <div
                key={task.id}
                onClick={() => onTaskClick(task)}
                className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 cursor-pointer hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground">{task.title}</p>
                  {project && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {project.name}
                    </p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground capitalize">{task.status}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
