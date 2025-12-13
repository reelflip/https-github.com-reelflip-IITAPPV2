
import React from 'react';
import { 
  BookOpen, Target, Brain, BarChart2, Calendar, 
  RotateCw, Users, ShieldCheck, Zap, Layers, 
  CheckCircle2, TrendingUp, Clock, FileText, Activity 
} from 'lucide-react';

export const FeaturesScreen: React.FC = () => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 pb-12 font-inter">
      
      {/* Hero Section */}
      <div className="bg-slate-900 text-white pt-20 pb-24 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 bg-gradient-to-l from-blue-600 to-transparent pointer-events-none"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
            <span className="inline-block py-1 px-3 rounded-full bg-blue-900 text-blue-200 text-xs font-bold uppercase tracking-wider mb-4 border border-blue-800">
                v12.5 Platform Overview
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6">
                The Complete Toolkit for <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Engineering Excellence</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                IITGEEPrep integrates syllabus tracking, AI-driven testing, and performance analytics into one cohesive ecosystem designed for JEE Main & Advanced aspirants.
            </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-20">
        
        {/* Key Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
            
            {/* Feature 1: Syllabus Tracker */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 hover:-translate-y-1 transition-transform duration-300">
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                    <BookOpen className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Granular Syllabus Tracker</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                    Don't just check off chapters. Track sub-topics across Physics, Chemistry, and Maths with statuses like 'Backlog', 'In Progress', and 'Revision Due'. Visual progress bars keep you motivated.
                </p>
            </div>

            {/* Feature 2: Test Center */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 hover:-translate-y-1 transition-transform duration-300">
                <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center mb-6">
                    <Target className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Adaptive Test Engine</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                    Attempt full-length mock tests or create custom practice sessions by chapter and difficulty (Easy, Medium, Hard). Includes NTA-style interface and negative marking logic.
                </p>
            </div>

            {/* Feature 3: Analytics */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 hover:-translate-y-1 transition-transform duration-300">
                <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center mb-6">
                    <BarChart2 className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Deep Performance Analytics</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                    Go beyond scores. Analyze your accuracy, question-wise time management, and identify weak chapters. Our radar charts show exactly where you need to focus.
                </p>
            </div>

            {/* Feature 4: AI Tutor */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 hover:-translate-y-1 transition-transform duration-300">
                <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center mb-6">
                    <Brain className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">AI Personal Tutor</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                    Stuck on a concept at 2 AM? Our integrated AI Tutor allows you to ask doubts instantly. It provides step-by-step explanations for complex Physics and Math problems.
                </p>
            </div>

            {/* Feature 5: Revision Manager */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 hover:-translate-y-1 transition-transform duration-300">
                <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center mb-6">
                    <RotateCw className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Revision Scheduler</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                    Based on the 1-7-30 spaced repetition rule. The system automatically flags topics for review to ensure they move from short-term to long-term memory.
                </p>
            </div>

            {/* Feature 6: Parent Connect */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 hover:-translate-y-1 transition-transform duration-300">
                <div className="w-14 h-14 bg-pink-50 rounded-xl flex items-center justify-center mb-6">
                    <Users className="w-8 h-8 text-pink-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Parent Family Dashboard</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                    Parents can link to their child's account to view non-intrusive progress reports. See study hours, test scores, and syllabus completion without constant nagging.
                </p>
            </div>

        </div>

        {/* Benefits Section */}
        <div className="mb-24">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Choose IITGEEPrep?</h2>
                <p className="text-slate-600">
                    We bridge the gap between hard work and smart work. Our platform is designed to serve the specific needs of both students and their support system.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* For Students */}
                <div className="bg-blue-50 rounded-3xl p-10 border border-blue-100">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-blue-600 text-white p-3 rounded-xl">
                            <Zap className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold text-blue-900">For Students</h3>
                    </div>
                    <ul className="space-y-4">
                        {[
                            "Stay organized with automated timetables.",
                            "Practice exam temperament with timed tests.",
                            "Eliminate 'what to study next' paralysis.",
                            "Consolidate learning with Flashcards & Notes.",
                            "Manage mental health with the Wellness Zone."
                        ].map((item, i) => (
                            <li key={i} className="flex items-start text-blue-800">
                                <CheckCircle2 className="w-5 h-5 mr-3 text-blue-600 shrink-0 mt-0.5" />
                                <span className="font-medium">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* For Parents */}
                <div className="bg-slate-50 rounded-3xl p-10 border border-slate-200">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-slate-800 text-white p-3 rounded-xl">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800">For Parents</h3>
                    </div>
                    <ul className="space-y-4">
                        {[
                            "Gain transparency into your child's effort.",
                            "Identify struggle areas early to provide help.",
                            "Celebrate small wins and progress milestones.",
                            "Access psychometric reports to understand stress levels.",
                            "Reduce household friction over study updates."
                        ].map((item, i) => (
                            <li key={i} className="flex items-start text-slate-700">
                                <CheckCircle2 className="w-5 h-5 mr-3 text-green-600 shrink-0 mt-0.5" />
                                <span className="font-medium">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>

        {/* Tools Showcase */}
        <div className="mb-24">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900">More Than Just Tracking</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="p-6 bg-white border border-slate-200 rounded-xl text-center hover:shadow-lg transition-shadow">
                    <Clock className="w-10 h-10 text-orange-500 mx-auto mb-3" />
                    <h4 className="font-bold text-slate-800">Pomodoro Timer</h4>
                    <p className="text-xs text-slate-500 mt-1">Focus management</p>
                </div>
                <div className="p-6 bg-white border border-slate-200 rounded-xl text-center hover:shadow-lg transition-shadow">
                    <Layers className="w-10 h-10 text-teal-500 mx-auto mb-3" />
                    <h4 className="font-bold text-slate-800">Flashcards</h4>
                    <p className="text-xs text-slate-500 mt-1">Active recall</p>
                </div>
                <div className="p-6 bg-white border border-slate-200 rounded-xl text-center hover:shadow-lg transition-shadow">
                    <FileText className="w-10 h-10 text-red-500 mx-auto mb-3" />
                    <h4 className="font-bold text-slate-800">Mistake Log</h4>
                    <p className="text-xs text-slate-500 mt-1">Error analysis</p>
                </div>
                <div className="p-6 bg-white border border-slate-200 rounded-xl text-center hover:shadow-lg transition-shadow">
                    <Activity className="w-10 h-10 text-blue-500 mx-auto mb-3" />
                    <h4 className="font-bold text-slate-800">Psychometrics</h4>
                    <p className="text-xs text-slate-500 mt-1">Mindset tracking</p>
                </div>
            </div>
        </div>

        {/* CTA */}
        <div className="bg-slate-900 rounded-3xl p-12 text-center text-white relative overflow-hidden mb-12">
            <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold mb-4">Start Your Journey Today</h2>
                <p className="text-slate-400 mb-8">
                    Join thousands of aspirants organizing their preparation with IITGEEPrep. It's time to turn your hard work into results.
                </p>
            </div>
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -ml-20 -mt-20"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl -mr-20 -mb-20"></div>
        </div>

      </div>
    </div>
  );
};
