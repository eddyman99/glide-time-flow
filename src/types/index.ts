export type Priority = 'high' | 'medium' | 'low' | 'none';

export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'completed';

export interface User {
  id: string;
  name: string;
  avatar?: string;
  email: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  dueDate?: Date;
  startDate?: Date;
  duration?: number; // in minutes
  assignee?: User;
  labels: Label[];
  projectId?: string;
  workspaceId: string;
  progress: number; // 0-100
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  workspaceId: string;
  tasks: Task[];
  createdAt: Date;
}

export interface Workspace {
  id: string;
  name: string;
  color: string;
  icon: string;
  projects: Project[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  taskId?: string;
  color?: string;
}
