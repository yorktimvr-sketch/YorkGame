
import React, { useState } from 'react';
import { Button } from './Button';
import { User } from '../types';
import { Lock, User as UserIcon, LogIn, UserPlus, AlertCircle } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuth = () => {
    if (!username.trim() || !password.trim()) {
      setError('请填写所有字段');
      return;
    }

    const storedUsers = JSON.parse(localStorage.getItem('sweet_users') || '{}');

    if (isLoginView) {
      // Login
      if (storedUsers[username] && storedUsers[username] === password) {
        onLogin({ username });
      } else {
        setError('用户名或密码错误');
      }
    } else {
      // Register
      if (storedUsers[username]) {
        setError('该用户名已被注册');
      } else {
        storedUsers[username] = password;
        localStorage.setItem('sweet_users', JSON.stringify(storedUsers));
        onLogin({ username });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-pink-100 relative overflow-hidden">
        {/* Decorative background circle */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-pink-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-100 rounded-full blur-3xl opacity-50"></div>

        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">
            {isLoginView ? '欢迎回家' : '加入我们'}
          </h1>
          <p className="text-center text-slate-400 mb-8">
            {isLoginView ? '登录以开始转动轮盘' : '立即创建您的账户'}
          </p>

          <div className="space-y-4">
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-300" size={20} />
              <input
                type="text"
                placeholder="用户名"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all bg-slate-50"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-300" size={20} />
              <input
                type="password"
                placeholder="密码"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all bg-slate-50"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-xl">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <Button fullWidth onClick={handleAuth} size="lg" className="mt-4 shadow-pink-200">
              {isLoginView ? (
                <><LogIn size={20} /> 登录</>
              ) : (
                <><UserPlus size={20} /> 注册</>
              )}
            </Button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsLoginView(!isLoginView); setError(''); setUsername(''); setPassword(''); }}
              className="text-slate-500 hover:text-pink-500 font-medium text-sm underline decoration-pink-200 underline-offset-4 transition-colors"
            >
              {isLoginView ? "还没有账号？去注册" : "已有账号？去登录"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
