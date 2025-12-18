import React, { useState, useMemo } from 'react';
import { UserProgress, TopicStatus, Topic, User, VideoLesson, ChapterNote, Question, TestAttempt } from '../lib/types';
import { BookReader } from '../components/BookReader';
import { 
  Search, ChevronDown, CheckCircle2, LayoutGrid, BookOpen, 
  Save, Loader2, PlayCircle, X, Youtube, Filter, Info, StickyNote, 
  ArrowLeft, List, CheckSquare, Target, BarChart2, Video, FileText, Check, AlertCircle, Clock, Trophy, ChevronRight, Play, ExternalLink
} from 'lucide-react';

interface SyllabusTrackerProps {
  user: User;
  viewingStudentName?: string;
  subjects: Topic[]; 
  progress: Record<string, UserProgress>;
  onUpdateProgress: (topicId: string, updates: Partial<UserProgress>) => void;
  readOnly?: boolean;
  summaryOnly?: boolean; 
  videoMap?: Record<string, VideoLesson>;
  chapterNotes?: Record<string, ChapterNote>;
  questionBank?: Question[];
  onToggleQuestion?: (topicId: string, questionId: string) => void;
  addTestAttempt?: (attempt: TestAttempt) => void;
  testAttempts?: TestAttempt[];
}

const statusColors: Record<TopicStatus, string> = {
  'NOT_STARTED': 'bg-slate-100 text-slate-600 border-slate-200',
  'PENDING': 'bg-slate-100 text-slate-600 border-slate-200',
  'IN_PROGRESS': 'bg-blue-50 text-blue-700 border-blue-200',
  'COMPLETED': 'bg-green-50 text-green-700 border-green-200',
  'REVISE': 'bg-amber-50 text-amber-700 border-amber-200',
  'BACKLOG': 'bg-red-50 text-red-700 border-red-200',
};

const statusLabels: Record<TopicStatus, string> = {
  'NOT_STARTED': 'Not Started',
  'PENDING': 'Not Started',
  'IN_PROGRESS': 'In Progress',
  'COMPLETED': 'Completed',
  'REVISE': 'Revise',
  'BACKLOG': 'Backlog',
};

export const SyllabusScreen: React.FC<SyllabusTrackerProps> = ({ 
  user, viewingStudentName, subjects, progress, onUpdateProgress, readOnly = false, summaryOnly = false,
  videoMap = {}, chapterNotes = {}, questionBank = [], onToggleQuestion, addTestAttempt, testAttempts = []
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubjectFilter, setActiveSubjectFilter] = useState<string>('ALL');
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [activeNote, setActiveNote] = useState<{title: string, pages: string[]} | null>(null);

  const structuredSubjects = useMemo(() => {
      const grouped: Record<string, Record<string, Topic[]>> = {
          'Physics': {}, 'Chemistry': {}, 'Maths': {}
      };
      
      subjects.forEach(topic => {
          if (!grouped[topic.subject][topic.chapter]) {
              grouped[topic.subject][topic.chapter] = [];
          }
          grouped[topic.subject][topic.chapter].push(topic);
      });

      return Object.entries(grouped).map(([subjectName, chapters]) => ({
          id: subjectName === 'Physics' ? 'phys' : subjectName === 'Chemistry' ? 'chem' : 'math',
          name: subjectName,
          chapters: Object.entries(chapters).map(([chapterName, topics]) => ({
              id: chapterName,
              name: chapterName,
              topics
          }))
      }));
  }, [subjects]);

  const stats = useMemo(() => {
    const totalTopics = subjects.length;
    const completed = subjects.filter(t => progress[t.id]?.status === 'COMPLETED').length;
    const percent = totalTopics > 0 ? Math.round((completed / totalTopics) * 100) : 0;
    return { total: totalTopics, completed, percent };
  }, [subjects, progress]);

  const filteredData = useMemo(() => {
    return structuredSubjects
      .filter(s => activeSubjectFilter === 'ALL' || s.id === activeSubjectFilter)
      .map(subject => ({
        ...subject,
        chapters: subject.chapters
          .map(chapter => ({
            ...chapter,
            topics: chapter.topics.filter(topic => 
              topic.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
          }))
          .filter(chapter => chapter.topics.length > 0) 
      }))
      .filter(subject => subject.chapters.length > 0);
  }, [structuredSubjects, activeSubjectFilter, searchQuery]);

  const getTopicProgress = (topicId: string): UserProgress => {
    return progress[topicId] || {
      topicId, 
      status: 'NOT_STARTED',
      lastRevised: null,
      revisionLevel: 0,
      nextRevisionDate: null,
      solvedQuestions: []
    };
  };

  const TopicDetailView = ({ topic, onClose }: { topic: Topic, onClose: () => void }) => {
      const [activeTab, setActiveTab] = useState<'NOTES' | 'VIDEOS' | 'PRACTICE'>('PRACTICE');
      const topicData = getTopicProgress(topic.id);
      
      const topicQuestions = useMemo(() => 
          questionBank.filter(q => q.topicId === topic.id), 
      [topic.id, questionBank]);

      const videoLesson = videoMap[topic.id];
      const chapterNote = chapterNotes[topic.id];

      const solvedCount = topicData.solvedQuestions?.length || 0;
      const totalCount = topicQuestions.length;
      const solvedPercent = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

      const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
      const [showResults, setShowResults] = useState<Record<string, boolean>>({});

      const handleCheckAnswer = (qId: string, optionIdx: number, correctIdx: number) => {
          if (showResults[qId]) return;
          setSelectedAnswers(prev => ({ ...prev, [qId]: optionIdx }));
          setShowResults(prev => ({ ...prev, [qId]: true }));
          
          if (optionIdx === correctIdx && onToggleQuestion) {
              onToggleQuestion(topic.id, qId);
          }
      };

      return (
          <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col animate-in slide-in-from-right-4 duration-300">
              <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm shrink-0">
                  <div className="flex items-center gap-4">
                      <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                          <ArrowLeft className="w-6 h-6" />
                      </button>
                      <div>
                          <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest gap-2">
                              <span>{topic.subject}</span>
                              <ChevronRight className="w-3 h-3" />
                              <span>{topic.chapter}</span>
                          </div>
                          <h2 className="text-xl font-black text-slate-900 leading-tight">{topic.name}</h2>
                      </div>
                  </div>
                  
                  {!readOnly && (
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden md:block">Update Status</span>
                        <select 
                            value={topicData.status}
                            onChange={(e) => onUpdateProgress(topic.id, { status: e.target.value as TopicStatus })}
                            className={`px-4 py-2 rounded-xl text-xs font-bold border outline-none transition-all ${statusColors[topicData.status || 'NOT_STARTED']}`}
                        >
                            {Object.entries(statusLabels).map(([val, label]) => (
                                <option key={val} value={val} className="bg-white text-slate-800">{label}</option>
                            ))}
                        </select>
                      </div>
                  )}
              </div>

              {/* Tabs */}
              <div className="bg-white border-b border-slate-100 flex justify-center px-4">
                  <div className="flex gap-8">
                    {['PRACTICE', 'NOTES', 'VIDEOS'].map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${
                                activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                  </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                  <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
                      {activeTab === 'PRACTICE' && (
                          <div className="space-y-6">
                               <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                                  <div>
                                      <h3 className="font-bold text-slate-800">Chapter Question Bank</h3>
                                      <p className="text-xs text-slate-500 mt-1">Challenge yourself with {totalCount} practice problems.</p>
                                  </div>
                                  <div className="text-right">
                                      <span className="text-2xl font-black text-blue-600">{solvedPercent}%</span>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase">Mastery</p>
                                  </div>
                               </div>

                               <div className="space-y-6 pb-20">
                                   {topicQuestions.length === 0 ? (
                                       <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed">
                                           No questions available for this topic yet.
                                       </div>
                                   ) : (
                                       topicQuestions.map((q, idx) => (
                                           <div key={q.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                               <div className="flex justify-between items-start">
                                                   <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded">QUESTION {idx + 1}</span>
                                                   <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                                                       q.difficulty === 'HARD' ? 'bg-red-50 text-red-600' : 
                                                       q.difficulty === 'MEDIUM' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
                                                   }`}>{q.difficulty}</span>
                                               </div>
                                               <p className="text-slate-800 font-medium leading-relaxed">{q.text}</p>
                                               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                   {q.options.map((opt, oIdx) => {
                                                       const isSelected = selectedAnswers[q.id] === oIdx;
                                                       const isCorrect = oIdx === q.correctOptionIndex;
                                                       const revealed = showResults[q.id];
                                                       
                                                       let btnStyle = "bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100";
                                                       if (revealed) {
                                                           if (isCorrect) btnStyle = "bg-green-100 border-green-500 text-green-800 ring-2 ring-green-500/20";
                                                           else if (isSelected) btnStyle = "bg-red-100 border-red-500 text-red-800";
                                                           else btnStyle = "bg-slate-50 border-slate-100 text-slate-400 opacity-50";
                                                       } else if (isSelected) {
                                                           btnStyle = "bg-blue-600 border-blue-600 text-white";
                                                       }

                                                       return (
                                                           <button 
                                                                key={oIdx}
                                                                onClick={() => handleCheckAnswer(q.id, oIdx, q.correctOptionIndex)}
                                                                className={`p-4 rounded-xl border text-left text-sm font-medium transition-all ${btnStyle}`}
                                                           >
                                                               <span className="mr-2 font-bold uppercase">{String.fromCharCode(65 + oIdx)}.</span> {opt}
                                                           </button>
                                                       );
                                                   })}
                                               </div>
                                               {showResults[q.id] && (
                                                   <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 ${
                                                       selectedAnswers[q.id] === q.correctOptionIndex ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                                   }`}>
                                                       {selectedAnswers[q.id] === q.correctOptionIndex ? (
                                                           <><CheckCircle2 className="w-4 h-4" /> Correct Answer!</>
                                                       ) : (
                                                           <><AlertCircle className="w-4 h-4" /> Incorrect. The right answer is {String.fromCharCode(65 + q.correctOptionIndex)}.</>
                                                       )}
                                                   </div>
                                               )}
                                           </div>
                                       ))
                                   )}
                               </div>
                          </div>
                      )}

                      {activeTab === 'NOTES' && (
                          <div className="space-y-6">
                              {chapterNote ? (
                                  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
                                      <StickyNote className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                                      <h3 className="text-xl font-bold text-slate-800 mb-2">Detailed Chapter Notes</h3>
                                      <p className="text-slate-500 text-sm mb-6">Expert-curated theory, formulas, and diagrams for {topic.name}.</p>
                                      <button 
                                          onClick={() => setActiveNote({ title: topic.name, pages: chapterNote.pages })}
                                          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center mx-auto gap-2"
                                      >
                                          <BookOpen className="w-5 h-5" /> Open Reader Mode
                                      </button>
                                  </div>
                              ) : (
                                  <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed">
                                      Notes for this topic are currently being prepared.
                                  </div>
                              )}
                          </div>
                      )}

                      {activeTab === 'VIDEOS' && (
                          <div className="space-y-6">
                              {videoLesson ? (
                                  <div className="space-y-4">
                                      <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 shadow-xl border border-slate-800">
                                          <iframe 
                                              src={videoLesson.videoUrl} 
                                              className="w-full h-full"
                                              allowFullScreen
                                              title={topic.name}
                                          ></iframe>
                                      </div>
                                      <div className="bg-white p-6 rounded-2xl border border-slate-200">
                                          <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                              <Youtube className="w-5 h-5 text-red-600" /> Video Explanation
                                          </h3>
                                          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                                              {videoLesson.description || "Comprehensive lecture covering the core concepts of this topic."}
                                          </p>
                                      </div>
                                  </div>
                              ) : (
                                  <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed">
                                      Video lessons are coming soon.
                                  </div>
                              )}
                          </div>
                      )}
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="space-y-8 font-inter animate-in fade-in slide-in-from-bottom-4 relative">
      {activeTopic && <TopicDetailView topic={activeTopic} onClose={() => setActiveTopic(null)} />}
      {activeNote && <BookReader title={activeNote.title} pages={activeNote.pages} onClose={() => setActiveNote(null)} />}

      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-2">
                 <BookOpen className="w-8 h-8 text-white" />
                 <h1 className="text-3xl font-bold">{summaryOnly ? 'Syllabus Summary' : 'Detailed Syllabus Tracker'}</h1>
              </div>
              <p className="text-blue-100 text-lg opacity-90 max-w-2xl">
                  {summaryOnly ? `Reviewing current preparation depth for ${viewingStudentName || user.name}.` : 'Track completion, watch lectures, and solve chapter-wise problems.'}
              </p>
          </div>
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10"></div>
      </div>

      <div className="sticky top-0 md:top-4 z-30 flex flex-col md:flex-row gap-4 items-center justify-between bg-white/95 backdrop-blur-sm p-3 rounded-xl border border-slate-200 shadow-md">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input type="text" placeholder="Search topics..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border-none rounded-lg outline-none text-slate-700" />
        </div>
        <div className="flex space-x-1 w-full md:w-auto overflow-x-auto no-scrollbar">
            {['ALL', 'phys', 'chem', 'math'].map((filter) => {
                const labels: Record<string, string> = { 'ALL': 'All', 'phys': 'Physics', 'chem': 'Chemistry', 'math': 'Maths' };
                return <button key={filter} onClick={() => setActiveSubjectFilter(filter)} className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${activeSubjectFilter === filter ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'}`}>{labels[filter]}</button>;
            })}
        </div>
      </div>

      <div className="space-y-8 pb-24">
        {filteredData.map(subject => (
           <div key={subject.id} className="space-y-6">
              {subject.chapters.map(chapter => (
                <div key={chapter.id}>
                  <div className="flex items-center space-x-3 mb-4 pb-2 border-b border-slate-200/60">
                     <span className={`h-2 w-2 rounded-full ${subject.id === 'phys' ? 'bg-purple-500' : subject.id === 'chem' ? 'bg-amber-500' : 'bg-blue-500'}`}></span>
                     <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">{chapter.name}</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {chapter.topics.map(topic => {
                      const topicData = getTopicProgress(topic.id);
                      const qCount = (questionBank || []).filter(q => q.topicId === topic.id).length;
                      const solvedCount = topicData.solvedQuestions?.length || 0;
                      const qPercent = qCount > 0 ? Math.round((solvedCount / qCount) * 100) : 0;
                      return (
                        <div key={topic.id} onClick={() => !summaryOnly ? setActiveTopic(topic) : null} className={`bg-white border border-slate-200 rounded-xl p-5 shadow-sm transition-all duration-200 group relative overflow-hidden ${!summaryOnly ? 'hover:shadow-lg hover:border-blue-300 cursor-pointer' : ''}`}>
                           <div className="flex justify-between items-start mb-4">
                               <div>
                                   <div className="flex items-center gap-2 mb-1">
                                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${subject.id === 'phys' ? 'bg-purple-100 text-purple-700' : subject.id === 'chem' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{subject.name}</span>
                                       {topicData.status === 'COMPLETED' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                   </div>
                                   <h3 className="text-base font-bold text-slate-800">{topic.name}</h3>
                               </div>
                           </div>
                           <div className="space-y-3">
                               <div className="flex items-center justify-between text-xs text-slate-500">
                                   <span>Solved Questions</span>
                                   <span className="font-bold">{solvedCount} / {qCount}</span>
                               </div>
                               <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                   <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${qPercent}%` }}></div>
                               </div>
                           </div>
                           <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                               <span className={`text-[10px] font-bold uppercase tracking-wider ${statusColors[topicData.status || 'PENDING']}`}>
                                   {statusLabels[topicData.status || 'PENDING']}
                               </span>
                               {!summaryOnly && <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />}
                           </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
           </div>
        ))}
      </div>
    </div>
  );
};