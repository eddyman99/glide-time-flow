import { Plus, CheckCircle2, Calendar, Users, FolderKanban, ArrowRight } from 'lucide-react';
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

  // Show welcome message for new users with no data
  if (tasks.length === 0 && projects.length === 0) {
    return (
      <div className="h-full overflow-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        </div>

        <div className="max-w-2xl mx-auto py-12">
          <div className="text-center mb-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to Motion!</h2>
            <p className="text-muted-foreground">
              Let's get you started with task management. Here's what you can do:
            </p>
          </div>

          <div className="grid gap-4 mb-8">
            <div className="flex items-start gap-4 rounded-lg border border-border bg-card p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Create Your First Task</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Click the "Add Task" button to create tasks with due dates, priorities, and more.
                </p>
              </div>
              <Button onClick={onCreateTask} size="sm">
                Add Task
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <div className="flex items-start gap-4 rounded-lg border border-border bg-card p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Schedule on Calendar</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Use the Calendar view to schedule tasks and manage your time effectively.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-lg border border-border bg-card p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <FolderKanban className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Organize with Projects</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Go to Projects to create project boards and organize related tasks together.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-lg border border-border bg-card p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Create Teams</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Use the Teams section in the sidebar to create teams and invite collaborators.
                </p>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Sample data is being created to help you explore the features!
          </p>
        </div>
      </div>
    );
  }

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
        {tasks.length === 0 ? (
          <div className="text-center py-8 rounded-lg border border-dashed border-border">
            <p className="text-muted-foreground mb-4">No tasks yet</p>
            <Button onClick={onCreateTask}>
              <Plus className="h-4 w-4 mr-2" />
              Create your first task
            </Button>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
