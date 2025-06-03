import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import Button from './components/ui/Button';

const Auth: React.FC = () => {
  const { login, register } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      if (isLogin) {
        await login(username, password);
      } else {
        await register(username, password);
        setIsLogin(true);
        setError('Registration successful. Please log in.');
      }
    } catch (err) {
      setError('Invalid credentials or username taken');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">
        {isLogin ? 'Login' : 'Register'}
      </h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      />
      <Button
        onClick={handleSubmit}
        variant="primary"
        className="w-full shadow-neon-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        aria-label={isLogin ? 'Login' : 'Register'}
        disabled={!username || !password}
        loading={false}
      >
        {isLogin ? 'Login' : 'Register'}
      </Button>
      <Button
        onClick={() => setIsLogin(!isLogin)}
        variant="ghost"
        className="mt-4 text-blue-500 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        aria-label={isLogin ? 'Switch to Register' : 'Switch to Login'}
      >
        {isLogin
          ? 'Need an account? Register'
          : 'Already have an account? Login'}
      </Button>
    </div>
  );
};

export default Auth;
