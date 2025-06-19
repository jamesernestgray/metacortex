import { useState, useEffect, useCallback, useMemo } from 'react';
import { noteService, noteHelpers } from '../services/notes';
import { handleApiError } from '../services/api';
import {
  Note,
  NoteWithLinks,
  NoteCreate,
  NoteUpdate,
  NoteFilter,
  NoteType,
  Tag,
  PaginationParams,
  SortParams,
} from '../types/models';

interface UseNotesOptions extends NoteFilter, PaginationParams, SortParams {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseNotesReturn {
  notes: Note[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createNote: (data: NoteCreate) => Promise<Note | null>;
  updateNote: (id: string, data: NoteUpdate) => Promise<Note | null>;
  deleteNote: (id: string) => Promise<boolean>;
  toggleFavorite: (id: string) => Promise<Note | null>;
}

export const useNotes = (options: UseNotesOptions = {}): UseNotesReturn => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
    ...filterOptions
  } = options;

  // Fetch notes
  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await noteService.getNotes(filterOptions);
      setNotes(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filterOptions)]);

  // Create note
  const createNote = useCallback(async (data: NoteCreate): Promise<Note | null> => {
    try {
      const newNote = await noteService.createNote(data);
      setNotes(prev => [newNote, ...prev]);
      return newNote;
    } catch (err) {
      setError(handleApiError(err));
      return null;
    }
  }, []);

  // Update note
  const updateNote = useCallback(async (id: string, data: NoteUpdate): Promise<Note | null> => {
    try {
      const updatedNote = await noteService.updateNote(id, data);
      setNotes(prev => prev.map(note => 
        note.id === id ? updatedNote : note
      ));
      return updatedNote;
    } catch (err) {
      setError(handleApiError(err));
      return null;
    }
  }, []);

  // Delete note
  const deleteNote = useCallback(async (id: string): Promise<boolean> => {
    try {
      await noteService.deleteNote(id);
      setNotes(prev => prev.filter(note => note.id !== id));
      return true;
    } catch (err) {
      setError(handleApiError(err));
      return false;
    }
  }, []);

  // Toggle favorite
  const toggleFavorite = useCallback(async (id: string): Promise<Note | null> => {
    try {
      const updatedNote = await noteService.toggleFavorite(id);
      setNotes(prev => prev.map(note => 
        note.id === id ? updatedNote : note
      ));
      return updatedNote;
    } catch (err) {
      setError(handleApiError(err));
      return null;
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchNotes, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchNotes]);

  return {
    notes,
    loading,
    error,
    refetch: fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    toggleFavorite,
  };
};

// Hook for a single note with links
export const useNote = (noteId: string | null) => {
  const [note, setNote] = useState<NoteWithLinks | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNote = useCallback(async () => {
    if (!noteId) {
      setNote(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await noteService.getNote(noteId);
      setNote(data);
    } catch (err) {
      setError(handleApiError(err));
      setNote(null);
    } finally {
      setLoading(false);
    }
  }, [noteId]);

  const updateNote = useCallback(async (data: NoteUpdate): Promise<NoteWithLinks | null> => {
    if (!noteId) return null;

    try {
      const updatedNote = await noteService.updateNote(noteId, data);
      // Refetch to get updated links
      await fetchNote();
      return note;
    } catch (err) {
      setError(handleApiError(err));
      return null;
    }
  }, [noteId, fetchNote, note]);

  const addLink = useCallback(async (targetId: string): Promise<boolean> => {
    if (!noteId) return false;

    try {
      await noteService.addNoteLink(noteId, targetId);
      await fetchNote(); // Refresh to get updated links
      return true;
    } catch (err) {
      setError(handleApiError(err));
      return false;
    }
  }, [noteId, fetchNote]);

  const removeLink = useCallback(async (targetId: string): Promise<boolean> => {
    if (!noteId) return false;

    try {
      await noteService.removeNoteLink(noteId, targetId);
      await fetchNote(); // Refresh to get updated links
      return true;
    } catch (err) {
      setError(handleApiError(err));
      return false;
    }
  }, [noteId, fetchNote]);

  useEffect(() => {
    fetchNote();
  }, [fetchNote]);

  return {
    note,
    loading,
    error,
    refetch: fetchNote,
    updateNote,
    addLink,
    removeLink,
  };
};

// Hook for tags
export const useTags = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await noteService.getTags();
      setTags(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const tagHierarchy = useMemo(() => {
    return noteHelpers.buildTagHierarchy(tags);
  }, [tags]);

  return {
    tags,
    tagHierarchy,
    loading,
    error,
    refetch: fetchTags,
  };
};

// Hook for note statistics
export const useNoteStats = () => {
  const [stats, setStats] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await noteService.getNoteStats();
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

// Hook for note search with debouncing
export const useNoteSearch = (initialQuery: string = '', debounceMs: number = 300) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await noteService.searchNotes(searchQuery);
      setResults(data);
    } catch (err) {
      setError(handleApiError(err));
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        search(query);
      } else {
        setResults([]);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs, search]);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
  };
};

// Hook for grouped notes by type
export const useNotesByType = (options: UseNotesOptions = {}) => {
  const { notes, loading, error, ...methods } = useNotes(options);

  const groupedNotes = useMemo(() => {
    return noteHelpers.groupNotesByType(notes);
  }, [notes]);

  return {
    groupedNotes,
    loading,
    error,
    ...methods,
  };
};