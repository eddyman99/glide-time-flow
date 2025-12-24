import { create } from 'zustand';
import { Task, Project, Workspace, TaskStatus, Priority } from '@/types';
import { defaultTasks, defaultProjects, defaultWorkspaces } from '@/data/mockData';

interface AppState {
  tasks: Task[];
  projects: Project[];
  workspaces: Workspace[];
  selectedWorkspaceId: string | null;
  selectedProjectId: string | null;
  
  // Actions
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  
  addProject: (project: Project) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
  
  setSelectedWorkspace: (id: string | null) => void;
  setSelectedProject: (id: string | null) => void;
}

export const useStore = create<AppState>((set) => ({
  tasks: defaultTasks,
  projects: defaultProjects,
  workspaces: defaultWorkspaces,
  selectedWorkspaceId: null,
  selectedProjectId: null,
  
  addTask: (task) => set((state) => ({ 
    tasks: [...state.tasks, task] 
  })),
  
  updateTask: (taskId, updates) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === taskId ? { ...task, ...updates, updatedAt: new Date() } : task
    ),
  })),
  
  deleteTask: (taskId) => set((state) => ({
    tasks: state.tasks.filter((task) => task.id !== taskId),
  })),
  
  updateTaskStatus: (taskId, status) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === taskId 
        ? { 
            ...task, 
            status, 
            progress: status === 'completed' ? 100 : task.progress,
            updatedAt: new Date() 
          } 
        : task
    ),
  })),
  
  addProject: (project) => set((state) => ({
    projects: [...state.projects, project],
  })),
  
  updateProject: (projectId, updates) => set((state) => ({
    projects: state.projects.map((project) =>
      project.id === projectId ? { ...project, ...updates } : project
    ),
  })),
  
  deleteProject: (projectId) => set((state) => ({
    projects: state.projects.filter((project) => project.id !== projectId),
    tasks: state.tasks.filter((task) => task.projectId !== projectId),
  })),
  
  setSelectedWorkspace: (id) => set({ selectedWorkspaceId: id }),
  setSelectedProject: (id) => set({ selectedProjectId: id }),
}));
