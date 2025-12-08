
import React, { useState } from 'react';
import { Flashcard } from '../lib/types';

interface Props {
  flashcards?: Flashcard[]; // Now accepts props
}

const DEMO_CARDS: Flashcard[] = [
  { id: 1, front: "Newton's Second Law", back: "F = ma (Force equals mass times acceleration)" },
  { id: 2, front: "Integration of sin(x)", back: "-cos(x) + C" },
  { id: 3, front: "Avogadro's Number", back: "6.022 × 10²³" },
];

export const FlashcardScreen: React.FC<Props> = ({ flashcards }) => {
  const cards = flashcards && flashcards.length > 0 ? flashcards : DEMO_CARDS;
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCard((prev) => (prev + 1) % cards.length);
    }, 200);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCard((prev) => (prev - 1 + cards.length) % cards.length);
    }, 200);
  };

  return (
    <div className="h-[80vh] flex flex-col items-center justify-center space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">Flashcards</h2>
        <p className="text-slate-500">Tap card to flip • {cards.length} cards in deck</p>
      </div>

      {/* Card Container with Perspective */}
      <div 
        className="relative w-80 h-52 md:w-96 md:h-64 cursor-pointer perspective-1000"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`w-full h-full relative preserve-3d transition-transform duration-500 ${isFlipped ? 'rotate-y-180' : ''}`}>
          {/* Front */}
          <div className="absolute w-full h-full backface-hidden bg-white border-2 border-blue-100 rounded-2xl shadow-xl flex items-center justify-center p-6 text-center">
            <div>
              <span className="block text-xs font-bold text-blue-500 uppercase tracking-widest mb-2">Question</span>
              <h3 className="text-xl font-bold text-slate-800">{cards[currentCard].front}</h3>
            </div>
          </div>

          {/* Back */}
          <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-blue-600 rounded-2xl shadow-xl flex items-center justify-center p-6 text-center text-white">
            <div>
              <span className="block text-xs font-bold text-blue-200 uppercase tracking-widest mb-2">Answer</span>
              <h3 className="text-xl font-bold">{cards[currentCard].back}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6">
        <button 
          onClick={prevCard}
          className="p-3 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 transition"
        >
          ← Prev
        </button>
        <span className="font-mono text-slate-400 font-bold">
          {currentCard + 1} / {cards.length}
        </span>
        <button 
           onClick={nextCard}
           className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition shadow-md"
        >
          Next →
        </button>
      </div>
    </div>
  );
};