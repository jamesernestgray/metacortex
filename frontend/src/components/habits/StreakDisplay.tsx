import React from 'react';
import { HabitStreak } from '../../types/models';
import { habitHelpers } from '../../services/habits';
import './StreakDisplay.css';

interface StreakDisplayProps {
  streaks: HabitStreak[];
  onHabitClick?: (habitId: string) => void;
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({
  streaks,
  onHabitClick,
}) => {
  // Sort streaks by current streak count (descending)
  const sortedStreaks = [...streaks].sort((a, b) => b.current_streak - a.current_streak);
  
  // Get top streaks
  const topStreaks = sortedStreaks.slice(0, 3);
  const activeStreaks = sortedStreaks.filter(s => s.current_streak > 0);
  const longestStreak = sortedStreaks.reduce((max, s) => 
    s.best_streak > max ? s.best_streak : max, 0
  );

  return (
    <div className="streak-display">
      <div className="streak-header">
        <h2>Habit Streaks</h2>
        <div className="streak-summary">
          <div className="summary-stat">
            <span className="stat-value">{activeStreaks.length}</span>
            <span className="stat-label">Active Streaks</span>
          </div>
          <div className="summary-stat">
            <span className="stat-value">{longestStreak}</span>
            <span className="stat-label">Longest Ever</span>
          </div>
        </div>
      </div>

      {streaks.length === 0 ? (
        <div className="streak-empty">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          <p>No active streaks yet. Start building habits!</p>
        </div>
      ) : (
        <>
          {topStreaks.length > 0 && (
            <div className="top-streaks">
              <h3>Top Streaks</h3>
              <div className="streak-podium">
                {topStreaks.map((streak, index) => (
                  <div
                    key={streak.habit.id}
                    className={`podium-item rank-${index + 1}`}
                    onClick={() => onHabitClick?.(streak.habit.id)}
                  >
                    <div className="podium-rank">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                    </div>
                    <div className="podium-habit">
                      <span className="habit-icon">{streak.habit.icon || '🎯'}</span>
                      <span className="habit-name">{streak.habit.name}</span>
                    </div>
                    <div className="podium-streak">
                      <span className="streak-count">{streak.current_streak}</span>
                      <span className="streak-label">days</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="all-streaks">
            <h3>All Streaks</h3>
            <div className="streak-list">
              {sortedStreaks.map(streak => {
                const isActive = streak.current_streak > 0;
                const streakStatus = isActive ? 'active' : 'broken';
                
                return (
                  <div
                    key={streak.habit.id}
                    className={`streak-item ${streakStatus}`}
                    onClick={() => onHabitClick?.(streak.habit.id)}
                  >
                    <div className="streak-habit">
                      <span className="habit-icon">{streak.habit.icon || '🎯'}</span>
                      <div className="habit-details">
                        <h4 className="habit-name">{streak.habit.name}</h4>
                        <span className="habit-category">{streak.habit.category}</span>
                      </div>
                    </div>
                    
                    <div className="streak-stats">
                      <div className="current-streak">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor">
                          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                        </svg>
                        <span className={`streak-number ${isActive ? 'active' : ''}`}>
                          {streak.current_streak}
                        </span>
                        <span className="streak-text">current</span>
                      </div>
                      
                      <div className="best-streak">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span className="streak-number">{streak.best_streak}</span>
                        <span className="streak-text">best</span>
                      </div>
                    </div>

                    <div className="streak-visual">
                      <div className="streak-bar">
                        <div 
                          className="streak-fill current"
                          style={{ 
                            width: `${(streak.current_streak / Math.max(streak.best_streak, streak.current_streak)) * 100}%` 
                          }}
                        />
                        <div 
                          className="streak-fill best"
                          style={{ 
                            width: `${100}%`,
                            opacity: 0.2
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="streak-achievements">
            <h3>Milestones</h3>
            <div className="achievement-grid">
              {activeStreaks.filter(s => s.current_streak >= 7).length > 0 && (
                <div className="achievement">
                  <div className="achievement-icon">🔥</div>
                  <div className="achievement-info">
                    <span className="achievement-name">Week Warrior</span>
                    <span className="achievement-count">
                      {activeStreaks.filter(s => s.current_streak >= 7).length} habits
                    </span>
                  </div>
                </div>
              )}
              
              {activeStreaks.filter(s => s.current_streak >= 30).length > 0 && (
                <div className="achievement">
                  <div className="achievement-icon">💪</div>
                  <div className="achievement-info">
                    <span className="achievement-name">Monthly Master</span>
                    <span className="achievement-count">
                      {activeStreaks.filter(s => s.current_streak >= 30).length} habits
                    </span>
                  </div>
                </div>
              )}
              
              {activeStreaks.filter(s => s.current_streak >= 100).length > 0 && (
                <div className="achievement">
                  <div className="achievement-icon">👑</div>
                  <div className="achievement-info">
                    <span className="achievement-name">Century Club</span>
                    <span className="achievement-count">
                      {activeStreaks.filter(s => s.current_streak >= 100).length} habits
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StreakDisplay;