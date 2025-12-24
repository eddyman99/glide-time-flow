import { useState, useMemo } from 'react';
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { Task } from '@/types';
import { cn } from '@/lib/utils';

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

export function WeekCalendar() {
  const { tasks } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const goToPrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const tasksByDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    weekDays.forEach((day) => {
      const dayTasks = tasks.filter((task) => 
        task.dueDate && isSameDay(new Date(task.dueDate), day)
      );
      map.set(format(day, 'yyyy-MM-dd'), dayTasks);
    });
    return map;
  }, [tasks, weekDays]);

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'bg-priority-high/90 border-priority-high';
      case 'medium': return 'bg-priority-medium/90 border-priority-medium';
      case 'low': return 'bg-priority-low/90 border-priority-low';
      default: return 'bg-primary/90 border-primary';
    }
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

      {/* Calendar Grid */}
      <div className="flex flex-1 overflow-hidden">
        {/* Time Column */}
        <div className="w-16 flex-shrink-0 border-r border-border bg-muted/30">
          <div className="h-16 border-b border-border" /> {/* Header spacer */}
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="flex h-20 items-start justify-end pr-3 pt-1"
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
                  'flex flex-1 flex-col border-r border-border last:border-r-0',
                  isToday && 'bg-primary/5'
                )}
              >
                {/* Day Header */}
                <div className="flex h-16 flex-col items-center justify-center border-b border-border">
                  <span className="text-xs font-medium uppercase text-muted-foreground">
                    {format(day, 'EEE')}
                  </span>
                  <span
                    className={cn(
                      'mt-1 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold',
                      isToday
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground'
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                </div>

                {/* Time Slots */}
                <div className="relative flex-1">
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      className="h-20 border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer group"
                    >
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center h-full">
                        <Plus className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}

                  {/* Tasks */}
                  <div className="absolute inset-0 p-1 pointer-events-none">
                    {dayTasks.slice(0, 3).map((task, index) => (
                      <div
                        key={task.id}
                        className={cn(
                          'mb-1 rounded-md border-l-2 px-2 py-1.5 pointer-events-auto cursor-pointer transition-all hover:scale-[1.02] animate-fade-in',
                          getPriorityColor(task.priority)
                        )}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <p className="text-xs font-medium text-primary-foreground truncate">
                          {task.title}
                        </p>
                        {task.duration && (
                          <p className="text-[10px] text-primary-foreground/80">
                            {task.duration >= 60 
                              ? `${Math.floor(task.duration / 60)}h` 
                              : `${task.duration}m`}
                          </p>
                        )}
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <div className="px-2 text-xs text-muted-foreground pointer-events-auto cursor-pointer hover:text-foreground transition-colors">
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
