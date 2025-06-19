import { apiClient } from './api';
import { API_ENDPOINTS } from '../config/api';
import {
  Task,
  TaskCreate,
  TaskUpdate,
  TaskFilter,
  TaskStatus,
  TaskPriority,
  Project,
  ProjectCreate,
  ProjectUpdate,
  PaginationParams,
  SortParams,
} from '../types/models';

// Task API Service
export const taskService = {
  // Task operations
  async getTasks(params?: TaskFilter & PaginationParams & SortParams): Promise<Task[]> {
    return apiClient.get<Task[]>(API_ENDPOINTS.tasks.list, params);
  },

  async getTask(id: string): Promise<Task> {
    return apiClient.get<Task>(API_ENDPOINTS.tasks.get(id));
  },

  async createTask(data: TaskCreate): Promise<Task> {
    return apiClient.post<Task>(API_ENDPOINTS.tasks.create, data);
  },

  async updateTask(id: string, data: TaskUpdate): Promise<Task> {
    return apiClient.patch<Task>(API_ENDPOINTS.tasks.update(id), data);
  },

  async deleteTask(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.tasks.delete(id));
  },

  async completeTask(id: string): Promise<Task> {
    return apiClient.post<Task>(API_ENDPOINTS.tasks.complete(id));
  },

  async getSubtasks(parentId: string): Promise<Task[]> {
    return apiClient.get<Task[]>(API_ENDPOINTS.tasks.subtasks(parentId));
  },

  async getOverdueTasks(params?: PaginationParams): Promise<Task[]> {
    return apiClient.get<Task[]>(API_ENDPOINTS.tasks.overdue, params);
  },

  async getTaskStats(): Promise<Record<string, any>> {
    return apiClient.get<Record<string, any>>(API_ENDPOINTS.tasks.stats);
  },

  // Project operations
  async getProjects(activeOnly: boolean = true): Promise<Project[]> {
    return apiClient.get<Project[]>(API_ENDPOINTS.projects.list, { active_only: activeOnly });
  },

  async getProject(id: string): Promise<Project> {
    return apiClient.get<Project>(API_ENDPOINTS.projects.get(id));
  },

  async createProject(data: ProjectCreate): Promise<Project> {
    return apiClient.post<Project>(API_ENDPOINTS.projects.create, data);
  },

  async updateProject(id: string, data: ProjectUpdate): Promise<Project> {
    return apiClient.patch<Project>(API_ENDPOINTS.projects.update(id), data);
  },

  async deleteProject(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.projects.delete(id));
  },

  async getProjectTasks(projectId: string, params?: PaginationParams): Promise<Task[]> {
    return apiClient.get<Task[]>(API_ENDPOINTS.projects.tasks(projectId), params);
  },
};

// Helper functions for task management
export const taskHelpers = {
  // Group tasks by status for board view
  groupTasksByStatus(tasks: Task[]): Record<TaskStatus, Task[]> {
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
  },

  // Group tasks by project
  groupTasksByProject(tasks: Task[]): Map<string | null, Task[]> {
    const groups = new Map<string | null, Task[]>();

    tasks.forEach(task => {
      const projectId = task.project_id || null;
      if (!groups.has(projectId)) {
        groups.set(projectId, []);
      }
      groups.get(projectId)!.push(task);
    });

    return groups;
  },

  // Sort tasks by various criteria
  sortTasks(tasks: Task[], sortBy: 'due_date' | 'priority' | 'created_at' | 'title', desc: boolean = false): Task[] {
    const sorted = [...tasks].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'due_date':
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          comparison = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
          break;

        case 'priority':
          const priorityOrder = {
            [TaskPriority.URGENT]: 4,
            [TaskPriority.HIGH]: 3,
            [TaskPriority.MEDIUM]: 2,
            [TaskPriority.LOW]: 1,
          };
          comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
          break;

        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;

        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }

      return desc ? -comparison : comparison;
    });

    return sorted;
  },

  // Filter overdue tasks
  getOverdueTasks(tasks: Task[]): Task[] {
    return tasks.filter(task => task.is_overdue);
  },

  // Get tasks due today
  getTasksDueToday(tasks: Task[]): Task[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return tasks.filter(task => {
      if (!task.due_date) return false;
      const dueDate = new Date(task.due_date);
      return dueDate >= today && dueDate < tomorrow;
    });
  },

  // Get tasks due this week
  getTasksDueThisWeek(tasks: Task[]): Task[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);

    return tasks.filter(task => {
      if (!task.due_date) return false;
      const dueDate = new Date(task.due_date);
      return dueDate >= today && dueDate <= weekEnd;
    });
  },
};