
import React, { useEffect, useState } from 'react';
import { Button } from './Button';
import { Sparkles, Star, Heart, Music, Zap } from 'lucide-react';

interface WelcomeScreenProps {
  username: string;
  onEnter: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ username, onEnter }) => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowButton(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col items-center justify-center z-50">
      
      {/* Floating Background Elements */}
      <div className="absolute top-10 left-10 text-yellow-300 opacity-30 animate-float">
        <Star size={60} fill="currentColor" />
      </div>
      <div className="absolute bottom-20 right-10 text-pink-400 opacity-30 animate-float-delay-1">
        <Heart size={80} fill="currentColor" />
      </div>
      <div className="absolute top-1/3 right-1/4 text-purple-300 opacity-20 animate-float-delay-2">
        <Music size={50} />
      </div>
       <div className="absolute bottom-1/3 left-1/4 text-cyan-300 opacity-20 animate-float">
        <Zap size={50} fill="currentColor" />
      </div>
      
      {/* Dynamic Particles (Simple CSS implementation) */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white opacity-10 animate-pulse"
          style={{
            width: Math.random() * 10 + 2 + 'px',
            height: Math.random() * 10 + 2 + 'px',
            top: Math.random() * 100 + '%',
            left: Math.random() * 100 + '%',
            animationDuration: Math.random() * 3 + 1 + 's',
            animationDelay: Math.random() * 2 + 's',
          }}
        />
      ))}

      {/* Main Content */}
      <div className="relative z-10 text-center p-8">
        <div className="animate-pop-in">
           <div className="inline-block mb-4 p-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_0_50px_rgba(236,72,153,0.5)]">
             <Sparkles size={64} className="text-yellow-300 animate-spin-slow" />
           </div>
           
           <h2 className="text-3xl md:text-4xl text-pink-200 font-light mb-2 tracking-wide">欢迎回家</h2>
           <h1 className="text-5xl md:text-7xl font-black text-white mb-8 drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] bg-clip-text text-transparent bg-gradient-to-r from-pink-300 via-purple-200 to-cyan-200 animate-pulse">
             {username}
           </h1>
        </div>

        <div className={`transition-all duration-1000 transform ${showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <button
            onClick={onEnter}
            className="group relative px-12 py-5 bg-white text-purple-900 text-xl font-bold rounded-full shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:shadow-[0_0_50px_rgba(255,255,255,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-3">
              进入游戏 <span className="group-hover:translate-x-1 transition-transform">→</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-pink-200 to-purple-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      </div>
    </div>
  );
};
