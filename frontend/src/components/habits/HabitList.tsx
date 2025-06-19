import React, { useState } from 'react';
import { Habit, HabitFilter, HabitType, HabitFrequency } from '../../types/models';
import HabitCard from './HabitCard';
import './HabitList.css';

interface HabitListProps {
  habits: Habit[];
  onHabitClick?: (habit: Habit) => void;
  onHabitUpdate?: (id: string, data: Partial<Habit>) => void;
  onHabitDelete?: (id: string) => void;
  onHabitArchive?: (id: string) => void;
  showFilters?: boolean;
  onFilterChange?: (filters: HabitFilter) => void;
}

const HabitList: React.FC<HabitListProps> = ({
  habits,
  onHabitClick,
  onHabitUpdate,
  onHabitDelete,
  onHabitArchive,
  showFilters = true,
  onFilterChange,
}) => {
  const [filters, setFilters] = useState<HabitFilter>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleFilterChange = (newFilters: HabitFilter) => {
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const categories = Array.from(new Set(habits.map(h => h.category).filter(Boolean)));

  return (
    <div className="habit-list-container">
      {showFilters && (
        <div className="habit-filters">
          <div className="filter-group">
            <label>Type</label>
            <select
              value={filters.habit_type || ''}
              onChange={(e) => handleFilterChange({
                ...filters,
                habit_type: e.target.value as HabitType || undefined,
              })}
            >
              <option value="">All Types</option>
              <option value={HabitType.BUILD}>Build</option>
              <option value={HabitType.BREAK}>Break</option>
              <option value={HabitType.MAINTAIN}>Maintain</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Frequency</label>
            <select
              value={filters.frequency || ''}
              onChange={(e) => handleFilterChange({
                ...filters,
                frequency: e.target.value as HabitFrequency || undefined,
              })}
            >
              <option value="">All Frequencies</option>
              <option value={HabitFrequency.DAILY}>Daily</option>
              <option value={HabitFrequency.WEEKLY}>Weekly</option>
              <option value={HabitFrequency.MONTHLY}>Monthly</option>
              <option value={HabitFrequency.CUSTOM}>Custom</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Category</label>
            <select
              value={filters.category || ''}
              onChange={(e) => handleFilterChange({
                ...filters,
                category: e.target.value || undefined,
              })}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              value={filters.is_archived === true ? 'archived' : filters.is_active === false ? 'inactive' : ''}
              onChange={(e) => {
                const value = e.target.value;
                handleFilterChange({
                  ...filters,
                  is_archived: value === 'archived' ? true : undefined,
                  is_active: value === 'inactive' ? false : undefined,
                });
              }}
            >
              <option value="">All Habits</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="filter-group search-group">
            <input
              type="text"
              placeholder="Search habits..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange({
                ...filters,
                search: e.target.value || undefined,
              })}
            />
          </div>

          <div className="view-mode-toggle">
            <button
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
            </button>
            <button
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {habits.length === 0 ? (
        <div className="habit-empty-state">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor">
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
          <h3>No habits found</h3>
          <p>Create your first habit to start building better routines</p>
        </div>
      ) : (
        <div className={`habit-list ${viewMode}`}>
          {habits.map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onClick={() => onHabitClick?.(habit)}
              onUpdate={onHabitUpdate}
              onDelete={onHabitDelete}
              onArchive={onHabitArchive}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HabitList;