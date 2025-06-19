// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
export const API_VERSION = '/api/v1';

export const API_ENDPOINTS = {
  // Health
  health: '/health',
  
  // Auth (Clerk will handle this)
  auth: {
    signin: '/auth/signin',
    signout: '/auth/signout',
    user: '/auth/user',
  },
  
  // Users
  users: {
    me: '/users/me',
    search: '/users/search',
    preferences: '/users/me/preferences',
    modules: '/users/me/modules',
  },
  
  // Tasks
  tasks: {
    list: '/tasks/',
    create: '/tasks/',
    get: (id: string) => `/tasks/${id}`,
    update: (id: string) => `/tasks/${id}`,
    delete: (id: string) => `/tasks/${id}`,
    complete: (id: string) => `/tasks/${id}/complete`,
    subtasks: (id: string) => `/tasks/${id}/subtasks`,
    overdue: '/tasks/overdue/',
    stats: '/tasks/stats/',
  },
  
  // Projects
  projects: {
    list: '/tasks/projects/',
    create: '/tasks/projects/',
    get: (id: string) => `/tasks/projects/${id}`,
    update: (id: string) => `/tasks/projects/${id}`,
    delete: (id: string) => `/tasks/projects/${id}`,
    tasks: (id: string) => `/tasks/projects/${id}/tasks`,
  },
  
  // Notes
  notes: {
    list: '/notes/',
    create: '/notes/',
    get: (id: string) => `/notes/${id}`,
    update: (id: string) => `/notes/${id}`,
    delete: (id: string) => `/notes/${id}`,
    favorite: (id: string) => `/notes/${id}/favorite`,
    links: (id: string) => `/notes/${id}/links`,
    removeLink: (id: string, targetId: string) => `/notes/${id}/links/${targetId}`,
    folders: '/notes/folders/',
    tags: '/notes/tags/',
    stats: '/notes/stats/',
  },
  
  // Habits
  habits: {
    list: '/habits/',
    create: '/habits/',
    get: (id: string) => `/habits/${id}`,
    update: (id: string) => `/habits/${id}`,
    delete: (id: string) => `/habits/${id}`,
    archive: (id: string) => `/habits/${id}/archive`,
    log: (id: string) => `/habits/${id}/logs`,
    logs: (id: string) => `/habits/${id}/logs`,
    today: '/habits/today/',
    categories: '/habits/categories/',
    streaks: '/habits/streaks/',
    stats: '/habits/stats/',
    userLogs: '/habits/logs/range/',
  },
} as const;