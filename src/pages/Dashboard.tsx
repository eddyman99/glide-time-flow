import { useMemo } from 'react';
import { format } from 'date-fns';
import { CheckCircle2, Clock, AlertCircle, TrendingUp, Calendar, ArrowRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { TaskRow } from '@/components/tasks/TaskRow';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { currentUser } from '@/data/mockData';

export default function Dashboard() {
  const { tasks, projects } = useStore();

  const stats = useMemo(() => {
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
    const overdue = tasks.filter((t) => 
      t.dueDate && 
      new Date(t.dueDate) < new Date() && 
      t.status !== 'completed'
    ).length;
    const total = tasks.length;

    return { completed, inProgress, overdue, total };
  }, [tasks]);

  const upcomingTasks = useMemo(() => {
    return tasks
      .filter((t) => t.status !== 'completed' && t.assignee?.id === currentUser.id)
      .sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      })
      .slice(0, 5);
  }, [tasks]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          {greeting}, {currentUser.name.split(' ')[0]}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {format(new Date(), 'EEEE, MMMM d')} — Here's what's on your plate today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Completed Tasks"
          value={stats.completed}
          icon={CheckCircle2}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="In Progress"
          value={stats.inProgress}
          icon={Clock}
        />
        <StatsCard
          title="Overdue"
          value={stats.overdue}
          icon={AlertCircle}
          className={stats.overdue > 0 ? 'border-destructive/30' : ''}
        />
        <StatsCard
          title="Completion Rate"
          value={`${Math.round((stats.completed / stats.total) * 100)}%`}
          icon={TrendingUp}
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming Tasks */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold text-card-foreground">
                Your Tasks
              </h2>
              <Link to="/tasks">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="divide-y divide-border">
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map((task) => (
                  <div key={task.id} className="px-2">
                    <TaskRow task={task} />
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle2 className="h-12 w-12 text-priority-low" />
                  <h3 className="mt-4 text-lg font-medium">All caught up!</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    You don't have any pending tasks
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Projects Overview */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-card-foreground">
              Active Projects
            </h2>
            <div className="space-y-4">
              {projects.map((project) => {
                const projectTasks = tasks.filter((t) => t.projectId === project.id);
                const completed = projectTasks.filter((t) => t.status === 'completed').length;
                const total = projectTasks.length;
                const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

                return (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="block group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: project.color }}
                        />
                        <span className="font-medium text-card-foreground group-hover:text-primary transition-colors">
                          {project.name}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {percentage}%
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: project.color 
                        }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-card-foreground">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <Link to="/calendar">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  View Calendar
                </Button>
              </Link>
              <Link to="/projects">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Project Board
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
