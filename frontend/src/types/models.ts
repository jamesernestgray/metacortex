// Base types
export interface BaseModel {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface UserOwnedModel extends BaseModel {
  user_id: string;
  is_deleted: boolean;
  deleted_at?: string;
}

// User types
export interface User extends BaseModel {
  email: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  clerk_id: string;
  is_active: boolean;
  is_verified: boolean;
  preferences: Record<string, any>;
  enabled_modules: string[];
  full_name: string;
}

export interface UserPublic {
  id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
}

// Task types
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface Task extends UserOwnedModel {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  completed_at?: string;
  tags: string[];
  meta_data: Record<string, any>;
  parent_task_id?: string;
  project_id?: string;
  assignee_id?: string;
  delegated_to?: string;
  delegated_at?: string;
  is_recurring: boolean;
  recurrence_rule?: string;
  recurrence_parent_id?: string;
  is_overdue: boolean;
  subtasks?: Task[];
  project?: ProjectSummary;
}

export interface TaskCreate {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string;
  tags?: string[];
  meta_data?: Record<string, any>;
  parent_task_id?: string;
  project_id?: string;
  assignee_id?: string;
  is_recurring?: boolean;
  recurrence_rule?: string;
}

export interface TaskUpdate extends Partial<TaskCreate> {}

// Project types
export interface Project extends UserOwnedModel {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  is_active: boolean;
  is_archived: boolean;
  task_count?: number;
}

export interface ProjectSummary {
  id: string;
  name: string;
  color?: string;
  icon?: string;
}

export interface ProjectCreate {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface ProjectUpdate extends Partial<ProjectCreate> {
  is_active?: boolean;
  is_archived?: boolean;
}

// Note types
export enum NoteType {
  NOTE = 'note',
  DAILY = 'daily',
  MEETING = 'meeting',
  TEMPLATE = 'template',
}

export interface Note extends UserOwnedModel {
  title: string;
  content: string;
  note_type: NoteType;
  template_id?: string;
  is_pinned: boolean;
  is_archived: boolean;
  is_template: boolean;
  meta_data: Record<string, any>;
  tags: Tag[];
  word_count: number;
}

export interface NoteWithLinks extends Note {
  linked_to: NoteSummary[];
  linked_from: NoteSummary[];
}

export interface NoteSummary {
  id: string;
  title: string;
  note_type: NoteType;
  is_pinned: boolean;
  is_archived: boolean;
  tags: Tag[];
  created_at: string;
  updated_at: string;
}

export interface NoteCreate {
  title: string;
  content?: string;
  note_type?: NoteType;
  template_id?: string;
  is_pinned?: boolean;
  is_archived?: boolean;
  is_template?: boolean;
  meta_data?: Record<string, any>;
  tags?: string[];
}

export interface NoteUpdate extends Partial<NoteCreate> {}

export interface NoteLink {
  target_id: string;
}

export interface NoteVersion extends BaseModel {
  note_id: string;
  title: string;
  content: string;
  user_id: string;
  change_summary?: string;
  version_number: number;
}

// Tag types
export interface Tag extends UserOwnedModel {
  name: string;
  color?: string;
  description?: string;
  parent_tag_id?: string;
  parent?: Tag;
  children?: Tag[];
}

export interface TagCreate {
  name: string;
  color?: string;
  description?: string;
  parent_tag_id?: string;
}

export interface TagUpdate extends Partial<TagCreate> {}

// Note filter types
export interface NoteFilter {
  note_type?: NoteType;
  is_pinned?: boolean;
  is_archived?: boolean;
  is_template?: boolean;
  tags?: string[];
  search?: string;
}

// Habit types
export enum HabitFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom',
}

export enum HabitType {
  BUILD = 'build',
  BREAK = 'break',
  MAINTAIN = 'maintain',
}

export interface Habit extends UserOwnedModel {
  name: string;
  description?: string;
  category?: string;
  habit_type: HabitType;
  frequency: HabitFrequency;
  target_days?: number[];
  target_count?: number;
  target_value?: number;
  unit?: string;
  color?: string;
  icon?: string;
  reminder_time?: string;
  is_active: boolean;
  is_archived: boolean;
  streak_count: number;
  best_streak: number;
  total_completions: number;
  last_completed?: string;
}

export interface HabitWithLogs {
  habit: Habit;
  logs: HabitLog[];
  streak: number;
}

export interface HabitSummary {
  id: string;
  name: string;
  category?: string;
  frequency: HabitFrequency;
  color?: string;
  icon?: string;
  streak_count: number;
  is_active: boolean;
}

export interface HabitCreate {
  name: string;
  description?: string;
  category?: string;
  habit_type?: HabitType;
  frequency?: HabitFrequency;
  target_days?: number[];
  target_count?: number;
  target_value?: number;
  unit?: string;
  color?: string;
  icon?: string;
  reminder_time?: string;
  is_active?: boolean;
}

export interface HabitUpdate extends Partial<HabitCreate> {}

export interface HabitLog {
  id: string;
  habit_id: string;
  date: string;
  completed: boolean;
  value?: number;
  notes?: string;
  created_at: string;
}

export interface HabitLogCreate {
  date: string;
  completed?: boolean;
  value?: number;
  notes?: string;
}

export interface HabitStreak {
  habit: HabitSummary;
  current_streak: number;
  best_streak: number;
}

export interface HabitStats {
  total: number;
  active: number;
  archived: number;
  completion_rate_today: number;
  completed_today: number;
  total_today: number;
  monthly_logs: number;
}

export interface HabitFilter {
  habit_type?: HabitType;
  frequency?: HabitFrequency;
  category?: string;
  is_active?: boolean;
  is_archived?: boolean;
  search?: string;
}

// Common filter/query types
export interface PaginationParams {
  skip?: number;
  limit?: number;
}

export interface SortParams {
  sort_by?: string;
  sort_desc?: boolean;
}

export interface TaskFilter {
  status?: TaskStatus;
  priority?: TaskPriority;
  project_id?: string;
  assignee_id?: string;
  tags?: string[];
  is_overdue?: boolean;
  search?: string;
}