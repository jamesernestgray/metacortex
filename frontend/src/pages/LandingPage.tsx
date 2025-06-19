import React from 'react';
import { SignIn, SignUp, useAuth } from '@clerk/clerk-react';
import TasksPage from './TasksPage';
import '../styles/clerk-overrides.css';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const { isSignedIn } = useAuth();
  const [showSignUp, setShowSignUp] = React.useState(false);

  if (isSignedIn) {
    return <TasksPage />;
  }

  return (
    <main className="landing-page" role="main">
      <header className="landing-hero">
        <h1>Metacortex</h1>
        <p className="tagline">Your AI-powered productivity companion</p>
        
        <section className="features" aria-label="Features">
          <article className="feature">
            <div className="feature-icon" aria-hidden="true">📝</div>
            <h3>Task Management</h3>
            <p>Organize tasks with AI-powered prioritization</p>
          </article>
          <article className="feature">
            <div className="feature-icon" aria-hidden="true">📔</div>
            <h3>Smart Notes</h3>
            <p>Bi-directional linking and knowledge graph</p>
          </article>
          <article className="feature">
            <div className="feature-icon" aria-hidden="true">🎯</div>
            <h3>Habit Tracking</h3>
            <p>Build better habits with streak tracking</p>
          </article>
        </section>
      </header>

      <section className="auth-container" aria-label="Authentication">
        {showSignUp ? (
          <>
            <SignUp 
              appearance={{
                elements: {
                  rootBox: "clerk-root-box",
                  card: "clerk-card"
                }
              }}
            />
            <p className="auth-switch">
              Already have an account?{' '}
              <button 
                onClick={() => setShowSignUp(false)}
                aria-label="Switch to sign in form"
              >
                Sign In
              </button>
            </p>
          </>
        ) : (
          <>
            <SignIn 
              appearance={{
                elements: {
                  rootBox: "clerk-root-box",
                  card: "clerk-card"
                }
              }}
            />
            <p className="auth-switch">
              Don't have an account?{' '}
              <button 
                onClick={() => setShowSignUp(true)}
                aria-label="Switch to sign up form"
              >
                Sign Up
              </button>
            </p>
          </>
        )}
      </section>
    </main>
  );
};

export default LandingPage;