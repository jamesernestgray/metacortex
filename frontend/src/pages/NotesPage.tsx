import React, { useState } from 'react';
import { 
  NoteList, 
  NoteEditor, 
  NoteLinkSelector 
} from '../components/notes';
import { 
  useNotes, 
  useNote, 
  useTags,
  useNotesByType 
} from '../hooks/useNotes';
import { 
  Note, 
  NoteCreate, 
  NoteUpdate, 
  NoteType,
  NoteFilter,
  Tag,
  TagCreate
} from '../types/models';
import { noteService } from '../services/notes';
import './NotesPage.css';

export const NotesPage: React.FC = () => {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showLinkSelector, setShowLinkSelector] = useState(false);
  const [filter, setFilter] = useState<NoteFilter>({});
  const [groupBy, setGroupBy] = useState<'none' | 'type' | 'date'>('type');

  // Hooks
  const { notes, loading, error, createNote, updateNote, deleteNote, toggleFavorite } = useNotes(filter);
  const { note: selectedNote, addLink, removeLink } = useNote(selectedNoteId);
  const { tags, refetch: refetchTags } = useTags();

  // Handlers
  const handleCreateNote = () => {
    setIsCreating(true);
    setIsEditing(false);
    setSelectedNoteId(null);
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNoteId(note.id);
    setIsCreating(false);
    setIsEditing(false);
  };

  const handleEditNote = (note: Note) => {
    setSelectedNoteId(note.id);
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleSaveNote = async (data: NoteCreate | NoteUpdate) => {
    if (isCreating) {
      const newNote = await createNote(data as NoteCreate);
      if (newNote) {
        setSelectedNoteId(newNote.id);
        setIsCreating(false);
      }
    } else if (isEditing && selectedNoteId) {
      await updateNote(selectedNoteId, data as NoteUpdate);
      setIsEditing(false);
    }
  };

  const handleDeleteNote = async (note: Note) => {
    const success = await deleteNote(note.id);
    if (success && selectedNoteId === note.id) {
      setSelectedNoteId(null);
    }
  };

  const handleToggleFavorite = async (note: Note) => {
    await toggleFavorite(note.id);
  };

  const handleCancelEdit = () => {
    setIsCreating(false);
    setIsEditing(false);
  };

  const handleAddLink = async (targetNoteId: string) => {
    if (selectedNoteId) {
      await addLink(targetNoteId);
      setShowLinkSelector(false);
    }
  };

  const handleCreateTag = async (name: string): Promise<Tag | null> => {
    try {
      const newTag = await noteService.createTag({ name });
      await refetchTags();
      return newTag;
    } catch (error) {
      console.error('Failed to create tag:', error);
      return null;
    }
  };

  // Filter handlers
  const handleFilterChange = (newFilter: Partial<NoteFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  };

  const clearFilter = () => {
    setFilter({});
  };

  return (
    <div className="notes-page">
      <div className="notes-sidebar">
        <div className="notes-header">
          <h2>Notes</h2>
          <button 
            className="create-note-button"
            onClick={handleCreateNote}
          >
            + New Note
          </button>
        </div>

        <div className="notes-filters">
          <select
            value={filter.note_type || ''}
            onChange={(e) => handleFilterChange({ 
              note_type: e.target.value as NoteType || undefined 
            })}
          >
            <option value="">All Types</option>
            <option value={NoteType.NOTE}>Notes</option>
            <option value={NoteType.DAILY}>Daily Notes</option>
            <option value={NoteType.MEETING}>Meeting Notes</option>
            <option value={NoteType.TEMPLATE}>Templates</option>
          </select>

          <label>
            <input
              type="checkbox"
              checked={filter.is_pinned || false}
              onChange={(e) => handleFilterChange({ 
                is_pinned: e.target.checked || undefined 
              })}
            />
            Pinned only
          </label>

          <label>
            <input
              type="checkbox"
              checked={filter.is_archived || false}
              onChange={(e) => handleFilterChange({ 
                is_archived: e.target.checked || undefined 
              })}
            />
            Show archived
          </label>

          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as 'none' | 'type' | 'date')}
          >
            <option value="none">No grouping</option>
            <option value="type">Group by type</option>
            <option value="date">Group by date</option>
          </select>

          {Object.keys(filter).length > 0 && (
            <button onClick={clearFilter} className="clear-filter">
              Clear filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="loading">Loading notes...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <NoteList
            notes={notes}
            selectedNoteId={selectedNoteId}
            onNoteSelect={handleSelectNote}
            onNoteEdit={handleEditNote}
            onNoteDelete={handleDeleteNote}
            onToggleFavorite={handleToggleFavorite}
            groupBy={groupBy}
          />
        )}
      </div>

      <div className="notes-content">
        {isCreating || isEditing ? (
          <NoteEditor
            note={isEditing ? selectedNote : null}
            onSave={handleSaveNote}
            onCancel={handleCancelEdit}
            availableTags={tags}
            onCreateTag={handleCreateTag}
            isCreating={isCreating}
          />
        ) : selectedNote ? (
          <div className="note-view">
            <div className="note-view-header">
              <h1>{selectedNote.title}</h1>
              <div className="note-view-actions">
                <button onClick={() => setIsEditing(true)}>Edit</button>
                <button onClick={() => setShowLinkSelector(true)}>Add Link</button>
              </div>
            </div>

            <div className="note-view-metadata">
              <span className="note-type">{selectedNote.note_type}</span>
              {selectedNote.is_pinned && <span className="pinned-badge">Pinned</span>}
              <span className="word-count">{selectedNote.word_count} words</span>
            </div>

            <div className="note-view-content">
              <pre>{selectedNote.content}</pre>
            </div>

            {selectedNote.tags.length > 0 && (
              <div className="note-view-tags">
                {selectedNote.tags.map(tag => (
                  <span
                    key={tag.id}
                    className="tag"
                    style={{ backgroundColor: tag.color || '#e0e0e0' }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {(selectedNote.linked_to.length > 0 || selectedNote.linked_from.length > 0) && (
              <div className="note-view-links">
                <h3>Linked Notes</h3>
                
                {selectedNote.linked_to.length > 0 && (
                  <div className="link-section">
                    <h4>Links to:</h4>
                    {selectedNote.linked_to.map(link => (
                      <div key={link.id} className="linked-note">
                        <span 
                          className="link-title"
                          onClick={() => setSelectedNoteId(link.id)}
                        >
                          {link.title}
                        </span>
                        <button
                          className="remove-link"
                          onClick={() => removeLink(link.id)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {selectedNote.linked_from.length > 0 && (
                  <div className="link-section">
                    <h4>Linked from:</h4>
                    {selectedNote.linked_from.map(link => (
                      <div key={link.id} className="linked-note">
                        <span 
                          className="link-title"
                          onClick={() => setSelectedNoteId(link.id)}
                        >
                          {link.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="notes-empty-state">
            <p>Select a note to view or create a new one</p>
          </div>
        )}
      </div>

      {showLinkSelector && selectedNote && (
        <NoteLinkSelector
          currentNoteId={selectedNoteId || undefined}
          existingLinks={selectedNote.linked_to}
          onSelectNote={handleAddLink}
          onClose={() => setShowLinkSelector(false)}
        />
      )}
    </div>
  );
};