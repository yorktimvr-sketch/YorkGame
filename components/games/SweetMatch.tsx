import React, { useState, useEffect } from 'react';
import { Button } from '../Button';
import { RefreshCw, Trophy, Sparkles } from 'lucide-react';

const EMOJIS = ['🍭', '🍬', '🍩', '🍪', '🍰', '🧁', '🍦', '🍫'];

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const SweetMatch: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isWon, setIsWon] = useState(false);

  const initializeGame = () => {
    const shuffled = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setIsWon(false);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2) return;
    if (cards[id].isMatched || cards[id].isFlipped) return;

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;
      if (newCards[first].emoji === newCards[second].emoji) {
        newCards[first].isMatched = true;
        newCards[second].isMatched = true;
        setCards(newCards);
        setFlippedCards([]);
        setMatches(m => m + 1);
        if (matches + 1 === EMOJIS.length) {
          setIsWon(true);
        }
      } else {
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[first].isFlipped = false;
          resetCards[second].isFlipped = false;
          setCards(resetCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-2xl mx-auto p-4">
      <div className="flex justify-between w-full mb-6 items-center bg-white p-4 rounded-3xl shadow-sm border border-pink-100">
        <div className="flex gap-4">
          <div className="text-pink-600 font-bold flex items-center gap-2">
            <RefreshCw size={18} />
            <span>Moves: {moves}</span>
          </div>
          <div className="text-purple-600 font-bold flex items-center gap-2">
            <Trophy size={18} />
            <span>Pairs: {matches}/{EMOJIS.length}</span>
          </div>
        </div>
        <Button size="sm" onClick={initializeGame} variant="secondary">Restart</Button>
      </div>

      {isWon ? (
        <div className="text-center py-10 animate-bounce">
          <Sparkles className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-pink-600 mb-2">Sweet Victory!</h2>
          <p className="text-slate-500 mb-6">You found all pairs in {moves} moves.</p>
          <Button onClick={initializeGame}>Play Again</Button>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3 sm:gap-4 w-full">
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`
                aspect-square rounded-2xl cursor-pointer transition-all duration-300 transform perspective-1000
                flex items-center justify-center text-4xl select-none shadow-sm
                ${card.isFlipped || card.isMatched 
                  ? 'bg-white rotate-y-180 border-2 border-pink-200' 
                  : 'bg-gradient-to-br from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500'}
              `}
            >
              <div className={`transition-opacity duration-300 ${card.isFlipped || card.isMatched ? 'opacity-100' : 'opacity-0'}`}>
                {card.emoji}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};