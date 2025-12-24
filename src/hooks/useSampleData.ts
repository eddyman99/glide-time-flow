import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useSampleData() {
  const { toast } = useToast();

  const seedSampleData = useCallback(async (userId: string) => {
    try {
      // Check if user already has data
      const { data: existingTasks } = await supabase
        .from('tasks')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      if (existingTasks && existingTasks.length > 0) {
        return false; // Already has data
      }

      // Get user's default workspace
      const { data: workspaces } = await supabase
        .from('workspaces')
        .select('*')
        .eq('user_id', userId)
        .limit(1);

      if (!workspaces || workspaces.length === 0) {
        return false;
      }

      const defaultWorkspace = workspaces[0];

      // Create sample projects
      const projectColors = ['#8B5CF6', '#3B82F6', '#10B981'];
      const projectNames = [
        { name: 'Website Redesign', description: 'Complete overhaul of the company website' },
        { name: 'Mobile App', description: 'React Native mobile application' },
        { name: 'Marketing Campaign', description: 'Q1 marketing campaign' },
      ];

      const { data: createdProjects, error: projectError } = await supabase
        .from('projects')
        .insert(
          projectNames.map((p, i) => ({
            name: p.name,
            description: p.description,
            color: projectColors[i],
            workspace_id: defaultWorkspace.id,
            user_id: userId,
          }))
        )
        .select();

      if (projectError || !createdProjects) {
        console.error('Error creating sample projects:', projectError);
        return false;
      }

      // Create sample tasks
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      const sampleTasks = [
        {
          title: 'Review project requirements',
          description: 'Go through the project brief and list all requirements',
          priority: 'high',
          status: 'in-progress',
          due_date: tomorrow.toISOString(),
          duration: 60,
          progress: 40,
          project_id: createdProjects[0].id,
        },
        {
          title: 'Design homepage mockup',
          description: 'Create high-fidelity mockup for the new homepage',
          priority: 'high',
          status: 'todo',
          due_date: nextWeek.toISOString(),
          duration: 180,
          progress: 0,
          project_id: createdProjects[0].id,
        },
        {
          title: 'Set up development environment',
          description: 'Configure local dev environment and install dependencies',
          priority: 'medium',
          status: 'completed',
          due_date: today.toISOString(),
          duration: 90,
          progress: 100,
          project_id: createdProjects[1].id,
        },
        {
          title: 'Implement user authentication',
          description: 'Add login, signup, and password reset functionality',
          priority: 'high',
          status: 'in-progress',
          due_date: tomorrow.toISOString(),
          duration: 240,
          progress: 65,
          project_id: createdProjects[1].id,
        },
        {
          title: 'Create social media content calendar',
          description: 'Plan content for Instagram, Twitter, and LinkedIn',
          priority: 'medium',
          status: 'todo',
          due_date: nextWeek.toISOString(),
          duration: 120,
          progress: 0,
          project_id: createdProjects[2].id,
        },
        {
          title: 'Write blog post for launch',
          description: 'Draft announcement blog post for the campaign launch',
          priority: 'low',
          status: 'backlog',
          due_date: nextWeek.toISOString(),
          duration: 90,
          progress: 0,
          project_id: createdProjects[2].id,
        },
      ];

      const { error: taskError } = await supabase
        .from('tasks')
        .insert(
          sampleTasks.map((task) => ({
            ...task,
            workspace_id: defaultWorkspace.id,
            user_id: userId,
            is_private: true,
          }))
        );

      if (taskError) {
        console.error('Error creating sample tasks:', taskError);
        return false;
      }

      // Create sample labels
      const sampleLabels = [
        { name: 'Design', color: '#8B5CF6' },
        { name: 'Development', color: '#3B82F6' },
        { name: 'Marketing', color: '#F59E0B' },
        { name: 'Research', color: '#10B981' },
      ];

      await supabase
        .from('labels')
        .insert(sampleLabels.map((label) => ({ ...label, user_id: userId })));

      toast({
        title: 'Welcome!',
        description: 'Sample data has been created to help you get started.',
      });

      return true;
    } catch (error) {
      console.error('Error seeding sample data:', error);
      return false;
    }
  }, [toast]);

  return { seedSampleData };
}
