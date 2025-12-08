import React from 'react';
import { UserProgress, Topic } from '../lib/types';
import { SYLLABUS_DATA } from '../lib/syllabusData';
import { formatDate } from '../lib/utils';

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
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Smart Revision Manager</h2>
        <p className="text-slate-500">Based on the 1-7-30 Spaced Repetition Algorithm</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Due Today Column */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            Due Today ({dueTopics.length})
          </h3>
          
          {dueTopics.length === 0 ? (
            <div className="bg-green-50 border border-green-100 rounded-xl p-8 text-center">
              <span className="text-4xl mb-3 block">🎉</span>
              <h4 className="font-bold text-green-800">All caught up!</h4>
              <p className="text-green-600 text-sm mt-1">No revisions pending for today. Great job!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dueTopics.map(({ topic, progress }) => (
                <div key={topic.id} className="bg-white p-4 rounded-xl border border-red-100 shadow-sm flex justify-between items-center group hover:border-red-200 transition-all">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{topic.subject}</span>
                    <h4 className="font-bold text-slate-800">{topic.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">Level {progress.revisionLevel} • Last reviewed: {formatDate(progress.lastRevised)}</p>
                  </div>
                  <button 
                    onClick={() => handleRevisionComplete(topic.id)}
                    className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors"
                  >
                    Mark Done
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Column */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Upcoming
          </h3>
          
          <div className="space-y-3">
             {upcomingTopics.length === 0 && (
                 <p className="text-slate-400 text-sm italic">Complete more topics to see upcoming revisions.</p>
             )}
             {upcomingTopics.map(({ topic, progress }) => (
                <div key={topic.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center opacity-75">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{topic.subject}</span>
                    <h4 className="font-semibold text-slate-700">{topic.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">Due: {formatDate(progress.nextRevisionDate)}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};