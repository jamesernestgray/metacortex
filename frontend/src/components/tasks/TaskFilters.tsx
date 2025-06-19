import React from 'react';
import {
  TaskFilter,
  TaskStatus,
  TaskPriority,
} from '../../types/models';
import './TaskFilters.css';

interface TaskFiltersProps {
  filter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  sortBy: 'due_date' | 'priority' | 'created_at' | 'title';
  onSortByChange: (sortBy: 'due_date' | 'priority' | 'created_at' | 'title') => void;
  sortDesc: boolean;
  onSortDescChange: (desc: boolean) => void;
  groupBy: 'none' | 'status' | 'project' | 'date';
  onGroupByChange: (groupBy: 'none' | 'status' | 'project' | 'date') => void;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({
  filter,
  onFilterChange,
  sortBy,
  onSortByChange,
  sortDesc,
  onSortDescChange,
  groupBy,
  onGroupByChange,
}) => {
  const handleFilterChange = (key: keyof TaskFilter, value: any) => {
    onFilterChange({
      ...filter,
      [key]: value || undefined,
    });
  };

  return (
    <div className="task-filters">
      <div className="task-filters-row">
        <div className="filter-group">
          <label htmlFor="filter-search">Search</label>
          <input
            id="filter-search"
            type="text"
            placeholder="Search tasks..."
            value={filter.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="filter-status">Status</label>
          <select
            id="filter-status"
            value={filter.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="">All</option>
            <option value={TaskStatus.PENDING}>Pending</option>
            <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
            <option value={TaskStatus.COMPLETED}>Completed</option>
            <option value={TaskStatus.CANCELLED}>Cancelled</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-priority">Priority</label>
          <select
            id="filter-priority"
            value={filter.priority || ''}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="filter-select"
          >
            <option value="">All</option>
            <option value={TaskPriority.LOW}>Low</option>
            <option value={TaskPriority.MEDIUM}>Medium</option>
            <option value={TaskPriority.HIGH}>High</option>
            <option value={TaskPriority.URGENT}>Urgent</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-overdue">
            <input
              id="filter-overdue"
              type="checkbox"
              checked={filter.is_overdue || false}
              onChange={(e) => handleFilterChange('is_overdue', e.target.checked)}
              className="filter-checkbox"
            />
            Overdue only
          </label>
        </div>
      </div>

      <div className="task-filters-row">
        <div className="filter-group">
          <label htmlFor="sort-by">Sort by</label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as any)}
            className="filter-select"
          >
            <option value="created_at">Created Date</option>
            <option value="due_date">Due Date</option>
            <option value="priority">Priority</option>
            <option value="title">Title</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="sort-order">
            <input
              id="sort-order"
              type="checkbox"
              checked={sortDesc}
              onChange={(e) => onSortDescChange(e.target.checked)}
              className="filter-checkbox"
            />
            Descending
          </label>
        </div>

        <div className="filter-group">
          <label htmlFor="group-by">Group by</label>
          <select
            id="group-by"
            value={groupBy}
            onChange={(e) => onGroupByChange(e.target.value as any)}
            className="filter-select"
          >
            <option value="none">None</option>
            <option value="status">Status</option>
            <option value="project">Project</option>
            <option value="date">Due Date</option>
          </select>
        </div>

        <div className="filter-group filter-actions">
          <button
            onClick={() => {
              onFilterChange({});
              onSortByChange('created_at');
              onSortDescChange(false);
              onGroupByChange('none');
            }}
            className="filter-reset"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskFilters;