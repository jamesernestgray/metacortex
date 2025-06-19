import React, { useState, useEffect, useRef } from 'react';
import { Note, NoteSummary } from '../../types/models';
import { useNoteSearch } from '../../hooks/useNotes';
import './NoteLinkSelector.css';

interface NoteLinkSelectorProps {
  currentNoteId?: string;
  existingLinks: NoteSummary[];
  onSelectNote: (noteId: string) => void;
  onClose: () => void;
}

export const NoteLinkSelector: React.FC<NoteLinkSelectorProps> = ({
  currentNoteId,
  existingLinks,
  onSelectNote,
  onClose,
}) => {
  const { query, setQuery, results, loading } = useNoteSearch('', 200);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Filter out current note and already linked notes
  const filteredResults = results.filter(note => 
    note.id !== currentNoteId && 
    !existingLinks.some(link => link.id === note.id)
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredResults.length - 1 ? prev + 1 : prev
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      
      case 'Enter':
        e.preventDefault();
        if (filteredResults[selectedIndex]) {
          onSelectNote(filteredResults[selectedIndex].id);
        }
        break;
      
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  const handleSelect = (noteId: string) => {
    onSelectNote(noteId);
  };

  return (
    <div className="note-link-selector-overlay" onClick={onClose}>
      <div className="note-link-selector" onClick={(e) => e.stopPropagation()}>
        <div className="note-link-selector-header">
          <h3>Link to Note</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <input
          ref={inputRef}
          type="text"
          className="note-link-search"
          placeholder="Search notes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <div className="note-link-results">
          {loading && query && (
            <div className="note-link-loading">Searching...</div>
          )}
          
          {!loading && query && filteredResults.length === 0 && (
            <div className="note-link-empty">No notes found</div>
          )}
          
          {!loading && filteredResults.map((note, index) => (
            <div
              key={note.id}
              className={`note-link-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleSelect(note.id)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="note-link-item-title">{note.title}</div>
              {note.tags.length > 0 && (
                <div className="note-link-item-tags">
                  {note.tags.map(tag => (
                    <span
                      key={tag.id}
                      className="note-link-tag"
                      style={{ backgroundColor: tag.color || '#e0e0e0' }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {!query && (
            <div className="note-link-hint">
              Start typing to search for notes to link
            </div>
          )}
        </div>
      </div>
    </div>
  );
};