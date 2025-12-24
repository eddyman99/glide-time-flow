import { useState, useMemo } from 'react';
import { Plus, Filter, ArrowUpDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TaskRow } from './TaskRow';
import { CreateTaskModal } from './CreateTaskModal';
import { useStore } from '@/store/useStore';
import { Task, TaskStatus, Priority } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskListProps {
  projectId?: string;
  workspaceId?: string;
}

export function TaskList({ projectId, workspaceId }: TaskListProps) {
  const { tasks } = useStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<Priority[]>([]);
  const [showCompleted, setShowCompleted] = useState(true);

  const filteredTasks = useMemo(() => {
    let result = tasks;

    if (projectId) {
      result = result.filter((t) => t.projectId === projectId);
    }
    if (workspaceId) {
      result = result.filter((t) => t.workspaceId === workspaceId);
    }
    if (searchQuery) {
      result = result.filter((t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (statusFilter.length > 0) {
      result = result.filter((t) => statusFilter.includes(t.status));
    }
    if (priorityFilter.length > 0) {
      result = result.filter((t) => priorityFilter.includes(t.priority));
    }
    if (!showCompleted) {
      result = result.filter((t) => t.status !== 'completed');
    }

    return result.sort((a, b) => {
      // Sort by status (in-progress first, then todo, then backlog, then completed)
      const statusOrder: Record<TaskStatus, number> = {
        'in-progress': 0,
        todo: 1,
        backlog: 2,
        completed: 3,
      };
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;

      // Then by priority
      const priorityOrder: Record<Priority, number> = {
        high: 0,
        medium: 1,
        low: 2,
        none: 3,
      };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [tasks, projectId, workspaceId, searchQuery, statusFilter, priorityFilter, showCompleted]);

  const toggleStatusFilter = (status: TaskStatus) => {
    setStatusFilter((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const togglePriorityFilter = (priority: Priority) => {
    setPriorityFilter((prev) =>
      prev.includes(priority) ? prev.filter((p) => p !== priority) : [...prev, priority]
    );
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
              {(statusFilter.length > 0 || priorityFilter.length > 0) && (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {statusFilter.length + priorityFilter.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            {(['backlog', 'todo', 'in-progress', 'completed'] as TaskStatus[]).map((status) => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={statusFilter.includes(status)}
                onCheckedChange={() => toggleStatusFilter(status)}
              >
                {status.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Priority</DropdownMenuLabel>
            {(['high', 'medium', 'low', 'none'] as Priority[]).map((priority) => (
              <DropdownMenuCheckboxItem
                key={priority}
                checked={priorityFilter.includes(priority)}
                onCheckedChange={() => togglePriorityFilter(priority)}
              >
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={showCompleted}
              onCheckedChange={setShowCompleted}
            >
              Show Completed
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* Task List */}
      <div className="space-y-1">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => <TaskRow key={task.id} task={task} />)
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-medium">No tasks yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first task to get started
            </p>
            <Button onClick={() => setIsCreateOpen(true)} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Create Task
            </Button>
          </div>
        )}
      </div>

      <CreateTaskModal open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
}
