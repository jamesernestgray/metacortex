import React, { useState } from 'react';
import {
  Task,
  TaskStatus,
  TaskPriority,
} from '../../types/models';
import './TaskItem.css';

interface TaskItemProps {
  task: Task;
  onClick?: () => void;
  onUpdate?: (data: Partial<Task>) => void;
  onDelete?: () => void;
  onComplete?: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onClick,
  onUpdate,
  onDelete,
  onComplete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onComplete?.();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this task?')) {
      onDelete?.();
    }
  };

  const handleTitleSubmit = () => {
    if (editTitle.trim() && editTitle !== task.title) {
      onUpdate?.({ title: editTitle.trim() });
    }
    setIsEditing(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setEditTitle(task.title);
      setIsEditing(false);
    }
  };

  const getPriorityClass = (priority: TaskPriority) => {
    return `task-priority-${priority}`;
  };

  const getStatusClass = (status: TaskStatus) => {
    return `task-status-${status.replace('_', '-')}`;
  };

  const formatDueDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);
    
    if (taskDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (taskDate.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    } else if (taskDate < today) {
      const daysAgo = Math.floor((today.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24));
      return `${daysAgo} day${daysAgo > 1 ? 's' : ''} overdue`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div 
      className={`task-item ${getStatusClass(task.status)} ${task.is_overdue ? 'task-overdue' : ''}`}
      onClick={onClick}
    >
      <div className="task-item-left">
        <button
          className="task-checkbox"
          onClick={handleComplete}
          aria-label={task.status === TaskStatus.COMPLETED ? 'Mark incomplete' : 'Mark complete'}
        >
          {task.status === TaskStatus.COMPLETED && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M20 6L9 17l-5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
        
        <div className="task-content">
          {isEditing ? (
            <input
              type="text"
              className="task-title-input"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={handleTitleKeyDown}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          ) : (
            <h4 
              className="task-title"
              onDoubleClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
            >
              {task.title}
            </h4>
          )}
          
          {task.description && (
            <p className="task-description">{task.description}</p>
          )}
          
          <div className="task-meta">
            {task.project && (
              <span 
                className="task-project"
                style={{ 
                  backgroundColor: task.project.color ? `${task.project.color}20` : undefined,
                  color: task.project.color || undefined
                }}
              >
                {task.project.icon} {task.project.name}
              </span>
            )}
            
            <span className={`task-priority ${getPriorityClass(task.priority)}`}>
              {task.priority}
            </span>
            
            {task.due_date && (
              <span className={`task-due-date ${task.is_overdue ? 'overdue' : ''}`}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                {formatDueDate(task.due_date)}
              </span>
            )}
            
            {task.tags.length > 0 && (
              <div className="task-tags">
                {task.tags.map(tag => (
                  <span key={tag} className="task-tag">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="task-item-right">
        {task.subtasks && task.subtasks.length > 0 && (
          <span className="task-subtasks-count">
            {task.subtasks.filter(st => st.status === TaskStatus.COMPLETED).length}/{task.subtasks.length}
          </span>
        )}
        
        <button
          className="task-delete"
          onClick={handleDelete}
          aria-label="Delete task"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TaskItem;