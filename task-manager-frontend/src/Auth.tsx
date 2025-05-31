import React, { useState } from 'react';
import axios from 'axios';

interface AuthProps {
  onLogin: (token: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      const endpoint = isLogin ? 'login' : 'register';
      const response = await axios.post(
        `http://localhost:3000/auth/${endpoint}`,
        {
          username,
          password,
        }
      );
      if (isLogin) {
        onLogin(response.data.access_token);
      } else {
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
      <button
        onClick={handleSubmit}
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        disabled={!username || !password}
      >
        {isLogin ? 'Login' : 'Register'}
      </button>
      <button
        onClick={() => setIsLogin(!isLogin)}
        className="mt-4 text-blue-500 hover:underline"
      >
        {isLogin
          ? 'Need an account? Register'
          : 'Already have an account? Login'}
      </button>
    </div>
  );
};

export default Auth;
