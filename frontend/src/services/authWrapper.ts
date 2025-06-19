import { GetTokenFn } from './api';
import { API_ENDPOINTS } from '../config/api';
import { apiClient } from './api';
import { Task, Project, Note, Habit, HabitLog } from '../types/models';

// Create authenticated task service
export const createAuthenticatedTaskService = (getToken: GetTokenFn) => ({
  // Task operations
  getTasks: (params?: any) => apiClient.get<Task[]>(API_ENDPOINTS.tasks.list, params, getToken),
  getTask: (id: string) => apiClient.get<Task>(API_ENDPOINTS.tasks.get(id), undefined, getToken),
  createTask: (data: any) => apiClient.post<Task>(API_ENDPOINTS.tasks.create, data, getToken),
  updateTask: (id: string, data: any) => apiClient.patch<Task>(API_ENDPOINTS.tasks.update(id), data, getToken),
  deleteTask: (id: string) => apiClient.delete<void>(API_ENDPOINTS.tasks.delete(id), getToken),
  completeTask: (id: string) => apiClient.post<Task>(API_ENDPOINTS.tasks.complete(id), undefined, getToken),
  getSubtasks: (parentId: string) => apiClient.get<Task[]>(API_ENDPOINTS.tasks.subtasks(parentId), undefined, getToken),
  getOverdueTasks: (params?: any) => apiClient.get<Task[]>(API_ENDPOINTS.tasks.overdue, params, getToken),
  getTaskStats: () => apiClient.get<Record<string, any>>(API_ENDPOINTS.tasks.stats, undefined, getToken),
  
  // Project operations
  getProjects: (activeOnly: boolean = true) => 
    apiClient.get<Project[]>(API_ENDPOINTS.projects.list, { active_only: activeOnly }, getToken),
  getProject: (id: string) => apiClient.get<Project>(API_ENDPOINTS.projects.get(id), undefined, getToken),
  createProject: (data: any) => apiClient.post<Project>(API_ENDPOINTS.projects.create, data, getToken),
  updateProject: (id: string, data: any) => apiClient.patch<Project>(API_ENDPOINTS.projects.update(id), data, getToken),
  deleteProject: (id: string) => apiClient.delete<void>(API_ENDPOINTS.projects.delete(id), getToken),
  getProjectTasks: (projectId: string, params?: any) => 
    apiClient.get<Task[]>(API_ENDPOINTS.projects.tasks(projectId), params, getToken),
});

// Create authenticated note service
export const createAuthenticatedNoteService = (getToken: GetTokenFn) => ({
  getNotes: (params?: any) => apiClient.get<Note[]>(API_ENDPOINTS.notes.list, params, getToken),
  getNote: (id: string) => apiClient.get<Note>(API_ENDPOINTS.notes.get(id), undefined, getToken),
  createNote: (data: any) => apiClient.post<Note>(API_ENDPOINTS.notes.create, data, getToken),
  updateNote: (id: string, data: any) => apiClient.patch<Note>(API_ENDPOINTS.notes.update(id), data, getToken),
  deleteNote: (id: string) => apiClient.delete<void>(API_ENDPOINTS.notes.delete(id), getToken),
  toggleFavorite: (id: string) => apiClient.post<Note>(API_ENDPOINTS.notes.favorite(id), undefined, getToken),
  getNoteFolders: () => apiClient.get<string[]>(API_ENDPOINTS.notes.folders, undefined, getToken),
  getNoteTags: () => apiClient.get<string[]>(API_ENDPOINTS.notes.tags, undefined, getToken),
  getNoteLinks: (id: string) => apiClient.get<Note[]>(API_ENDPOINTS.notes.links(id), undefined, getToken),
  addNoteLink: (id: string, targetId: string) => 
    apiClient.post<void>(API_ENDPOINTS.notes.links(id), { target_id: targetId }, getToken),
  removeNoteLink: (id: string, targetId: string) => 
    apiClient.delete<void>(API_ENDPOINTS.notes.removeLink(id, targetId), getToken),
  getNoteStats: () => apiClient.get<Record<string, any>>(API_ENDPOINTS.notes.stats, undefined, getToken),
});

// Create authenticated habit service
export const createAuthenticatedHabitService = (getToken: GetTokenFn) => ({
  getHabits: (params?: any) => apiClient.get<Habit[]>(API_ENDPOINTS.habits.list, params, getToken),
  getHabit: (id: string) => apiClient.get<Habit>(API_ENDPOINTS.habits.get(id), undefined, getToken),
  createHabit: (data: any) => apiClient.post<Habit>(API_ENDPOINTS.habits.create, data, getToken),
  updateHabit: (id: string, data: any) => apiClient.patch<Habit>(API_ENDPOINTS.habits.update(id), data, getToken),
  deleteHabit: (id: string) => apiClient.delete<void>(API_ENDPOINTS.habits.delete(id), getToken),
  archiveHabit: (id: string) => apiClient.post<Habit>(API_ENDPOINTS.habits.archive(id), undefined, getToken),
  logHabit: (id: string, date: string) => 
    apiClient.post<HabitLog>(API_ENDPOINTS.habits.log(id), { date }, getToken),
  getHabitLogs: (id: string, startDate: string, endDate: string) => 
    apiClient.get<HabitLog[]>(API_ENDPOINTS.habits.logs(id), { start_date: startDate, end_date: endDate }, getToken),
  getTodaysHabits: () => apiClient.get<Habit[]>(API_ENDPOINTS.habits.today, undefined, getToken),
  getHabitCategories: () => apiClient.get<string[]>(API_ENDPOINTS.habits.categories, undefined, getToken),
  getHabitStreaks: () => apiClient.get<any[]>(API_ENDPOINTS.habits.streaks, undefined, getToken),
  getHabitStats: () => apiClient.get<Record<string, any>>(API_ENDPOINTS.habits.stats, undefined, getToken),
  getUserLogs: (startDate: string, endDate: string) => 
    apiClient.get<HabitLog[]>(API_ENDPOINTS.habits.userLogs, { start_date: startDate, end_date: endDate }, getToken),
});