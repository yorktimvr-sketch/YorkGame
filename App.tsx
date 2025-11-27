
import React, { useState, useEffect } from 'react';
import { GameState, User } from './types';
import { AuthScreen } from './components/AuthScreen';
import { WelcomeScreen } from './components/WelcomeScreen';
import { DoubleWheelGame } from './components/DoubleWheelGame';

const App: React.FC = () => {
  const [view, setView] = useState<GameState>('AUTH');
  const [user, setUser] = useState<User | null>(null);

  // Check for existing session (optional, but good UX)
  useEffect(() => {
    const savedUser = localStorage.getItem('sweet_current_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setView('GAME'); // Skip welcome if already logged in for faster access, or set to 'WELCOME' if you always want the effect
    }
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('sweet_current_user', JSON.stringify(newUser));
    setView('WELCOME');
  };

  const handleEnterGame = () => {
    setView('GAME');
  };

  const handleLogout = () => {
    localStorage.removeItem('sweet_current_user');
    setUser(null);
    setView('AUTH');
  };

  return (
    <div className="min-h-screen bg-pink-50 font-fredoka text-slate-800">
      {view === 'AUTH' && (
        <AuthScreen onLogin={handleLogin} />
      )}
      
      {view === 'WELCOME' && user && (
        <WelcomeScreen username={user.username} onEnter={handleEnterGame} />
      )}
      
      {view === 'GAME' && user && (
        <DoubleWheelGame username={user.username} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default App;
