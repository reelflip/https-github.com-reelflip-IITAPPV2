
import React, { useState } from 'react';
import { MistakeLog, Subject } from '../lib/types';

interface Props {
  mistakes: MistakeLog[];
  addMistake: (m: Omit<MistakeLog, 'id' | 'date'>) => void;
}

export const MistakesScreen: React.FC<Props> = ({ mistakes, addMistake }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ question: '', subject: 'Physics' as Subject, note: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMistake(form);
    setForm({ question: '', subject: 'Physics', note: '' });
    setIsOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Mistake Notebook</h2>
          <p className="text-slate-500">Learn from your errors. Never repeat them.</p>
        </div>
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-red-700 transition"
        >
          + Log Mistake
        </button>
      </div>

      {isOpen && (
        <div className="bg-white p-6 rounded-xl border border-red-100 shadow-sm">
          <h3 className="font-bold text-lg mb-4">Log a New Error</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
             <div>
               <label className="block text-xs font-bold text-slate-500 mb-1">Subject</label>
               <select 
                 className="w-full p-2 border rounded-lg bg-slate-50"
                 value={form.subject}
                 onChange={e => setForm({...form, subject: e.target.value as Subject})}
               >
                 <option>Physics</option>
                 <option>Chemistry</option>
                 <option>Maths</option>
               </select>
             </div>
             <div>
               <label className="block text-xs font-bold text-slate-500 mb-1">Question / Concept</label>
               <input 
                 required
                 className="w-full p-2 border rounded-lg" 
                 placeholder="e.g. Rotational Motion Moment of Inertia of Disc"
                 value={form.question}
                 onChange={e => setForm({...form, question: e.target.value})}
               />
             </div>
             <div>
               <label className="block text-xs font-bold text-slate-500 mb-1">Why did I get it wrong?</label>
               <textarea 
                 required
                 className="w-full p-2 border rounded-lg" 
                 placeholder="e.g. Calculation error, Forgot formula 1/2MR^2..."
                 rows={3}
                 value={form.note}
                 onChange={e => setForm({...form, note: e.target.value})}
               />
             </div>
             <div className="flex gap-2">
               <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Save</button>
               <button type="button" onClick={() => setIsOpen(false)} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold">Cancel</button>
             </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mistakes.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed">
            No mistakes logged yet. That's either very good or you need to analyze your tests better!
          </div>
        ) : (
          mistakes.map(m => (
            <div key={m.id} className="bg-white p-5 rounded-xl border border-l-4 border-l-red-500 shadow-sm">
               <div className="flex justify-between items-start mb-2">
                 <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{m.subject}</span>
                 <span className="text-xs text-slate-400">{new Date(m.date).toLocaleDateString()}</span>
               </div>
               <h4 className="font-bold text-slate-800 mb-2">{m.question}</h4>
               <p className="text-sm text-slate-600 bg-red-50 p-3 rounded-lg border border-red-100">
                 "{m.note}"
               </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};