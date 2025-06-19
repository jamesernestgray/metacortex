import React, { useState } from 'react';
import { Habit } from '../../types/models';
import { habitHelpers } from '../../services/habits';
import './HabitCard.css';

interface HabitCardProps {
  habit: Habit;
  onClick?: () => void;
  onUpdate?: (id: string, data: Partial<Habit>) => void;
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
  viewMode?: 'grid' | 'list';
}

const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onClick,
  onUpdate,
  onDelete,
  onArchive,
  viewMode = 'grid',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(habit.name);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this habit?')) {
      onDelete?.(habit.id);
    }
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    onArchive?.(habit.id);
  };

  const handleNameSubmit = () => {
    if (editName.trim() && editName !== habit.name) {
      onUpdate?.(habit.id, { name: editName.trim() });
    }
    setIsEditing(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    } else if (e.key === 'Escape') {
      setEditName(habit.name);
      setIsEditing(false);
    }
  };

  const typeInfo = habitHelpers.getHabitTypeDisplay(habit.habit_type);
  const frequency = habitHelpers.getFrequencyDisplay(habit.frequency);
  const streakStatus = habitHelpers.getStreakStatus(habit);

  return (
    <div
      className={`habit-card ${viewMode} ${streakStatus}`}
      onClick={onClick}
      style={{
        borderColor: habit.color || undefined,
      }}
    >
      <div className="habit-card-header">
        <div className="habit-icon-wrapper">
          {habit.icon || typeInfo.icon}
        </div>
        {isEditing ? (
          <input
            type="text"
            className="habit-name-input"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={handleNameKeyDown}
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
        ) : (
          <h3
            className="habit-name"
            onDoubleClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
          >
            {habit.name}
          </h3>
        )}
      </div>

      {habit.description && (
        <p className="habit-description">{habit.description}</p>
      )}

      <div className="habit-meta">
        <span className={`habit-type ${habit.habit_type}`}>
          {typeInfo.label}
        </span>
        <span className="habit-frequency">
          {frequency}
          {habit.frequency === 'weekly' && habit.target_days && (
            <span className="habit-weekdays">
              {' '}({habitHelpers.getWeekdayNames(habit.target_days).join(', ')})
            </span>
          )}
        </span>
        {habit.category && (
          <span className="habit-category">{habit.category}</span>
        )}
      </div>

      <div className="habit-stats">
        <div className="habit-streak">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          <span className={`streak-count ${streakStatus}`}>
            {habitHelpers.formatStreak(habit.streak_count)}
          </span>
        </div>

        {habit.best_streak > 0 && (
          <div className="habit-best-streak">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span>Best: {habit.best_streak}</span>
          </div>
        )}

        <div className="habit-completions">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{habit.total_completions}</span>
        </div>
      </div>

      <div className="habit-actions">
        {habit.is_archived ? (
          <button
            className="habit-unarchive"
            onClick={(e) => {
              e.stopPropagation();
              onUpdate?.(habit.id, { is_archived: false });
            }}
            aria-label="Unarchive habit"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="12" y1="11" x2="12" y2="17" />
              <line x1="12" y1="11" x2="12" y2="7" />
            </svg>
          </button>
        ) : (
          <button
            className="habit-archive"
            onClick={handleArchive}
            aria-label="Archive habit"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor">
              <polyline points="21 8 21 21 3 21 3 8" />
              <rect x="1" y="3" width="22" height="5" />
              <line x1="10" y1="12" x2="14" y2="12" />
            </svg>
          </button>
        )}
        
        {!habit.is_active && (
          <button
            className="habit-activate"
            onClick={(e) => {
              e.stopPropagation();
              onUpdate?.(habit.id, { is_active: true });
            }}
            aria-label="Activate habit"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </button>
        )}

        {habit.is_active && !habit.is_archived && (
          <button
            className="habit-pause"
            onClick={(e) => {
              e.stopPropagation();
              onUpdate?.(habit.id, { is_active: false });
            }}
            aria-label="Pause habit"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          </button>
        )}

        <button
          className="habit-delete"
          onClick={handleDelete}
          aria-label="Delete habit"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default HabitCard;