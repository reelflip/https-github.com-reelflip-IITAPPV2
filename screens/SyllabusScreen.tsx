
import React, { useState, useMemo } from 'react';
import { UserProgress, TopicStatus, Topic, User, VideoLesson } from '../lib/types';
import { 
  Search, 
  ChevronDown, 
  Clock, 
  CheckCircle2, 
  LayoutGrid,
  BookOpen,
  Save,
  Loader2,
  PlayCircle,
  X,
  Youtube,
  Filter,
  Info
} from 'lucide-react';

interface SyllabusTrackerProps {
  user: User;
  subjects: Topic[]; 
  progress: Record<string, UserProgress>;
  onUpdateProgress: (topicId: string, updates: Partial<UserProgress>) => void;
  readOnly?: boolean;
  videoMap?: Record<string, VideoLesson>;
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

export const SyllabusScreen: React.FC<SyllabusTrackerProps> = ({ user, subjects, progress, onUpdateProgress, readOnly = false, videoMap = {} }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubjectFilter, setActiveSubjectFilter] = useState<string>('ALL');
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [activeVideo, setActiveVideo] = useState<{url: string, title: string, desc?: string} | null>(null);

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

  const handleSave = () => {
      if (readOnly) return;
      setIsSaving(true);
      setTimeout(() => {
          setIsSaving(false);
          setShowSaveToast(true);
          setTimeout(() => setShowSaveToast(false), 2000);
      }, 800);
  };

  const stats = useMemo(() => {
    const totalTopics = subjects.length;
    const completed = subjects.filter(t => progress[t.id]?.status === 'COMPLETED').length;
    
    const targetDate = new Date(user.targetYear ? `${user.targetYear}-06-01` : '2025-06-01');
    const today = new Date();
    const diffTime = Math.abs(targetDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    const remainingDays = Math.floor((diffDays % 365) % 30);

    return {
      total: totalTopics,
      completed,
      percent: totalTopics > 0 ? Math.round((completed / totalTopics) * 100) : 0,
      timeRemaining: `${years} Yr ${months} Mo ${remainingDays} Days`
    };
  }, [subjects, progress, user.targetYear]);

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
      ex1Solved: 0, ex1Total: 30, ex2Solved: 0, ex2Total: 20,
      ex3Solved: 0, ex3Total: 15, ex4Solved: 0, ex4Total: 10
    };
  };

  return (
    <div className="space-y-8 font-inter animate-in fade-in slide-in-from-bottom-4 relative">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-2">
                 <BookOpen className="w-8 h-8 text-white" />
                 <h1 className="text-3xl font-bold">Comprehensive Syllabus Tracker</h1>
              </div>
              <p className="text-blue-100 text-lg opacity-90 max-w-2xl">Track your completion status, exercise progress, and revision cycles chapter by chapter.</p>
          </div>
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10"></div>
          <div className="absolute bottom-0 right-20 w-32 h-32 rounded-full bg-white opacity-10"></div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 bg-white p-5 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col justify-center">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Student Overview: <span className="text-blue-600">{user.name.split(' ')[0]}</span></h3>
          <p className="text-xs text-slate-500">
            {user.name.split(' ')[0]} has completed <span className="font-bold text-slate-700">{stats.completed}</span> out of <span className="font-bold text-slate-700">{stats.total}</span> major topics.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 flex items-center justify-between">
           <div>
             <div className="flex items-center space-x-2 text-slate-400 mb-1">
               <Clock className="w-3.5 h-3.5" />
               <span className="text-[10px] font-bold uppercase tracking-wider">Time Remaining</span>
             </div>
             <div className="text-xl font-bold text-slate-800">{stats.timeRemaining}</div>
             <div className="text-[10px] text-slate-400">Target: {user.targetExam || 'IIT JEE'} {user.targetYear || 2025}</div>
           </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col justify-center">
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
           <p className="text-[10px] text-slate-400 mt-2 text-right">based on syllabus completion</p>
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
        
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
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
            
            {!readOnly && (
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="hidden md:flex items-center justify-center space-x-2 px-6 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 active:scale-95 transition-all shadow-md shadow-green-200 disabled:opacity-70 disabled:cursor-not-allowed min-w-[120px]"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{isSaving ? 'Saving...' : 'Save Progress'}</span>
                </button>
            )}
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

                  <div className="grid grid-cols-1 gap-4">
                    {chapter.topics.map(topic => {
                      const topicData = getProgress(topic.id);
                      const totalQuestions = (topicData.ex1Total||0) + (topicData.ex2Total||0) + (topicData.ex3Total||0) + (topicData.ex4Total||0);
                      const solvedQuestions = (topicData.ex1Solved||0) + (topicData.ex2Solved||0) + (topicData.ex3Solved||0) + (topicData.ex4Solved||0);
                      const qPercent = totalQuestions > 0 ? Math.round((solvedQuestions / totalQuestions) * 100) : 0;
                      const isExpanded = expandedTopicId === topic.id;
                      const videoLesson = videoMap[topic.id];

                      return (
                        <div key={topic.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex-1">
                                 <div className="flex items-center space-x-2 mb-1">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                        subject.id === 'phys' ? 'bg-purple-100 text-purple-700' : 
                                        subject.id === 'chem' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                        {subject.name}
                                    </span>
                                    <span className="text-[10px] text-slate-400">Est. 8 Hours</span>
                                 </div>
                                 <div className="flex items-center gap-3">
                                     <h3 className="text-base font-bold text-slate-800">{topic.name}</h3>
                                     {videoLesson && (
                                         <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveVideo({ 
                                                    url: videoLesson.videoUrl, 
                                                    title: topic.name,
                                                    desc: videoLesson.description 
                                                });
                                            }}
                                            className="flex items-center space-x-1.5 px-2 py-1 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors border border-red-100 group"
                                            title={videoLesson.description || "Watch Video Lesson"}
                                         >
                                             <PlayCircle className="w-3.5 h-3.5 fill-red-100 group-hover:fill-red-200" />
                                             <span className="text-[10px] font-bold uppercase tracking-wide">Watch</span>
                                         </button>
                                     )}
                                 </div>
                                 
                                 <div className="mt-3 flex items-center space-x-3 w-full md:w-64">
                                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                       <div className="h-full bg-slate-400 rounded-full" style={{ width: `${qPercent}%` }}></div>
                                    </div>
                                    <span className="text-xs text-slate-500 font-medium">{qPercent}% Questions</span>
                                 </div>
                              </div>

                              <div className="flex items-center space-x-3 self-end md:self-center">
                                 <div className="relative">
                                    <select 
                                      value={topicData.status || 'PENDING'}
                                      onChange={(e) => onUpdateProgress(topic.id, { status: e.target.value as TopicStatus })}
                                      className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-bold border outline-none cursor-pointer transition-colors ${statusColors[topicData.status || 'PENDING']} ${readOnly ? 'opacity-70 pointer-events-none' : ''}`}
                                      disabled={readOnly}
                                    >
                                      {Object.entries(statusLabels).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                      ))}
                                    </select>
                                    <ChevronDown className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 pointer-events-none ${
                                        topicData.status === 'NOT_STARTED' ? 'text-slate-400' : 'text-current opacity-60'
                                    }`} />
                                 </div>
                                 
                                 <button 
                                   onClick={() => setExpandedTopicId(isExpanded ? null : topic.id)}
                                   className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline px-2"
                                 >
                                   {isExpanded ? 'Close' : 'Details'}
                                 </button>
                              </div>
                           </div>

                           {isExpanded && (
                             <div className="mt-4 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-1">
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center">
                                    <BookOpen className="w-3 h-3 mr-1.5" /> Exercise Tracking
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                   {[1, 2, 3, 4].map(num => {
                                      const solvedKey = `ex${num}Solved` as keyof UserProgress;
                                      const totalKey = `ex${num}Total` as keyof UserProgress;
                                      return (
                                        <div key={num} className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[10px] font-bold text-slate-400">EXERCISE {num}</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <input 
                                                  type="number" 
                                                  value={topicData[solvedKey] as number || 0}
                                                  onChange={(e) => onUpdateProgress(topic.id, { [solvedKey]: parseInt(e.target.value) || 0 })}
                                                  className="w-full text-xs p-1 rounded border border-slate-200 focus:border-blue-400 focus:ring-0 outline-none text-center font-medium text-slate-700"
                                                  disabled={readOnly}
                                                />
                                                <span className="text-slate-300">/</span>
                                                <input 
                                                  type="number" 
                                                  value={topicData[totalKey] as number || 0}
                                                  onChange={(e) => onUpdateProgress(topic.id, { [totalKey]: parseInt(e.target.value) || 0 })}
                                                  className="w-full text-xs p-1 rounded border border-slate-200 focus:border-blue-400 focus:ring-0 outline-none text-center font-medium text-slate-500 bg-slate-100"
                                                  disabled={readOnly}
                                                />
                                            </div>
                                        </div>
                                      );
                                   })}
                                </div>
                                {!readOnly && (
                                    <div className="flex justify-end mt-4">
                                        <button 
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="text-xs font-bold text-green-600 hover:text-green-700 flex items-center bg-green-50 px-3 py-1.5 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
                                        >
                                            {isSaving ? <Loader2 className="w-3 h-3 mr-1 animate-spin"/> : <CheckCircle2 className="w-3 h-3 mr-1" />}
                                            {isSaving ? 'Saving' : 'Save'}
                                        </button>
                                    </div>
                                )}
                             </div>
                           )}
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

      {showSaveToast && (
          <div className="fixed bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-xl flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-2 z-50">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span className="font-bold text-sm">Progress Saved!</span>
          </div>
      )}

      {activeVideo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="w-full max-w-5xl bg-black rounded-2xl overflow-hidden shadow-2xl relative border border-slate-800">
                  <div className="flex justify-between items-center p-4 bg-slate-900 text-white border-b border-slate-800">
                      <div className="flex items-center space-x-3">
                          <Youtube className="w-6 h-6 text-red-600" />
                          <div>
                              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Video Lesson</p>
                              <h3 className="font-bold text-lg">{activeVideo.title}</h3>
                          </div>
                      </div>
                      <button 
                        onClick={() => setActiveVideo(null)}
                        className="text-slate-400 hover:text-white transition-colors bg-white/10 p-2 rounded-full hover:bg-white/20"
                      >
                          <X className="w-5 h-5" />
                      </button>
                  </div>
                  <div className="relative pt-[56.25%] bg-black">
                      <iframe 
                        className="absolute inset-0 w-full h-full"
                        src={activeVideo.url} 
                        title={activeVideo.title}
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                      ></iframe>
                  </div>
                  <div className="p-4 bg-slate-900 text-slate-300 text-xs border-t border-slate-800 flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                          <strong>About this lesson:</strong> {activeVideo.desc || "No detailed description available."}
                      </p>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
