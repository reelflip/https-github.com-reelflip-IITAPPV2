

import React, { useState } from 'react';
import { Flashcard, MemoryHack, BlogPost } from '../lib/types';

interface Props {
  flashcards: Flashcard[];
  hacks: MemoryHack[];
  blogs: BlogPost[];
  onAddFlashcard: (card: Omit<Flashcard, 'id'>) => void;
  onAddHack: (hack: Omit<MemoryHack, 'id'>) => void;
  onAddBlog: (blog: Omit<BlogPost, 'id' | 'date'>) => void;
  onDelete: (type: 'flashcard' | 'hack' | 'blog', id: number) => void;
  initialTab?: 'flashcards' | 'hacks' | 'blog';
}

export const ContentManagerScreen: React.FC<Props> = ({ 
  flashcards, hacks, blogs, 
  onAddFlashcard, onAddHack, onAddBlog, onDelete,
  initialTab = 'flashcards'
}) => {
  const [activeTab, setActiveTab] = useState<'flashcards' | 'hacks' | 'blog'>(initialTab);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-slate-900">Content Manager</h2>
           <p className="text-slate-500">Manage database content visible to users.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
           {(['flashcards', 'hacks', 'blog'] as const).map(tab => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`px-4 py-2 text-sm font-bold capitalize rounded-md transition-all ${
                 activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
               }`}
             >
               {tab}
             </button>
           ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm min-h-[500px]">
         {activeTab === 'flashcards' && (
            <FlashcardManager cards={flashcards} onAdd={onAddFlashcard} onDelete={onDelete} />
         )}
         {activeTab === 'hacks' && (
            <HacksManager hacks={hacks} onAdd={onAddHack} onDelete={onDelete} />
         )}
         {activeTab === 'blog' && (
            <BlogManager blogs={blogs} onAdd={onAddBlog} onDelete={onDelete} />
         )}
      </div>
    </div>
  );
};

// --- Sub-Components ---

const FlashcardManager = ({ cards, onAdd, onDelete }: any) => {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ front, back });
    setFront('');
    setBack('');
  };

  return (
    <div className="space-y-6">
       <form onSubmit={handleSubmit} className="flex gap-4 items-end bg-slate-50 p-4 rounded-lg border border-slate-200">
         <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 mb-1">Front (Question)</label>
            <input required value={front} onChange={e => setFront(e.target.value)} className="w-full p-2 border rounded" placeholder="e.g. Unit of Force" />
         </div>
         <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 mb-1">Back (Answer)</label>
            <input required value={back} onChange={e => setBack(e.target.value)} className="w-full p-2 border rounded" placeholder="e.g. Newton (N)" />
         </div>
         <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700">Add Card</button>
       </form>

       <div className="space-y-2">
         {cards.map((c: Flashcard) => (
           <div key={c.id} className="flex justify-between items-center p-3 border rounded hover:bg-slate-50">
              <div>
                 <span className="font-bold text-slate-800">Q: {c.front}</span>
                 <p className="text-slate-500 text-sm">A: {c.back}</p>
              </div>
              <button onClick={() => onDelete('flashcard', c.id)} className="text-red-500 hover:bg-red-50 p-2 rounded">🗑️</button>
           </div>
         ))}
       </div>
    </div>
  );
};

const HacksManager = ({ hacks, onAdd, onDelete }: any) => {
  const [title, setTitle] = useState('');
  const [tag, setTag] = useState('');
  const [desc, setDesc] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ title, description: desc, tag });
    setTitle('');
    setDesc('');
    setTag('');
  };

  return (
    <div className="space-y-6">
       <form onSubmit={handleSubmit} className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
         <div className="flex gap-4">
            <div className="flex-1">
                <label className="block text-xs font-bold text-slate-500 mb-1">Title</label>
                <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded" placeholder="e.g. Periodic Table Trick" />
            </div>
            <div className="w-1/3">
                <label className="block text-xs font-bold text-slate-500 mb-1">Tag</label>
                <input required value={tag} onChange={e => setTag(e.target.value)} className="w-full p-2 border rounded" placeholder="e.g. Chemistry" />
            </div>
         </div>
         <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Content</label>
            <textarea required value={desc} onChange={e => setDesc(e.target.value)} className="w-full p-2 border rounded" rows={3} placeholder="Describe the hack..." />
         </div>
         <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700">Add Memory Hack</button>
       </form>

       <div className="space-y-2">
         {hacks.map((h: MemoryHack) => (
           <div key={h.id} className="flex justify-between items-center p-3 border rounded hover:bg-slate-50">
              <div>
                 <div className="flex items-center gap-2">
                   <span className="font-bold text-slate-800">{h.title}</span>
                   <span className="text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-600">{h.tag}</span>
                 </div>
                 <p className="text-slate-500 text-sm truncate max-w-lg">{h.description}</p>
              </div>
              <button onClick={() => onDelete('hack', h.id)} className="text-red-500 hover:bg-red-50 p-2 rounded">🗑️</button>
           </div>
         ))}
       </div>
    </div>
  );
};

const BlogManager = ({ blogs, onAdd, onDelete }: any) => {
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ title, excerpt, content, imageUrl: image, author: 'Admin' });
    setTitle('');
    setExcerpt('');
    setContent('');
    setImage('');
  };

  return (
    <div className="space-y-6">
       <form onSubmit={handleSubmit} className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
         <div>
             <label className="block text-xs font-bold text-slate-500 mb-1">Blog Title</label>
             <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded" placeholder="e.g. How to crack JEE in 3 months" />
         </div>
         <div>
             <label className="block text-xs font-bold text-slate-500 mb-1">Excerpt (Short Summary)</label>
             <input required value={excerpt} onChange={e => setExcerpt(e.target.value)} className="w-full p-2 border rounded" placeholder="A brief overview..." />
         </div>
         <div>
             <label className="block text-xs font-bold text-slate-500 mb-1">Full Content (HTML Supported)</label>
             <textarea required value={content} onChange={e => setContent(e.target.value)} className="w-full p-2 border rounded font-mono text-sm" rows={5} placeholder="<p>Write your blog post here...</p>" />
         </div>
         <div>
             <label className="block text-xs font-bold text-slate-500 mb-1">Cover Image URL (Optional)</label>
             <input value={image} onChange={e => setImage(e.target.value)} className="w-full p-2 border rounded" placeholder="https://..." />
         </div>
         <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700">Publish Post</button>
       </form>

       <div className="space-y-2">
         {blogs.map((b: BlogPost) => (
           <div key={b.id} className="flex justify-between items-center p-3 border rounded hover:bg-slate-50">
              <div>
                 <span className="font-bold text-slate-800">{b.title}</span>
                 <p className="text-slate-500 text-xs">By {b.author} • {new Date(b.date).toLocaleDateString()}</p>
              </div>
              <button onClick={() => onDelete('blog', b.id)} className="text-red-500 hover:bg-red-50 p-2 rounded">🗑️</button>
           </div>
         ))}
       </div>
    </div>
  );
};