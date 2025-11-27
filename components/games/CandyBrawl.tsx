import React, { useState, useEffect } from 'react';
import { Button } from '../Button';
import { FightingStats } from '../../types';
import { Sword, Shield, Zap, Heart, RefreshCcw } from 'lucide-react';

const MAX_HP = 100;
const MAX_ENERGY = 100;

export const CandyBrawl: React.FC = () => {
  const [player, setPlayer] = useState<FightingStats>({ hp: MAX_HP, maxHp: MAX_HP, energy: 50, maxEnergy: MAX_ENERGY });
  const [enemy, setEnemy] = useState<FightingStats>({ hp: MAX_HP, maxHp: MAX_HP, energy: 50, maxEnergy: MAX_ENERGY });
  const [log, setLog] = useState<string[]>(['Battle Start! Choose your move.']);
  const [turn, setTurn] = useState<'PLAYER' | 'ENEMY'>('PLAYER');
  const [animating, setAnimating] = useState(false);

  const addLog = (msg: string) => {
    setLog(prev => [msg, ...prev].slice(0, 4));
  };

  const enemyAI = () => {
    setTimeout(() => {
      const actions = ['ATTACK', 'HEAL', 'CHARGE'];
      const action = actions[Math.floor(Math.random() * actions.length)];
      
      let dmg = 0;
      let heal = 0;
      let msg = '';

      if (action === 'ATTACK') {
        dmg = Math.floor(Math.random() * 15) + 5;
        msg = `Enemy attacks for ${dmg} damage!`;
        setPlayer(p => ({ ...p, hp: Math.max(0, p.hp - dmg) }));
      } else if (action === 'HEAL') {
        heal = 15;
        msg = `Enemy eats a donut and heals ${heal} HP!`;
        setEnemy(e => ({ ...e, hp: Math.min(e.maxHp, e.hp + heal) }));
      } else {
        msg = `Enemy is charging up energy!`;
        setEnemy(e => ({ ...e, energy: Math.min(e.maxEnergy, e.energy + 20) }));
      }
      addLog(msg);
      setTurn('PLAYER');
      setAnimating(false);
    }, 1000);
  };

  useEffect(() => {
    if (turn === 'ENEMY' && player.hp > 0 && enemy.hp > 0) {
      setAnimating(true);
      enemyAI();
    }
  }, [turn, player.hp, enemy.hp]);

  const handleAction = (action: 'ATTACK' | 'HEAL' | 'SPECIAL') => {
    if (turn !== 'PLAYER' || animating || player.hp <= 0 || enemy.hp <= 0) return;

    let dmg = 0;
    let heal = 0;
    let energyCost = 0;
    let msg = '';

    if (action === 'ATTACK') {
      dmg = Math.floor(Math.random() * 12) + 8;
      msg = `You threw a jawbreaker! ${dmg} damage.`;
      setEnemy(e => ({ ...e, hp: Math.max(0, e.hp - dmg) }));
      setPlayer(p => ({ ...p, energy: Math.min(p.maxEnergy, p.energy + 10) }));
    } else if (action === 'HEAL') {
      if (player.energy < 20) {
        addLog("Not enough energy to heal!");
        return;
      }
      energyCost = 20;
      heal = 20;
      msg = `You ate a cupcake. Recovered ${heal} HP.`;
      setPlayer(p => ({ ...p, hp: Math.min(p.maxHp, p.hp + heal), energy: p.energy - energyCost }));
    } else if (action === 'SPECIAL') {
      if (player.energy < 50) {
        addLog("Need 50 energy for Sugar Rush!");
        return;
      }
      energyCost = 50;
      dmg = 35;
      msg = `SUGAR RUSH!! Massive hit for ${dmg} damage!`;
      setEnemy(e => ({ ...e, hp: Math.max(0, e.hp - dmg) }));
      setPlayer(p => ({ ...p, energy: p.energy - energyCost }));
    }

    addLog(msg);
    setTurn('ENEMY');
  };

  const resetGame = () => {
    setPlayer({ hp: MAX_HP, maxHp: MAX_HP, energy: 50, maxEnergy: MAX_ENERGY });
    setEnemy({ hp: MAX_HP, maxHp: MAX_HP, energy: 50, maxEnergy: MAX_ENERGY });
    setLog(['New battle started!']);
    setTurn('PLAYER');
    setAnimating(false);
  };

  const HealthBar = ({ current, max, color }: { current: number, max: number, color: string }) => (
    <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden mb-1">
      <div 
        className={`h-full transition-all duration-500 ${color}`} 
        style={{ width: `${(current / max) * 100}%` }} 
      />
    </div>
  );

  return (
    <div className="max-w-xl mx-auto p-4 w-full">
      {/* Battle Arena */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-slate-100">
        <div className="p-6 bg-gradient-to-b from-blue-50 to-white">
          
          {/* Enemy */}
          <div className="flex flex-col items-center mb-8">
            <div className={`text-6xl mb-2 transition-transform duration-300 ${animating ? 'scale-110' : ''}`}>👾</div>
            <div className="w-full max-w-[200px]">
              <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                <span>SOUR MONSTER</span>
                <span>{enemy.hp}/{enemy.maxHp}</span>
              </div>
              <HealthBar current={enemy.hp} max={enemy.maxHp} color="bg-red-500" />
            </div>
          </div>

          {/* VS Divider */}
          <div className="flex justify-center my-4">
             <span className="bg-slate-100 text-slate-400 px-3 py-1 rounded-full text-xs font-bold">VS</span>
          </div>

          {/* Player */}
          <div className="flex flex-col items-center mt-2">
            <div className="w-full max-w-[200px]">
              <HealthBar current={player.hp} max={player.maxHp} color="bg-green-500" />
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mt-1">
                <div 
                  className="h-full bg-yellow-400 transition-all duration-300" 
                  style={{ width: `${(player.energy / player.maxEnergy) * 100}%` }} 
                />
              </div>
               <div className="flex justify-between text-xs font-bold text-slate-500 mt-1">
                <span>YOU</span>
                <span>{player.hp}/{player.maxHp}</span>
              </div>
            </div>
            <div className={`text-6xl mt-2 ${turn === 'PLAYER' ? 'animate-bounce' : ''}`}>🦸</div>
          </div>
        </div>

        {/* Action Log */}
        <div className="bg-slate-50 p-3 h-24 overflow-y-auto border-t border-slate-100">
          {log.map((l, i) => (
            <div key={i} className={`text-sm ${i === 0 ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
              {i === 0 ? '> ' : ''}{l}
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="p-4 grid grid-cols-2 gap-3 bg-white">
          {player.hp <= 0 || enemy.hp <= 0 ? (
            <Button fullWidth onClick={resetGame} variant="primary" className="col-span-2">
              <RefreshCcw size={18} /> Play Again
            </Button>
          ) : (
            <>
              <Button 
                onClick={() => handleAction('ATTACK')} 
                disabled={turn !== 'PLAYER'}
                className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
              >
                <Sword size={18} /> Attack
              </Button>
              <Button 
                onClick={() => handleAction('HEAL')} 
                disabled={turn !== 'PLAYER' || player.energy < 20}
                className="bg-green-50 text-green-600 hover:bg-green-100 border border-green-100"
              >
                <Heart size={18} /> Heal (20E)
              </Button>
              <Button 
                onClick={() => handleAction('SPECIAL')} 
                disabled={turn !== 'PLAYER' || player.energy < 50}
                className="col-span-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-yellow-200"
              >
                <Zap size={18} /> Sugar Rush (50E)
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};