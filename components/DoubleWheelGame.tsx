
import React, { useState, useRef, useEffect } from 'react';
import { Button } from './Button';
import { WheelData, HistoryRecord } from '../types';
import { Settings, Play, Plus, Trash2, ArrowRight, RotateCw, Check, X, LogOut, History, Image as ImageIcon } from 'lucide-react';

const COLORS = ['#f472b6', '#c084fc', '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#2dd4bf'];

const DEFAULT_DATA: WheelData = {
  '美食': ['火锅', '烧烤', '日料', '快餐', '面条', '沙拉'],
  '运动': ['跑步', '瑜伽', '游泳', '骑行', '俯卧撑'],
  '学习': ['编程', '英语', '设计', '历史', '数学'],
  '放松': ['听歌', '看电影', '睡觉', '散步', '打游戏']
};

interface DoubleWheelGameProps {
  username: string;
  onLogout: () => void;
}

export const DoubleWheelGame: React.FC<DoubleWheelGameProps> = ({ username, onLogout }) => {
  // Game State
  const [data, setData] = useState<WheelData>(() => {
    const saved = localStorage.getItem('sweet_wheel_data');
    return saved ? JSON.parse(saved) : DEFAULT_DATA;
  });

  const [history, setHistory] = useState<HistoryRecord[]>(() => {
    const saved = localStorage.getItem(`sweet_history_${username}`);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [mode, setMode] = useState<'GAME' | 'SETTINGS'>('GAME');
  const [settingsTab, setSettingsTab] = useState<'DATA' | 'HISTORY'>('DATA');

  // Stages: 1=Wait for Cat Spin, 1.5=Show Cat Result, 2=Wait for Item Spin, 3=Show Final Result
  const [stage, setStage] = useState<1 | 1.5 | 2 | 3>(1); 
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [finalImage, setFinalImage] = useState<string | null>(null);
  
  // Wheel Animation State
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  // Settings State
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newItemName, setNewItemName] = useState('');

  // Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    localStorage.setItem('sweet_wheel_data', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem(`sweet_history_${username}`, JSON.stringify(history));
  }, [history, username]);

  // --- Wheel Logic ---

  const getActiveItems = () => {
    if (stage === 1) return Object.keys(data);
    if (stage === 2 && selectedCategory) return data[selectedCategory];
    return [];
  };

  const handleSpin = () => {
    const items = getActiveItems();
    if (isSpinning || items.length < 1) return;

    setIsSpinning(true);
    
    // Determine winner index
    const minSpins = 5;
    const randomDegree = Math.floor(Math.random() * 360);
    const newRotation = rotation + (360 * minSpins) + randomDegree;
    
    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const normalizedRotation = newRotation % 360;
      const segmentAngle = 360 / items.length;
      // Index calc (Top pointer logic)
      const winningIndex = Math.floor(((360 - (normalizedRotation % 360)) % 360) / segmentAngle);
      const winner = items[winningIndex];

      if (stage === 1) {
        setTimeout(() => {
            setSelectedCategory(winner);
            setStage(1.5); // Show intermediate modal
        }, 500);
      } else if (stage === 2) {
        setTimeout(() => {
            setSelectedItem(winner);
            generateAndSaveImage(selectedCategory!, winner);
        }, 500);
      }
    }, 4000);
  };

  const nextStep = () => {
    setRotation(0);
    setStage(2);
  };

  const generateAndSaveImage = (category: string, item: string) => {
    const canvas = canvasRef.current;
    if (!canvas) {
       // If canvas is missing for some reason, just show modal without saving (fallback)
       setStage(3);
       return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = 600;
    canvas.height = 800;

    // Draw Background
    const gradient = ctx.createLinearGradient(0, 0, 0, 800);
    gradient.addColorStop(0, '#fdf2f8'); // pink-50
    gradient.addColorStop(1, '#fae8ff'); // purple-100
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 800);

    // Decorative Circle
    ctx.beginPath();
    ctx.arc(300, 300, 200, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(236, 72, 153, 0.1)'; // Pink transparent
    ctx.fill();

    // Text Settings
    ctx.textAlign = 'center';
    
    // Title
    ctx.font = 'bold 36px sans-serif';
    ctx.fillStyle = '#db2777'; // pink-600
    ctx.fillText(`今天 ${username} 的任务是`, 300, 150);

    // Category
    ctx.font = '32px sans-serif';
    ctx.fillStyle = '#9333ea'; // purple-600
    ctx.fillText(category, 300, 300);

    // Arrow
    ctx.font = '40px sans-serif';
    ctx.fillStyle = '#cbd5e1'; // slate-300
    ctx.fillText('▼', 300, 360);

    // Item (Winner)
    ctx.font = 'bold 64px sans-serif';
    ctx.fillStyle = '#be185d'; // pink-700
    ctx.fillText(item, 300, 450);

    // Footer Watermark
    const now = new Date();
    const dateStr = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()} ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#94a3b8'; // slate-400
    ctx.textAlign = 'right';
    ctx.fillText(`SweetGames • ${dateStr}`, 580, 780);

    // Save
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setFinalImage(dataUrl);

    // Add to History
    const newRecord: HistoryRecord = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      dateStr,
      category,
      item,
      imageDataUrl: dataUrl
    };

    setHistory(prev => [newRecord, ...prev]);
    setStage(3);
  };

  const resetGame = () => {
    setStage(1);
    setSelectedCategory(null);
    setSelectedItem(null);
    setFinalImage(null);
    setRotation(0);
  };

  // --- Settings Logic ---
  const addCategory = () => {
    if (newCategoryName.trim() && !data[newCategoryName.trim()]) {
      setData({ ...data, [newCategoryName.trim()]: [] });
      setNewCategoryName('');
    }
  };

  const deleteCategory = (cat: string) => {
    const newData = { ...data };
    delete newData[cat];
    setData(newData);
    if (editingCategory === cat) setEditingCategory(null);
  };

  const addItemToCategory = () => {
    if (editingCategory && newItemName.trim()) {
        const currentItems = data[editingCategory];
        if (!currentItems.includes(newItemName.trim())) {
             setData({
                ...data,
                [editingCategory]: [...currentItems, newItemName.trim()]
            });
        }
        setNewItemName('');
    }
  };

  const deleteItemFromCategory = (itemIndex: number) => {
    if (editingCategory) {
        const newItems = data[editingCategory].filter((_, i) => i !== itemIndex);
        setData({
            ...data,
            [editingCategory]: newItems
        });
    }
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  // --- Rendering ---

  const renderWheelSVG = (items: string[]) => {
    if (items.length === 0) return <circle cx="150" cy="150" r="150" fill="#e2e8f0" />;
    
    const numSegments = items.length;
    const anglePerSegment = 360 / numSegments;
    const radius = 150;

    return items.map((item, index) => {
      const startAngle = index * anglePerSegment;
      const endAngle = (index + 1) * anglePerSegment;
      
      const x1 = radius + radius * Math.cos(Math.PI * startAngle / 180);
      const y1 = radius + radius * Math.sin(Math.PI * startAngle / 180);
      const x2 = radius + radius * Math.cos(Math.PI * endAngle / 180);
      const y2 = radius + radius * Math.sin(Math.PI * endAngle / 180);

      const d = `M ${radius} ${radius} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;

      // Use a slightly larger text size for Chinese characters for readability
      const fontSize = items.length > 10 ? 12 : 16; 

      return (
        <g key={index}>
          <path d={d} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth="2" />
          <text
            x={radius + (radius * 0.6) * Math.cos(Math.PI * (startAngle + anglePerSegment / 2) / 180)}
            y={radius + (radius * 0.6) * Math.sin(Math.PI * (startAngle + anglePerSegment / 2) / 180)}
            fill="white"
            fontSize={fontSize}
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="middle"
            transform={`rotate(${startAngle + anglePerSegment / 2 + 90}, ${radius + (radius * 0.6) * Math.cos(Math.PI * (startAngle + anglePerSegment / 2) / 180)}, ${radius + (radius * 0.6) * Math.sin(Math.PI * (startAngle + anglePerSegment / 2) / 180)})`}
          >
            {item.length > 8 ? item.substring(0, 6) + '..' : item}
          </text>
        </g>
      );
    });
  };

  if (mode === 'SETTINGS') {
    return (
      <div className="max-w-4xl mx-auto p-4 animate-fade-in-up">
        {/* Settings Header */}
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Settings className="text-pink-500"/> 设置
            </h2>
            <Button onClick={() => setMode('GAME')} variant="secondary">
                <Check size={18} /> 完成
            </Button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-4 mb-6 border-b border-slate-200 pb-1">
          <button 
            onClick={() => setSettingsTab('DATA')}
            className={`pb-2 px-4 font-bold transition-all ${settingsTab === 'DATA' ? 'text-pink-600 border-b-4 border-pink-500' : 'text-slate-400 hover:text-slate-600'}`}
          >
            数据管理
          </button>
          <button 
            onClick={() => setSettingsTab('HISTORY')}
            className={`pb-2 px-4 font-bold transition-all ${settingsTab === 'HISTORY' ? 'text-pink-600 border-b-4 border-pink-500' : 'text-slate-400 hover:text-slate-600'}`}
          >
            历史记录
          </button>
        </div>

        {settingsTab === 'DATA' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[calc(100vh-220px)]">
              {/* Categories Column */}
              <div className="bg-white p-4 rounded-3xl shadow-sm border border-pink-100 flex flex-col h-full">
                  <h3 className="font-bold text-lg mb-4 text-purple-600">1. 编辑类别</h3>
                  <div className="flex gap-2 mb-4">
                      <input 
                          className="flex-1 px-3 py-2 border rounded-xl"
                          placeholder="新类别名称..."
                          value={newCategoryName}
                          onChange={e => setNewCategoryName(e.target.value)}
                      />
                      <Button onClick={addCategory} size="sm"><Plus size={18}/></Button>
                  </div>
                  <div className="overflow-y-auto flex-1 space-y-2">
                      {Object.keys(data).map(cat => (
                          <div 
                              key={cat} 
                              onClick={() => setEditingCategory(cat)}
                              className={`p-3 rounded-xl flex justify-between items-center cursor-pointer transition-all ${editingCategory === cat ? 'bg-pink-100 border-pink-300 border' : 'bg-slate-50 hover:bg-slate-100'}`}
                          >
                              <span className="font-medium">{cat}</span>
                              <button onClick={(e) => { e.stopPropagation(); deleteCategory(cat); }} className="text-slate-300 hover:text-red-500">
                                  <Trash2 size={16}/>
                              </button>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Items Column */}
              <div className="bg-white p-4 rounded-3xl shadow-sm border border-pink-100 flex flex-col h-full">
                  <h3 className="font-bold text-lg mb-4 text-blue-600">2. 编辑内容</h3>
                  {editingCategory ? (
                      <>
                          <div className="mb-2 text-sm text-slate-500">当前类别: <span className="font-bold text-slate-800">{editingCategory}</span></div>
                          <div className="flex gap-2 mb-4">
                              <input 
                                  className="flex-1 px-3 py-2 border rounded-xl"
                                  placeholder={`添加内容到 ${editingCategory}...`}
                                  value={newItemName}
                                  onChange={e => setNewItemName(e.target.value)}
                                  onKeyDown={e => e.key === 'Enter' && addItemToCategory()}
                              />
                              <Button onClick={addItemToCategory} size="sm"><Plus size={18}/></Button>
                          </div>
                          <div className="overflow-y-auto flex-1 space-y-2">
                              {data[editingCategory].map((item, idx) => (
                                  <div key={idx} className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
                                      <span>{item}</span>
                                      <button onClick={() => deleteItemFromCategory(idx)} className="text-slate-300 hover:text-red-500">
                                          <Trash2 size={16}/>
                                      </button>
                                  </div>
                              ))}
                              {data[editingCategory].length === 0 && (
                                  <div className="text-center text-slate-400 mt-10">暂无内容，请添加。</div>
                              )}
                          </div>
                      </>
                  ) : (
                      <div className="flex-1 flex items-center justify-center text-slate-400 text-center p-8 border-2 border-dashed border-slate-200 rounded-xl">
                          请在左侧选择一个类别以编辑内容。
                      </div>
                  )}
              </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100 h-[calc(100vh-220px)] overflow-y-auto">
            {history.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-400">
                 <History size={48} className="mb-4 opacity-50" />
                 <p>还没有历史记录，快去玩一把吧！</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {history.map(record => (
                  <div key={record.id} className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="aspect-[3/4] bg-slate-200 relative group">
                       <img src={record.imageDataUrl} alt="Result" className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <a href={record.imageDataUrl} download={`SweetResult_${record.dateStr}.jpg`} className="text-white bg-white/20 p-2 rounded-full backdrop-blur hover:bg-white/40">
                             <ImageIcon size={24} />
                          </a>
                       </div>
                    </div>
                    <div className="p-3 flex justify-between items-center">
                       <div>
                         <div className="font-bold text-slate-700">{record.category} - {record.item}</div>
                         <div className="text-xs text-slate-400">{record.dateStr}</div>
                       </div>
                       <button onClick={() => deleteHistoryItem(record.id)} className="text-slate-300 hover:text-red-500 p-2">
                         <Trash2 size={16} />
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // --- Game View ---
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8 px-4 relative">
        {/* Canvas for image generation (Hidden) */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Header */}
        <div className="absolute top-4 right-4 flex gap-2 z-20">
             <button onClick={() => setMode('SETTINGS')} className="p-2 bg-white rounded-full shadow-md text-slate-600 hover:text-pink-600 hover:scale-110 transition-all">
                <Settings size={24} />
            </button>
            <button onClick={onLogout} className="p-2 bg-white rounded-full shadow-md text-slate-600 hover:text-red-600 hover:scale-110 transition-all">
                <LogOut size={24} />
            </button>
        </div>

        <div className="text-center mb-8 animate-fade-in-up">
            <h1 className="text-4xl font-black text-slate-800 mb-2">
                {stage === 1 ? '第一步：选择类别' : (stage === 1.5 ? '第一步结果' : (stage === 2 ? `第二步：${selectedCategory}里有什么？` : '最终结果'))}
            </h1>
            <p className="text-slate-500">转动轮盘，决定你的命运！</p>
        </div>

        {/* Wheel Container */}
        <div className="relative mb-10">
             {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-10 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[35px] border-t-slate-800 drop-shadow-xl"></div>
            
            <div 
                className="w-[320px] h-[320px] md:w-[400px] md:h-[400px] rounded-full shadow-2xl overflow-hidden border-8 border-white ring-4 ring-pink-200 transition-transform duration-[4000ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]"
                style={{ transform: `rotate(${rotation}deg)` }}
            >
                <svg viewBox="0 0 300 300" className="w-full h-full transform -rotate-90">
                    {renderWheelSVG(getActiveItems())}
                </svg>
            </div>
             {/* Center Cap */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center z-10 border-4 border-pink-100">
                <div className={`w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full ${isSpinning ? 'animate-pulse' : ''}`}></div>
            </div>
        </div>

        {/* Controls */}
        <div className="w-full max-w-xs">
            <Button 
                onClick={handleSpin} 
                disabled={isSpinning || getActiveItems().length === 0 || stage === 1.5 || stage === 3} 
                size="lg" 
                fullWidth
                className="text-xl py-4 shadow-xl"
            >
                {isSpinning ? '转动中...' : stage === 1 ? '转动类别' : '转动内容'}
            </Button>
            {getActiveItems().length === 0 && (
                <p className="text-red-500 text-center mt-2 font-bold">该类别暂无内容，请去设置添加。</p>
            )}
        </div>

        {/* Intermediate Result Modal (Stage 1.5) */}
        {stage === 1.5 && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-up">
                 <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center relative overflow-hidden shadow-2xl">
                    <h2 className="text-xl font-bold text-slate-500 mb-4">选中类别</h2>
                    <div className="text-4xl font-black text-purple-600 mb-8">{selectedCategory}</div>
                    <Button fullWidth onClick={nextStep} size="lg">
                       下一步 <ArrowRight size={20} />
                    </Button>
                 </div>
            </div>
        )}

        {/* Final Result Modal (Stage 3) */}
        {stage === 3 && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-up">
                <div className="bg-white rounded-3xl p-6 max-w-md w-full text-center relative overflow-hidden shadow-2xl">
                     <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-shine"></div>
                     
                     <h2 className="text-xl font-bold text-slate-800 mb-4">结果已保存！</h2>
                     
                     {/* Display Generated Image */}
                     {finalImage && (
                        <div className="mb-6 rounded-xl overflow-hidden shadow-lg border-4 border-slate-100">
                             <img src={finalImage} alt="Final Result" className="w-full object-contain" />
                        </div>
                     )}
                     
                     <div className="flex gap-4">
                        <Button fullWidth onClick={resetGame} variant="primary">
                            <RotateCw size={20} /> 再玩一次
                        </Button>
                        <Button fullWidth onClick={onLogout} variant="secondary">
                            <LogOut size={20} /> 退出
                        </Button>
                     </div>
                </div>
            </div>
        )}
    </div>
  );
};
