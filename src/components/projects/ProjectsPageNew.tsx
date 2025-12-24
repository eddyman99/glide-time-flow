import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { LayoutGrid, List, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KanbanBoardNew } from '@/components/projects/KanbanBoardNew';
import { TaskListNew } from '@/components/tasks/TaskListNew';
import { DbTask, DbProject, DbWorkspace, DbProfile, DbLabel } from '@/hooks/useSupabaseData';
import { cn } from '@/lib/utils';

interface ProjectsPageNewProps {
  tasks: DbTask[];
  projects: DbProject[];
  workspaces: DbWorkspace[];
  profiles: DbProfile[];
  labels: DbLabel[];
  onTaskClick: (task: DbTask) => void;
  onUpdateTask: (id: string, updates: Partial<DbTask>) => Promise<any>;
  onCreateTask: (task: any) => Promise<any>;
}

type ViewMode = 'kanban' | 'list';

export function ProjectsPageNew({
  tasks,
  projects,
  workspaces,
  profiles,
  labels,
  onTaskClick,
  onUpdateTask,
  onCreateTask,
}: ProjectsPageNewProps) {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');

  const selectedProject = projectId 
    ? projects.find((p) => p.id === projectId) 
    : null;

  const projectTasks = projectId
    ? tasks.filter((t) => t.project_id === projectId)
    : tasks;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          {selectedProject && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/projects')}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {selectedProject ? selectedProject.name : 'All Projects'}
            </h1>
            {selectedProject?.description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedProject.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center rounded-lg border border-border p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                viewMode === 'kanban'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <LayoutGrid className="h-4 w-4" />
              Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                viewMode === 'list'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <List className="h-4 w-4" />
              List
            </button>
          </div>
        </div>
      </div>

      {/* Project Tabs (when no project selected) */}
      {!selectedProject && (
        <div className="flex gap-2 border-b border-border px-6 py-3 overflow-x-auto">
          <Link to="/projects">
            <Button
              variant={!projectId ? 'secondary' : 'ghost'}
              size="sm"
            >
              All Tasks
            </Button>
          </Link>
          {projects.map((project) => (
            <Link key={project.id} to={`/projects/${project.id}`}>
              <Button
                variant={projectId === project.id ? 'secondary' : 'ghost'}
                size="sm"
                className="gap-2"
              >
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                {project.name}
              </Button>
            </Link>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'kanban' ? (
          <KanbanBoardNew
            tasks={projectTasks}
            projects={projects}
            workspaces={workspaces}
            onTaskClick={onTaskClick}
            onUpdateTask={onUpdateTask}
            onCreateTask={onCreateTask}
          />
        ) : (
          <div className="p-6 h-full overflow-auto">
            <TaskListNew
              tasks={projectTasks}
              projects={projects}
              profiles={profiles}
              onTaskClick={onTaskClick}
            />
          </div>
        )}
      </div>
    </div>
  );
}
