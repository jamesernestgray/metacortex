import { apiClient } from './api';
import { API_ENDPOINTS } from '../config/api';
import {
  Note,
  NoteWithLinks,
  NoteCreate,
  NoteUpdate,
  NoteFilter,
  NoteLink,
  NoteVersion,
  NoteSummary,
  NoteType,
  Tag,
  TagCreate,
  TagUpdate,
  PaginationParams,
  SortParams,
} from '../types/models';

// Note API Service
export const noteService = {
  // Note operations
  async getNotes(params?: NoteFilter & PaginationParams & SortParams): Promise<Note[]> {
    return apiClient.get<Note[]>(API_ENDPOINTS.notes.list, params);
  },

  async getNote(id: string): Promise<NoteWithLinks> {
    return apiClient.get<NoteWithLinks>(API_ENDPOINTS.notes.get(id));
  },

  async createNote(data: NoteCreate): Promise<Note> {
    return apiClient.post<Note>(API_ENDPOINTS.notes.create, data);
  },

  async updateNote(id: string, data: NoteUpdate): Promise<Note> {
    return apiClient.patch<Note>(API_ENDPOINTS.notes.update(id), data);
  },

  async deleteNote(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.notes.delete(id));
  },

  async toggleFavorite(id: string): Promise<Note> {
    return apiClient.post<Note>(API_ENDPOINTS.notes.favorite(id));
  },

  // Note linking operations
  async addNoteLink(id: string, targetId: string): Promise<void> {
    const linkData: NoteLink = { target_id: targetId };
    return apiClient.post<void>(API_ENDPOINTS.notes.links(id), linkData);
  },

  async removeNoteLink(id: string, targetId: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.notes.removeLink(id, targetId));
  },

  async getNoteVersions(id: string): Promise<NoteVersion[]> {
    return apiClient.get<NoteVersion[]>(`/notes/${id}/versions`);
  },

  // Tag operations
  async getTags(): Promise<Tag[]> {
    return apiClient.get<Tag[]>(API_ENDPOINTS.notes.tags);
  },

  async createTag(data: TagCreate): Promise<Tag> {
    return apiClient.post<Tag>(API_ENDPOINTS.notes.tags, data);
  },

  async updateTag(id: string, data: TagUpdate): Promise<Tag> {
    return apiClient.patch<Tag>(`${API_ENDPOINTS.notes.tags}/${id}`, data);
  },

  async deleteTag(id: string): Promise<void> {
    return apiClient.delete<void>(`${API_ENDPOINTS.notes.tags}/${id}`);
  },

  // Utility operations
  async getFolders(): Promise<string[]> {
    return apiClient.get<string[]>(API_ENDPOINTS.notes.folders);
  },

  async getNoteStats(): Promise<Record<string, any>> {
    return apiClient.get<Record<string, any>>(API_ENDPOINTS.notes.stats);
  },

  // Search notes
  async searchNotes(query: string, params?: PaginationParams): Promise<Note[]> {
    return apiClient.get<Note[]>(API_ENDPOINTS.notes.list, {
      search: query,
      ...params,
    });
  },
};

// Helper functions for note management
export const noteHelpers = {
  // Group notes by type
  groupNotesByType(notes: Note[]): Record<NoteType, Note[]> {
    const groups: Record<NoteType, Note[]> = {
      [NoteType.NOTE]: [],
      [NoteType.DAILY]: [],
      [NoteType.MEETING]: [],
      [NoteType.TEMPLATE]: [],
    };

    notes.forEach(note => {
      groups[note.note_type].push(note);
    });

    return groups;
  },

  // Filter pinned notes
  getPinnedNotes(notes: Note[]): Note[] {
    return notes.filter(note => note.is_pinned);
  },

  // Filter archived notes
  getArchivedNotes(notes: Note[]): Note[] {
    return notes.filter(note => note.is_archived);
  },

  // Filter notes by tag
  getNotesByTag(notes: Note[], tagName: string): Note[] {
    return notes.filter(note => 
      note.tags.some(tag => tag.name.toLowerCase() === tagName.toLowerCase())
    );
  },

  // Sort notes by various criteria
  sortNotes(notes: Note[], sortBy: 'created_at' | 'updated_at' | 'title' | 'word_count', desc: boolean = false): Note[] {
    const sorted = [...notes].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;

        case 'updated_at':
          comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          break;

        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;

        case 'word_count':
          comparison = a.word_count - b.word_count;
          break;
      }

      return desc ? -comparison : comparison;
    });

    return sorted;
  },

  // Get recent notes
  getRecentNotes(notes: Note[], limit: number = 10): Note[] {
    return this.sortNotes(notes, 'updated_at', true).slice(0, limit);
  },

  // Format note preview
  formatNotePreview(content: string, maxLength: number = 150): string {
    const cleaned = content
      .replace(/^#+ /gm, '') // Remove markdown headers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links
      .replace(/[*_~`]/g, '') // Remove markdown formatting
      .trim();

    if (cleaned.length <= maxLength) {
      return cleaned;
    }

    return cleaned.substring(0, maxLength).trim() + '...';
  },

  // Extract links from note content (markdown style)
  extractNoteLinks(content: string): string[] {
    const linkRegex = /\[\[([^\]]+)\]\]/g;
    const matches = content.matchAll(linkRegex);
    return Array.from(matches, m => m[1]);
  },

  // Build tag hierarchy
  buildTagHierarchy(tags: Tag[]): Tag[] {
    const tagMap = new Map<string, Tag>();
    const rootTags: Tag[] = [];

    // First pass: create map
    tags.forEach(tag => {
      tagMap.set(tag.id, { ...tag, children: [] });
    });

    // Second pass: build hierarchy
    tags.forEach(tag => {
      const tagNode = tagMap.get(tag.id)!;
      if (tag.parent_tag_id) {
        const parent = tagMap.get(tag.parent_tag_id);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(tagNode);
        }
      } else {
        rootTags.push(tagNode);
      }
    });

    return rootTags;
  },

  // Get note title suggestions based on type
  getNoteTitleSuggestion(type: NoteType): string {
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    switch (type) {
      case NoteType.DAILY:
        return `Daily Note - ${dateStr}`;
      case NoteType.MEETING:
        return `Meeting Notes - ${dateStr}`;
      case NoteType.TEMPLATE:
        return 'New Template';
      default:
        return 'Untitled Note';
    }
  },
};