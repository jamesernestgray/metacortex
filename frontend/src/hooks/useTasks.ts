import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { createAuthenticatedTaskService } from '../services/authWrapper';
import { handleApiError } from '../services/api';
import {
  Task,
  TaskCreate,
  TaskUpdate,
  TaskFilter,
  TaskStatus,
  PaginationParams,
  SortParams,
} from '../types/models';

interface UseTasksOptions extends TaskFilter, PaginationParams, SortParams {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createTask: (data: TaskCreate) => Promise<Task | null>;
  updateTask: (id: string, data: TaskUpdate) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<boolean>;
  completeTask: (id: string) => Promise<Task | null>;
}

export const useTasks = (options: UseTasksOptions = {}): UseTasksReturn => {
  const { getToken, isSignedIn } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Create authenticated service
  const authTaskService = useMemo(() => 
    createAuthenticatedTaskService(getToken as any), [getToken]);

  const {
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
    ...filterOptions
  } = options;

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    if (!isSignedIn) {
      console.log('Not fetching tasks - user not signed in');
      setTasks([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const data = await authTaskService.getTasks(filterOptions);
      setTasks(data);
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filterOptions), authTaskService, isSignedIn]);

  // Create task
  const createTask = useCallback(async (data: TaskCreate): Promise<Task | null> => {
    try {
      const newTask = await authTaskService.createTask(data);
      setTasks(prev => [newTask, ...prev]);
      return newTask;
    } catch (err) {
      setError(handleApiError(err));
      return null;
    }
  }, [authTaskService]);

  // Update task
  const updateTask = useCallback(async (id: string, data: TaskUpdate): Promise<Task | null> => {
    try {
      const updatedTask = await authTaskService.updateTask(id, data);
      setTasks(prev => prev.map(task => 
        task.id === id ? updatedTask : task
      ));
      return updatedTask;
    } catch (err) {
      setError(handleApiError(err));
      return null;
    }
  }, [authTaskService]);

  // Delete task
  const deleteTask = useCallback(async (id: string): Promise<boolean> => {
    try {
      await authTaskService.deleteTask(id);
      setTasks(prev => prev.filter(task => task.id !== id));
      return true;
    } catch (err) {
      setError(handleApiError(err));
      return false;
    }
  }, [authTaskService]);

  // Complete task
  const completeTask = useCallback(async (id: string): Promise<Task | null> => {
    try {
      console.log('Completing task with ID:', id);
      const completedTask = await authTaskService.completeTask(id);
      setTasks(prev => prev.map(task => 
        task.id === id ? completedTask : task
      ));
      return completedTask;
    } catch (err) {
      console.error('Error completing task:', err);
      setError(handleApiError(err));
      return null;
    }
  }, [authTaskService]);

  // Initial fetch
  useEffect(() => {
    if (isSignedIn) {
      fetchTasks();
    }
  }, [fetchTasks, isSignedIn]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchTasks, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchTasks]);

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
  };
};

// Hook for a single task
export const useTask = (taskId: string | null) => {
  const { getToken } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Create authenticated service
  const authTaskService = useMemo(() => 
    createAuthenticatedTaskService(getToken as any), [getToken]);

  const fetchTask = useCallback(async () => {
    if (!taskId) {
      setTask(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await authTaskService.getTask(taskId);
      setTask(data);
    } catch (err) {
      setError(handleApiError(err));
      setTask(null);
    } finally {
      setLoading(false);
    }
  }, [taskId, authTaskService]);

  const updateTask = useCallback(async (data: TaskUpdate): Promise<Task | null> => {
    if (!taskId) return null;

    try {
      const updatedTask = await authTaskService.updateTask(taskId, data);
      setTask(updatedTask);
      return updatedTask;
    } catch (err) {
      setError(handleApiError(err));
      return null;
    }
  }, [taskId, authTaskService]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  return {
    task,
    loading,
    error,
    refetch: fetchTask,
    updateTask,
  };
};

// Hook for task statistics
export const useTaskStats = () => {
  const { getToken } = useAuth();
  const [stats, setStats] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Create authenticated service
  const authTaskService = useMemo(() => 
    createAuthenticatedTaskService(getToken as any), [getToken]);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await authTaskService.getTaskStats();
      setStats(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [authTaskService]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};

// Hook for grouped tasks (for board view)
export const useTaskBoard = (options: UseTasksOptions = {}) => {
  const { tasks, loading, error, ...methods } = useTasks(options);

  const groupedTasks = useMemo(() => {
    const groups: Record<TaskStatus, Task[]> = {
      [TaskStatus.PENDING]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.COMPLETED]: [],
      [TaskStatus.CANCELLED]: [],
    };

    tasks.forEach(task => {
      groups[task.status].push(task);
    });

    return groups;
  }, [tasks]);

  const moveTask = useCallback(async (taskId: string, newStatus: TaskStatus): Promise<boolean> => {
    const result = await methods.updateTask(taskId, { status: newStatus });
    return result !== null;
  }, [methods.updateTask]);

  return {
    groupedTasks,
    loading,
    error,
    ...methods,
    moveTask,
  };
};