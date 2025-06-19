import { apiClient } from './api';
import { API_ENDPOINTS } from '../config/api';
import {
  Habit,
  HabitCreate,
  HabitUpdate,
  HabitFilter,
  HabitLog,
  HabitLogCreate,
  HabitStreak,
  HabitStats,
  HabitWithLogs,
  PaginationParams,
  SortParams,
} from '../types/models';

// Habit API Service
export const habitService = {
  // Habit CRUD operations
  async getHabits(params?: HabitFilter & PaginationParams & SortParams): Promise<Habit[]> {
    return apiClient.get<Habit[]>(API_ENDPOINTS.habits.list, params);
  },

  async getHabit(id: string): Promise<Habit> {
    return apiClient.get<Habit>(API_ENDPOINTS.habits.get(id));
  },

  async createHabit(data: HabitCreate): Promise<Habit> {
    return apiClient.post<Habit>(API_ENDPOINTS.habits.create, data);
  },

  async updateHabit(id: string, data: HabitUpdate): Promise<Habit> {
    return apiClient.patch<Habit>(API_ENDPOINTS.habits.update(id), data);
  },

  async deleteHabit(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.habits.delete(id));
  },

  async archiveHabit(id: string): Promise<Habit> {
    return apiClient.post<Habit>(API_ENDPOINTS.habits.archive(id));
  },

  // Habit log operations
  async createHabitLog(habitId: string, data: HabitLogCreate): Promise<HabitLog> {
    return apiClient.post<HabitLog>(API_ENDPOINTS.habits.log(habitId), data);
  },

  async getHabitLogs(habitId: string, startDate?: string, endDate?: string): Promise<HabitLog[]> {
    return apiClient.get<HabitLog[]>(API_ENDPOINTS.habits.logs(habitId), {
      start_date: startDate,
      end_date: endDate,
    });
  },

  async deleteHabitLog(habitId: string, logId: string): Promise<void> {
    return apiClient.delete<void>(`${API_ENDPOINTS.habits.logs(habitId)}/${logId}`);
  },

  // Today's habits
  async getTodaysHabits(): Promise<HabitWithLogs[]> {
    return apiClient.get<HabitWithLogs[]>(API_ENDPOINTS.habits.today);
  },

  // Check in (complete) a habit for today
  async checkInHabit(habitId: string, date?: string): Promise<HabitLog> {
    return apiClient.post<HabitLog>(API_ENDPOINTS.habits.log(habitId), {
      date: date || new Date().toISOString().split('T')[0],
      completed: true,
    });
  },

  // Streaks
  async getStreaks(): Promise<HabitStreak[]> {
    return apiClient.get<HabitStreak[]>(API_ENDPOINTS.habits.streaks);
  },

  // Categories
  async getCategories(): Promise<string[]> {
    return apiClient.get<string[]>(API_ENDPOINTS.habits.categories);
  },

  // Stats
  async getStats(): Promise<HabitStats> {
    return apiClient.get<HabitStats>(API_ENDPOINTS.habits.stats);
  },

  // Get logs for a date range
  async getUserLogs(startDate: string, endDate: string): Promise<HabitLog[]> {
    return apiClient.get<HabitLog[]>(API_ENDPOINTS.habits.userLogs, {
      start_date: startDate,
      end_date: endDate,
    });
  },
};

// Helper functions for habit management
export const habitHelpers = {
  // Check if habit should be done today
  isHabitDueToday(habit: Habit): boolean {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
    
    switch (habit.frequency) {
      case 'daily':
        return true;
      
      case 'weekly':
        // target_days contains weekday numbers (0-6)
        return habit.target_days?.includes(dayOfWeek) || false;
      
      case 'monthly':
        // target_days contains day of month (1-31)
        return habit.target_days?.includes(today.getDate()) || false;
      
      case 'custom':
        // Custom logic would go here
        return true;
      
      default:
        return false;
    }
  },

  // Calculate completion rate for a set of habits
  calculateCompletionRate(habits: HabitWithLogs[]): number {
    if (habits.length === 0) return 0;
    
    const completed = habits.filter(h => {
      const today = new Date().toISOString().split('T')[0];
      return h.logs.some(log => log.date === today && log.completed);
    }).length;
    
    return Math.round((completed / habits.length) * 100);
  },

  // Group habits by category
  groupHabitsByCategory(habits: Habit[]): Map<string, Habit[]> {
    const groups = new Map<string, Habit[]>();
    
    habits.forEach(habit => {
      const category = habit.category || 'Uncategorized';
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)!.push(habit);
    });
    
    return groups;
  },

  // Get streak status
  getStreakStatus(habit: { last_completed?: string }): 'active' | 'at-risk' | 'broken' {
    if (!habit.last_completed) return 'broken';
    
    const lastCompleted = new Date(habit.last_completed);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastCompleted.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((today.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) return 'active';
    if (daysDiff === 1) return 'at-risk';
    return 'broken';
  },

  // Format streak display
  formatStreak(streakCount: number): string {
    if (streakCount === 0) return 'No streak';
    if (streakCount === 1) return '1 day';
    return `${streakCount} days`;
  },

  // Get habit type display
  getHabitTypeDisplay(type: string): { label: string; icon: string } {
    switch (type) {
      case 'build':
        return { label: 'Build', icon: '🎯' };
      case 'break':
        return { label: 'Break', icon: '🚫' };
      case 'maintain':
        return { label: 'Maintain', icon: '🔄' };
      default:
        return { label: 'Unknown', icon: '❓' };
    }
  },

  // Get frequency display
  getFrequencyDisplay(frequency: string): string {
    switch (frequency) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'monthly':
        return 'Monthly';
      case 'custom':
        return 'Custom';
      default:
        return 'Unknown';
    }
  },

  // Get weekday names for weekly habits
  getWeekdayNames(days: number[]): string[] {
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map(day => weekdays[day]).filter(Boolean);
  },
};