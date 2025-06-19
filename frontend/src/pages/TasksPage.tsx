import React, { useState } from 'react';
import TaskList from '../components/tasks/TaskList';
import { useTasks } from '../hooks/useTasks';
import { TaskCreate, TaskUpdate } from '../types/models';
import { AuthButton } from '../components/auth';
import './TasksPage.css';

const TasksPage: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  const {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    refetch,
  } = useTasks({
    autoRefresh: true,
    refreshInterval: 30000,
  });
  
  console.log('TasksPage state:', { tasks, loading, error });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTaskTitle.trim()) return;
    
    const taskData: TaskCreate = {
      title: newTaskTitle.trim(),
    };
    
    const result = await createTask(taskData);
    
    if (result) {
      setNewTaskTitle('');
      setShowCreateForm(false);
    }
  };

  const handleTaskUpdate = async (taskId: string, data: Partial<TaskUpdate>) => {
    await updateTask(taskId, data);
  };

  const handleTaskDelete = async (taskId: string) => {
    await deleteTask(taskId);
  };

  const handleTaskComplete = async (taskId: string) => {
    await completeTask(taskId);
  };

  const handleTaskClick = (task: any) => {
    // TODO: Open task detail modal/page
  };

  return (
    <div className="tasks-page">
      <header className="tasks-header">
        <div className="header-left">
          <h1>Tasks</h1>
        </div>
        <div className="header-right">
          <AuthButton />
        </div>
      </header>
      <div className="tasks-toolbar">
        <div className="tasks-actions">
          <button 
            className="btn-refresh"
            onClick={() => refetch()}
            disabled={loading}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor">
              <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Refresh
          </button>
          <button 
            className="btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor">
              <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2" strokeLinecap="round"/>
              <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            New Task
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div className="create-task-form">
          <form onSubmit={handleCreateTask}>
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="create-task-input"
              autoFocus
            />
            <div className="create-task-actions">
              <button 
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewTaskTitle('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="btn-primary"
                disabled={!newTaskTitle.trim()}
              >
                Add Task
              </button>
            </div>
          </form>
        </div>
      )}

      <TaskList
        tasks={tasks}
        onTaskClick={handleTaskClick}
        onTaskUpdate={handleTaskUpdate}
        onTaskDelete={handleTaskDelete}
        onTaskComplete={handleTaskComplete}
        loading={loading}
        error={error}
      />
    </div>
  );
};

export default TasksPage;