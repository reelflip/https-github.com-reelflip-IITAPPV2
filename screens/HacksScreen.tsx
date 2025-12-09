
import React from 'react';
import { MemoryHack } from '../lib/types';
import { Lightbulb, Zap, Brain } from 'lucide-react';

interface Props {
  hacks: MemoryHack[];
}

export const HacksScreen: React.FC<Props> = ({ hacks }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-12">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            Memory Hacks & Mnemonics
          </h2>
          <p className="text-amber-50 mt-2 opacity-90 max-w-xl text-sm md:text-base">
            Master complex formulas and periodic tables using smart acronyms, visualization tricks, and shortcuts. 
            This curated library helps you recall information instantly during exams.
          </p>
        </div>
        {/* Decor */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="absolute bottom-0 right-20 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      {hacks.length === 0 ? (
         <div className="p-12 text-center text-slate-400 border border-dashed border-slate-300 rounded-xl bg-slate-50">
           <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
           <p className="font-medium">No hacks added by Admin yet.</p>
           <p className="text-xs mt-1">Check back later for new shortcuts!</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {hacks.map(hack => (
             <div key={hack.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                   <Zap className="w-12 h-12 text-amber-500 fill-amber-500" />
                </div>
                
                <span className={`inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded mb-3 border ${
                    hack.tag === 'Physics' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                    hack.tag === 'Chemistry' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                   {hack.tag}
                </span>
                
                <h3 className="font-bold text-lg text-slate-800 mb-2 leading-tight">{hack.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-3">{hack.description}</p>
                
                {hack.trick && (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mt-auto">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">The Trick:</span>
                        <code className="text-sm font-bold text-blue-600 font-mono">{hack.trick}</code>
                    </div>
                )}
             </div>
           ))}
        </div>
      )}
    </div>
  );
};
