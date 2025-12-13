
import React from 'react';
import { UserProgress, Topic } from '../lib/types';
import { SYLLABUS_DATA } from '../lib/syllabusData';
import { formatDate } from '../lib/utils';
import { RotateCw, Calendar, CheckCircle2, AlertCircle, Clock, Info, HelpCircle } from 'lucide-react';

interface Props {
  progress: Record<string, UserProgress>;
  handleRevisionComplete: (topicId: string) => void;
}

export const RevisionScreen: React.FC<Props> = ({ progress, handleRevisionComplete }) => {
  const now = new Date();
  
  // Find topics due for revision
  const dueTopics = (Object.entries(progress) as [string, UserProgress][])
    .filter(([_, p]) => p.status === 'COMPLETED' && p.nextRevisionDate && new Date(p.nextRevisionDate) <= now)
    .map(([id, p]) => {
      const topic = SYLLABUS_DATA.find(t => t.id === id);
      return { topic, progress: p };
    })
    .filter(item => item.topic !== undefined) as { topic: Topic, progress: UserProgress }[];

  const upcomingTopics = (Object.entries(progress) as [string, UserProgress][])
    .filter(([_, p]) => p.status === 'COMPLETED' && p.nextRevisionDate && new Date(p.nextRevisionDate) > now)
    .sort((a, b) => new Date(a[1].nextRevisionDate!).getTime() - new Date(b[1].nextRevisionDate!).getTime())
    .slice(0, 5)
    .map(([id, p]) => {
      const topic = SYLLABUS_DATA.find(t => t.id === id);
      return { topic, progress: p };
    }) as { topic: Topic, progress: UserProgress }[];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-12">
      
      {/* Enhanced Header with Explainer */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <RotateCw className="w-6 h-6 text-white" />
            </div>
            Smart Revision Manager
          </h2>
          <p className="text-blue-50 opacity-90 max-w-xl text-sm md:text-base leading-relaxed">
            Beat the "Forgetting Curve" using the <strong>1-7-30 Spaced Repetition Rule</strong>. 
            We automatically schedule reviews to move concepts from short-term to long-term memory.
          </p>

          {/* Usage Guide Box */}
          <div className="mt-6 bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur-md max-w-3xl">
              <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-yellow-300" /> How to use this tab:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs md:text-sm text-blue-50">
                  <div className="flex gap-3">
                      <span className="bg-white/20 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0">1</span>
                      <p>Mark a topic as <strong className="text-white">Completed</strong> in the Syllabus Tracker.</p>
                  </div>
                  <div className="flex gap-3">
                      <span className="bg-white/20 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0">2</span>
                      <p>The system automatically adds it here when due (Day 1, Day 7, Day 30).</p>
                  </div>
                  <div className="flex gap-3">
                      <span className="bg-white/20 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0">3</span>
                      <p>Revise the topic, then click <strong className="text-white">Mark Done</strong> to schedule the next review.</p>
                  </div>
              </div>
          </div>
        </div>
        
        {/* Decor */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="absolute bottom-0 right-20 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Due Today Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Due Today
            </h3>
            <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">{dueTopics.length} Pending</span>
          </div>
          
          {dueTopics.length === 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[200px]">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-3xl">
                🎉
              </div>
              <h4 className="font-bold text-green-900 text-lg">All caught up!</h4>
              <p className="text-green-700 text-sm mt-1">No revisions pending for today. Go learn something new!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dueTopics.map(({ topic, progress }) => (
                <div key={topic.id} className="bg-white p-5 rounded-xl border border-red-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-red-200 transition-all group">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                            topic.subject === 'Physics' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            topic.subject === 'Chemistry' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                            {topic.subject}
                        </span>
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Level {progress.revisionLevel}</span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-base">{topic.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Last reviewed: {formatDate(progress.lastRevised)}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleRevisionComplete(topic.id)}
                    className="w-full sm:w-auto bg-red-50 text-red-600 border border-red-100 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-100 hover:text-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Mark Done
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Column */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Upcoming Schedule
          </h3>
          
          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 min-h-[200px]">
             {upcomingTopics.length === 0 ? (
                 <div className="text-center py-10 text-slate-400">
                     <p className="text-sm italic">Complete more topics in the Syllabus tab to populate your revision schedule.</p>
                 </div>
             ) : (
                 upcomingTopics.map(({ topic, progress }) => (
                    <div key={topic.id} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center opacity-90 hover:opacity-100 transition-opacity">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{topic.subject}</span>
                        <h4 className="font-semibold text-slate-700 text-sm">{topic.name}</h4>
                      </div>
                      <div className="text-right">
                          <span className="block text-xs font-bold text-blue-600">{formatDate(progress.nextRevisionDate)}</span>
                          <span className="text-[10px] text-slate-400">Due Date</span>
                      </div>
                    </div>
                  ))
             )}
             {upcomingTopics.length > 0 && (
                 <p className="text-center text-xs text-slate-400 mt-2">Showing next 5 scheduled items</p>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
