
import React, { useState } from 'react';
import { User, UserProgress, TestAttempt, Goal } from '../lib/types';
import { SYLLABUS_DATA } from '../lib/syllabusData';

interface Props {
  user: User;
  progress: Record<string, UserProgress>;
  testAttempts: TestAttempt[];
  goals: Goal[];
  toggleGoal: (id: string) => void;
  addGoal: (text: string) => void;
  setScreen: (screen: any) => void;
}

export const DashboardScreen: React.FC<Props> = ({ user, progress, testAttempts, goals, toggleGoal, addGoal, setScreen }) => {
  const [newGoalText, setNewGoalText] = useState('');

  const totalTopics = SYLLABUS_DATA.length;
  const completedTopics = (Object.values(progress) as UserProgress[]).filter(p => p.status === 'COMPLETED').length;
  const progressPercent = Math.round((completedTopics / totalTopics) * 100);
  
  // Calculate Days Remaining (Assuming Exam Date is Jan 1st Next Year for demo)
  const today = new Date();
  const examDate = new Date(today.getFullYear() + 1, 0, 24); // Jan 24th approx
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

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        {/* Decorative background circle */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Hello, {user.name.split(' ')[0]}! 👋</h1>
            <p className="text-blue-100 italic text-sm md:text-base max-w-xl">
              "Success is the sum of small efforts, repeated day in and day out."
              <br/><span className="text-xs opacity-75 font-semibold not-italic mt-1 block">- ROBERT COLLIER</span>
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2 border border-white/10">
            <span className="text-xl">🔥</span>
            <span className="font-bold">12 Day Streak</span>
          </div>
        </div>
        
        <div className="flex gap-1 mt-6">
           <div className="h-1 w-8 bg-white rounded-full"></div>
           <div className="h-1 w-2 bg-white/40 rounded-full"></div>
           <div className="h-1 w-2 bg-white/40 rounded-full"></div>
           <div className="h-1 w-2 bg-white/40 rounded-full"></div>
           <div className="h-1 w-2 bg-white/40 rounded-full"></div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Countdown Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
             <div className="flex items-center gap-2 text-slate-500 mb-2">
                <span className="text-lg">📅</span>
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

        {/* Syllabus Donut Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
          <div>
             <div className="flex items-center gap-2 text-slate-500 mb-2">
                <span className="text-lg">✅</span>
                <span className="text-xs font-bold uppercase tracking-wider">Syllabus</span>
             </div>
             <span className="text-4xl font-bold text-slate-800">{progressPercent}%</span>
             <p className="text-xs text-slate-400 mt-1">Overall Completion</p>
             <button 
                onClick={() => setScreen('syllabus')}
                className="text-blue-600 text-xs font-bold mt-3 hover:underline"
             >
                View Tracker →
             </button>
          </div>
          {/* Simple CSS Conic Gradient for Donut Chart */}
          <div className="w-24 h-24 rounded-full relative bg-slate-100" style={{
            background: `conic-gradient(#3b82f6 ${progressPercent}%, #f1f5f9 0)`
          }}>
             <div className="absolute inset-2 bg-white rounded-full"></div>
          </div>
        </div>

        {/* Recent Test Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
           <div className="flex items-center gap-2 text-slate-500 mb-4 w-full justify-start">
              <span className="text-lg">🏆</span>
              <span className="text-xs font-bold uppercase tracking-wider">Recent Test</span>
           </div>
           
           {recentTest ? (
             <div className="w-full">
                <h3 className="text-lg font-bold text-slate-800 truncate">{recentTest.title}</h3>
                <div className="mt-2 text-3xl font-bold text-blue-600">
                   {recentTest.score}<span className="text-lg text-slate-400">/{recentTest.totalMarks}</span>
                </div>
                <div className="mt-2 text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded inline-block">
                   {recentTest.accuracy}% Accuracy
                </div>
             </div>
           ) : (
             <div className="py-2">
                <p className="text-slate-400 text-sm mb-3">No tests taken yet.</p>
                <button 
                  onClick={() => setScreen('tests')}
                  className="text-blue-600 font-bold text-sm hover:underline"
                >
                  Go to Test Center
                </button>
             </div>
           )}
        </div>
      </div>

      {/* Goals Section */}
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

      {/* Notice Board */}
      <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100">
         <div className="flex items-center gap-2 mb-3">
            <span className="text-orange-500">🔔</span>
            <h3 className="font-bold text-yellow-800 text-sm">Student Notice Board</h3>
         </div>
         <div className="text-sm text-yellow-700 italic">
            No new notices.
         </div>
      </div>
    </div>
  );
};