import { useState } from 'react';
import { format, setHours, setMinutes } from 'date-fns';
import { Calendar as CalendarIcon, Flag, Clock, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DbProject, DbWorkspace, DbProfile } from '@/hooks/useSupabaseData';
import { cn } from '@/lib/utils';

interface CreateTaskModalNewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: DbProject[];
  workspaces: DbWorkspace[];
  profiles: DbProfile[];
  onCreateTask: (task: any) => Promise<any>;
}

const DURATION_PRESETS = [
  { label: '15m', value: 15 },
  { label: '30m', value: 30 },
  { label: '1h', value: 60 },
  { label: '2h', value: 120 },
];

export function CreateTaskModalNew({
  open,
  onOpenChange,
  projects,
  workspaces,
  profiles,
  onCreateTask,
}: CreateTaskModalNewProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('todo');
  const [dueDate, setDueDate] = useState<Date>();
  const [duration, setDuration] = useState(60);
  const [startHour, setStartHour] = useState('09');
  const [startMinute, setStartMinute] = useState('00');
  const [assigneeId, setAssigneeId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);

    const project = projects.find(p => p.id === projectId);
    const workspaceId = project?.workspace_id || workspaces[0]?.id;

    if (!workspaceId) {
      setLoading(false);
      return;
    }

    let startTime: string | null = null;
    if (dueDate) {
      const start = setMinutes(setHours(dueDate, parseInt(startHour)), parseInt(startMinute));
      startTime = start.toISOString();
    }

    await onCreateTask({
      title: title.trim(),
      description: description.trim() || null,
      priority,
      status,
      due_date: dueDate?.toISOString() || null,
      start_time: startTime,
      duration,
      assignee_id: assigneeId || null,
      project_id: projectId || null,
      workspace_id: workspaceId,
      is_private: true,
      progress: 0,
    });

    setLoading(false);
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setStatus('todo');
    setDueDate(undefined);
    setDuration(60);
    setStartHour('09');
    setStartMinute('00');
    setAssigneeId('');
    setProjectId('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Name</Label>
            <Input
              id="title"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Add more details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high"><div className="flex items-center gap-2"><Flag className="h-4 w-4 text-priority-high" />High</div></SelectItem>
                  <SelectItem value="medium"><div className="flex items-center gap-2"><Flag className="h-4 w-4 text-priority-medium" />Medium</div></SelectItem>
                  <SelectItem value="low"><div className="flex items-center gap-2"><Flag className="h-4 w-4 text-priority-low" />Low</div></SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="backlog">Backlog</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Date & Time</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('flex-1 justify-start', !dueDate && 'text-muted-foreground')}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, 'PPP') : 'Pick date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dueDate} onSelect={setDueDate} /></PopoverContent>
              </Popover>
              <Select value={startHour} onValueChange={setStartHour}>
                <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="flex items-center">:</span>
              <Select value={startMinute} onValueChange={setStartMinute}>
                <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['00', '15', '30', '45'].map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Duration</Label>
            <div className="flex gap-2">
              {DURATION_PRESETS.map((p) => (
                <Button key={p.value} type="button" variant={duration === p.value ? 'secondary' : 'outline'} size="sm" onClick={() => setDuration(p.value)}>
                  {p.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No project</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                        {p.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Assignee</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {profiles.map((p) => (
                    <SelectItem key={p.user_id} value={p.user_id}>
                      <div className="flex items-center gap-2"><User className="h-4 w-4" />{p.full_name || p.email}</div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!title.trim() || loading}>Create Task</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
