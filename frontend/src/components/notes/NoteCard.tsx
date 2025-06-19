import React from 'react';
import { Note, NoteType, Tag } from '../../types/models';
import { noteHelpers } from '../../services/notes';
import './NoteCard.css';

interface NoteCardProps {
  note: Note;
  onClick?: (note: Note) => void;
  onEdit?: (note: Note) => void;
  onDelete?: (note: Note) => void;
  onToggleFavorite?: (note: Note) => void;
  selected?: boolean;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onClick,
  onEdit,
  onDelete,
  onToggleFavorite,
  selected = false,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(note);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(note);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this note?')) {
      onDelete?.(note);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(note);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const getNoteTypeIcon = (type: NoteType) => {
    switch (type) {
      case NoteType.DAILY:
        return '📅';
      case NoteType.MEETING:
        return '👥';
      case NoteType.TEMPLATE:
        return '📋';
      default:
        return '📝';
    }
  };

  return (
    <div 
      className={`note-card ${selected ? 'selected' : ''} ${note.is_pinned ? 'pinned' : ''}`}
      onClick={handleClick}
    >
      <div className="note-card-header">
        <div className="note-card-title-row">
          <span className="note-type-icon">{getNoteTypeIcon(note.note_type)}</span>
          <h3 className="note-card-title">{note.title}</h3>
          {note.is_pinned && <span className="pin-icon">📌</span>}
        </div>
        <div className="note-card-actions">
          <button
            className="icon-button"
            onClick={handleToggleFavorite}
            title={note.is_pinned ? 'Unpin' : 'Pin'}
          >
            {note.is_pinned ? '📌' : '📍'}
          </button>
          <button
            className="icon-button"
            onClick={handleEdit}
            title="Edit"
          >
            ✏️
          </button>
          <button
            className="icon-button"
            onClick={handleDelete}
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="note-card-preview">
        {noteHelpers.formatNotePreview(note.content)}
      </div>

      <div className="note-card-footer">
        <div className="note-card-tags">
          {note.tags.slice(0, 3).map((tag: Tag) => (
            <span
              key={tag.id}
              className="note-tag"
              style={{ backgroundColor: tag.color || '#e0e0e0' }}
            >
              {tag.name}
            </span>
          ))}
          {note.tags.length > 3 && (
            <span className="note-tag more-tags">+{note.tags.length - 3}</span>
          )}
        </div>

        <div className="note-card-meta">
          <span className="note-date">{formatDate(note.updated_at)}</span>
          <span className="note-word-count">{note.word_count} words</span>
        </div>
      </div>

      {note.is_archived && (
        <div className="note-archived-badge">Archived</div>
      )}
    </div>
  );
};