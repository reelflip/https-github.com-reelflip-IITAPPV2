
import React from 'react';
import { MemoryHack } from '../lib/types';

interface Props {
  hacks: MemoryHack[];
}

export const HacksScreen: React.FC<Props> = ({ hacks }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Memory Hacks & Mnemonics</h2>
        <p className="text-slate-500">Shortcuts to remember complex topics.</p>
      </div>

      {hacks.length === 0 ? (
         <div className="p-12 text-center text-slate-400 border border-dashed rounded-xl">
           No hacks added by Admin yet.
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {hacks.map(hack => (
             <div key={hack.id} className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                   <span className="text-6xl text-yellow-500">💡</span>
                </div>
                
                <span className="inline-block px-2 py-1 bg-yellow-200 text-yellow-800 text-[10px] font-bold uppercase tracking-wider rounded mb-3">
                   {hack.tag}
                </span>
                
                <h3 className="font-bold text-lg text-slate-800 mb-2">{hack.title}</h3>
                <p className="text-slate-700 text-sm leading-relaxed">{hack.description}</p>
             </div>
           ))}
        </div>
      )}
    </div>
  );
};