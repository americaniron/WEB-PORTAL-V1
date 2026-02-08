import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { Lock, Mail, Loader2, Hammer } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('admin@americaniron.com');
  const [password, setPassword] = useState('IronStrong!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await api.auth.login(email, password);
      onLogin(user);
    } catch (err) {
      setError('Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-catblack flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
            <div className="bg-catyellow p-3 rounded-lg shadow-lg shadow-catyellow/20">
                <Hammer className="w-10 h-10 text-catblack" />
            </div>
        </div>
        <h2 className="mt-6 text-center text-4xl font-bold text-white tracking-wide uppercase font-heading">
          American Iron
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-500 uppercase tracking-widest font-black">
          Management Portal Access
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-lg sm:px-10 border-t-4 border-catyellow">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-700">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-zinc-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus:ring-catyellow focus:border-catyellow block w-full pl-10 sm:text-sm border-zinc-300 rounded-md py-2 border"
                  placeholder="admin@americaniron.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-zinc-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:ring-catyellow focus:border-catyellow block w-full pl-10 sm:text-sm border-zinc-300 rounded-md py-2 border"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-700 text-sm bg-red-50 p-2 rounded border border-red-100">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-catblack bg-catyellow hover:bg-[#E6B800] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-catyellow disabled:opacity-50 transition-colors uppercase tracking-wider"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Access Portal'}
              </button>
            </div>
          </form>
          <div className="mt-6 text-center text-xs text-zinc-400 font-bold uppercase tracking-widest">
             Protected System • American Iron US
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;