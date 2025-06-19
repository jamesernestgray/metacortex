import React from 'react';
import { useAuth } from '@clerk/clerk-react';
import { SignIn } from '@clerk/clerk-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoaded, isSignedIn } = useAuth();

  // Wait for Clerk to load
  if (!isLoaded) {
    return <div className="loading">Loading...</div>;
  }

  // Show sign-in if not authenticated
  if (!isSignedIn) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <SignIn />
      </div>
    );
  }

  // Show protected content
  return <>{children}</>;
};