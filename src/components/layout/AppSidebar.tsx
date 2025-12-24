import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Calendar, 
  CheckSquare, 
  FolderKanban, 
  ChevronDown, 
  ChevronRight,
  Plus,
  Settings,
  Search,
  Diamond,
  Megaphone,
  Code,
  Palette,
  LayoutDashboard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { currentUser } from '@/data/mockData';

const workspaceIcons: Record<string, React.ReactNode> = {
  megaphone: <Megaphone className="h-4 w-4" />,
  code: <Code className="h-4 w-4" />,
  palette: <Palette className="h-4 w-4" />,
};

const workspaceColors: Record<string, string> = {
  purple: 'bg-workspace-purple',
  blue: 'bg-workspace-blue',
  green: 'bg-workspace-green',
  orange: 'bg-workspace-orange',
  pink: 'bg-workspace-pink',
};

export function AppSidebar() {
  const location = useLocation();
  const { workspaces, projects } = useStore();
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<string[]>(['ws-1', 'ws-2']);

  const toggleWorkspace = (id: string) => {
    setExpandedWorkspaces((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    );
  };

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/tasks', icon: CheckSquare, label: 'My Tasks' },
    { to: '/calendar', icon: Calendar, label: 'Calendar' },
    { to: '/projects', icon: FolderKanban, label: 'Projects' },
  ];

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-sidebar">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Diamond className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sidebar-foreground">Motion</span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Search className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 scrollbar-thin">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
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

        {/* Workspaces */}
        <div className="mt-6">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Workspaces
            </span>
            <Button variant="ghost" size="icon" className="h-5 w-5">
              <Plus className="h-3 w-3 text-muted-foreground" />
            </Button>
          </div>

          <div className="mt-1 space-y-1">
            {workspaces.map((workspace) => (
              <div key={workspace.id}>
                <button
                  onClick={() => toggleWorkspace(workspace.id)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent/50"
                >
                  <div className={cn('flex h-5 w-5 items-center justify-center rounded text-primary-foreground', workspaceColors[workspace.color])}>
                    {workspaceIcons[workspace.icon]}
                  </div>
                  <span className="flex-1 text-left">{workspace.name}</span>
                  {expandedWorkspaces.includes(workspace.id) ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>

                {expandedWorkspaces.includes(workspace.id) && (
                  <div className="ml-6 mt-1 space-y-1 animate-fade-in">
                    {projects
                      .filter((p) => p.workspaceId === workspace.id)
                      .map((project) => (
                        <NavLink
                          key={project.id}
                          to={`/projects/${project.id}`}
                          className={({ isActive }) =>
                            cn(
                              'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors',
                              isActive
                                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                            )
                          }
                        >
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: project.color }}
                          />
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

      {/* User */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-xs text-primary-foreground">
              {currentUser.name.split(' ').map((n) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              {currentUser.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {currentUser.email}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
