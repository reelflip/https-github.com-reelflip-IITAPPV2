
import React, { useState } from 'react';
import { User, UserProgress, TestAttempt, Goal } from '../lib/types';
import { SYLLABUS_DATA } from '../lib/syllabusData';
import { Users, Search, ArrowRight, Target, Trophy, Clock, AlertCircle } from 'lucide-react';

interface Props {
  user: User;
  viewingStudentName?: string;
  progress: Record<string, UserProgress>;
  testAttempts: TestAttempt[];
  goals: Goal[];
  toggleGoal: (id: string) => void;
  addGoal: (text: string) => void;
  setScreen: (screen: any) => void;
}

export const DashboardScreen: React.FC<Props> = ({ user, viewingStudentName, progress, testAttempts, goals, toggleGoal, addGoal, setScreen }) => {
  const [newGoalText, setNewGoalText] = useState('');

  const totalTopics = SYLLABUS_DATA.length;
  const completedTopics = (Object.values(progress) as UserProgress[]).filter(p => p.status === 'COMPLETED').length;
  const progressPercent = Math.round((completedTopics / totalTopics) * 100);
  
  const today = new Date();
  const examDate = new Date(today.getFullYear() + 1, 0, 24); 
  const diffTime = Math.abs(examDate.getTime() - today.getTime());
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

  const recentTest = testAttempts.length > 0 ? testAttempts[testAttempts.length - 1] : null;

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoalText.trim()) {
      addGoal(newGoalText);
      setNewGoalText('');
    }
  };

  // --- Parent Unconnected View ---
  if (user.role === 'PARENT' && !user.linkedStudentId) {
      return (
          <div className="space-y-8 animate-in fade-in">
              <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                  <div className="relative z-10">
                      <h1 className="text-3xl font-bold mb-4">Welcome to Parent Portal</h1>
                      <p className="text-slate-400 max-w-xl text-lg leading-relaxed">
                          Monitor your child's JEE preparation journey with real-time analytics, mock test scores, and psychometric insights.
                      </p>
                  </div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              </div>

              <div className="bg-white rounded-2xl border border-blue-200 p-10 text-center shadow-lg max-w-2xl mx-auto mt-12">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Users className="w-10 h-10 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Connect with your Student</h2>
                  <p className="text-slate-500 mb-8 max-w-md mx-auto">
                      To see preparation data, you must link your account with your child's 6-digit Student ID.
                  </p>
                  <button 
                    onClick={() => setScreen('family')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center mx-auto gap-2 group"
                  >
                      Find Student <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
                {viewingStudentName ? (
                    <div className="flex items-center gap-3">
                        <Users className="w-8 h-8 text-blue-300" />
                        <span>Tracking: {viewingStudentName}</span>
                    </div>
                ) : `Hello, ${user.name.split(' ')[0]}! 👋`}
            </h1>
            <p className="text-blue-100 italic text-sm md:text-base max-w-xl">
              {viewingStudentName 
                ? "Monitoring progress across Physics, Chemistry, and Maths for the upcoming JEE exam."
                : "\"Success is the sum of small efforts, repeated day in and day out.\""}
              {!viewingStudentName && <br/>}
              {!viewingStudentName && <span className="text-xs opacity-75 font-semibold not-italic mt-1 block">- ROBERT COLLIER</span>}
            </p>
          </div>
          {!viewingStudentName && (
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2 border border-white/10">
                <span className="text-xl">🔥</span>
                <span className="font-bold">12 Day Streak</span>
              </div>
          )}
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
             <div className="flex items-center gap-2 text-slate-500 mb-2">
                <Clock className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Target: JEE {today.getFullYear() + 1}</span>
             </div>
             <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold text-slate-800">-{daysRemaining}</span>
                <span className="text-sm font-medium text-slate-500">Days Remaining</span>
             </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-4">
            <div className="bg-orange-500 h-2 rounded-full w-2/3"></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
          <div>
             <div className="flex items-center gap-2 text-slate-500 mb-2">
                <Target className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Syllabus</span>
             </div>
             <span className="text-4xl font-bold text-slate-800">{progressPercent}%</span>
             <p className="text-xs text-slate-400 mt-1">Overall Completion</p>
             <button 
                onClick={() => setScreen('syllabus')}
                className="text-blue-600 text-xs font-bold mt-3 hover:underline"
             >
                {user.role === 'PARENT' ? 'Review Progress →' : 'View Tracker →'}
             </button>
          </div>
          <div className="w-24 h-24 rounded-full relative bg-slate-100" style={{ background: `conic-gradient(#3b82f6 ${progressPercent}%, #f1f5f9 0)` }}>
             <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                 <span className="text-[10px] font-bold text-slate-400 uppercase">DONE</span>
             </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
           <div className="flex items-center gap-2 text-slate-500 mb-4 w-full justify-start">
              <Trophy className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Recent Test</span>
           </div>
           
           {recentTest ? (
             <div className="w-full">
                <h3 className="text-lg font-bold text-slate-800 truncate">{recentTest.title}</h3>
                <div className="mt-2 text-3xl font-bold text-blue-600">
                   {recentTest.score}<span className="text-lg text-slate-400">/{recentTest.totalMarks}</span>
                </div>
                <div className="mt-2 text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded inline-block">
                   {recentTest.accuracy_percent}% Accuracy
                </div>
             </div>
           ) : (
             <div className="py-2">
                <p className="text-slate-400 text-sm mb-3">No tests taken yet.</p>
                {!viewingStudentName && (
                    <button 
                    onClick={() => setScreen('tests')}
                    className="text-blue-600 font-bold text-sm hover:underline"
                    >
                    Go to Test Center
                    </button>
                )}
             </div>
           )}
        </div>
      </div>

      {/* Goals Section or Connection Helper */}
      {!viewingStudentName ? (
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
               <div className="flex items-center gap-2">
                  <span className="text-xl text-blue-600">🎯</span>
                  <h3 className="font-bold text-slate-700 uppercase tracking-wider text-sm">Today's Goals</h3>
               </div>
               <span className="text-xs font-bold text-slate-400">{goals.filter(g => g.completed).length}/{goals.length}</span>
            </div>

            {goals.length === 0 && (
               <p className="text-slate-400 text-sm italic mb-4">No goals set for today.</p>
            )}

            <div className="space-y-2 mb-4">
              {goals.map(goal => (
                <div key={goal.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg group">
                  <button 
                     onClick={() => toggleGoal(goal.id)}
                     className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        goal.completed ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-300 text-transparent hover:border-blue-400'
                     }`}
                  >
                     ✓
                  </button>
                  <span className={`text-sm ${goal.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                     {goal.text}
                  </span>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddGoal} className="flex gap-2">
               <input 
                  type="text" 
                  placeholder="Add new goal..." 
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newGoalText}
                  onChange={e => setNewGoalText(e.target.value)}
               />
               <button 
                  type="submit"
                  className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-lg font-bold hover:bg-blue-100 transition"
               >
                  +
               </button>
            </form>
          </div>
      ) : (
          <div className="bg-blue-900 rounded-xl p-6 text-white shadow-lg flex items-center justify-between">
              <div>
                  <h3 className="text-lg font-bold mb-1">Student Performance Insights</h3>
                  <p className="text-blue-200 text-sm">Review subject-wise readiness and psychometric analysis.</p>
              </div>
              <button 
                  onClick={() => setScreen('family')}
                  className="bg-white text-blue-900 px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-blue-50 transition-colors"
              >
                  Analyze Readiness
              </button>
          </div>
      )}

      {/* Notice Board */}
      <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100">
         <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <h3 className="font-bold text-yellow-800 text-sm">{viewingStudentName ? 'System Observations' : 'Notice Board'}</h3>
         </div>
         <div className="text-sm text-yellow-700 italic">
            No important notifications at the moment.
         </div>
      </div>
    </div>
  );
};
