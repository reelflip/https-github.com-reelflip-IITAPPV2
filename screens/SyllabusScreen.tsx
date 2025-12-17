
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
  viewingStudentName?: string;
  subjects: Topic[]; 
  progress: Record<string, UserProgress>;
  onUpdateProgress: (topicId: string, updates: Partial<UserProgress>) => void;
  readOnly?: boolean;
  summaryOnly?: boolean; // New prop for Parents
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

  const displayUserName = viewingStudentName || user.name.split(' ')[0];

  // --- TOPIC DETAIL VIEW COMPONENT ---
  const TopicDetailView = ({ topic, onClose }: { topic: Topic, onClose: () => void }) => {
      const [tab, setTab] = useState<'OVERVIEW' | 'PRACTICE'>('PRACTICE');
      const topicData = getProgress(topic.id);
      
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
          let correct = 0, incorrect = 0, unattempted = 0;
          const total = filteredQuestions.length;
          const detailedResults: any[] = [];

          filteredQuestions.forEach(q => {
              const ans = testAnswers[q.id];
              let status = 'UNATTEMPTED';
              if(ans === undefined) { unattempted++; } 
              else if (ans === q.correctOptionIndex) { correct++; status = 'CORRECT'; if (onToggleQuestion && (!topicData.solvedQuestions || !topicData.solvedQuestions.includes(q.id))) onToggleQuestion(topic.id, q.id); } 
              else { incorrect++; status = 'INCORRECT'; }
              detailedResults.push({ questionId: q.id, subjectId: q.subjectId, topicId: q.topicId, status, selectedOptionIndex: ans });
          });

          const score = (correct * 4) - (incorrect * 1);
          setTestScore(score);
          setTestSubmitted(true);

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

      return (
          <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col animate-in slide-in-from-right-4 duration-300">
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
                  <div className="relative">
                      <div className={`pl-4 pr-10 py-2.5 rounded-xl text-sm font-bold border transition-all ${statusColors[topicData.status || 'PENDING']}`}>
                          {statusLabels[topicData.status || 'PENDING']}
                      </div>
                  </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-slate-50">
                  <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm col-span-2 flex flex-col justify-between">
                              <div className="flex justify-between items-start">
                                  <div>
                                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Topic Progress</p>
                                      <div className="flex items-baseline gap-2">
                                          <h3 className="text-3xl font-black text-slate-800">{solvedCount}<span className="text-lg text-slate-400 font-medium">/{totalCount}</span></h3>
                                          <span className="text-sm font-bold text-slate-500">Questions</span>
                                      </div>
                                  </div>
                                  <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><Target className="w-6 h-6" /></div>
                              </div>
                              <div className="mt-4">
                                  <div className="flex justify-between text-xs font-bold text-slate-500 mb-1"><span>Completion</span><span>{solvedPercent}%</span></div>
                                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden"><div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${solvedPercent}%` }}></div></div>
                              </div>
                          </div>
                          <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl md:col-span-2 flex items-center justify-center text-center">
                              <p className="text-slate-400 text-sm font-medium">
                                  {user.role === 'PARENT' ? "Parents have read-only access to progress stats. Direct interaction with study materials is reserved for the student." : "Full details and resources are available on your student dashboard."}
                              </p>
                          </div>
                      </div>
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
                  {summaryOnly ? `Reviewing current preparation depth for ${displayUserName}.` : 'Track completion, watch lectures, and solve chapter-wise problems.'}
              </p>
          </div>
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Student: <span className="text-blue-600">{displayUserName}</span></h3>
          <p className="text-xs text-slate-500">
            {displayUserName} has completed <span className="font-bold text-slate-700">{stats.completed}</span> out of <span className="font-bold text-slate-700">{stats.total}</span> major topics.
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
           <div className="flex justify-between items-end mb-2">
             <div><h3 className="text-sm font-semibold text-slate-900">Overall Progress</h3><p className="text-3xl font-bold text-slate-800 mt-1">{stats.percent}<span className="text-base font-normal text-slate-400 ml-1">%</span></p></div>
             <LayoutGrid className="text-slate-200 w-8 h-8" />
           </div>
           <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden"><div className="bg-blue-600 h-full rounded-full transition-all duration-1000" style={{ width: `${stats.percent}%` }}></div></div>
        </div>
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

      <div className="space-y-8">
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
                      const topicData = getProgress(topic.id);
                      const qCount = questionBank.filter(q => q.topicId === topic.id).length;
                      const solvedCount = topicData.solvedQuestions?.length || 0;
                      const qPercent = qCount > 0 ? Math.round((solvedCount / qCount) * 100) : 0;
                      return (
                        <div key={topic.id} onClick={() => !summaryOnly ? setActiveTopic(topic) : null} className={`bg-white border border-slate-200 rounded-xl p-5 shadow-sm transition-all duration-200 group relative overflow-hidden ${!summaryOnly ? 'hover:shadow-lg hover:border-blue-300 cursor-pointer' : ''}`}>
                           <div className="flex justify-between items-start mb-4">
                               <div><div className="flex items-center gap-2 mb-1"><span className={`text-[10px] font-bold px-2 py-0.5 rounded ${subject.id === 'phys' ? 'bg-purple-100 text-purple-700' : subject.id === 'chem' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{subject.name}</span>{topicData.status === 'COMPLETED' && <CheckCircle2 className="w-4 h-4 text-green-500" />}</div><h3 className="text-base font-bold text-slate-800">{topic.name}</h3></div>
                           </div>
                           <div className="space-y-3"><div className="flex items-center justify-between text-xs text-slate-500"><span>Progress</span><span className="font-bold">{solvedCount} / {qCount} Qs</span></div><div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${qPercent}%` }}></div></div></div>
                           <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center"><span className={`text-[10px] font-bold uppercase tracking-wider ${topicData.status === 'COMPLETED' ? 'text-green-600' : 'text-slate-400'}`}>{statusLabels[topicData.status || 'NOT_STARTED']}</span></div>
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
