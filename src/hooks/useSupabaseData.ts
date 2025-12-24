import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface DbTask {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  due_date: string | null;
  start_time: string | null;
  duration: number;
  progress: number;
  project_id: string | null;
  workspace_id: string;
  user_id: string;
  assignee_id: string | null;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbProject {
  id: string;
  name: string;
  description: string | null;
  color: string;
  workspace_id: string;
  user_id: string;
  created_at: string;
}

export interface DbWorkspace {
  id: string;
  name: string;
  color: string;
  icon: string;
  user_id: string;
  team_id: string | null;
  is_private: boolean;
  created_at: string;
}

export interface DbProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

export interface DbLabel {
  id: string;
  name: string;
  color: string;
  user_id: string;
  team_id: string | null;
}

export interface DbTeam {
  id: string;
  name: string;
  description: string | null;
  color: string;
  created_by: string | null;
  created_at: string;
}

export interface DbTeamMember {
  id: string;
  team_id: string;
  user_id: string;
  created_at: string;
}

export function useSupabaseData() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [tasks, setTasks] = useState<DbTask[]>([]);
  const [projects, setProjects] = useState<DbProject[]>([]);
  const [workspaces, setWorkspaces] = useState<DbWorkspace[]>([]);
  const [labels, setLabels] = useState<DbLabel[]>([]);
  const [profiles, setProfiles] = useState<DbProfile[]>([]);
  const [teams, setTeams] = useState<DbTeam[]>([]);
  const [teamMembers, setTeamMembers] = useState<DbTeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const [
        tasksRes,
        projectsRes,
        workspacesRes,
        labelsRes,
        profilesRes,
        teamsRes,
      ] = await Promise.all([
        supabase.from('tasks').select('*').order('created_at', { ascending: false }),
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('workspaces').select('*').order('created_at', { ascending: false }),
        supabase.from('labels').select('*'),
        supabase.from('profiles').select('*'),
        supabase.from('teams').select('*'),
      ]);

      if (tasksRes.data) setTasks(tasksRes.data);
      if (projectsRes.data) setProjects(projectsRes.data);
      if (workspacesRes.data) setWorkspaces(workspacesRes.data);
      if (labelsRes.data) setLabels(labelsRes.data);
      if (profilesRes.data) setProfiles(profilesRes.data);
      if (teamsRes.data) setTeams(teamsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Task operations
  const createTask = async (task: Omit<DbTask, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('tasks')
      .insert({ ...task, user_id: user.id })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return null;
    }

    setTasks((prev) => [data, ...prev]);
    return data;
  };

  const updateTask = async (id: string, updates: Partial<DbTask>) => {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return null;
    }

    setTasks((prev) => prev.map((t) => (t.id === id ? data : t)));
    return data;
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return false;
    }

    setTasks((prev) => prev.filter((t) => t.id !== id));
    return true;
  };

  // Workspace operations
  const createWorkspace = async (workspace: { name: string; color: string; icon: string; team_id?: string; is_private?: boolean }) => {
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('workspaces')
      .insert({ ...workspace, user_id: user.id })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return null;
    }

    setWorkspaces((prev) => [data, ...prev]);
    return data;
  };

  // Project operations
  const createProject = async (project: { name: string; description?: string; color: string; workspace_id: string }) => {
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('projects')
      .insert({ ...project, user_id: user.id })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return null;
    }

    setProjects((prev) => [data, ...prev]);
    return data;
  };

  // Team operations
  const createTeam = async (team: { name: string; description?: string; color?: string }) => {
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('teams')
      .insert({ ...team, created_by: user.id })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return null;
    }

    // Add creator as owner
    await supabase.from('team_members').insert({ team_id: data.id, user_id: user.id });
    await supabase.from('user_roles').insert({ team_id: data.id, user_id: user.id, role: 'owner' });

    setTeams((prev) => [data, ...prev]);
    return data;
  };

  const inviteToTeam = async (teamId: string, email: string) => {
    // Use secure server-side function to prevent email enumeration
    const { data, error } = await supabase.rpc('invite_user_to_team', {
      _team_id: teamId,
      _email: email,
    });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return false;
    }

    const result = data as { success: boolean; message: string };
    
    if (result.success) {
      toast({ title: 'Success', description: result.message });
      fetchData();
      return true;
    } else {
      toast({ title: 'Info', description: result.message });
      return false;
    }
  };

  // Label operations
  const createLabel = async (label: { name: string; color: string; team_id?: string }) => {
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('labels')
      .insert({ ...label, user_id: user.id })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return null;
    }

    setLabels((prev) => [...prev, data]);
    return data;
  };

  return {
    tasks,
    projects,
    workspaces,
    labels,
    profiles,
    teams,
    teamMembers,
    loading,
    refetch: fetchData,
    createTask,
    updateTask,
    deleteTask,
    createWorkspace,
    createProject,
    createTeam,
    inviteToTeam,
    createLabel,
  };
}
