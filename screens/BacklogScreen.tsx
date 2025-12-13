
import React, { useState } from 'react';
import { BacklogItem, Subject } from '../lib/types';
import { ListTodo, CheckCircle2, Circle, Flame, CalendarClock, Trash2 } from 'lucide-react';

interface Props {
  backlogs: BacklogItem[];
  onAddBacklog: (item: Omit<BacklogItem, 'id' | 'status'>) => void;
  onToggleBacklog: (id: string) => void;
  onDeleteBacklog: (id: string) => void;
}

export const BacklogScreen: React.FC<Props> = ({ backlogs, onAddBacklog, onToggleBacklog, onDeleteBacklog }) => {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState<Subject>('Physics');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !deadline) return;
    
    onAddBacklog({ topic, subject, priority, deadline });
    setTopic('');
    setPriority('High');
    setDeadline('');
  };

  const pendingCount = backlogs.filter(b => b.status === 'PENDING').length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-600 to-orange-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex justify-between items-center">
              <div>
                  <div className="flex items-center space-x-3 mb-2">
                      <ListTodo className="w-8 h-8 text-white" />
                      <h1 className="text-3xl font-bold">Backlog Manager</h1>
                  </div>
                  <p className="text-rose-100 text-lg opacity-90 max-w-2xl">
                      Track and clear pending topics to ensure you stay on top of your preparation.
                  </p>
              </div>
              <div className="text-center bg-white/20 p-3 rounded-xl border border-white/20 backdrop-blur-sm hidden md:block">
                  <span className="block text-3xl font-bold text-white">{pendingCount}</span>
                  <span className="text-[10px] text-white uppercase font-bold tracking-wider">Pending Tasks</span>
              </div>
          </div>
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10"></div>
          <div className="absolute bottom-0 right-20 w-32 h-32 rounded-full bg-white opacity-10"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Add Form */}
        <div className="lg:col-span-1 h-fit">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center">
              <span className="text-xl mr-2">+</span> Add New Backlog
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Topic / Chapter Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Rotational Motion Ex-2"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject</label>
                  <select 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                    value={subject}
                    onChange={e => setSubject(e.target.value as Subject)}
                  >
                    <option>Physics</option>
                    <option>Chemistry</option>
                    <option>Maths</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Priority</label>
                  <select 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                  >
                    <option value="High">High 🔥</option>
                    <option value="Medium">Medium ⚡</option>
                    <option value="Low">Low 💤</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Deadline</label>
                <input 
                  type="date"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-[#0f172a] hover:bg-slate-800 text-white font-bold py-3 rounded-lg transition-colors shadow-md active:scale-95"
              >
                Add to List
              </button>
            </form>
          </div>
        </div>

        {/* Task List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm min-h-[400px] flex flex-col">
            {backlogs.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-slate-600 font-medium text-lg">No backlogs! Great job.</h3>
                <p className="text-slate-400 text-sm mt-1">Add tasks on the left to start tracking.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {backlogs.map(item => (
                  <div key={item.id} className={`p-5 flex items-center justify-between group transition-colors ${item.status === 'COMPLETED' ? 'bg-slate-50' : 'hover:bg-blue-50/30'}`}>
                    
                    <div className="flex items-start gap-4">
                      <button 
                        onClick={() => onToggleBacklog(item.id)}
                        className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          item.status === 'COMPLETED' 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'border-slate-300 text-transparent hover:border-green-400'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      
                      <div>
                        <h4 className={`font-bold text-base ${item.status === 'COMPLETED' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                          {item.topic}
                        </h4>
                        
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                            item.subject === 'Physics' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                            item.subject === 'Chemistry' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            'bg-blue-50 text-blue-700 border-blue-100'
                          }`}>
                            {item.subject}
                          </span>
                          
                          <div className={`flex items-center text-xs font-medium px-2 py-0.5 rounded ${
                            item.priority === 'High' ? 'text-red-600 bg-red-50' :
                            item.priority === 'Medium' ? 'text-orange-600 bg-orange-50' :
                            'text-green-600 bg-green-50'
                          }`}>
                            <Flame className="w-3 h-3 mr-1" /> {item.priority}
                          </div>

                          <div className="flex items-center text-xs text-slate-400">
                            <CalendarClock className="w-3 h-3 mr-1" />
                            {new Date(item.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </div>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => onDeleteBacklog(item.id)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Delete Backlog"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
