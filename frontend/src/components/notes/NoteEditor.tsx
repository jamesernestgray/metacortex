import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Note, NoteCreate, NoteUpdate, NoteType, Tag } from '../../types/models';
import { noteHelpers } from '../../services/notes';
import './NoteEditor.css';

interface NoteEditorProps {
  note?: Note | null;
  onSave: (data: NoteCreate | NoteUpdate) => Promise<void>;
  onCancel: () => void;
  availableTags: Tag[];
  onCreateTag?: (name: string) => Promise<Tag | null>;
  isCreating?: boolean;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  onSave,
  onCancel,
  availableTags,
  onCreateTag,
  isCreating = false,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [noteType, setNoteType] = useState<NoteType>(NoteType.NOTE);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isPinned, setIsPinned] = useState(false);
  const [isTemplate, setIsTemplate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setNoteType(note.note_type);
      setSelectedTags(note.tags.map(t => t.id));
      setIsPinned(note.is_pinned);
      setIsTemplate(note.is_template);
    } else if (isCreating) {
      // Set default title based on note type
      const defaultTitle = noteHelpers.getNoteTitleSuggestion(noteType);
      setTitle(defaultTitle);
    }
  }, [note, isCreating, noteType]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const data = isCreating ? {
        title: title.trim(),
        content,
        note_type: noteType,
        tags: selectedTags,
        is_pinned: isPinned,
        is_template: isTemplate,
      } as NoteCreate : {
        title: title.trim(),
        content,
        note_type: noteType,
        tags: selectedTags,
        is_pinned: isPinned,
        is_template: isTemplate,
      } as NoteUpdate;

      await onSave(data);
    } catch (err: any) {
      setError(err.message || 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;

    if (onCreateTag) {
      const newTag = await onCreateTag(newTagName.trim());
      if (newTag) {
        setSelectedTags([...selectedTags, newTag.id]);
      }
    }
    
    setNewTagName('');
    setShowTagInput(false);
  };

  const handleRemoveTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter(id => id !== tagId));
  };

  const insertLink = () => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const linkText = selectedText || 'Note Title';
    const newText = content.substring(0, start) + `[[${linkText}]]` + content.substring(end);
    
    setContent(newText);
    
    // Set cursor position after the link
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 2, start + 2 + linkText.length);
    }, 0);
  };

  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;

  return (
    <div className="note-editor">
      <div className="note-editor-header">
        <input
          type="text"
          className="note-editor-title"
          placeholder="Note title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus={isCreating}
        />
        
        <div className="note-editor-actions">
          <button
            className="button button-primary"
            onClick={handleSave}
            disabled={saving || !title.trim()}
          >
            {saving ? 'Saving...' : (isCreating ? 'Create' : 'Save')}
          </button>
          <button
            className="button button-secondary"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>
        </div>
      </div>

      {error && (
        <div className="note-editor-error">
          {error}
        </div>
      )}

      <div className="note-editor-metadata">
        <div className="note-editor-type">
          <label>Type:</label>
          <select
            value={noteType}
            onChange={(e) => setNoteType(e.target.value as NoteType)}
            disabled={!isCreating}
          >
            <option value={NoteType.NOTE}>Note</option>
            <option value={NoteType.DAILY}>Daily Note</option>
            <option value={NoteType.MEETING}>Meeting Note</option>
            <option value={NoteType.TEMPLATE}>Template</option>
          </select>
        </div>

        <div className="note-editor-options">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
            />
            Pin note
          </label>
          
          {noteType === NoteType.TEMPLATE && (
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isTemplate}
                onChange={(e) => setIsTemplate(e.target.checked)}
              />
              Save as template
            </label>
          )}
        </div>
      </div>

      <div className="note-editor-toolbar">
        <button
          className="toolbar-button"
          onClick={insertLink}
          title="Insert note link"
        >
          🔗 Link
        </button>
        <div className="word-count">
          {wordCount} {wordCount === 1 ? 'word' : 'words'}
        </div>
      </div>

      <textarea
        ref={contentRef}
        className="note-editor-content"
        placeholder="Start writing..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <div className="note-editor-tags">
        <label>Tags:</label>
        <div className="tag-list">
          {selectedTags.map(tagId => {
            const tag = availableTags.find(t => t.id === tagId);
            if (!tag) return null;
            
            return (
              <div
                key={tag.id}
                className="tag-item"
                style={{ backgroundColor: tag.color || '#e0e0e0' }}
              >
                {tag.name}
                <button
                  className="tag-remove"
                  onClick={() => handleRemoveTag(tag.id)}
                >
                  ×
                </button>
              </div>
            );
          })}
          
          {showTagInput ? (
            <div className="tag-input-container">
              <input
                type="text"
                className="tag-input"
                placeholder="New tag..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddTag();
                  }
                }}
                onBlur={() => {
                  if (!newTagName) {
                    setShowTagInput(false);
                  }
                }}
                autoFocus
              />
            </div>
          ) : (
            <button
              className="add-tag-button"
              onClick={() => setShowTagInput(true)}
            >
              + Add tag
            </button>
          )}
        </div>
        
        {availableTags.length > 0 && (
          <div className="available-tags">
            {availableTags
              .filter(tag => !selectedTags.includes(tag.id))
              .map(tag => (
                <button
                  key={tag.id}
                  className="available-tag"
                  style={{ backgroundColor: tag.color || '#e0e0e0' }}
                  onClick={() => setSelectedTags([...selectedTags, tag.id])}
                >
                  {tag.name}
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};