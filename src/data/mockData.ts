import { Task, Project, Workspace, User, Label } from '@/types';

export const currentUser: User = {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex@motion.app',
  avatar: undefined,
};

export const teamMembers: User[] = [
  currentUser,
  { id: '2', name: 'Sarah Chen', email: 'sarah@motion.app' },
  { id: '3', name: 'Mike Peters', email: 'mike@motion.app' },
  { id: '4', name: 'Emily Davis', email: 'emily@motion.app' },
];

export const labels: Label[] = [
  { id: '1', name: 'SEO', color: '#3B82F6' },
  { id: '2', name: 'Design', color: '#8B5CF6' },
  { id: '3', name: 'Development', color: '#10B981' },
  { id: '4', name: 'Marketing', color: '#F59E0B' },
  { id: '5', name: 'Research', color: '#EC4899' },
];

export const defaultWorkspaces: Workspace[] = [
  {
    id: 'ws-1',
    name: 'Marketing',
    color: 'purple',
    icon: 'megaphone',
    projects: [],
  },
  {
    id: 'ws-2',
    name: 'Engineering',
    color: 'blue',
    icon: 'code',
    projects: [],
  },
  {
    id: 'ws-3',
    name: 'Design',
    color: 'pink',
    icon: 'palette',
    projects: [],
  },
];

export const defaultProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Website Redesign',
    description: 'Complete overhaul of the company website',
    color: '#8B5CF6',
    workspaceId: 'ws-2',
    tasks: [],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'proj-2',
    name: 'Q1 Campaign',
    description: 'Marketing campaign for Q1 launch',
    color: '#F59E0B',
    workspaceId: 'ws-1',
    tasks: [],
    createdAt: new Date('2024-01-05'),
  },
  {
    id: 'proj-3',
    name: 'Mobile App',
    description: 'React Native mobile application',
    color: '#3B82F6',
    workspaceId: 'ws-2',
    tasks: [],
    createdAt: new Date('2024-01-10'),
  },
];

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 7);
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);

export const defaultTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Conduct user interviews',
    description: 'Interview 5 users about their experience with the current website',
    priority: 'high',
    status: 'in-progress',
    dueDate: tomorrow,
    duration: 120,
    assignee: currentUser,
    labels: [labels[4]],
    projectId: 'proj-1',
    workspaceId: 'ws-2',
    progress: 40,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
  },
  {
    id: 'task-2',
    title: 'Design homepage mockup',
    description: 'Create high-fidelity mockup for the new homepage',
    priority: 'high',
    status: 'todo',
    dueDate: nextWeek,
    duration: 240,
    assignee: teamMembers[1],
    labels: [labels[1]],
    projectId: 'proj-1',
    workspaceId: 'ws-2',
    progress: 0,
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date(),
  },
  {
    id: 'task-3',
    title: 'Write blog post about Q1 launch',
    description: 'Draft a compelling blog post announcing our Q1 campaign',
    priority: 'medium',
    status: 'todo',
    dueDate: tomorrow,
    duration: 90,
    assignee: teamMembers[2],
    labels: [labels[3], labels[0]],
    projectId: 'proj-2',
    workspaceId: 'ws-1',
    progress: 0,
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date(),
  },
  {
    id: 'task-4',
    title: 'Set up CI/CD pipeline',
    description: 'Configure GitHub Actions for automated testing and deployment',
    priority: 'medium',
    status: 'backlog',
    dueDate: nextWeek,
    duration: 180,
    assignee: teamMembers[3],
    labels: [labels[2]],
    projectId: 'proj-3',
    workspaceId: 'ws-2',
    progress: 0,
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date(),
  },
  {
    id: 'task-5',
    title: 'Review analytics dashboard',
    description: 'Analyze user behavior from last month',
    priority: 'low',
    status: 'completed',
    dueDate: yesterday,
    duration: 60,
    assignee: currentUser,
    labels: [labels[4]],
    projectId: 'proj-2',
    workspaceId: 'ws-1',
    progress: 100,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date(),
  },
  {
    id: 'task-6',
    title: 'Implement authentication flow',
    description: 'Add login, signup, and password reset functionality',
    priority: 'high',
    status: 'in-progress',
    dueDate: today,
    duration: 300,
    assignee: currentUser,
    labels: [labels[2]],
    projectId: 'proj-3',
    workspaceId: 'ws-2',
    progress: 65,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date(),
  },
  {
    id: 'task-7',
    title: 'Create social media assets',
    description: 'Design graphics for Instagram, Twitter, and LinkedIn',
    priority: 'medium',
    status: 'todo',
    dueDate: nextWeek,
    duration: 150,
    assignee: teamMembers[1],
    labels: [labels[1], labels[3]],
    projectId: 'proj-2',
    workspaceId: 'ws-1',
    progress: 0,
    createdAt: new Date('2024-01-19'),
    updatedAt: new Date(),
  },
];
