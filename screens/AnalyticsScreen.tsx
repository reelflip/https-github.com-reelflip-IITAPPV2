
import React from 'react';
import { User, UserProgress, TestAttempt } from '../lib/types';
import { SYLLABUS_DATA } from '../lib/syllabusData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle2, Target, BarChart3 } from 'lucide-react';

interface Props {
  user?: User; // Optional now to support generic use
  progress?: Record<string, UserProgress>;
  testAttempts?: TestAttempt[];
}

export const AnalyticsScreen: React.FC<Props> = ({ user, progress = {}, testAttempts = [] }) => {
  
  // --- 1. Subject Proficiency (Radar/Radial) ---
  const subjectStats = ['Physics', 'Chemistry', 'Maths'].map(subject => {
      const subjectTopics = SYLLABUS_DATA.filter(t => t.subject === subject);
      const completedCount = subjectTopics.filter(t => progress[t.id]?.status === 'COMPLETED').length;
      const totalCount = subjectTopics.length;
      const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
      
      return {
          name: subject,
          score: percentage,
          fill: subject === 'Physics' ? '#8884d8' : subject === 'Chemistry' ? '#82ca9d' : '#ffc658'
      };
  });

  // --- 2. Score Trend (Line Chart) ---
  const scoreTrendData = testAttempts.map(attempt => ({
      date: new Date(attempt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: attempt.score,
      total: attempt.totalMarks
  })).slice(-10); // Last 10 tests

  // --- 3. Chapter-wise Question Volume (New Section) ---
  const getQuestionVolumeData = () => {
      const volumes = { 'Physics': 0, 'Chemistry': 0, 'Maths': 0 };
      
      Object.values(progress).forEach(p => {
          const topic = SYLLABUS_DATA.find(t => t.id === p.topicId);
          if (topic) {
              const solved = (p.ex1Solved || 0) + (p.ex2Solved || 0) + (p.ex3Solved || 0) + (p.ex4Solved || 0);
              volumes[topic.subject] += solved;
          }
      });

      return [
          { name: 'Physics', questions: volumes['Physics'] },
          { name: 'Chemistry', questions: volumes['Chemistry'] },
          { name: 'Maths', questions: volumes['Maths'] }
      ];
  };
  
  const questionVolumeData = getQuestionVolumeData();

  // --- 4. Weak Areas Logic ---
  const getWeakAreas = () => {
      // Aggregate incorrect answers by subject from all attempts
      const subjectErrors: Record<string, number> = { 'Physics': 0, 'Chemistry': 0, 'Maths': 0 };
      
      testAttempts.forEach(attempt => {
          if(attempt.detailedResults) {
              attempt.detailedResults.forEach(res => {
                  if(res.status === 'INCORRECT' || res.status === 'UNATTEMPTED') {
                      // Map subjectId 'phys' to 'Physics' etc
                      const sub = res.subjectId === 'phys' ? 'Physics' : res.subjectId === 'chem' ? 'Chemistry' : 'Maths';
                      subjectErrors[sub] = (subjectErrors[sub] || 0) + 1;
                  }
              });
          }
      });

      return Object.entries(subjectErrors)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3) // Top 3 weak subjects
          .map(([name, count]) => ({ name, count }));
  };

  const weakAreas = getWeakAreas();

  // --- 5. Mock Data if Empty (for visual appeal) ---
  const showDemoData = testAttempts.length === 0;
  const displayTrendData = showDemoData ? [
      { date: 'Test 1', score: 120 }, { date: 'Test 2', score: 145 }, { date: 'Test 3', score: 132 },
      { date: 'Test 4', score: 160 }, { date: 'Test 5', score: 185 }
  ] : scoreTrendData;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Performance Analytics</h2>
        <p className="text-slate-500">Deep dive into your study metrics, question volume, and test scores.</p>
      </div>

      {/* Top Row: Syllabus Radar & Score Trend */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Syllabus Coverage */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-80 flex flex-col">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                  <CheckCircle2 className="w-5 h-5 mr-2 text-green-500" /> Syllabus Coverage
              </h3>
              <div className="flex-1 w-full -ml-4">
                  <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" barSize={20} data={subjectStats}>
                          <RadialBar
                              label={{ position: 'insideStart', fill: '#fff' }}
                              background
                              dataKey="score"
                          />
                          <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={{ right: 0 }} />
                          <Tooltip />
                      </RadialBarChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Test Score History */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-80 flex flex-col">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-500" /> Score Trajectory
              </h3>
              <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={displayTrendData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" fontSize={12} />
                          <YAxis fontSize={12} />
                          <Tooltip />
                          <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} activeDot={{ r: 8 }} />
                      </LineChart>
                  </ResponsiveContainer>
              </div>
              {showDemoData && <p className="text-xs text-center text-slate-400 mt-2 italic">Showing demo data. Take a test to see real trends!</p>}
          </div>
      </div>

      {/* Middle Row: Question Volume Analysis */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-96">
          <h3 className="font-bold text-slate-800 mb-2 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-purple-500" /> Chapter-wise Question Volume
          </h3>
          <p className="text-xs text-slate-500 mb-6">Total problems solved per subject (Exercises 1-4 combined).</p>
          <ResponsiveContainer width="100%" height="80%">
              <BarChart data={questionVolumeData} layout="horizontal" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f8fafc'}} />
                  <Bar dataKey="questions" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={50} name="Questions Solved" />
              </BarChart>
          </ResponsiveContainer>
      </div>

      {/* Bottom Row: Weak Areas & Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Weak Areas Card */}
          <div className="md:col-span-1 bg-red-50 border border-red-100 rounded-xl p-6">
              <h3 className="font-bold text-red-800 mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" /> Attention Required
              </h3>
              <p className="text-xs text-red-600 mb-4">Based on incorrect answers in recent tests.</p>
              
              <div className="space-y-3">
                  {weakAreas.length > 0 ? weakAreas.map((area, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border border-red-100 flex justify-between items-center shadow-sm">
                          <span className="font-bold text-slate-700">{area.name}</span>
                          <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">{area.count} Errors</span>
                      </div>
                  )) : (
                      <div className="text-center py-4 text-red-400 text-sm">No error data available yet.</div>
                  )}
              </div>
          </div>

          {/* AI Insights */}
          <div className="md:col-span-2 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Target className="w-32 h-32" />
              </div>
              
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 relative z-10">
                  <span className="bg-blue-500 p-1 rounded text-xs">AI</span> Smart Insights
              </h3>
              
              <div className="space-y-4 relative z-10 text-sm text-indigo-100">
                  <p>
                      • <strong>Consistency:</strong> Your test frequency is {testAttempts.length > 2 ? 'good' : 'low'}. Try to take at least one mock test every Sunday.
                  </p>
                  <p>
                      • <strong>Syllabus Pace:</strong> Based on your current completion rate, ensure you finish Mechanics by next month.
                  </p>
                  <p>
                      • <strong>Revision Alert:</strong> Regular revision cycles are key. Check the Revision tab for pending topics.
                  </p>
                  <div className="mt-4 pt-4 border-t border-indigo-800">
                      <p className="italic text-xs opacity-75">"Success doesn't come from what you do occasionally, it comes from what you do consistently."</p>
                  </div>
              </div>
          </div>

      </div>
    </div>
  );
};
