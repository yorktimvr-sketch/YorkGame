import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '../Button';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Skull } from 'lucide-react';

// 0: Empty, 1: Wall, 2: Dot, 3: Player, 4: Enemy
type CellType = 0 | 1 | 2 | 3 | 4;
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null;

const GRID_SIZE = 15;
const INITIAL_MAP: number[][] = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
  [1, 2, 2, 2, 2, 2, 1, 0, 1, 2, 2, 2, 2, 2, 1],
  [1, 1, 1, 1, 1, 2, 1, 0, 1, 2, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 2, 0, 4, 0, 2, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1],
  [1, 2, 2, 2, 2, 2, 2, 3, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
  [1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1],
  [1, 1, 2, 2, 1, 1, 1, 2, 1, 1, 1, 2, 2, 1, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

export const SugarMaze: React.FC = () => {
  const [grid, setGrid] = useState<number[][]>(JSON.parse(JSON.stringify(INITIAL_MAP)));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [playerPos, setPlayerPos] = useState({ x: 7, y: 9 });
  const [enemyPos, setEnemyPos] = useState({ x: 7, y: 7 });
  const directionRef = useRef<Direction>(null);
  const gameLoopRef = useRef<number | null>(null);

  const resetGame = () => {
    setGrid(JSON.parse(JSON.stringify(INITIAL_MAP)));
    setScore(0);
    setGameOver(false);
    setWin(false);
    setPlayerPos({ x: 7, y: 9 });
    setEnemyPos({ x: 7, y: 7 });
    directionRef.current = null;
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    startGameLoop();
  };

  const moveEntity = (
    currentPos: { x: number; y: number },
    dir: Direction,
    isPlayer: boolean
  ) => {
    let newX = currentPos.x;
    let newY = currentPos.y;

    if (dir === 'UP') newY--;
    if (dir === 'DOWN') newY++;
    if (dir === 'LEFT') newX--;
    if (dir === 'RIGHT') newX++;

    if (grid[newY][newX] === 1) return currentPos; // Wall

    return { x: newX, y: newY };
  };

  const gameTick = useCallback(() => {
    if (gameOver || win) return;

    // Move Player
    if (directionRef.current) {
      setPlayerPos((prev) => {
        const next = moveEntity(prev, directionRef.current, true);
        
        // Check dot collection
        setGrid((g) => {
          const newGrid = g.map(row => [...row]);
          if (newGrid[next.y][next.x] === 2) {
             newGrid[next.y][next.x] = 0;
          }
          return newGrid;
        });
        
        if (grid[next.y][next.x] === 2) {
           setScore(s => s + 10);
        }

        return next;
      });
    }

    // Move Enemy (Simple AI: Move towards player randomly)
    setEnemyPos((prev) => {
      const possibleMoves: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
      // Filter out walls
      const validMoves = possibleMoves.filter(d => {
        const pos = moveEntity(prev, d, false);
        return pos.x !== prev.x || pos.y !== prev.y;
      });
      
      const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
      return moveEntity(prev, randomMove, false);
    });

  }, [gameOver, win, grid]);

  // Check Collisions and Win Condition
  useEffect(() => {
    if (playerPos.x === enemyPos.x && playerPos.y === enemyPos.y) {
      setGameOver(true);
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }

    // Check win (no dots left)
    let dotsLeft = 0;
    grid.forEach(row => row.forEach(cell => { if (cell === 2) dotsLeft++; }));
    if (dotsLeft === 0 && !gameOver) {
      setWin(true);
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
  }, [playerPos, enemyPos, grid, gameOver]);

  const startGameLoop = () => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    gameLoopRef.current = window.setInterval(gameTick, 250);
  };

  useEffect(() => {
    startGameLoop();
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameTick]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'w'].includes(e.key)) directionRef.current = 'UP';
      if (['ArrowDown', 's'].includes(e.key)) directionRef.current = 'DOWN';
      if (['ArrowLeft', 'a'].includes(e.key)) directionRef.current = 'LEFT';
      if (['ArrowRight', 'd'].includes(e.key)) directionRef.current = 'RIGHT';
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTouch = (d: Direction) => {
    directionRef.current = d;
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto p-4">
      <div className="flex justify-between w-full mb-4 items-center">
        <div className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-xl font-bold border border-yellow-200">
          Score: {score}
        </div>
        <Button size="sm" variant="secondary" onClick={resetGame}>Restart</Button>
      </div>

      <div className="relative bg-indigo-900 p-2 rounded-xl shadow-lg border-4 border-indigo-950">
        {(gameOver || win) && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-lg z-10 text-white">
            <h2 className={`text-4xl font-bold mb-4 ${win ? 'text-yellow-400' : 'text-red-500'}`}>
              {win ? 'YUMMY!' : 'OUCH!'}
            </h2>
            <Button onClick={resetGame} variant="primary">Try Again</Button>
          </div>
        )}
        
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, 
            gap: '1px' 
          }}
          className="bg-indigo-900"
        >
          {grid.map((row, y) => (
            row.map((cell, x) => {
              let content = null;
              if (x === playerPos.x && y === playerPos.y) content = <div className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse" />;
              else if (x === enemyPos.x && y === enemyPos.y) content = <Skull size={14} className="text-red-500" />;
              else if (cell === 2) content = <div className="w-1.5 h-1.5 bg-pink-200 rounded-full" />;
              
              return (
                <div 
                  key={`${x}-${y}`} 
                  className={`w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center ${cell === 1 ? 'bg-indigo-500 rounded-sm' : ''}`}
                >
                  {content}
                </div>
              );
            })
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-6">
        <div />
        <Button variant="secondary" className="h-12 w-12 !p-0 flex items-center justify-center" onPointerDown={() => handleTouch('UP')}><ArrowUp /></Button>
        <div />
        <Button variant="secondary" className="h-12 w-12 !p-0 flex items-center justify-center" onPointerDown={() => handleTouch('LEFT')}><ArrowLeft /></Button>
        <Button variant="secondary" className="h-12 w-12 !p-0 flex items-center justify-center" onPointerDown={() => handleTouch('DOWN')}><ArrowDown /></Button>
        <Button variant="secondary" className="h-12 w-12 !p-0 flex items-center justify-center" onPointerDown={() => handleTouch('RIGHT')}><ArrowRight /></Button>
      </div>
      <p className="mt-4 text-xs text-slate-400">Use arrow keys or buttons to move.</p>
    </div>
  );
};