import React, { useState, useEffect } from 'react';
import { Topic, Subject, ChapterNote, VideoLesson } from '../lib/types';
import { Plus, Trash2, FolderPlus, FilePlus, Book, FileText, Save, X, ChevronLeft, ChevronRight, Video, Youtube } from 'lucide-react';
import { RichTextEditor } from '../components/RichTextEditor';

interface Props {
  syllabus: Topic[];
  onAddTopic: (topic: Omit<Topic, 'id'>) => void;
  onDeleteTopic: (id: string) => void;
  chapterNotes?: Record<string, ChapterNote>;
  onUpdateNotes?: (topicId: string, pages: string[]) => void;
  // New props for Video Management
  videoMap?: Record<string, VideoLesson>;
  onUpdateVideo?: (topicId: string, url: string, description: string) => void;
}

export const AdminSyllabusScreen: React.FC<Props> = ({ 
    syllabus, onAddTopic, onDeleteTopic, chapterNotes = {}, onUpdateNotes,
    videoMap = {}, onUpdateVideo
}) => {
  const [subject, setSubject] = useState<Subject>('Physics');
  const [chapter, setChapter] = useState('');
  const [topicName, setTopicName] = useState('');
  
  // Notes Editor State
  const [editingNoteTopic, setEditingNoteTopic] = useState<{id: string, name: string} | null>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [activePageIndex, setActivePageIndex] = useState(0);

  // Video Editor State
  const [editingVideoTopic, setEditingVideoTopic] = useState<{id: string, name: string} | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDesc, setVideoDesc] = useState('');

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
  };

  // --- Notes Functions ---
  const openNoteEditor = (topic: Topic) => {
      const existing = chapterNotes[topic.id];
      setPages(existing ? [...existing.pages] : ['']);
      setEditingNoteTopic({ id: topic.id, name: topic.name });
      setActivePageIndex(0);
  };

  const saveNotes = () => {
      if(editingNoteTopic && onUpdateNotes) {
          onUpdateNotes(editingNoteTopic.id, pages);
          setEditingNoteTopic(null);
      }
  };

  const updateCurrentPage = (content: string) => {
      const newPages = [...pages];
      newPages[activePageIndex] = content;
      setPages(newPages);
  };

  const addPage = () => {
      setPages([...pages, '']);
      setActivePageIndex(pages.length);
  };

  const deletePage = (index: number) => {
      if (pages.length <= 1) {
          setPages(['']);
          return;
      }
      const newPages = pages.filter((_, i) => i !== index);
      setPages(newPages);
      if (activePageIndex >= newPages.length) setActivePageIndex(newPages.length - 1);
  };

  // --- Video Functions ---
  const openVideoEditor = (topic: Topic) => {
      const existing = videoMap[topic.id];
      setVideoUrl(existing ? existing.videoUrl : '');
      setVideoDesc(existing ? existing.description || '' : '');
      setEditingVideoTopic({ id: topic.id, name: topic.name });
  };

  const saveVideo = () => {
      if (editingVideoTopic && onUpdateVideo) {
          let finalUrl = videoUrl;
          // Basic YouTube link converter
          if (finalUrl.includes('watch?v=')) {
              finalUrl = finalUrl.replace('watch?v=', 'embed/');
          } else if (finalUrl.includes('youtu.be/')) {
              finalUrl = finalUrl.replace('youtu.be/', 'www.youtube.com/embed/');
          }
          onUpdateVideo(editingVideoTopic.id, finalUrl, videoDesc);
          setEditingVideoTopic(null);
      }
  };

  return (
    <div className="space-y-6 animate-in fade-in relative">
        
        {/* Notes Editor Overlay */}
        {editingNoteTopic && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] flex overflow-hidden shadow-2xl animate-in zoom-in-95">
                    {/* Sidebar */}
                    <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col">
                        <div className="p-4 border-b border-slate-200">
                            <h3 className="font-bold text-slate-800 text-sm truncate">{editingNoteTopic.name}</h3>
                            <p className="text-xs text-slate-500">Managing {pages.length} Pages</p>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {pages.map((_, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={() => setActivePageIndex(idx)}
                                    className={`p-3 rounded-lg border cursor-pointer flex justify-between items-center transition-all ${
                                        activePageIndex === idx ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-slate-200 hover:border-blue-300'
                                    }`}
                                >
                                    <span className={`text-sm font-bold ${activePageIndex === idx ? 'text-blue-700' : 'text-slate-600'}`}>Page {idx + 1}</span>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); deletePage(idx); }}
                                        className="text-slate-400 hover:text-red-500 p-1"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            <button 
                                onClick={addPage}
                                className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-blue-400 hover:text-blue-600 text-sm font-bold transition-all flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Add Page
                            </button>
                        </div>
                    </div>

                    {/* Editor */}
                    <div className="flex-1 flex flex-col">
                        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
                            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Editing Page {activePageIndex + 1}</span>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setEditingNoteTopic(null)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-800">Cancel</button>
                                <button onClick={saveNotes} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-md flex items-center gap-2">
                                    <Save className="w-4 h-4" /> Save All
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
                            <RichTextEditor 
                                content={pages[activePageIndex]} 
                                onChange={updateCurrentPage}
                                placeholder="Start typing your chapter notes here..."
                                className="h-full min-h-[500px]"
                            />
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Video Editor Overlay */}
        {editingVideoTopic && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95">
                    <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Youtube className="w-5 h-5 text-red-600" /> 
                            Video Lesson: <span className="text-slate-600 font-normal">{editingVideoTopic.name}</span>
                        </h3>
                        <button onClick={() => setEditingVideoTopic(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">YouTube URL</label>
                            <input 
                                type="text"
                                className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-100"
                                placeholder="https://www.youtube.com/watch?v=..."
                                value={videoUrl}
                                onChange={(e) => setVideoUrl(e.target.value)}
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Paste any YouTube link. We'll convert it automatically.</p>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Description</label>
                            <textarea 
                                className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-100 h-24 resize-none"
                                placeholder="Short description of the video..."
                                value={videoDesc}
                                onChange={(e) => setVideoDesc(e.target.value)}
                            />
                        </div>
                        <div className="pt-2 flex gap-3">
                            <button onClick={saveVideo} className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition-colors">Save Video</button>
                            {videoUrl && (
                                <button 
                                    onClick={() => { setVideoUrl(''); setVideoDesc(''); }}
                                    className="px-4 py-3 border border-red-200 text-red-600 rounded-lg font-bold hover:bg-red-50 transition-colors"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Header */}
        <div className="bg-slate-900 rounded-xl p-8 text-white shadow-lg flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold mb-2">Syllabus & Content</h2>
                <p className="text-slate-400">Manage topics, chapter notes, and video lessons.</p>
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
                                {topics.map(t => {
                                    const hasNotes = chapterNotes && chapterNotes[t.id];
                                    const hasVideo = videoMap && videoMap[t.id];
                                    return (
                                        <div key={t.id} className="px-4 py-3 flex justify-between items-center hover:bg-slate-50 transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm text-slate-600">{t.name}</span>
                                                <div className="flex gap-1">
                                                    {hasNotes && <span className="bg-green-100 text-green-700 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Note</span>}
                                                    {hasVideo && <span className="bg-red-100 text-red-700 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Video</span>}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <button 
                                                    onClick={() => openNoteEditor(t)}
                                                    className="flex items-center gap-1 bg-white border border-slate-200 text-slate-600 hover:text-blue-700 hover:border-blue-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                                >
                                                    <FileText className="w-3 h-3" /> Notes
                                                </button>
                                                <button 
                                                    onClick={() => openVideoEditor(t)}
                                                    className="flex items-center gap-1 bg-white border border-slate-200 text-slate-600 hover:text-red-700 hover:border-red-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                                >
                                                    <Video className="w-3 h-3" /> Video
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        if(confirm(`Delete topic "${t.name}"?`)) onDeleteTopic(t.id);
                                                    }}
                                                    className="text-slate-300 hover:text-red-500 p-1.5 rounded transition-all bg-white hover:bg-red-50 border border-transparent hover:border-red-200"
                                                    title="Delete Topic"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
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