import React, { useState } from 'react';
import {
  Task,
  TaskFilter,
} from '../../types/models';
import { taskHelpers } from '../../services/tasks';
import TaskItem from './TaskItem';
import TaskFilters from './TaskFilters';
import './TaskList.css';

interface TaskListProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onTaskUpdate?: (taskId: string, data: Partial<Task>) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskComplete?: (taskId: string) => void;
  loading?: boolean;
  error?: string | null;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onTaskClick,
  onTaskUpdate,
  onTaskDelete,
  onTaskComplete,
  loading = false,
  error = null,
}) => {
  const [filter, setFilter] = useState<TaskFilter>({});
  const [sortBy, setSortBy] = useState<'due_date' | 'priority' | 'created_at' | 'title'>('created_at');
  const [sortDesc, setSortDesc] = useState(false);
  const [groupBy, setGroupBy] = useState<'none' | 'status' | 'project' | 'date'>('none');

  // Apply filters
  let filteredTasks = tasks;
  
  if (filter.status) {
    filteredTasks = filteredTasks.filter(task => task.status === filter.status);
  }
  
  if (filter.priority) {
    filteredTasks = filteredTasks.filter(task => task.priority === filter.priority);
  }
  
  if (filter.project_id) {
    filteredTasks = filteredTasks.filter(task => task.project_id === filter.project_id);
  }
  
  if (filter.is_overdue) {
    filteredTasks = taskHelpers.getOverdueTasks(filteredTasks);
  }
  
  if (filter.search) {
    const searchLower = filter.search.toLowerCase();
    filteredTasks = filteredTasks.filter(task =>
      task.title.toLowerCase().includes(searchLower) ||
      task.description?.toLowerCase().includes(searchLower) ||
      task.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }

  // Apply sorting
  const sortedTasks = taskHelpers.sortTasks(filteredTasks, sortBy, sortDesc);

  // Render grouped tasks
  const renderGroupedTasks = () => {
    switch (groupBy) {
      case 'status':
        const statusGroups = taskHelpers.groupTasksByStatus(sortedTasks);
        return Object.entries(statusGroups).map(([status, groupTasks]) => (
          groupTasks.length > 0 && (
            <div key={status} className="task-group">
              <h3 className="task-group-title">
                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                <span className="task-count">({groupTasks.length})</span>
              </h3>
              <div className="task-group-items">
                {groupTasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onClick={() => onTaskClick?.(task)}
                    onUpdate={(data) => onTaskUpdate?.(task.id, data)}
                    onDelete={() => onTaskDelete?.(task.id)}
                    onComplete={() => onTaskComplete?.(task.id)}
                  />
                ))}
              </div>
            </div>
          )
        ));

      case 'project':
        const projectGroups = taskHelpers.groupTasksByProject(sortedTasks);
        return Array.from(projectGroups.entries()).map(([projectId, groupTasks]) => (
          <div key={projectId || 'no-project'} className="task-group">
            <h3 className="task-group-title">
              {groupTasks[0]?.project?.name || 'No Project'}
              <span className="task-count">({groupTasks.length})</span>
            </h3>
            <div className="task-group-items">
              {groupTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onClick={() => onTaskClick?.(task)}
                  onUpdate={(data) => onTaskUpdate?.(task.id, data)}
                  onDelete={() => onTaskDelete?.(task.id)}
                  onComplete={() => onTaskComplete?.(task.id)}
                />
              ))}
            </div>
          </div>
        ));

      case 'date':
        const todayTasks = taskHelpers.getTasksDueToday(sortedTasks);
        const weekTasks = taskHelpers.getTasksDueThisWeek(sortedTasks)
          .filter(task => !todayTasks.includes(task));
        const overdueTasks = taskHelpers.getOverdueTasks(sortedTasks);
        const otherTasks = sortedTasks.filter(task => 
          !todayTasks.includes(task) && 
          !weekTasks.includes(task) && 
          !overdueTasks.includes(task)
        );

        return (
          <>
            {overdueTasks.length > 0 && (
              <div className="task-group task-group-overdue">
                <h3 className="task-group-title">
                  Overdue
                  <span className="task-count">({overdueTasks.length})</span>
                </h3>
                <div className="task-group-items">
                  {overdueTasks.map(task => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onClick={() => onTaskClick?.(task)}
                      onUpdate={(data) => onTaskUpdate?.(task.id, data)}
                      onDelete={() => onTaskDelete?.(task.id)}
                      onComplete={() => onTaskComplete?.(task.id)}
                    />
                  ))}
                </div>
              </div>
            )}
            {todayTasks.length > 0 && (
              <div className="task-group">
                <h3 className="task-group-title">
                  Today
                  <span className="task-count">({todayTasks.length})</span>
                </h3>
                <div className="task-group-items">
                  {todayTasks.map(task => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onClick={() => onTaskClick?.(task)}
                      onUpdate={(data) => onTaskUpdate?.(task.id, data)}
                      onDelete={() => onTaskDelete?.(task.id)}
                      onComplete={() => onTaskComplete?.(task.id)}
                    />
                  ))}
                </div>
              </div>
            )}
            {weekTasks.length > 0 && (
              <div className="task-group">
                <h3 className="task-group-title">
                  This Week
                  <span className="task-count">({weekTasks.length})</span>
                </h3>
                <div className="task-group-items">
                  {weekTasks.map(task => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onClick={() => onTaskClick?.(task)}
                      onUpdate={(data) => onTaskUpdate?.(task.id, data)}
                      onDelete={() => onTaskDelete?.(task.id)}
                      onComplete={() => onTaskComplete?.(task.id)}
                    />
                  ))}
                </div>
              </div>
            )}
            {otherTasks.length > 0 && (
              <div className="task-group">
                <h3 className="task-group-title">
                  Later
                  <span className="task-count">({otherTasks.length})</span>
                </h3>
                <div className="task-group-items">
                  {otherTasks.map(task => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onClick={() => onTaskClick?.(task)}
                      onUpdate={(data) => onTaskUpdate?.(task.id, data)}
                      onDelete={() => onTaskDelete?.(task.id)}
                      onComplete={() => onTaskComplete?.(task.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        );

      default:
        return (
          <div className="task-list-items">
            {sortedTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onClick={() => onTaskClick?.(task)}
                onUpdate={(data) => onTaskUpdate?.(task.id, data)}
                onDelete={() => onTaskDelete?.(task.id)}
                onComplete={() => onTaskComplete?.(task.id)}
              />
            ))}
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="task-list-loading">
        <div className="loading-spinner" />
        <p>Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="task-list-error">
        <p>Error loading tasks: {error}</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      <TaskFilters
        filter={filter}
        onFilterChange={setFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortDesc={sortDesc}
        onSortDescChange={setSortDesc}
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
      />
      
      <div className="task-list-content">
        {sortedTasks.length === 0 ? (
          <div className="task-list-empty">
            <p>No tasks found</p>
          </div>
        ) : (
          renderGroupedTasks()
        )}
      </div>
    </div>
  );
};

export default TaskList;