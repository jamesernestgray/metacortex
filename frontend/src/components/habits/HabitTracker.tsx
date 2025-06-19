import React, { useState } from 'react';
import { HabitWithLogs, HabitLog } from '../../types/models';
import { habitHelpers } from '../../services/habits';
import './HabitTracker.css';

interface HabitTrackerProps {
  habits: HabitWithLogs[];
  completionRate: number;
  onCheckIn: (habitId: string) => void;
  onUncheckIn: (habitId: string, logId: string) => void;
  onHabitClick?: (habitId: string) => void;
}

const HabitTracker: React.FC<HabitTrackerProps> = ({
  habits,
  completionRate,
  onCheckIn,
  onUncheckIn,
  onHabitClick,
}) => {
  const [expandedHabits, setExpandedHabits] = useState<Set<string>>(new Set());

  const toggleExpanded = (habitId: string) => {
    const newExpanded = new Set(expandedHabits);
    if (newExpanded.has(habitId)) {
      newExpanded.delete(habitId);
    } else {
      newExpanded.add(habitId);
    }
    setExpandedHabits(newExpanded);
  };

  const isHabitCompletedToday = (logs: HabitLog[]): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return logs.some(log => log.date === today && log.completed);
  };

  const getTodaysLog = (logs: HabitLog[]) => {
    const today = new Date().toISOString().split('T')[0];
    return logs.find(log => log.date === today);
  };

  const groupedHabits = habitHelpers.groupHabitsByCategory(habits.map(h => h.habit));

  return (
    <div className="habit-tracker">
      <div className="tracker-header">
        <h2>Today's Habits</h2>
        <div className="tracker-stats">
          <div className="completion-rate">
            <div className="rate-circle" style={{ '--completion': completionRate } as React.CSSProperties}>
              <span>{completionRate}%</span>
            </div>
            <span className="rate-label">Complete</span>
          </div>
          <div className="habit-count">
            <span className="count">{habits.filter(h => isHabitCompletedToday(h.logs)).length}</span>
            <span className="total">/ {habits.length}</span>
          </div>
        </div>
      </div>

      {habits.length === 0 ? (
        <div className="tracker-empty">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <p>No habits scheduled for today</p>
        </div>
      ) : (
        <div className="tracker-habits">
          {Array.from(groupedHabits.entries()).map(([category, categoryHabits]) => {
            const categoryHabitsWithLogs = habits.filter(h => 
              categoryHabits.some(ch => ch.id === h.habit.id)
            );

            return (
              <div key={category} className="habit-category-group">
                <h3 className="category-title">{category}</h3>
                <div className="category-habits">
                  {categoryHabitsWithLogs.map(({ habit, logs }) => {
                    const isCompleted = isHabitCompletedToday(logs);
                    const todaysLog = getTodaysLog(logs);
                    const isExpanded = expandedHabits.has(habit.id);
                    const typeInfo = habitHelpers.getHabitTypeDisplay(habit.habit_type);

                    return (
                      <div
                        key={habit.id}
                        className={`tracker-habit ${isCompleted ? 'completed' : ''}`}
                      >
                        <div className="habit-main">
                          <button
                            className={`habit-checkbox ${isCompleted ? 'checked' : ''}`}
                            onClick={() => {
                              if (isCompleted && todaysLog) {
                                onUncheckIn(habit.id, todaysLog.id);
                              } else {
                                onCheckIn(habit.id);
                              }
                            }}
                            aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                          >
                            {isCompleted && (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M20 6L9 17l-5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </button>

                          <div 
                            className="habit-info"
                            onClick={() => onHabitClick?.(habit.id)}
                          >
                            <div className="habit-header">
                              <span className="habit-icon">{habit.icon || typeInfo.icon}</span>
                              <h4 className="habit-name">{habit.name}</h4>
                              {habit.target_count && habit.target_count > 1 && (
                                <span className="habit-target">
                                  {todaysLog?.value || 0} / {habit.target_count}
                                </span>
                              )}
                            </div>
                            
                            {habit.description && isExpanded && (
                              <p className="habit-description">{habit.description}</p>
                            )}

                            <div className="habit-meta">
                              <span className="habit-streak">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor">
                                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                                </svg>
                                {habit.streak_count} day streak
                              </span>
                              
                              {habit.frequency === 'weekly' && habit.target_days && (
                                <span className="habit-schedule">
                                  {habitHelpers.getWeekdayNames(habit.target_days).join(', ')}
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            className="habit-expand"
                            onClick={() => toggleExpanded(habit.id)}
                            aria-label={isExpanded ? 'Collapse' : 'Expand'}
                          >
                            <svg 
                              viewBox="0 0 24 24" 
                              width="20" 
                              height="20" 
                              fill="none" 
                              stroke="currentColor"
                              style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }}
                            >
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="habit-details">
                            <div className="recent-activity">
                              <h5>Recent Activity</h5>
                              <div className="activity-dots">
                                {Array.from({ length: 7 }, (_, i) => {
                                  const date = new Date();
                                  date.setDate(date.getDate() - (6 - i));
                                  const dateStr = date.toISOString().split('T')[0];
                                  const log = logs.find(l => l.date === dateStr);
                                  
                                  return (
                                    <div
                                      key={dateStr}
                                      className={`activity-dot ${log?.completed ? 'completed' : ''}`}
                                      title={date.toLocaleDateString('en-US', { weekday: 'short' })}
                                    />
                                  );
                                })}
                              </div>
                            </div>

                            {todaysLog?.notes && (
                              <div className="habit-notes">
                                <h5>Notes</h5>
                                <p>{todaysLog.notes}</p>
                              </div>
                            )}

                            <div className="habit-stats-mini">
                              <div className="stat">
                                <span className="stat-value">{habit.total_completions}</span>
                                <span className="stat-label">Total</span>
                              </div>
                              <div className="stat">
                                <span className="stat-value">{habit.best_streak}</span>
                                <span className="stat-label">Best Streak</span>
                              </div>
                              <div className="stat">
                                <span className="stat-value">
                                  {habit.last_completed 
                                    ? new Date(habit.last_completed).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                    : 'Never'
                                  }
                                </span>
                                <span className="stat-label">Last Done</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HabitTracker;