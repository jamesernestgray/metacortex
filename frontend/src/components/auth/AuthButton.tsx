import React from 'react';
import { useAuth, useUser, UserButton, SignInButton } from '@clerk/clerk-react';
import './AuthButton.css';

export const AuthButton: React.FC = () => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  if (isSignedIn && user) {
    return (
      <div className="auth-button">
        <span className="user-email">{user.primaryEmailAddress?.emailAddress}</span>
        <UserButton afterSignOutUrl="/" />
      </div>
    );
  }

  return (
    <div className="auth-button">
      <SignInButton mode="modal">
        <button className="sign-in-btn">Sign In</button>
      </SignInButton>
    </div>
  );
};