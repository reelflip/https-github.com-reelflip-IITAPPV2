
import React, { useState, useMemo } from 'react';
import { UserProgress, TopicStatus, Topic, User, VideoLesson, ChapterNote, Question, TestAttempt } from '../lib/types';
import { BookReader } from '../components/BookReader';
import { 
  Search, ChevronDown, CheckCircle2, LayoutGrid, BookOpen, 
  Save, Loader2, PlayCircle, X, Youtube, Filter, Info, StickyNote, 
  ArrowLeft, List, CheckSquare, Target, BarChart2, Video, FileText, Check, AlertCircle
} from 'lucide-react';

interface SyllabusTrackerProps {
  user: User;
  subjects: Topic[]; 
  progress: Record<string, UserProgress>;
  onUpdateProgress: (topicId: string, updates: Partial<UserProgress>) => void;
  readOnly?: boolean;
  videoMap?: Record<string, VideoLesson>;
  chapterNotes?: Record<string, ChapterNote>;
  questionBank?: Question[];
  onToggleQuestion?: (topicId: string, questionId: string) => void;
  addTestAttempt?: (attempt: TestAttempt) => void;
}

const statusColors: Record<TopicStatus, string> = {
  'NOT_STARTED': 'bg-slate-100 text-slate-600 border-slate-200',
  'IN_PROGRESS': 'bg-blue-50 text-blue-700 border-blue-200',
  'COMPLETED': 'bg-green-50 text-green-700 border-green-200',
  'REVISE': 'bg-amber-50 text-amber-700 border-amber-200',
  'PENDING': 'bg-slate-100 text-slate-600 border-slate-200',
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
  user, subjects, progress, onUpdateProgress, readOnly = false, 
  videoMap = {}, chapterNotes = {}, questionBank = [], onToggleQuestion, addTestAttempt
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubjectFilter, setActiveSubjectFilter] = useState<string>('ALL');
  
  // Topic Detail View State
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  
  // Modals
  const [activeNote, setActiveNote] = useState<{title: string, pages: string[]} | null>(null);

  // Group flat topics into Subject -> Chapter -> Topic hierarchy
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

  // Filtering
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

  const getProgress = (topicId: string): UserProgress => {
    return progress[topicId] || {
      topicId, 
      status: 'NOT_STARTED',
      lastRevised: null,
      revisionLevel: 0,
      nextRevisionDate: null,
      solvedQuestions: []
    };
  };

  // --- TOPIC DETAIL VIEW COMPONENT ---
  const TopicDetailView = ({ topic, onClose }: { topic: Topic, onClose: () => void }) => {
      const [tab, setTab] = useState<'OVERVIEW' | 'PRACTICE'>('PRACTICE');
      const topicData = getProgress(topic.id);
      
      // Test State
      const [isTesting, setIsTesting] = useState(false);
      const [testAnswers, setTestAnswers] = useState<Record<string, number>>({});
      const [testSubmitted, setTestSubmitted] = useState(false);
      const [testScore, setTestScore] = useState(0);
      const [difficultyFilter, setDifficultyFilter] = useState<'ALL' | 'EASY' | 'MEDIUM' | 'HARD'>('ALL');

      const topicQuestions = useMemo(() => 
          questionBank.filter(q => q.topicId === topic.id), 
      [topic.id]);

      const filteredQuestions = topicQuestions.filter(q => difficultyFilter === 'ALL' || q.difficulty === difficultyFilter);
      
      const solvedCount = topicData.solvedQuestions?.length || 0;
      const totalCount = topicQuestions.length;
      const solvedPercent = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

      const videoLesson = videoMap[topic.id];
      const chapterNote = chapterNotes[topic.id];

      // Auto-switch to overview if no questions
      if (topicQuestions.length === 0 && tab === 'PRACTICE') setTab('OVERVIEW');

      const startTest = () => {
          setIsTesting(true);
          setTestSubmitted(false);
          setTestAnswers({});
          setTestScore(0);
      };

      const submitTest = () => {
          if(!isTesting) return;
          let correct = 0;
          let incorrect = 0;
          let unattempted = 0;
          const total = filteredQuestions.length;

          filteredQuestions.forEach(q => {
              const ans = testAnswers[q.id];
              if(ans === undefined) {
                  unattempted++;
              } else if (ans === q.correctOptionIndex) {
                  correct++;
                  // Mark as solved in progress
                  if (onToggleQuestion && (!topicData.solvedQuestions || !topicData.solvedQuestions.includes(q.id))) {
                      onToggleQuestion(topic.id, q.id);
                  }
              } else {
                  incorrect++;
              }
          });

          // Calculate score (JEE Pattern: +4, -1)
          const score = (correct * 4) - (incorrect * 1);
          setTestScore(score);
          setTestSubmitted(true);

          // Save Attempt
          if(addTestAttempt) {
              addTestAttempt({
                  id: Date.now().toString(),
                  date: new Date().toISOString(),
                  title: `Chapter Practice: ${topic.name}`,
                  testId: `chapter_${topic.id}_${Date.now()}`,
                  score: score,
                  totalMarks: total * 4,
                  accuracy: 0,
                  accuracy_percent: correct + incorrect > 0 ? Math.round((correct / (correct + incorrect)) * 100) : 0,
                  totalQuestions: total,
                  correctCount: correct,
                  incorrectCount: incorrect,
                  unattemptedCount: unattempted
              });
          }
      };

      return (
          <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col animate-in slide-in-from-bottom-10 duration-200">
              {/* Header */}
              <div className="bg-white border-b border-slate-200 px-4 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
                  <div className="flex items-center gap-4">
                      <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                          <ArrowLeft className="w-6 h-6 text-slate-600" />
                      </button>
                      <div>
                          <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                                  topic.subject === 'Physics' ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                                  topic.subject === 'Chemistry' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}>
                                  {topic.subject}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">{topic.chapter}</span>
                          </div>
                          <h2 className="text-xl font-bold text-slate-800 leading-tight">{topic.name}</h2>
                      </div>
                  </div>
                  
                  {/* Status Dropdown */}
                  <div className="relative hidden md:block">
                      <select 
                          value={topicData.status || 'PENDING'}
                          onChange={(e) => onUpdateProgress(topic.id, { status: e.target.value as TopicStatus })}
                          className={`appearance-none pl-4 pr-10 py-2 rounded-lg text-sm font-bold border outline-none cursor-pointer transition-colors ${statusColors[topicData.status || 'PENDING']} ${readOnly ? 'opacity-70 pointer-events-none' : ''}`}
                          disabled={readOnly}
                      >
                          {Object.entries(statusLabels).map(([key, label]) => (
                              <option key={key} value={key}>{label}</option>
                          ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 opacity-50" />
                  </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                  <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
                      
                      {/* Hero Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                              <div className="flex items-center gap-3 mb-2">
                                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Target className="w-5 h-5" /></div>
                                  <h3 className="font-bold text-slate-700">Question Bank</h3>
                              </div>
                              <div className="flex items-end gap-2">
                                  <span className="text-3xl font-black text-slate-800">{totalCount}</span>
                                  <span className="text-sm text-slate-500 mb-1">Total Questions</span>
                              </div>
                          </div>
                          
                          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                              <div className="flex items-center gap-3 mb-2">
                                  <div className="p-2 bg-green-100 text-green-600 rounded-lg"><CheckSquare className="w-5 h-5" /></div>
                                  <h3 className="font-bold text-slate-700">Completion</h3>
                              </div>
                              <div className="flex items-end gap-2">
                                  <span className="text-3xl font-black text-slate-800">{solvedCount}</span>
                                  <span className="text-sm text-slate-500 mb-1">Solved</span>
                              </div>
                              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                                  <div className="bg-green-500 h-full rounded-full transition-all" style={{ width: `${solvedPercent}%` }}></div>
                              </div>
                          </div>

                          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center gap-3">
                              {videoLesson ? (
                                  <a href={videoLesson.videoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-colors border border-red-100">
                                      <Youtube className="w-6 h-6" />
                                      <span className="font-bold text-sm">Watch Video Lesson</span>
                                  </a>
                              ) : (
                                  <div className="flex items-center gap-3 p-3 bg-slate-50 text-slate-400 rounded-xl border border-slate-100">
                                      <Video className="w-6 h-6" />
                                      <span className="font-bold text-sm">No Video Assigned</span>
                                  </div>
                              )}
                              
                              {chapterNote ? (
                                  <button onClick={() => setActiveNote({title: topic.name, pages: chapterNote.pages})} className="flex items-center gap-3 p-3 bg-amber-50 text-amber-700 rounded-xl hover:bg-amber-100 transition-colors border border-amber-100">
                                      <StickyNote className="w-6 h-6" />
                                      <span className="font-bold text-sm">Read Chapter Notes</span>
                                  </button>
                              ) : (
                                  <div className="flex items-center gap-3 p-3 bg-slate-50 text-slate-400 rounded-xl border border-slate-100">
                                      <BookOpen className="w-6 h-6" />
                                      <span className="font-bold text-sm">No Notes Available</span>
                                  </div>
                              )}
                          </div>
                      </div>

                      {/* Content Tabs */}
                      <div>
                          <div className="flex border-b border-slate-200 mb-6">
                              <button 
                                  onClick={() => setTab('PRACTICE')}
                                  className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${tab === 'PRACTICE' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                              >
                                  Practice Problems
                              </button>
                              <button 
                                  onClick={() => setTab('OVERVIEW')}
                                  className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${tab === 'OVERVIEW' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                              >
                                  Chapter Overview
                              </button>
                          </div>

                          {tab === 'OVERVIEW' && (
                              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in">
                                  <h3 className="font-bold text-lg text-slate-800 mb-4">About this Chapter</h3>
                                  <div className="prose prose-slate prose-sm max-w-none">
                                      <p className="text-slate-600 leading-relaxed">
                                          This chapter covers fundamental concepts essential for JEE preparation. 
                                          Mastery of {topic.name} requires understanding both the theoretical underpinnings and their application in complex problem-solving scenarios.
                                      </p>
                                      {videoLesson && videoLesson.description && (
                                          <div className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
                                              <h4 className="text-blue-800 font-bold mb-2 text-xs uppercase">Video Lesson Summary</h4>
                                              <p className="text-blue-700">{videoLesson.description}</p>
                                          </div>
                                      )}
                                  </div>
                              </div>
                          )}

                          {tab === 'PRACTICE' && (
                              <div className="space-y-6 animate-in fade-in">
                                  {!isTesting && !testSubmitted && (
                                      <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center shadow-sm">
                                          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                              <FileText className="w-10 h-10 text-blue-600" />
                                          </div>
                                          <h3 className="text-2xl font-bold text-slate-800 mb-2">Start Chapter Test</h3>
                                          <p className="text-slate-500 mb-8 max-w-md mx-auto">
                                              Test your knowledge with {filteredQuestions.length} practice questions. 
                                              Answers are hidden until you submit. Results will be saved to your analytics.
                                          </p>
                                          
                                          <div className="flex justify-center gap-4 mb-8">
                                               {['ALL', 'EASY', 'MEDIUM', 'HARD'].map(d => (
                                                  <button
                                                      key={d}
                                                      onClick={() => setDifficultyFilter(d as any)}
                                                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
                                                          difficultyFilter === d 
                                                          ? 'bg-slate-800 text-white border-slate-800 shadow-md' 
                                                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                                      }`}
                                                  >
                                                      {d.charAt(0) + d.slice(1).toLowerCase()}
                                                  </button>
                                              ))}
                                          </div>

                                          <button 
                                              onClick={startTest}
                                              disabled={filteredQuestions.length === 0}
                                              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                          >
                                              Begin Test ({filteredQuestions.length} Qs)
                                          </button>
                                      </div>
                                  )}

                                  {(isTesting || testSubmitted) && (
                                      <div className="space-y-6">
                                          {testSubmitted && (
                                              <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg mb-6 flex flex-col md:flex-row justify-between items-center gap-6">
                                                  <div>
                                                      <h3 className="text-2xl font-bold mb-1">Test Completed!</h3>
                                                      <p className="text-slate-400 text-sm">Your results have been saved to Analytics.</p>
                                                  </div>
                                                  <div className="flex gap-8 text-center">
                                                      <div>
                                                          <div className="text-3xl font-black text-blue-400">{testScore}</div>
                                                          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Score</div>
                                                      </div>
                                                      <div className="w-px bg-slate-700 h-10"></div>
                                                      <div>
                                                          <div className="text-3xl font-black text-green-400">
                                                              {Math.round((Object.entries(testAnswers).filter(([id, ans]) => 
                                                                  filteredQuestions.find(q => q.id === id)?.correctOptionIndex === ans
                                                              ).length / filteredQuestions.length) * 100)}%
                                                          </div>
                                                          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Accuracy</div>
                                                      </div>
                                                  </div>
                                                  <button onClick={() => { setIsTesting(false); setTestSubmitted(false); }} className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-lg font-bold text-sm transition-colors">
                                                      Close
                                                  </button>
                                              </div>
                                          )}

                                          <div className="space-y-6">
                                              {filteredQuestions.map((q, idx) => {
                                                  const selected = testAnswers[q.id];
                                                  const isCorrect = testSubmitted && selected === q.correctOptionIndex;
                                                  const isWrong = testSubmitted && selected !== undefined && selected !== q.correctOptionIndex;
                                                  
                                                  return (
                                                      <div key={q.id} className={`bg-white p-6 rounded-xl border transition-all ${
                                                          isCorrect ? 'border-green-300 bg-green-50/20' : 
                                                          isWrong ? 'border-red-300 bg-red-50/20' : 'border-slate-200'
                                                      }`}>
                                                          <div className="flex items-start gap-4">
                                                              <div className="bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-slate-500 shrink-0">
                                                                  {idx + 1}
                                                              </div>
                                                              <div className="flex-1">
                                                                  <div className="flex flex-wrap items-center gap-2 mb-3">
                                                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                                                          q.difficulty === 'HARD' ? 'bg-red-50 text-red-700 border-red-100' :
                                                                          q.difficulty === 'EASY' ? 'bg-green-50 text-green-700 border-green-100' :
                                                                          'bg-orange-50 text-orange-700 border-orange-100'
                                                                      }`}>
                                                                          {q.difficulty}
                                                                      </span>
                                                                      {testSubmitted && isCorrect && <span className="text-green-600 text-xs font-bold flex items-center"><CheckCircle2 className="w-3 h-3 mr-1"/> Correct</span>}
                                                                      {testSubmitted && isWrong && <span className="text-red-600 text-xs font-bold flex items-center"><AlertCircle className="w-3 h-3 mr-1"/> Incorrect</span>}
                                                                  </div>
                                                                  
                                                                  <p className="text-slate-800 font-medium mb-4 leading-relaxed">{q.text}</p>
                                                                  
                                                                  <div className="space-y-2">
                                                                      {q.options.map((opt, i) => {
                                                                          let optionClass = "border-slate-200 bg-white hover:bg-slate-50";
                                                                          
                                                                          if (testSubmitted) {
                                                                              if (i === q.correctOptionIndex) optionClass = "border-green-500 bg-green-50 text-green-800 font-bold ring-1 ring-green-500";
                                                                              else if (i === selected && i !== q.correctOptionIndex) optionClass = "border-red-300 bg-red-50 text-red-800";
                                                                              else optionClass = "border-slate-100 bg-slate-50 opacity-60";
                                                                          } else if (selected === i) {
                                                                              optionClass = "border-blue-500 bg-blue-50 text-blue-800 ring-1 ring-blue-500";
                                                                          }

                                                                          return (
                                                                              <div 
                                                                                  key={i} 
                                                                                  onClick={() => !testSubmitted && setTestAnswers(prev => ({ ...prev, [q.id]: i }))}
                                                                                  className={`p-3 rounded-lg border text-sm transition-all cursor-pointer flex items-center ${optionClass}`}
                                                                              >
                                                                                  <div className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center text-[10px] ${
                                                                                      selected === i || (testSubmitted && i === q.correctOptionIndex) 
                                                                                      ? 'border-current' : 'border-slate-300'
                                                                                  }`}>
                                                                                      {String.fromCharCode(65+i)}
                                                                                  </div>
                                                                                  {opt}
                                                                              </div>
                                                                          );
                                                                      })}
                                                                  </div>
                                                              </div>
                                                          </div>
                                                      </div>
                                                  );
                                              })}
                                          </div>

                                          {!testSubmitted && (
                                              <div className="sticky bottom-4 z-20 flex justify-center pt-4">
                                                  <button 
                                                      onClick={submitTest}
                                                      className="bg-slate-900 text-white font-bold py-3 px-12 rounded-full shadow-xl hover:bg-slate-800 hover:scale-105 transition-all active:scale-95"
                                                  >
                                                      Submit Test
                                                  </button>
                                              </div>
                                          )}
                                      </div>
                                  )}
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="space-y-8 font-inter animate-in fade-in slide-in-from-bottom-4 relative">
      
      {/* Detail Overlay */}
      {activeTopic && (
          <TopicDetailView topic={activeTopic} onClose={() => setActiveTopic(null)} />
      )}

      {/* Book Reader Modal */}
      {activeNote && (
          <BookReader 
              title={activeNote.title}
              pages={activeNote.pages}
              onClose={() => setActiveNote(null)}
          />
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-2">
                 <BookOpen className="w-8 h-8 text-white" />
                 <h1 className="text-3xl font-bold">Detailed Syllabus Tracker</h1>
              </div>
              <p className="text-blue-100 text-lg opacity-90 max-w-2xl">Track completion, watch lectures, and solve chapter-wise problems.</p>
          </div>
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10"></div>
          <div className="absolute bottom-0 right-20 w-32 h-32 rounded-full bg-white opacity-10"></div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Student Overview: <span className="text-blue-600">{user.name.split(' ')[0]}</span></h3>
          <p className="text-xs text-slate-500">
            {user.name.split(' ')[0]} has completed <span className="font-bold text-slate-700">{stats.completed}</span> out of <span className="font-bold text-slate-700">{stats.total}</span> major topics.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
           <div className="flex justify-between items-end mb-2">
             <div>
               <h3 className="text-sm font-semibold text-slate-900">Overall Progress</h3>
               <p className="text-3xl font-bold text-slate-800 mt-1">{stats.percent}<span className="text-base font-normal text-slate-400 ml-1">%</span></p>
             </div>
             <LayoutGrid className="text-slate-200 w-8 h-8" />
           </div>
           <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full transition-all duration-1000" style={{ width: `${stats.percent}%` }}></div>
           </div>
        </div>
      </div>

      {/* Controls */}
      <div className="sticky top-0 md:top-4 z-30 flex flex-col md:flex-row gap-4 items-center justify-between bg-white/95 backdrop-blur-sm p-3 rounded-xl border border-slate-200 shadow-md">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search topics..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-blue-100 outline-none text-slate-700 placeholder:text-slate-400"
          />
        </div>
        
        <div className="flex space-x-1 w-full md:w-auto overflow-x-auto no-scrollbar">
            {['ALL', 'phys', 'chem', 'math'].map((filter) => {
                const labels: Record<string, string> = { 'ALL': 'All', 'phys': 'Physics', 'chem': 'Chemistry', 'math': 'Maths' };
                return (
                <button
                    key={filter}
                    onClick={() => setActiveSubjectFilter(filter)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    activeSubjectFilter === filter 
                        ? 'bg-slate-800 text-white shadow-md' 
                        : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
                    }`}
                >
                    {labels[filter]}
                </button>
                );
            })}
        </div>
      </div>

      {/* Syllabus List */}
      <div className="space-y-8">
        {filteredData.map(subject => (
           <div key={subject.id} className="space-y-6">
              {subject.chapters.map(chapter => (
                <div key={chapter.id}>
                  <div className="flex items-center space-x-3 mb-4 pb-2 border-b border-slate-200/60">
                     <span className={`h-2 w-2 rounded-full ${
                        subject.id === 'phys' ? 'bg-purple-500' : 
                        subject.id === 'chem' ? 'bg-amber-500' : 'bg-blue-500'
                     }`}></span>
                     <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">{chapter.name}</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {chapter.topics.map(topic => {
                      const topicData = getProgress(topic.id);
                      const qCount = questionBank.filter(q => q.topicId === topic.id).length;
                      const solvedCount = topicData.solvedQuestions?.length || 0;
                      const qPercent = qCount > 0 ? Math.round((solvedCount / qCount) * 100) : 0;

                      return (
                        <div 
                            key={topic.id} 
                            onClick={() => setActiveTopic(topic)}
                            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer group relative overflow-hidden"
                        >
                           <div className="flex justify-between items-start mb-4">
                               <div>
                                   <div className="flex items-center gap-2 mb-1">
                                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                            subject.id === 'phys' ? 'bg-purple-100 text-purple-700' : 
                                            subject.id === 'chem' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {subject.name}
                                        </span>
                                        {topicData.status === 'COMPLETED' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                   </div>
                                   <h3 className="text-base font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{topic.name}</h3>
                               </div>
                           </div>

                           <div className="space-y-3">
                               <div className="flex items-center justify-between text-xs text-slate-500">
                                   <span>{qCount} Questions</span>
                                   <span className="font-bold">{solvedCount} Solved</span>
                               </div>
                               <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                   <div className="h-full bg-blue-500 rounded-full" style={{ width: `${qPercent}%` }}></div>
                               </div>
                           </div>

                           <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                               <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                   topicData.status === 'COMPLETED' ? 'text-green-600' : 
                                   topicData.status === 'IN_PROGRESS' ? 'text-blue-600' : 'text-slate-400'
                               }`}>
                                   {statusLabels[topicData.status || 'NOT_STARTED']}
                               </span>
                               <span className="text-xs font-bold text-blue-600 flex items-center group-hover:underline">
                                   View Chapter <ArrowLeft className="w-3 h-3 ml-1 rotate-180" />
                               </span>
                           </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
           </div>
        ))}

        {filteredData.length === 0 && (
            <div className="text-center py-20">
                <Filter className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <h3 className="text-slate-500 font-medium">No topics found</h3>
                <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filters</p>
            </div>
        )}
      </div>
    </div>
  );
};
