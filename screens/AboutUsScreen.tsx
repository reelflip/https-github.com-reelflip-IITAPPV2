
import React from 'react';
import { BookOpen, Target, CalendarClock, BarChart, BookX, Heart, CheckCircle2, Award, Users, Globe, Brain, TrendingUp } from 'lucide-react';

export const AboutUsScreen: React.FC = () => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 pb-10">
      
      {/* Hero Section */}
      <div className="bg-slate-900 text-white pt-20 pb-24 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <TrendingUp className="w-96 h-96 text-blue-500" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6">
                Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">IIT JEE Preparation</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                IITGEEPrep provides the digital infrastructure for serious engineering aspirants. We combine an advanced syllabus tracker, high-yield mock tests, and data-driven insights.
            </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-20">
        {/* Philosophy Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mb-16">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl transition-transform hover:-translate-y-1 duration-300">
                <span className="text-4xl font-black text-blue-600 block mb-2">IIT</span>
                <h3 className="text-xs text-slate-500 uppercase font-bold tracking-widest block mb-3">Targeting Excellence</h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                    Focused on the rigor required for the <strong>Indian Institutes of Technology</strong>. We provide the depth needed for JEE Advanced.
                </p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl transition-transform hover:-translate-y-1 duration-300">
                <span className="text-4xl font-black text-orange-500 block mb-2">GEE</span>
                <h3 className="text-xs text-slate-500 uppercase font-bold tracking-widest block mb-3">General Engineering</h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                    Beyond IITs, we cover all major <strong>entrance exams</strong> like BITSAT, VITEEE, and MET to ensure you have options.
                </p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl transition-transform hover:-translate-y-1 duration-300">
                <span className="text-4xl font-black text-green-600 block mb-2">Prep</span>
                <h3 className="text-xs text-slate-500 uppercase font-bold tracking-widest block mb-3">Strategic Preparation</h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                    Moving beyond rote learning. We use <strong>analytics and study planners</strong> to optimize your routine for maximum output.
                </p>
            </div>
        </div>

        {/* Feature Breakdown */}
        <div className="space-y-12 mb-20">
            <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Tools for Engineering Success</h2>
                <p className="text-slate-600">Our platform is built around the core pillars of effective exam preparation.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <FeatureCard 
                    icon={<BookOpen className="w-6 h-6 text-blue-600" />}
                    bg="bg-blue-50"
                    title="Syllabus Tracker"
                    desc="Granular tracking for Physics, Chemistry, and Maths. Visualize your coverage instantly."
                />
                <FeatureCard 
                    icon={<Target className="w-6 h-6 text-orange-600" />}
                    bg="bg-orange-50"
                    title="Mock Tests"
                    desc="Realistic practice with pattern-based mock tests and a vast question bank."
                />
                <FeatureCard 
                    icon={<CalendarClock className="w-6 h-6 text-purple-600" />}
                    bg="bg-purple-50"
                    title="Smart Timetable"
                    desc="Personalized study schedules based on your school hours and sleep cycle."
                />
                <FeatureCard 
                    icon={<BarChart className="w-6 h-6 text-indigo-600" />}
                    bg="bg-indigo-50"
                    title="Analytics"
                    desc="Identify weak areas with detailed subject-wise performance reports."
                />
                <FeatureCard 
                    icon={<BookX className="w-6 h-6 text-red-600" />}
                    bg="bg-red-50"
                    title="Mistake Notebook"
                    desc="Log incorrect answers and review them systematically to prevent repetition."
                />
                <FeatureCard 
                    icon={<Heart className="w-6 h-6 text-pink-600" />}
                    bg="bg-pink-50"
                    title="Wellness"
                    desc="Guided breathing exercises and focus sounds to maintain peak mental health."
                />
            </div>
        </div>

        {/* Mission Section */}
        <div className="bg-slate-100 rounded-3xl p-8 md:p-12 mb-16 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
                <h2 className="text-3xl font-bold text-slate-900">Why IITGEEPrep?</h2>
                <p className="text-slate-600 leading-relaxed">
                    The journey to an IIT or NIT is a marathon, not a sprint. Most students fail not due to a lack of effort, but due to a lack of <strong>structured planning</strong>.
                </p>
                <p className="text-slate-600 leading-relaxed">
                    We empower students with data. By tracking every hour spent and every question solved, we turn the chaotic JEE preparation process into a measurable, manageable science.
                </p>
                <ul className="space-y-3 pt-2">
                    {[
                        "Designed by Engineers for Aspirants",
                        "Supports JEE Main, Advanced, BITSAT & More",
                        "Free Access to Premium Tracking Tools"
                    ].map((item, i) => (
                        <li key={i} className="flex items-center text-slate-800 font-medium">
                            <CheckCircle2 className="w-5 h-5 text-green-500 mr-3" /> {item}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex-1 flex justify-center">
                <div className="bg-white p-8 rounded-full shadow-lg border border-slate-200 text-center w-64 h-64 flex flex-col justify-center items-center">
                    <Brain className="w-16 h-16 text-purple-500 mb-4" />
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Focus on Concepts</h3>
                    <p className="text-xs text-slate-500">"Don't just memorize. Understand."</p>
                </div>
            </div>
        </div>

        {/* Parent Feature */}
        <div className="bg-gradient-to-r from-teal-500 to-emerald-600 rounded-3xl p-10 text-white shadow-xl mb-16">
            <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="bg-white/20 p-6 rounded-full shrink-0">
                    <Users className="w-12 h-12 text-white" />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold mb-3">Empowering Parents</h3>
                    <p className="text-teal-50 leading-relaxed text-lg">
                        Preparation is a family effort. IITGEEPrep allows parents to securely connect to their child's account to view <strong>real-time progress reports</strong>, syllabus coverage, and mock test scores—without needing to nag. Support your child with data, not pressure.
                    </p>
                </div>
            </div>
        </div>

        {/* Disclaimer */}
        <div className="text-center border-t border-slate-200 pt-10">
            <div className="inline-flex items-center space-x-2 bg-slate-50 border border-slate-200 px-6 py-3 rounded-full">
                <Globe className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600">
                    Official Website: <strong>iitgeeprep.com</strong>
                </span>
            </div>
            <p className="text-xs text-slate-400 mt-4 max-w-lg mx-auto">
                IITGEEPrep is an independent educational platform and is not affiliated with the official IIT Joint Entrance Examination board, NTA, or any specific coaching institute.
            </p>
        </div>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{icon: React.ReactNode, bg: string, title: string, desc: string}> = ({ icon, bg, title, desc }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-200 transition-all hover:shadow-md group">
        <div className={`${bg} w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300`}>
            {icon}
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-700 transition-colors">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed">
            {desc}
        </p>
    </div>
);
