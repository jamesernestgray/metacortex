import { useState, useEffect, useCallback, useMemo } from 'react';
import { habitService, habitHelpers } from '../services/habits';
import { handleApiError } from '../services/api';
import {
  Habit,
  HabitCreate,
  HabitUpdate,
  HabitFilter,
  HabitLog,
  HabitLogCreate,
  HabitWithLogs,
  HabitStreak,
  HabitStats,
  PaginationParams,
  SortParams,
} from '../types/models';

interface UseHabitsOptions extends HabitFilter, PaginationParams, SortParams {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseHabitsReturn {
  habits: Habit[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createHabit: (data: HabitCreate) => Promise<Habit | null>;
  updateHabit: (id: string, data: HabitUpdate) => Promise<Habit | null>;
  deleteHabit: (id: string) => Promise<boolean>;
  archiveHabit: (id: string) => Promise<Habit | null>;
}

export const useHabits = (options: UseHabitsOptions = {}): UseHabitsReturn => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
    ...filterOptions
  } = options;

  // Fetch habits
  const fetchHabits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await habitService.getHabits(filterOptions);
      setHabits(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filterOptions)]);

  // Create habit
  const createHabit = useCallback(async (data: HabitCreate): Promise<Habit | null> => {
    try {
      const newHabit = await habitService.createHabit(data);
      setHabits(prev => [newHabit, ...prev]);
      return newHabit;
    } catch (err) {
      setError(handleApiError(err));
      return null;
    }
  }, []);

  // Update habit
  const updateHabit = useCallback(async (id: string, data: HabitUpdate): Promise<Habit | null> => {
    try {
      const updatedHabit = await habitService.updateHabit(id, data);
      setHabits(prev => prev.map(habit => 
        habit.id === id ? updatedHabit : habit
      ));
      return updatedHabit;
    } catch (err) {
      setError(handleApiError(err));
      return null;
    }
  }, []);

  // Delete habit
  const deleteHabit = useCallback(async (id: string): Promise<boolean> => {
    try {
      await habitService.deleteHabit(id);
      setHabits(prev => prev.filter(habit => habit.id !== id));
      return true;
    } catch (err) {
      setError(handleApiError(err));
      return false;
    }
  }, []);

  // Archive habit
  const archiveHabit = useCallback(async (id: string): Promise<Habit | null> => {
    try {
      const archivedHabit = await habitService.archiveHabit(id);
      setHabits(prev => prev.map(habit => 
        habit.id === id ? archivedHabit : habit
      ));
      return archivedHabit;
    } catch (err) {
      setError(handleApiError(err));
      return null;
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchHabits, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchHabits]);

  return {
    habits,
    loading,
    error,
    refetch: fetchHabits,
    createHabit,
    updateHabit,
    deleteHabit,
    archiveHabit,
  };
};

// Hook for today's habits with check-in functionality
interface UseTodaysHabitsReturn {
  habits: HabitWithLogs[];
  loading: boolean;
  error: string | null;
  completionRate: number;
  refetch: () => Promise<void>;
  checkIn: (habitId: string) => Promise<HabitLog | null>;
  uncheckIn: (habitId: string, logId: string) => Promise<boolean>;
}

export const useTodaysHabits = (): UseTodaysHabitsReturn => {
  const [habits, setHabits] = useState<HabitWithLogs[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch today's habits
  const fetchTodaysHabits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await habitService.getTodaysHabits();
      setHabits(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // Check in a habit
  const checkIn = useCallback(async (habitId: string): Promise<HabitLog | null> => {
    try {
      const log = await habitService.checkInHabit(habitId);
      
      // Update local state
      setHabits(prev => prev.map(h => {
        if (h.habit.id === habitId) {
          return {
            ...h,
            logs: [...h.logs, log],
            habit: {
              ...h.habit,
              streak_count: h.habit.streak_count + 1,
              total_completions: h.habit.total_completions + 1,
              last_completed: log.date,
            },
          };
        }
        return h;
      }));
      
      return log;
    } catch (err) {
      setError(handleApiError(err));
      return null;
    }
  }, []);

  // Uncheck a habit (delete log)
  const uncheckIn = useCallback(async (habitId: string, logId: string): Promise<boolean> => {
    try {
      await habitService.deleteHabitLog(habitId, logId);
      
      // Update local state
      setHabits(prev => prev.map(h => {
        if (h.habit.id === habitId) {
          return {
            ...h,
            logs: h.logs.filter(log => log.id !== logId),
            habit: {
              ...h.habit,
              total_completions: Math.max(0, h.habit.total_completions - 1),
            },
          };
        }
        return h;
      }));
      
      return true;
    } catch (err) {
      setError(handleApiError(err));
      return false;
    }
  }, []);

  // Calculate completion rate
  const completionRate = useMemo(() => {
    return habitHelpers.calculateCompletionRate(habits);
  }, [habits]);

  // Initial fetch
  useEffect(() => {
    fetchTodaysHabits();
  }, [fetchTodaysHabits]);

  return {
    habits,
    loading,
    error,
    completionRate,
    refetch: fetchTodaysHabits,
    checkIn,
    uncheckIn,
  };
};

// Hook for habit streaks
export const useHabitStreaks = () => {
  const [streaks, setStreaks] = useState<HabitStreak[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStreaks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await habitService.getStreaks();
      setStreaks(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStreaks();
  }, [fetchStreaks]);

  return {
    streaks,
    loading,
    error,
    refetch: fetchStreaks,
  };
};

// Hook for habit statistics
export const useHabitStats = () => {
  const [stats, setStats] = useState<HabitStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await habitService.getStats();
      setStats(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

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

// Hook for habit categories
export const useHabitCategories = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await habitService.getCategories();
      setCategories(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
};

// Hook for a single habit with logs
export const useHabit = (habitId: string | null) => {
  const [habit, setHabit] = useState<Habit | null>(null);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHabit = useCallback(async () => {
    if (!habitId) {
      setHabit(null);
      setLogs([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [habitData, logsData] = await Promise.all([
        habitService.getHabit(habitId),
        habitService.getHabitLogs(habitId),
      ]);
      setHabit(habitData);
      setLogs(logsData);
    } catch (err) {
      setError(handleApiError(err));
      setHabit(null);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [habitId]);

  const updateHabit = useCallback(async (data: HabitUpdate): Promise<Habit | null> => {
    if (!habitId) return null;

    try {
      const updatedHabit = await habitService.updateHabit(habitId, data);
      setHabit(updatedHabit);
      return updatedHabit;
    } catch (err) {
      setError(handleApiError(err));
      return null;
    }
  }, [habitId]);

  const createLog = useCallback(async (data: HabitLogCreate): Promise<HabitLog | null> => {
    if (!habitId) return null;

    try {
      const newLog = await habitService.createHabitLog(habitId, data);
      setLogs(prev => [...prev, newLog]);
      
      // Update habit stats
      if (habit) {
        setHabit({
          ...habit,
          total_completions: habit.total_completions + 1,
          last_completed: newLog.date,
        });
      }
      
      return newLog;
    } catch (err) {
      setError(handleApiError(err));
      return null;
    }
  }, [habitId, habit]);

  useEffect(() => {
    fetchHabit();
  }, [fetchHabit]);

  return {
    habit,
    logs,
    loading,
    error,
    refetch: fetchHabit,
    updateHabit,
    createLog,
  };
};