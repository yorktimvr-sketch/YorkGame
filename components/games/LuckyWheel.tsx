import React, { useState, useRef } from 'react';
import { Button } from '../Button';
import { Plus, Trash2, RotateCw } from 'lucide-react';

const COLORS = ['#f472b6', '#c084fc', '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#2dd4bf'];

export const LuckyWheel: React.FC = () => {
  const [items, setItems] = useState<string[]>(['Pizza', 'Burger', 'Sushi', 'Salad', 'Tacos', 'Pasta']);
  const [newItem, setNewItem] = useState('');
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  
  const wheelRef = useRef<HTMLDivElement>(null);

  const handleSpin = () => {
    if (isSpinning || items.length < 2) return;
    
    setWinner(null);
    setIsSpinning(true);
    
    // Calculate random spin
    const minSpins = 5;
    const randomDegree = Math.floor(Math.random() * 360);
    const totalRotation = rotation + (360 * minSpins) + randomDegree;
    
    setRotation(totalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const normalizedRotation = totalRotation % 360;
      const segmentAngle = 360 / items.length;
      // Adjust for pointer position (usually at top = 270deg or right = 0deg). 
      // Assuming CSS transform rotates clockwise, and pointer is at top (0deg visual, but requires offset).
      // Let's assume pointer is at Top (0 degrees).
      // If we rotate 90 deg clockwise, the item at 270 (-90) is at the top.
      const winningIndex = Math.floor(((360 - (normalizedRotation % 360)) % 360) / segmentAngle);
      setWinner(items[winningIndex]);
    }, 4000); // 4s transition
  };

  const addItem = () => {
    if (newItem.trim()) {
      setItems([...items, newItem.trim()]);
      setNewItem('');
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const renderWheel = () => {
    const numSegments = items.length;
    const anglePerSegment = 360 / numSegments;
    const radius = 150; // SVG radius

    // Create SVG paths for segments
    return items.map((item, index) => {
      const startAngle = index * anglePerSegment;
      const endAngle = (index + 1) * anglePerSegment;
      
      // Convert polar to cartesian
      const x1 = radius + radius * Math.cos(Math.PI * startAngle / 180);
      const y1 = radius + radius * Math.sin(Math.PI * startAngle / 180);
      const x2 = radius + radius * Math.cos(Math.PI * endAngle / 180);
      const y2 = radius + radius * Math.sin(Math.PI * endAngle / 180);

      // SVG Path command
      const d = `M ${radius} ${radius} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;

      return (
        <g key={index}>
          <path d={d} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth="2" />
          <text
            x={radius + (radius * 0.6) * Math.cos(Math.PI * (startAngle + anglePerSegment / 2) / 180)}
            y={radius + (radius * 0.6) * Math.sin(Math.PI * (startAngle + anglePerSegment / 2) / 180)}
            fill="white"
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="middle"
            transform={`rotate(${startAngle + anglePerSegment / 2 + 90}, ${radius + (radius * 0.6) * Math.cos(Math.PI * (startAngle + anglePerSegment / 2) / 180)}, ${radius + (radius * 0.6) * Math.sin(Math.PI * (startAngle + anglePerSegment / 2) / 180)})`}
          >
            {item.length > 10 ? item.substring(0, 8) + '...' : item}
          </text>
        </g>
      );
    });
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 items-center justify-center p-4">
      {/* Wheel Section */}
      <div className="relative">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[25px] border-t-slate-800 drop-shadow-md"></div>
        
        {/* The Wheel */}
        <div 
          className="w-[300px] h-[300px] rounded-full shadow-2xl overflow-hidden border-4 border-white ring-4 ring-pink-100 transition-transform duration-[4000ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <svg viewBox="0 0 300 300" className="w-full h-full transform -rotate-90">
             {items.length > 0 ? renderWheel() : <circle cx="150" cy="150" r="150" fill="#e2e8f0" />}
          </svg>
        </div>

        {/* Center Cap */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center z-10 border-4 border-pink-100">
           <div className="w-8 h-8 bg-pink-500 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="w-full max-w-sm bg-white p-6 rounded-3xl shadow-lg border border-pink-50">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
           <RotateCw className="text-pink-500"/>
           Lucky Wheel
        </h2>

        {winner && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-xl text-center font-bold border border-green-200 animate-bounce">
            🎉 Winner: {winner} 🎉
          </div>
        )}

        <div className="flex gap-2 mb-4">
          <input 
            type="text" 
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
            placeholder="Add item..." 
            className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
          <Button onClick={addItem} size="sm" variant="secondary"><Plus size={18}/></Button>
        </div>

        <div className="max-h-48 overflow-y-auto space-y-2 mb-6 pr-1">
          {items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg text-sm group">
              <span className="truncate">{item}</span>
              <button 
                onClick={() => removeItem(idx)} 
                className="text-slate-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <Button fullWidth onClick={handleSpin} disabled={isSpinning || items.length < 2} size="lg">
          {isSpinning ? 'Spinning...' : 'SPIN!'}
        </Button>
      </div>
    </div>
  );
};