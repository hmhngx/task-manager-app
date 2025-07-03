import React from 'react';
import { User } from '../types/user';

const getInitial = (user: User) => {
  if (!user) return 'U';
  
  // Handle different user object structures
  const username = user.username || user.name || '';
  const email = user.email || '';
  
  if (username) {
    return username.charAt(0).toUpperCase();
  }
  
  if (email) {
    return email.charAt(0).toUpperCase();
  }
  
  return 'U';
};

const UserAvatar: React.FC<{ user: User; className?: string }> = ({ user, className = '' }) => (
  <div className={`h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold ${className}`}>
    {getInitial(user)}
  </div>
);

export default UserAvatar; 