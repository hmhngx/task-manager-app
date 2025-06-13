import React from 'react';
import { User } from '../types/user';

const getInitial = (user: User) =>
  user?.username?.charAt(0).toUpperCase() ||
  user?.name?.charAt(0).toUpperCase() ||
  user?.email?.charAt(0).toUpperCase() ||
  'U';

const UserAvatar: React.FC<{ user: User; className?: string }> = ({ user, className = '' }) => (
  <div className={`h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold ${className}`}>
    {getInitial(user)}
  </div>
);

export default UserAvatar; 