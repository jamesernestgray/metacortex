import React, { useState } from 'react';
import { 
  HabitList, 
  HabitTracker, 
  StreakDisplay 
} from '../components/habits';
import { 
  useHabits, 
  useTodaysHabits, 
  useHabitStreaks, 
  useHabitStats 
} from '../hooks/useHabits';
import { HabitCreate, HabitType, HabitFrequency } from '../types/models';
import './HabitsPage.css';

const HabitsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'today' | 'all' | 'streaks'>('today');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  
  // Hooks
  const { habits, createHabit, updateHabit, deleteHabit, archiveHabit } = useHabits();
  const { habits: todaysHabits, completionRate, checkIn, uncheckIn } = useTodaysHabits();
  const { streaks } = useHabitStreaks();
  const { stats } = useHabitStats();

  const handleCreateHabit = async (data: HabitCreate) => {
    const result = await createHabit(data);
    if (result) {
      setShowCreateModal(false);
    }
  };

  const handleHabitClick = (habitId: string) => {
    setSelectedHabitId(habitId);
    // In a real app, this would open a habit detail modal or navigate to a detail page
  };

  return (
    <div className="habits-page">
      <div className="page-header">
        <h1>Habits</h1>
        <button 
          className="create-habit-btn"
          onClick={() => setShowCreateModal(true)}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Habit
        </button>
      </div>

      {stats && (
        <div className="habits-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Habits</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.active}</div>
            <div className="stat-label">Active</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.completion_rate_today}%</div>
            <div className="stat-label">Today's Progress</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.monthly_logs}</div>
            <div className="stat-label">This Month</div>
          </div>
        </div>
      )}

      <div className="habits-tabs">
        <button
          className={`tab ${activeTab === 'today' ? 'active' : ''}`}
          onClick={() => setActiveTab('today')}
        >
          Today
        </button>
        <button
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Habits
        </button>
        <button
          className={`tab ${activeTab === 'streaks' ? 'active' : ''}`}
          onClick={() => setActiveTab('streaks')}
        >
          Streaks
        </button>
      </div>

      <div className="habits-content">
        {activeTab === 'today' && (
          <HabitTracker
            habits={todaysHabits}
            completionRate={completionRate}
            onCheckIn={checkIn}
            onUncheckIn={uncheckIn}
            onHabitClick={handleHabitClick}
          />
        )}

        {activeTab === 'all' && (
          <HabitList
            habits={habits}
            onHabitClick={(habit) => handleHabitClick(habit.id)}
            onHabitUpdate={updateHabit}
            onHabitDelete={deleteHabit}
            onHabitArchive={archiveHabit}
          />
        )}

        {activeTab === 'streaks' && (
          <StreakDisplay
            streaks={streaks}
            onHabitClick={handleHabitClick}
          />
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Habit</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const targetDays = formData.get('target_days') as string;
                
                handleCreateHabit({
                  name: formData.get('name') as string,
                  description: formData.get('description') as string || undefined,
                  category: formData.get('category') as string || undefined,
                  habit_type: formData.get('habit_type') as HabitType,
                  frequency: formData.get('frequency') as HabitFrequency,
                  target_count: parseInt(formData.get('target_count') as string) || 1,
                  target_days: targetDays ? targetDays.split(',').map(Number) : undefined,
                  color: formData.get('color') as string || undefined,
                  icon: formData.get('icon') as string || undefined,
                });
              }}
            >
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder="e.g., Morning Exercise"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  placeholder="Add a description..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="habit_type">Type</label>
                  <select id="habit_type" name="habit_type" defaultValue={HabitType.BUILD}>
                    <option value={HabitType.BUILD}>Build</option>
                    <option value={HabitType.BREAK}>Break</option>
                    <option value={HabitType.MAINTAIN}>Maintain</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="frequency">Frequency</label>
                  <select id="frequency" name="frequency" defaultValue={HabitFrequency.DAILY}>
                    <option value={HabitFrequency.DAILY}>Daily</option>
                    <option value={HabitFrequency.WEEKLY}>Weekly</option>
                    <option value={HabitFrequency.MONTHLY}>Monthly</option>
                    <option value={HabitFrequency.CUSTOM}>Custom</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    placeholder="e.g., Health"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="target_count">Target Count</label>
                  <input
                    type="number"
                    id="target_count"
                    name="target_count"
                    min="1"
                    defaultValue="1"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="color">Color</label>
                  <input
                    type="color"
                    id="color"
                    name="color"
                    defaultValue="#6366f1"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="icon">Icon</label>
                  <input
                    type="text"
                    id="icon"
                    name="icon"
                    placeholder="e.g., 🏃"
                    maxLength={2}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary">
                  Create Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitsPage;