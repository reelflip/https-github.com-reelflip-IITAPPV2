
import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

interface BookReaderProps {
  title: string;
  pages: string[];
  onClose: () => void;
}

export const BookReader: React.FC<BookReaderProps> = ({ title, pages, onClose }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  const handleNext = () => {
    if (currentPage < pages.length - 1 && !isFlipping) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(prev => prev + 1);
        setIsFlipping(false);
      }, 300);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0 && !isFlipping) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(prev => prev - 1);
        setIsFlipping(false);
      }, 300);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, pages.length]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm animate-in fade-in">
      
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center text-white z-10">
        <div className="flex items-center gap-3">
           <BookOpen className="w-6 h-6 text-white/80" />
           <div>
             <h2 className="font-bold text-lg leading-none">{title}</h2>
             <span className="text-xs text-white/60 font-mono">Page {currentPage + 1} of {pages.length}</span>
           </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Book Container */}
      <div className="relative w-full max-w-3xl h-[85vh] perspective-1000 flex justify-center items-center px-4">
         
         {/* Navigation Buttons (Desktop) */}
         <button 
            onClick={handlePrev}
            disabled={currentPage === 0}
            className={`hidden md:flex absolute left-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed`}
         >
            <ChevronLeft className="w-8 h-8" />
         </button>

         <button 
            onClick={handleNext}
            disabled={currentPage === pages.length - 1}
            className={`hidden md:flex absolute right-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed`}
         >
            <ChevronRight className="w-8 h-8" />
         </button>

         {/* The Page */}
         <div 
            className={`
                bg-[#fdfbf7] w-full h-full rounded-r-xl rounded-l-md shadow-2xl overflow-hidden relative 
                transition-transform duration-300 transform-style-3d origin-left
                border-l-[12px] border-l-[#e3e0d8]
                ${isFlipping ? 'rotate-y-6 scale-95 opacity-80' : 'rotate-y-0 scale-100 opacity-100'}
            `}
            style={{ 
                boxShadow: 'inset 20px 0 50px rgba(0,0,0,0.05), 10px 20px 40px rgba(0,0,0,0.4)',
                fontFamily: '"Merriweather", "Georgia", serif'
            }}
         >
            {/* Page Content Container */}
            <div className="h-full overflow-y-auto custom-scrollbar p-8 md:p-12 text-slate-800 leading-relaxed page-content">
                {pages.length > 0 ? (
                    <div 
                        dangerouslySetInnerHTML={{ __html: pages[currentPage] }} 
                        className="blog-content"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <p>This chapter has no content pages yet.</p>
                    </div>
                )}
            </div>

            {/* Page Number Footer */}
            <div className="absolute bottom-4 right-6 text-xs font-bold text-slate-400 font-mono">
                {currentPage + 1}
            </div>
         </div>

      </div>

      {/* Mobile Controls */}
      <div className="absolute bottom-6 flex gap-4 md:hidden">
         <button 
            onClick={handlePrev}
            disabled={currentPage === 0}
            className="p-3 bg-white text-slate-900 rounded-full shadow-lg disabled:opacity-50"
         >
            <ChevronLeft className="w-6 h-6" />
         </button>
         <span className="bg-black/50 text-white px-4 py-2 rounded-full font-mono text-sm flex items-center">
            {currentPage + 1} / {pages.length}
         </span>
         <button 
            onClick={handleNext}
            disabled={currentPage === pages.length - 1}
            className="p-3 bg-white text-slate-900 rounded-full shadow-lg disabled:opacity-50"
         >
            <ChevronRight className="w-6 h-6" />
         </button>
      </div>

      <style>{`
        .perspective-1000 { perspective: 1500px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .rotate-y-6 { transform: rotateY(-5deg); }
        .page-content p { margin-bottom: 1.5em; font-size: 1.125rem; line-height: 1.8; color: #334155; }
        .page-content h1, .page-content h2, .page-content h3 { color: #1e293b; font-family: system-ui, sans-serif; margin-top: 1.5em; margin-bottom: 0.8em; font-weight: 800; }
        .page-content ul, .page-content ol { margin-left: 1.5em; margin-bottom: 1.5em; }
        .page-content img { border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); margin: 2em auto; display: block; max-height: 400px; }
        .page-content blockquote { border-left: 4px solid #cbd5e1; padding-left: 1em; font-style: italic; color: #64748b; }
      `}</style>
    </div>
  );
};
