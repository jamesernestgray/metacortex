import React from 'react';
import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import TasksPage from './pages/TasksPage';
import LandingPage from './pages/LandingPage';
import './styles/variables.css';
import './App.css';

const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY!;

function AppContent() {
  const { isSignedIn } = useAuth();
  
  return (
    <div className="App">
      {isSignedIn ? <TasksPage /> : <LandingPage />}
    </div>
  );
}

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <AppContent />
    </ClerkProvider>
  );
}

export default App;
