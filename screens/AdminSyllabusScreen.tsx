
import React, { useState } from 'react';
import { Topic, Subject } from '../lib/types';
import { Plus, Trash2, FolderPlus, FilePlus, Book } from 'lucide-react';

interface Props {
  syllabus: Topic[];
  onAddTopic: (topic: Omit<Topic, 'id'>) => void;
  onDeleteTopic: (id: string) => void;
}

export const AdminSyllabusScreen: React.FC<Props> = ({ syllabus, onAddTopic, onDeleteTopic }) => {
  const [subject, setSubject] = useState<Subject>('Physics');
  const [chapter, setChapter] = useState('');
  const [topicName, setTopicName] = useState('');

  // Grouping for Display
  const grouped = syllabus.filter(t => t.subject === subject).reduce((acc, topic) => {
      if (!acc[topic.chapter]) acc[topic.chapter] = [];
      acc[topic.chapter].push(topic);
      return acc;
  }, {} as Record<string, Topic[]>);

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(!chapter || !topicName) return;
      onAddTopic({ name: topicName, chapter, subject });
      setTopicName('');
      // Keep chapter to allow adding multiple topics to same chapter
  };

  return (
    <div className="space-y-6 animate-in fade-in">
        <div className="bg-slate-900 rounded-xl p-8 text-white shadow-lg flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold mb-2">Syllabus Management</h2>
                <p className="text-slate-400">Add or remove chapters and topics dynamically.</p>
            </div>
            <div className="p-3 bg-white/10 rounded-xl">
                <Book className="w-8 h-8 text-blue-400" />
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Add Form */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sticky top-6">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center">
                        <Plus className="w-5 h-5 mr-2 text-blue-600" /> Add New Topic
                    </h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Subject</label>
                            <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-200">
                                {['Physics', 'Chemistry', 'Maths'].map(sub => (
                                    <button
                                        key={sub}
                                        type="button"
                                        onClick={() => setSubject(sub as Subject)}
                                        className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
                                            subject === sub 
                                            ? 'bg-white shadow-sm text-blue-600' 
                                            : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                    >
                                        {sub}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Chapter Name</label>
                            <div className="relative">
                                <FolderPlus className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                <input 
                                    type="text" 
                                    value={chapter}
                                    onChange={e => setChapter(e.target.value)}
                                    placeholder="e.g. Electromagnetism"
                                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                    required
                                    list="existing-chapters"
                                />
                                <datalist id="existing-chapters">
                                    {Object.keys(grouped).map(c => <option key={c} value={c} />)}
                                </datalist>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Topic Name</label>
                            <div className="relative">
                                <FilePlus className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                <input 
                                    type="text" 
                                    value={topicName}
                                    onChange={e => setTopicName(e.target.value)}
                                    placeholder="e.g. Gauss's Law"
                                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Add to Syllabus
                        </button>
                    </form>
                </div>
            </div>

            {/* List */}
            <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-slate-800">Existing Syllabus ({syllabus.filter(t => t.subject === subject).length} Items)</h3>
                    <span className="text-xs font-bold px-3 py-1 bg-slate-100 rounded-full text-slate-500">{subject}</span>
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                    {Object.entries(grouped).map(([chap, topics]: [string, Topic[]]) => (
                        <div key={chap} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                                <span className="font-bold text-slate-700 text-sm">{chap}</span>
                                <span className="text-xs text-slate-400">{topics.length} Topics</span>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {topics.map(t => (
                                    <div key={t.id} className="px-4 py-3 flex justify-between items-center hover:bg-slate-50 transition-colors group">
                                        <span className="text-sm text-slate-600">{t.name}</span>
                                        <button 
                                            onClick={() => {
                                                if(confirm(`Delete topic "${t.name}"?`)) onDeleteTopic(t.id);
                                            }}
                                            className="text-slate-300 hover:text-red-500 p-1 rounded opacity-0 group-hover:opacity-100 transition-all"
                                            title="Delete Topic"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    {Object.keys(grouped).length === 0 && (
                        <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed">
                            <p className="text-slate-400">No chapters found for {subject}.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};
