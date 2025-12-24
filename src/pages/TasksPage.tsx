import { TaskList } from '@/components/tasks/TaskList';

export default function TasksPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">My Tasks</h1>
        <p className="mt-1 text-muted-foreground">
          Manage and track all your tasks in one place
        </p>
      </div>
      <TaskList />
    </div>
  );
}
