import React, { useState, useEffect } from 'react';
import { TestAttempt, Test, QuestionResult, User } from '../lib/types';
import { Clock, Check, FileText, PlayCircle, RotateCcw, Target, AlertTriangle } from 'lucide-react';

interface Props {
  user: User;
  addTestAttempt: (attempt: TestAttempt) => void;
  history: TestAttempt[];
  availableTests: Test[];
}

export const TestScreen: React.FC<Props> = ({ user, addTestAttempt, history, availableTests = [] }) => {
  const isParent = user.role === 'PARENT';
  const [activeTab, setActiveTab] = useState<'practice' | 'history'>(isParent ? 'history' : 'practice');
  const [activeTest, setActiveTest] = useState<Test | null>(null);

  // Logic: Parents are locked to History tab
  useEffect(() => {
    if (isParent) setActiveTab('history');
  }, [isParent]);

  if (activeTest) {
      return <div className="p-8 text-center bg-white rounded-xl border">Test Engine active...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold">{isParent ? 'Student Scorecards' : 'Test Center'}</h1>
                <p className="text-blue-100 mt-1 opacity-90">
                    {isParent ? "Viewing verified performance history of your child." : "Challenge yourself with mock exams and track your improvement."}
                </p>
            </div>
            {!isParent && (
                <div className="flex bg-white/20 p-1 rounded-xl backdrop-blur-sm border border-white/10">
                    <button onClick={() => setActiveTab('practice')} className={`px-6 py-2 rounded-lg text-sm font-bold ${activeTab === 'practice' ? 'bg-white text-blue-700' : 'text-white hover:bg-white/10'}`}>Practice</button>
                    <button onClick={() => setActiveTab('history')} className={`px-6 py-2 rounded-lg text-sm font-bold ${activeTab === 'history' ? 'bg-white text-blue-700' : 'text-white hover:bg-white/10'}`}>History</button>
                </div>
            )}
        </div>

        {activeTab === 'practice' && !isParent && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {availableTests.map(test => (
                    <div key={test.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                        <h3 className="text-lg font-bold text-slate-800 mb-2">{test.title}</h3>
                        <div className="flex gap-4 text-xs font-bold text-slate-500 mb-6 uppercase tracking-wider">
                            <span>{test.durationMinutes} mins</span>
                            <span>{test.questions.length} Questions</span>
                        </div>
                        <button onClick={() => setActiveTest(test)} className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-blue-600 transition-colors">Start Mock Test</button>
                    </div>
                ))}
            </div>
        )}

        {activeTab === 'history' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50 font-bold text-slate-700">
                    {isParent ? "Official Score History" : "Past Attempts"}
                </div>
                <div className="divide-y divide-slate-100">
                    {history.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">
                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p className="font-bold">No test records found.</p>
                            <p className="text-xs">{isParent ? "Your child hasn't taken any mock tests yet." : "Time to take your first mock test!"}</p>
                        </div>
                    ) : (
                        history.map(attempt => (
                            <div key={attempt.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm">{attempt.title}</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{new Date(attempt.date).toLocaleDateString()} • JEE Pattern</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-blue-600">{attempt.score}<span className="text-slate-400 text-xs font-normal">/{attempt.totalMarks}</span></div>
                                    <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${attempt.accuracy_percent >= 75 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                        {attempt.accuracy_percent}% Accuracy
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        )}
    </div>
  );
};