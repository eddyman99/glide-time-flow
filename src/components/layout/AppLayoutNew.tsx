import { useState } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { 
  Calendar, CheckSquare, FolderKanban, ChevronDown, ChevronRight,
  Plus, Settings, Search, Diamond, LayoutDashboard, LogOut, Users, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseData, DbTask } from '@/hooks/useSupabaseData';
import { WeekCalendarNew } from '@/components/calendar/WeekCalendarNew';
import { ProjectsPageNew } from '@/components/projects/ProjectsPageNew';
import { TaskListNew } from '@/components/tasks/TaskListNew';
import { EditTaskModal } from '@/components/tasks/EditTaskModal';
import { DashboardNew } from '@/components/dashboard/DashboardNew';
import { CreateTaskModalNew } from '@/components/tasks/CreateTaskModalNew';

export function AppLayoutNew() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { 
    tasks, projects, workspaces, labels, profiles, teams, loading,
    createTask, updateTask, deleteTask, createWorkspace, createProject 
  } = useSupabaseData();

  const [expandedWorkspaces, setExpandedWorkspaces] = useState<string[]>([]);
  const [editingTask, setEditingTask] = useState<DbTask | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const toggleWorkspace = (id: string) => {
    setExpandedWorkspaces((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    );
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const currentProfile = profiles.find(p => p.user_id === user?.id);

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/tasks', icon: CheckSquare, label: 'My Tasks' },
    { to: '/calendar', icon: Calendar, label: 'Calendar' },
    { to: '/projects', icon: FolderKanban, label: 'Projects' },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="flex h-screen w-64 flex-col border-r border-border bg-sidebar">
        <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Diamond className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sidebar-foreground">Motion</span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCreateModalOpen(true)}>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 scrollbar-thin">
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Workspaces
              </span>
            </div>
            <div className="mt-1 space-y-1">
              {workspaces.map((workspace) => (
                <div key={workspace.id}>
                  <button
                    onClick={() => toggleWorkspace(workspace.id)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent/50"
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded text-primary-foreground bg-primary">
                      <FolderKanban className="h-3 w-3" />
                    </div>
                    <span className="flex-1 text-left truncate">{workspace.name}</span>
                    {expandedWorkspaces.includes(workspace.id) ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  {expandedWorkspaces.includes(workspace.id) && (
                    <div className="ml-6 mt-1 space-y-1">
                      {projects.filter((p) => p.workspace_id === workspace.id).map((project) => (
                        <NavLink
                          key={project.id}
                          to={`/projects/${project.id}`}
                          className={({ isActive }) =>
                            cn(
                              'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors',
                              isActive
                                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                : 'text-muted-foreground hover:bg-sidebar-accent/50'
                            )
                          }
                        >
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: project.color }} />
                          {project.name}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                {(currentProfile?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-sidebar-foreground">
                {currentProfile?.full_name || 'User'}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email}
              </p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={
            <DashboardNew 
              tasks={tasks} 
              projects={projects} 
              onTaskClick={setEditingTask}
              onCreateTask={() => setCreateModalOpen(true)}
            />
          } />
          <Route path="/tasks" element={
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <h1 className="text-2xl font-bold text-foreground">My Tasks</h1>
                <Button onClick={() => setCreateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>
              <div className="flex-1 overflow-auto p-6">
                <TaskListNew tasks={tasks} projects={projects} profiles={profiles} onTaskClick={setEditingTask} />
              </div>
            </div>
          } />
          <Route path="/calendar" element={
            <WeekCalendarNew 
              tasks={tasks} 
              projects={projects}
              workspaces={workspaces}
              onTaskClick={setEditingTask}
              onCreateTask={createTask}
              onUpdateTask={updateTask}
            />
          } />
          <Route path="/projects/*" element={
            <ProjectsPageNew
              tasks={tasks}
              projects={projects}
              workspaces={workspaces}
              profiles={profiles}
              labels={labels}
              onTaskClick={setEditingTask}
              onUpdateTask={updateTask}
              onCreateTask={createTask}
            />
          } />
        </Routes>
      </main>

      {/* Modals */}
      {editingTask && (
        <EditTaskModal
          open={!!editingTask}
          onOpenChange={(open) => !open && setEditingTask(null)}
          task={editingTask}
          projects={projects}
          profiles={profiles}
          labels={labels}
          onSave={updateTask}
          onDelete={deleteTask}
        />
      )}

      <CreateTaskModalNew
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        projects={projects}
        workspaces={workspaces}
        profiles={profiles}
        onCreateTask={createTask}
      />
    </div>
  );
}
