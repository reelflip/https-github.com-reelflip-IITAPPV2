
import React, { useState, useEffect } from 'react';
import { Flashcard } from '../lib/types';
import { Layers, RotateCw, ArrowRight, ArrowLeft } from 'lucide-react';

interface Props {
  flashcards?: Flashcard[];
}

const DEMO_CARDS: Flashcard[] = [
  { id: 1, front: "Newton's Second Law", back: "F = ma\n(Force equals mass times acceleration)" },
  { id: 2, front: "∫ sin(x) dx", back: "-cos(x) + C" },
  { id: 3, front: "Avogadro's Number", back: "6.022 × 10²³" },
  { id: 4, front: "Derivative of ln(x)", back: "1/x" },
  { id: 5, front: "First Law of Thermodynamics", back: "ΔU = Q - W\n(Energy cannot be created or destroyed)" },
];

export const FlashcardScreen: React.FC<Props> = ({ flashcards }) => {
  const cards = flashcards && flashcards.length > 0 ? flashcards : DEMO_CARDS;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 150);
  };

  const handleResponse = (difficulty: 'hard' | 'good' | 'easy') => {
      // Future: send difficulty rating to spaced repetition algorithm
      handleNext();
  };

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-12 max-w-4xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Layers className="w-6 h-6 text-white" />
            </div>
            Active Recall Deck
          </h2>
          <p className="text-blue-100 mt-2 opacity-90 max-w-xl text-sm md:text-base">
            Mastery comes from testing yourself, not just reading. Flip, test, repeat.
          </p>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="absolute bottom-0 right-20 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      <div className="flex flex-col items-center justify-center space-y-8">
        
        {/* Progress Bar */}
        <div className="w-full max-w-lg flex items-center gap-4">
            <span className="text-xs font-bold text-slate-400 w-12 text-right">Start</span>
            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-blue-500 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            <span className="text-xs font-bold text-slate-400 w-12">End</span>
        </div>

        {/* Card Area */}
        <div className="relative group perspective-1000 w-full max-w-md aspect-[3/2]">
            
            {/* Background Stack Effect */}
            <div className="absolute inset-0 bg-white rounded-3xl shadow-sm border border-slate-200 transform translate-y-3 scale-95 opacity-50 z-0"></div>
            <div className="absolute inset-0 bg-white rounded-3xl shadow-sm border border-slate-200 transform translate-y-6 scale-90 opacity-25 z-[-1]"></div>

            {/* Main Card Container */}
            <div 
                className={`relative w-full h-full cursor-pointer transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
                onClick={() => setIsFlipped(!isFlipped)}
            >
                {/* Front Side */}
                <div className="absolute inset-0 backface-hidden bg-white rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center justify-center p-8 text-center hover:shadow-2xl transition-shadow">
                    <div className="absolute top-6 left-6 text-xs font-bold text-blue-500 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
                        Question
                    </div>
                    <div className="absolute top-6 right-6 text-slate-300">
                        <RotateCw size={20} />
                    </div>
                    
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-800 leading-tight">
                        {currentCard.front}
                    </h3>
                    
                    <p className="absolute bottom-6 text-xs text-slate-400 font-medium animate-pulse">
                        Tap to flip or press Space
                    </p>
                </div>

                {/* Back Side */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-slate-900 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 text-center text-white">
                    <div className="absolute top-6 left-6 text-xs font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full uppercase tracking-wider">
                        Answer
                    </div>
                    
                    <h3 className="text-xl md:text-2xl font-medium text-slate-100 leading-relaxed whitespace-pre-wrap">
                        {currentCard.back}
                    </h3>
                </div>
            </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-8 w-full max-w-md">
            <button 
                onClick={handlePrev}
                className="p-4 rounded-full bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 shadow-sm hover:shadow-md transition-all active:scale-95"
                title="Previous Card (Left Arrow)"
            >
                <ArrowLeft size={24} />
            </button>

            <div className="text-center">
                <p className="text-sm font-bold text-slate-700 mb-1">Card {currentIndex + 1} / {cards.length}</p>
                {isFlipped && (
                    <div className="flex gap-2 mt-2 animate-in fade-in slide-in-from-top-2">
                        <button onClick={() => handleResponse('hard')} className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-lg hover:bg-red-200 transition-colors">Hard</button>
                        <button onClick={() => handleResponse('good')} className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-200 transition-colors">Good</button>
                        <button onClick={() => handleResponse('easy')} className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg hover:bg-green-200 transition-colors">Easy</button>
                    </div>
                )}
            </div>

            <button 
                onClick={handleNext}
                className="p-4 rounded-full bg-slate-900 text-white hover:bg-slate-800 shadow-lg hover:shadow-xl transition-all active:scale-95"
                title="Next Card (Right Arrow)"
            >
                <ArrowRight size={24} />
            </button>
        </div>

        <div className="text-xs text-slate-400 font-medium">
            Pro Tip: Use <kbd className="bg-slate-100 border border-slate-300 rounded px-1 font-mono text-slate-500">Space</kbd> to flip and <kbd className="bg-slate-100 border border-slate-300 rounded px-1 font-mono text-slate-500">Arrows</kbd> to navigate.
        </div>
      </div>
    </div>
  );
};
