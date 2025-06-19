import React, { useState, useMemo } from 'react';
import { Note, NoteType } from '../../types/models';
import { NoteCard } from './NoteCard';
import { noteHelpers } from '../../services/notes';
import './NoteList.css';

interface NoteListProps {
  notes: Note[];
  selectedNoteId?: string | null;
  onNoteSelect?: (note: Note) => void;
  onNoteEdit?: (note: Note) => void;
  onNoteDelete?: (note: Note) => void;
  onToggleFavorite?: (note: Note) => void;
  groupBy?: 'none' | 'type' | 'date';
  sortBy?: 'created_at' | 'updated_at' | 'title' | 'word_count';
  sortDesc?: boolean;
  emptyMessage?: string;
}

export const NoteList: React.FC<NoteListProps> = ({
  notes,
  selectedNoteId,
  onNoteSelect,
  onNoteEdit,
  onNoteDelete,
  onToggleFavorite,
  groupBy = 'none',
  sortBy = 'updated_at',
  sortDesc = true,
  emptyMessage = 'No notes found',
}) => {
  const sortedNotes = useMemo(() => {
    return noteHelpers.sortNotes(notes, sortBy, sortDesc);
  }, [notes, sortBy, sortDesc]);

  const groupedNotes = useMemo(() => {
    if (groupBy === 'none') {
      return { 'All Notes': sortedNotes };
    }

    if (groupBy === 'type') {
      const groups = noteHelpers.groupNotesByType(sortedNotes);
      return Object.entries(groups).reduce((acc, [type, notes]) => {
        if (notes.length > 0) {
          const typeLabel = {
            [NoteType.NOTE]: 'Notes',
            [NoteType.DAILY]: 'Daily Notes',
            [NoteType.MEETING]: 'Meeting Notes',
            [NoteType.TEMPLATE]: 'Templates',
          }[type as NoteType];
          acc[typeLabel] = notes;
        }
        return acc;
      }, {} as Record<string, Note[]>);
    }

    if (groupBy === 'date') {
      const groups: Record<string, Note[]> = {
        'Today': [],
        'Yesterday': [],
        'This Week': [],
        'This Month': [],
        'Older': [],
      };

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      sortedNotes.forEach(note => {
        const noteDate = new Date(note.updated_at);
        if (noteDate >= today) {
          groups['Today'].push(note);
        } else if (noteDate >= yesterday) {
          groups['Yesterday'].push(note);
        } else if (noteDate >= weekAgo) {
          groups['This Week'].push(note);
        } else if (noteDate >= monthAgo) {
          groups['This Month'].push(note);
        } else {
          groups['Older'].push(note);
        }
      });

      // Remove empty groups
      return Object.entries(groups).reduce((acc, [key, notes]) => {
        if (notes.length > 0) {
          acc[key] = notes;
        }
        return acc;
      }, {} as Record<string, Note[]>);
    }

    return { 'All Notes': sortedNotes };
  }, [sortedNotes, groupBy]);

  if (notes.length === 0) {
    return (
      <div className="note-list-empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="note-list">
      {Object.entries(groupedNotes).map(([groupName, groupNotes]) => (
        <div key={groupName} className="note-group">
          {groupBy !== 'none' && (
            <h3 className="note-group-header">
              {groupName} <span className="note-count">({groupNotes.length})</span>
            </h3>
          )}
          <div className="note-group-items">
            {groupNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                selected={note.id === selectedNoteId}
                onClick={onNoteSelect}
                onEdit={onNoteEdit}
                onDelete={onNoteDelete}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};