export interface User {
  _id?: string;
  id?: string;
  name?: string;
  username?: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

// Helper function to get the user's ID regardless of format
export const getUserId = (user: User): string => {
  return user.id || user._id || '';
};

// Helper function to get the user's display name
export const getUserDisplayName = (user: User): string => {
  return user.username || user.name || '';
}; 