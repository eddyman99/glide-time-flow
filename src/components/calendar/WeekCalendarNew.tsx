import { useState, useMemo, useRef, useEffect } from 'react';
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks, setHours, setMinutes, addMinutes } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DbTask, DbProject } from '@/hooks/useSupabaseData';
import { cn } from '@/lib/utils';
import { CreateTaskFromCalendarModal } from './CreateTaskFromCalendarModal';

interface WeekCalendarProps {
  tasks: DbTask[];
  projects: DbProject[];
  workspaces: { id: string; name: string }[];
  onTaskClick: (task: DbTask) => void;
  onCreateTask: (task: any) => Promise<any>;
  onUpdateTask: (id: string, updates: Partial<DbTask>) => Promise<any>;
}

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM to 9 PM
const HOUR_HEIGHT = 64; // pixels per hour

export function WeekCalendarNew({ 
  tasks, 
  projects,
  workspaces,
  onTaskClick, 
  onCreateTask,
  onUpdateTask,
}: WeekCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; hour: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [dragTask, setDragTask] = useState<DbTask | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Scroll to 8 AM on mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = (8 - 6) * HOUR_HEIGHT;
    }
  }, []);

  const goToPrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const tasksByDay = useMemo(() => {
    const map = new Map<string, DbTask[]>();
    weekDays.forEach((day) => {
      const dayTasks = tasks.filter((task) => {
        if (task.start_time) {
          return isSameDay(new Date(task.start_time), day);
        }
        return task.due_date && isSameDay(new Date(task.due_date), day);
      });
      map.set(format(day, 'yyyy-MM-dd'), dayTasks);
    });
    return map;
  }, [tasks, weekDays]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-priority-high/90 border-l-priority-high';
      case 'medium': return 'bg-priority-medium/90 border-l-priority-medium';
      case 'low': return 'bg-priority-low/90 border-l-priority-low';
      default: return 'bg-primary/90 border-l-primary';
    }
  };

  const getTaskPosition = (task: DbTask) => {
    if (!task.start_time) return null;
    const startDate = new Date(task.start_time);
    const hour = startDate.getHours();
    const minute = startDate.getMinutes();
    const top = ((hour - 6) + minute / 60) * HOUR_HEIGHT;
    const height = (task.duration / 60) * HOUR_HEIGHT;
    return { top: Math.max(0, top), height: Math.max(height, 24) };
  };

  const handleSlotClick = (day: Date, hour: number) => {
    setSelectedSlot({ date: day, hour });
    setCreateModalOpen(true);
  };

  const handleDragStart = (e: React.DragEvent, task: DbTask) => {
    setDragTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, day: Date, hour: number) => {
    e.preventDefault();
    if (!dragTask) return;

    const newStartTime = setMinutes(setHours(day, hour), 0);
    await onUpdateTask(dragTask.id, {
      start_time: newStartTime.toISOString(),
      due_date: day.toISOString(),
    });
    setDragTask(null);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold text-foreground">
            {format(weekStart, 'MMMM yyyy')}
          </h2>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goToPrevWeek}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={goToNextWeek}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="flex border-b border-border">
        <div className="w-16 flex-shrink-0 border-r border-border bg-muted/30" />
        {weekDays.map((day) => {
          const isToday = isSameDay(day, new Date());
          return (
            <div
              key={day.toISOString()}
              className={cn(
                'flex flex-1 flex-col items-center justify-center py-3 border-r border-border last:border-r-0',
                isToday && 'bg-primary/5'
              )}
            >
              <span className="text-xs font-medium uppercase text-muted-foreground">
                {format(day, 'EEE')}
              </span>
              <span
                className={cn(
                  'mt-1 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold',
                  isToday ? 'bg-primary text-primary-foreground' : 'text-foreground'
                )}
              >
                {format(day, 'd')}
              </span>
            </div>
          );
        })}
      </div>

      {/* Scrollable Calendar Grid */}
      <div ref={scrollRef} className="flex flex-1 overflow-y-auto scrollbar-thin">
        {/* Time Column */}
        <div className="w-16 flex-shrink-0 border-r border-border bg-muted/30">
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="flex items-start justify-end pr-3 pt-1"
              style={{ height: HOUR_HEIGHT }}
            >
              <span className="text-xs text-muted-foreground">
                {format(new Date().setHours(hour, 0, 0, 0), 'h a')}
              </span>
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="flex flex-1">
          {weekDays.map((day) => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const dayTasks = tasksByDay.get(dayKey) || [];
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={dayKey}
                className={cn(
                  'relative flex-1 border-r border-border last:border-r-0',
                  isToday && 'bg-primary/5'
                )}
              >
                {/* Hour Slots */}
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer group"
                    style={{ height: HOUR_HEIGHT }}
                    onClick={() => handleSlotClick(day, hour)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, day, hour)}
                  >
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center h-full">
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}

                {/* Tasks */}
                {dayTasks.map((task) => {
                  const position = getTaskPosition(task);
                  if (!position) {
                    // Task without time - show at top
                    return (
                      <div
                        key={task.id}
                        className={cn(
                          'absolute left-1 right-1 rounded-md border-l-2 px-2 py-1 cursor-pointer transition-all hover:scale-[1.02] shadow-sm',
                          getPriorityColor(task.priority)
                        )}
                        style={{ top: 4 }}
                        onClick={() => onTaskClick(task)}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task)}
                      >
                        <p className="text-xs font-medium text-primary-foreground truncate">
                          {task.title}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={task.id}
                      className={cn(
                        'absolute left-1 right-1 rounded-md border-l-2 px-2 py-1 cursor-pointer transition-all hover:scale-[1.01] shadow-sm overflow-hidden',
                        getPriorityColor(task.priority)
                      )}
                      style={{ top: position.top, height: position.height }}
                      onClick={() => onTaskClick(task)}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                    >
                      <p className="text-xs font-medium text-primary-foreground truncate">
                        {task.title}
                      </p>
                      {position.height > 40 && (
                        <p className="text-[10px] text-primary-foreground/80 mt-0.5">
                          {format(new Date(task.start_time!), 'h:mm a')} · {task.duration}m
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <CreateTaskFromCalendarModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        selectedDate={selectedSlot?.date}
        selectedHour={selectedSlot?.hour}
        projects={projects}
        workspaces={workspaces}
        onCreateTask={onCreateTask}
      />
    </div>
  );
}
