
import React, { useState, useMemo } from 'react';
import { UserProgress, TopicStatus, Topic, User, VideoLesson, ChapterNote, Question, TestAttempt } from '../lib/types';
import { BookReader } from '../components/BookReader';
import { 
  Search, ChevronDown, CheckCircle2, LayoutGrid, BookOpen, 
  Save, Loader2, PlayCircle, X, Youtube, Filter, Info, StickyNote, 
  ArrowLeft, List, CheckSquare, Target, BarChart2, Video, FileText, Check, AlertCircle, Clock, Trophy, ChevronRight, Play
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
  testAttempts?: TestAttempt[];
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
  videoMap = {}, chapterNotes = {}, questionBank = [], onToggleQuestion, addTestAttempt, testAttempts = []
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
      const [reviewingAttempt, setReviewingAttempt] = useState<TestAttempt | null>(null);

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

      // Get Past Attempts for this topic
      const topicAttempts = useMemo(() => {
          return testAttempts
              .filter(a => a.topicId === topic.id)
              .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }, [testAttempts, topic.id]);

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
          
          const detailedResults: any[] = [];

          filteredQuestions.forEach(q => {
              const ans = testAnswers[q.id];
              let status = 'UNATTEMPTED';
              if(ans === undefined) {
                  unattempted++;
              } else if (ans === q.correctOptionIndex) {
                  correct++;
                  status = 'CORRECT';
                  // Mark as solved in progress
                  if (onToggleQuestion && (!topicData.solvedQuestions || !topicData.solvedQuestions.includes(q.id))) {
                      onToggleQuestion(topic.id, q.id);
                  }
              } else {
                  incorrect++;
                  status = 'INCORRECT';
              }
              
              detailedResults.push({
                  questionId: q.id,
                  subjectId: q.subjectId,
                  topicId: q.topicId,
                  status,
                  selectedOptionIndex: ans
              });
          });

          // Calculate score (JEE Pattern: +4, -1)
          const score = (correct * 4) - (incorrect * 1);
          setTestScore(score);
          setTestSubmitted(true);

          // Save Attempt with correct metadata
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
                  unattemptedCount: unattempted,
                  topicId: topic.id,
                  difficulty: difficultyFilter,
                  detailedResults
              });
          }
      };

      // Review Modal Logic
      const renderReviewModal = () => {
          if(!reviewingAttempt) return null;
          
          // Reconstruct questions based on ID lookup in the global question bank
          const questionList: Question[] = [];
          if (reviewingAttempt.detailedResults) {
              reviewingAttempt.detailedResults.forEach(res => {
                  const q = questionBank.find(q => q.id === res.questionId);
                  if(q) questionList.push(q);
              });
          }

          return (
              <div className="fixed inset-0 z-[60] bg-slate-50 flex flex-col animate-in slide-in-from-right-4 duration-300">
                  <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm shrink-0 sticky top-0 z-10">
                      <div className="flex items-center gap-4">
                          <button onClick={() => setReviewingAttempt(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-800">
                              <ArrowLeft className="w-6 h-6" />
                          </button>
                          <div>
                              <h2 className="text-xl font-black text-slate-900 leading-tight">Review Results</h2>
                              <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">{reviewingAttempt.title}</p>
                          </div>
                      </div>
                      <div className="flex gap-4">
                          <div className="text-right">
                              <span className="block text-xs font-bold text-slate-400 uppercase">Score</span>
                              <span className="text-lg font-black text-blue-600">{reviewingAttempt.score}</span>
                          </div>
                      </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
                      <div className="max-w-4xl mx-auto space-y-6">
                          {questionList.length === 0 && <p className="text-center text-slate-400">Questions data not available.</p>}
                          {questionList.map((q, idx) => {
                              const res = reviewingAttempt.detailedResults?.find(r => r.questionId === q.id);
                              const userSelected = res?.selectedOptionIndex;
                              const isCorrect = res?.status === 'CORRECT';
                              const isSkipped = res?.status === 'UNATTEMPTED';

                              return (
                                  <div key={q.id} className={`bg-white p-6 rounded-xl border-2 transition-all ${isCorrect ? 'border-green-100' : isSkipped ? 'border-slate-100' : 'border-red-100'}`}>
                                      <div className="flex gap-4">
                                          <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-bold text-sm ${isCorrect ? 'bg-green-100 text-green-700' : isSkipped ? 'bg-slate-100 text-slate-500' : 'bg-red-100 text-red-700'}`}>{idx + 1}</div>
                                          <div className="flex-1">
                                              <p className="text-slate-800 font-medium text-lg mb-4">{q.text}</p>
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                  {q.options.map((opt, i) => {
                                                      const isThisCorrect = i === q.correctOptionIndex;
                                                      const isThisSelected = i === userSelected;
                                                      let style = "border-slate-100 bg-white text-slate-600 opacity-60 grayscale";
                                                      if (isThisCorrect) style = "border-green-500 bg-green-50 text-green-800 font-bold ring-1 ring-green-500";
                                                      else if (isThisSelected) style = "border-red-400 bg-red-50 text-red-800 font-medium";
                                                      
                                                      return (
                                                          <div key={i} className={`p-3 rounded-lg border flex items-center gap-3 text-sm ${style}`}>
                                                              <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs shrink-0 ${isThisCorrect ? 'border-green-600 bg-green-200 text-green-800' : 'border-slate-300'}`}>{String.fromCharCode(65 + i)}</div>
                                                              {opt}
                                                              {isThisCorrect && <CheckCircle2 className="w-4 h-4 ml-auto text-green-600" />}
                                                              {isThisSelected && !isThisCorrect && <AlertCircle className="w-4 h-4 ml-auto text-red-500" />}
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
                  </div>
              </div>
          );
      };

      return (
          <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col animate-in slide-in-from-right-4 duration-300">
              {/* Header */}
              <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm shrink-0 sticky top-0 z-10">
                  <div className="flex items-center gap-4">
                      <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-800">
                          <ArrowLeft className="w-6 h-6" />
                      </button>
                      <div className="flex flex-col">
                          <div className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider gap-2">
                              <span>{topic.subject}</span>
                              <ChevronRight className="w-3 h-3" />
                              <span>{topic.chapter}</span>
                          </div>
                          <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">{topic.name}</h2>
                      </div>
                  </div>
                  
                  {/* Status Dropdown */}
                  <div className="relative group">
                      <div className="relative">
                          <select 
                              value={topicData.status || 'PENDING'}
                              onChange={(e) => onUpdateProgress(topic.id, { status: e.target.value as TopicStatus })}
                              className={`appearance-none pl-4 pr-10 py-2.5 rounded-xl text-sm font-bold border outline-none cursor-pointer transition-all hover:shadow-md ${statusColors[topicData.status || 'PENDING']} ${readOnly ? 'opacity-70 pointer-events-none' : ''}`}
                              disabled={readOnly}
                          >
                              {Object.entries(statusLabels).map(([key, label]) => (
                                  <option key={key} value={key}>{label}</option>
                              ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 opacity-60 pointer-events-none" />
                      </div>
                  </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-slate-50">
                  <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
                      
                      {/* Dashboard-style Stats Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          {/* Progress Card */}
                          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm col-span-2 relative overflow-hidden flex flex-col justify-between">
                              <div className="relative z-10 flex justify-between items-start">
                                  <div>
                                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Topic Progress</p>
                                      <div className="flex items-baseline gap-2">
                                          <h3 className="text-3xl font-black text-slate-800">{solvedCount}<span className="text-lg text-slate-400 font-medium">/{totalCount}</span></h3>
                                          <span className="text-sm font-bold text-slate-500">Questions</span>
                                      </div>
                                  </div>
                                  <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                      <Target className="w-6 h-6" />
                                  </div>
                              </div>
                              <div className="mt-4">
                                  <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                                      <span>Completion</span>
                                      <span>{solvedPercent}%</span>
                                  </div>
                                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                      <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${solvedPercent}%` }}></div>
                                  </div>
                              </div>
                          </div>

                          {/* Resource Cards */}
                          <button 
                              onClick={() => videoLesson ? window.open(videoLesson.videoUrl, '_blank') : null}
                              disabled={!videoLesson}
                              className={`p-5 rounded-2xl border shadow-sm flex flex-col justify-between transition-all group text-left ${videoLesson ? 'bg-white border-slate-200 hover:border-red-300 hover:shadow-md cursor-pointer' : 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'}`}
                          >
                              <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${videoLesson ? 'bg-red-50 text-red-600 group-hover:scale-110 transition-transform' : 'bg-slate-200 text-slate-400'}`}>
                                  <Youtube className="w-5 h-5" />
                              </div>
                              <div>
                                  <span className="text-slate-900 font-bold text-sm block">Video Lesson</span>
                                  <span className="text-slate-500 text-xs">{videoLesson ? 'Watch Now' : 'Not Available'}</span>
                              </div>
                          </button>

                          <button 
                              onClick={() => chapterNote ? setActiveNote({title: topic.name, pages: chapterNote.pages}) : null}
                              disabled={!chapterNote}
                              className={`p-5 rounded-2xl border shadow-sm flex flex-col justify-between transition-all group text-left ${chapterNote ? 'bg-white border-slate-200 hover:border-amber-300 hover:shadow-md cursor-pointer' : 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'}`}
                          >
                              <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${chapterNote ? 'bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform' : 'bg-slate-200 text-slate-400'}`}>
                                  <StickyNote className="w-5 h-5" />
                              </div>
                              <div>
                                  <span className="text-slate-900 font-bold text-sm block">Concept Notes</span>
                                  <span className="text-slate-500 text-xs">{chapterNote ? 'Read Chapter' : 'Not Available'}</span>
                              </div>
                          </button>
                      </div>

                      {/* Main Content Area */}
                      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                          {/* Tabs */}
                          <div className="border-b border-slate-100 px-6 py-4 flex gap-4 bg-slate-50/50 items-center justify-between">
                              <div className="flex bg-slate-200/50 p-1 rounded-xl">
                                  <button 
                                      onClick={() => setTab('PRACTICE')}
                                      className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${tab === 'PRACTICE' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                  >
                                      <FileText className="w-4 h-4" /> Practice
                                  </button>
                                  <button 
                                      onClick={() => setTab('OVERVIEW')}
                                      className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${tab === 'OVERVIEW' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                  >
                                      <Info className="w-4 h-4" /> Overview
                                  </button>
                              </div>
                              {/* Hint for context */}
                              <div className="hidden md:flex text-xs font-bold text-slate-400 uppercase tracking-wide items-center gap-2">
                                  {isTesting ? <span className="text-orange-500 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div> Test in Progress</span> : <span>Study Mode</span>}
                              </div>
                          </div>

                          <div className="flex-1 p-6 md:p-8">
                              {tab === 'OVERVIEW' && (
                                  <div className="animate-in fade-in max-w-3xl">
                                      <h3 className="font-bold text-2xl text-slate-800 mb-6">Chapter Insights</h3>
                                      <div className="prose prose-slate prose-sm md:prose-base max-w-none">
                                          <p className="text-slate-600 leading-relaxed text-lg">
                                              This chapter covers fundamental concepts essential for JEE preparation. 
                                              Mastery of <strong>{topic.name}</strong> requires understanding both the theoretical underpinnings and their application in complex problem-solving scenarios.
                                          </p>
                                          
                                          {videoLesson && videoLesson.description && (
                                              <div className="mt-8 bg-blue-50 p-6 rounded-2xl border border-blue-100 flex gap-4 items-start">
                                                  <Info className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
                                                  <div>
                                                      <h4 className="text-blue-900 font-bold text-base mb-2">Video Summary</h4>
                                                      <p className="text-blue-800 text-sm leading-relaxed">{videoLesson.description}</p>
                                                  </div>
                                              </div>
                                          )}
                                      </div>
                                  </div>
                              )}

                              {tab === 'PRACTICE' && (
                                  <div className="space-y-8 animate-in fade-in">
                                      
                                      {/* Not Testing Mode */}
                                      {!isTesting && !testSubmitted && (
                                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                              
                                              {/* Left: Start Test Card */}
                                              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 flex flex-col justify-center items-center text-center relative overflow-hidden group">
                                                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                                                  
                                                  <div className="w-20 h-20 bg-white rounded-full shadow-md flex items-center justify-center mb-6 border border-slate-100 group-hover:scale-110 transition-transform duration-300">
                                                      <Play className="w-8 h-8 text-blue-600 ml-1" />
                                                  </div>
                                                  
                                                  <h3 className="text-2xl font-bold text-slate-800 mb-3">Ready to Practice?</h3>
                                                  <p className="text-slate-500 mb-8 max-w-xs text-sm leading-relaxed">
                                                      Generate a custom test from the question bank. Select difficulty to tailor your session.
                                                  </p>
                                                  
                                                  <div className="flex gap-2 mb-8 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
                                                       {['ALL', 'EASY', 'MEDIUM', 'HARD'].map(d => (
                                                          <button
                                                              key={d}
                                                              onClick={() => setDifficultyFilter(d as any)}
                                                              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                                                  difficultyFilter === d 
                                                                  ? 'bg-slate-800 text-white shadow-md' 
                                                                  : 'text-slate-500 hover:bg-slate-100'
                                                              }`}
                                                          >
                                                              {d.charAt(0) + d.slice(1).toLowerCase()}
                                                          </button>
                                                      ))}
                                                  </div>

                                                  <button 
                                                      onClick={startTest}
                                                      disabled={filteredQuestions.length === 0}
                                                      className="w-full max-w-xs bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center gap-2"
                                                  >
                                                      <PlayCircle className="w-5 h-5" />
                                                      Start Test ({filteredQuestions.length} Qs)
                                                  </button>
                                                  
                                                  {filteredQuestions.length === 0 && (
                                                      <p className="text-xs text-red-500 mt-4 font-medium bg-red-50 px-3 py-1 rounded-full">
                                                          No questions available for this filter.
                                                      </p>
                                                  )}
                                              </div>

                                              {/* Right: Past Results List */}
                                              <div className="flex flex-col h-full">
                                                  <div className="flex items-center justify-between mb-4 px-1">
                                                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                                          <Trophy className="w-5 h-5 text-amber-500" /> Recent Performance
                                                      </h3>
                                                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">History</span>
                                                  </div>
                                                  
                                                  <div className="flex-1 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                                                      {topicAttempts.length === 0 ? (
                                                          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-50">
                                                              <div className="bg-slate-50 p-4 rounded-full mb-3">
                                                                  <BarChart2 className="w-8 h-8 text-slate-400" />
                                                              </div>
                                                              <p className="text-sm font-bold text-slate-600">No attempts yet</p>
                                                              <p className="text-xs text-slate-400 mt-1">Complete a test to see analytics.</p>
                                                          </div>
                                                      ) : (
                                                          <div className="overflow-y-auto max-h-[400px] custom-scrollbar divide-y divide-slate-100">
                                                              {topicAttempts.map(attempt => (
                                                                  <div key={attempt.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                                                                      <div className="flex flex-col">
                                                                          <div className="flex items-center gap-2 mb-1">
                                                                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                                                                                  attempt.difficulty === 'HARD' ? 'bg-red-50 text-red-700 border-red-100' :
                                                                                  attempt.difficulty === 'EASY' ? 'bg-green-50 text-green-700 border-green-100' :
                                                                                  'bg-orange-50 text-orange-700 border-orange-100'
                                                                              }`}>
                                                                                  {attempt.difficulty || 'MIXED'}
                                                                              </span>
                                                                              <span className="text-[10px] text-slate-400 font-mono">
                                                                                  {new Date(attempt.date).toLocaleDateString()}
                                                                              </span>
                                                                          </div>
                                                                          <span className="text-xs text-slate-500 font-medium">
                                                                              {attempt.totalQuestions} Questions
                                                                          </span>
                                                                      </div>
                                                                      
                                                                      <div className="text-right">
                                                                          <div className="text-lg font-black text-slate-800 leading-none mb-1">
                                                                              {attempt.score}
                                                                          </div>
                                                                          <button 
                                                                            onClick={() => setReviewingAttempt(attempt)}
                                                                            className="text-[10px] font-bold text-blue-600 hover:underline"
                                                                          >
                                                                            Review
                                                                          </button>
                                                                      </div>
                                                                  </div>
                                                              ))}
                                                          </div>
                                                      )}
                                                  </div>
                                              </div>
                                          </div>
                                      )}

                                      {/* Active Test Interface */}
                                      {(isTesting || testSubmitted) && (
                                          <div className="space-y-8 max-w-4xl mx-auto">
                                              
                                              {/* Result Banner */}
                                              {testSubmitted && (
                                                  <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-8 animate-in slide-in-from-top-4">
                                                      <div className="text-center md:text-left">
                                                          <h3 className="text-3xl font-bold mb-2">Test Complete!</h3>
                                                          <p className="text-slate-400 text-sm">Great job! Review your answers below.</p>
                                                      </div>
                                                      <div className="flex gap-8 md:gap-12 text-center bg-white/10 p-4 rounded-xl border border-white/10">
                                                          <div>
                                                              <div className="text-4xl font-black text-blue-400">{testScore}</div>
                                                              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Score</div>
                                                          </div>
                                                          <div className="w-px bg-white/20"></div>
                                                          <div>
                                                              <div className="text-4xl font-black text-green-400">
                                                                  {Math.round((Object.entries(testAnswers).filter(([id, ans]) => 
                                                                      filteredQuestions.find(q => q.id === id)?.correctOptionIndex === ans
                                                                  ).length / filteredQuestions.length) * 100)}%
                                                              </div>
                                                              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Accuracy</div>
                                                          </div>
                                                      </div>
                                                      <button 
                                                          onClick={() => { setIsTesting(false); setTestSubmitted(false); }} 
                                                          className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors shadow-lg active:scale-95"
                                                      >
                                                          Close Result
                                                      </button>
                                                  </div>
                                              )}

                                              {/* Questions List */}
                                              <div className="space-y-6">
                                                  {filteredQuestions.map((q, idx) => {
                                                      const selected = testAnswers[q.id];
                                                      const isCorrect = testSubmitted && selected === q.correctOptionIndex;
                                                      const isWrong = testSubmitted && selected !== undefined && selected !== q.correctOptionIndex;
                                                      
                                                      return (
                                                          <div key={q.id} className={`bg-white p-6 md:p-8 rounded-2xl border-2 transition-all shadow-sm ${
                                                              isCorrect ? 'border-green-400/50 bg-green-50/10' : 
                                                              isWrong ? 'border-red-400/50 bg-red-50/10' : 'border-slate-100 hover:border-blue-200'
                                                          }`}>
                                                              <div className="flex items-start gap-5">
                                                                  <div className="bg-slate-100 w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-slate-600 shrink-0 shadow-inner">
                                                                      {idx + 1}
                                                                  </div>
                                                                  <div className="flex-1">
                                                                      {/* Tags */}
                                                                      <div className="flex flex-wrap items-center gap-2 mb-4">
                                                                          <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${
                                                                              q.difficulty === 'HARD' ? 'bg-red-50 text-red-700 border-red-100' :
                                                                              q.difficulty === 'EASY' ? 'bg-green-50 text-green-700 border-green-100' :
                                                                              'bg-orange-50 text-orange-700 border-orange-100'
                                                                          }`}>
                                                                              {q.difficulty}
                                                                          </span>
                                                                          {testSubmitted && isCorrect && <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-1 rounded flex items-center"><CheckCircle2 className="w-3 h-3 mr-1"/> Correct</span>}
                                                                          {testSubmitted && isWrong && <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-1 rounded flex items-center"><AlertCircle className="w-3 h-3 mr-1"/> Incorrect</span>}
                                                                      </div>
                                                                      
                                                                      <p className="text-slate-800 font-medium text-lg mb-6 leading-relaxed">{q.text}</p>
                                                                      
                                                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                          {q.options.map((opt, i) => {
                                                                              let optionClass = "border-slate-200 bg-white hover:border-blue-300 hover:shadow-md";
                                                                              let markerClass = "border-slate-300 text-slate-400 bg-slate-50";
                                                                              
                                                                              if (testSubmitted) {
                                                                                  if (i === q.correctOptionIndex) {
                                                                                      optionClass = "border-green-500 bg-green-50 shadow-md ring-1 ring-green-500";
                                                                                      markerClass = "bg-green-500 border-green-500 text-white";
                                                                                  } else if (i === selected && i !== q.correctOptionIndex) {
                                                                                      optionClass = "border-red-300 bg-red-50 shadow-sm";
                                                                                      markerClass = "bg-red-500 border-red-500 text-white";
                                                                                  } else {
                                                                                      optionClass = "border-slate-100 bg-slate-50 opacity-60 grayscale";
                                                                                  }
                                                                              } else if (selected === i) {
                                                                                  optionClass = "border-blue-500 bg-blue-50 ring-1 ring-blue-500 shadow-md";
                                                                                  markerClass = "bg-blue-500 border-blue-500 text-white";
                                                                              }

                                                                              return (
                                                                                  <button 
                                                                                      key={i} 
                                                                                      onClick={() => !testSubmitted && setTestAnswers(prev => ({ ...prev, [q.id]: i }))}
                                                                                      className={`p-4 rounded-xl border-2 text-left transition-all relative group ${optionClass}`}
                                                                                      disabled={testSubmitted}
                                                                                  >
                                                                                      <div className="flex items-center gap-3">
                                                                                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${markerClass}`}>
                                                                                              {String.fromCharCode(65+i)}
                                                                                          </div>
                                                                                          <span className={`text-sm font-medium ${testSubmitted && i === q.correctOptionIndex ? 'text-green-900 font-bold' : 'text-slate-700'}`}>{opt}</span>
                                                                                      </div>
                                                                                  </button>
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
                                                  <div className="sticky bottom-6 z-20 flex justify-center pt-4 pointer-events-none">
                                                      <button 
                                                          onClick={submitTest}
                                                          className="pointer-events-auto bg-slate-900 hover:bg-black text-white font-bold py-4 px-12 rounded-full shadow-2xl hover:scale-105 transition-all active:scale-95 flex items-center gap-2 border-4 border-white/20 backdrop-blur-md"
                                                      >
                                                          <CheckCircle2 className="w-5 h-5" /> Submit Test
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
              {renderReviewModal()}
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
