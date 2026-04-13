import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const resp = await axios.post('/api/auth/signup', { name, email, password });
      await login(resp.data.access_token);
      navigate('/');
    } catch (error) {
      setErr(error.response?.data?.detail || 'Signup failed');
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      const res = await axios.post('/api/auth/google', { token: response.credential });
      await login(res.data.access_token);
      navigate('/');
    } catch (error) {
      setErr('Google signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d1017]">
      <div className="bg-[#161b22] p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-800">
        <h2 className="text-3xl font-bold text-center text-white mb-6">Create Account</h2>
        
        {err && (
          <div className="mb-4 bg-red-500/20 border border-red-500 text-red-300 p-3 rounded text-sm text-center">
            {err}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
            <input
              type="text"
              required
              className="w-full bg-[#0d1017] border border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full bg-[#0d1017] border border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full bg-[#0d1017] border border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition-colors"
          >
            Sign Up
          </button>
        </form>

        <div className="mt-6 flex items-center">
          <div className="flex-1 w-full h-px bg-gray-700"></div>
          <span className="px-3 text-sm text-gray-500">or</span>
          <div className="flex-1 w-full h-px bg-gray-700"></div>
        </div>

        <div className="mt-6 flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setErr('Google Signup Failed')}
            theme="filled_black"
          />
        </div>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-500 hover:text-blue-400">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
