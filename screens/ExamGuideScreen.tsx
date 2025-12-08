
import React from 'react';
import { Award, Zap, Building, GraduationCap, Flame, BookOpen, Target, Calendar, BarChart3, Layers } from 'lucide-react';

export const ExamGuideScreen: React.FC = () => {
  const exams = [
    {
      name: 'JEE Advanced',
      difficulty: 5,
      focus: 'Depth & Concept Application',
      desc: 'The toughest engineering exam. Requires deep understanding of concepts, multi-concept application, and high IQ problem solving.',
      colleges: 'IITs (Indian Institutes of Technology)',
      dates: 'May/June',
      color: 'bg-red-50 border-red-200',
      barColor: 'bg-red-500',
      icon: <Award className="w-6 h-6 text-red-600" />
    },
    {
      name: 'JEE Main',
      difficulty: 4,
      focus: 'Speed & Accuracy (NCERT)',
      desc: 'Gateway to NITs and qualifying exam for Advanced. Focuses on speed, accuracy, and syllabus coverage. Chemistry is strictly NCERT based.',
      colleges: 'NITs, IIITs, GFTIs',
      dates: 'Jan & April',
      color: 'bg-orange-50 border-orange-200',
      barColor: 'bg-orange-500',
      icon: <BookOpen className="w-6 h-6 text-orange-600" />
    },
    {
      name: 'BITSAT',
      difficulty: 3,
      focus: 'Speed, English & Logic',
      desc: 'Entrance for BITS Pilani. Easier questions than JEE Main but requires extreme speed (130 questions in 3 hours). Includes English & Logic sections.',
      colleges: 'BITS Pilani, Goa, Hyderabad',
      dates: 'May & June',
      color: 'bg-purple-50 border-purple-200',
      barColor: 'bg-purple-500',
      icon: <Zap className="w-6 h-6 text-purple-600" />
    },
    {
      name: 'VITEEE',
      difficulty: 2,
      focus: 'Speed & Direct Formula',
      desc: 'For VIT Vellore. Questions are direct application of formulas. No negative marking usually, so guessing is part of the strategy.',
      colleges: 'VIT Vellore, Chennai',
      dates: 'April',
      color: 'bg-blue-50 border-blue-200',
      barColor: 'bg-blue-500',
      icon: <Building className="w-6 h-6 text-blue-600" />
    },
    {
      name: 'State Exams (CET)',
      difficulty: 2,
      focus: 'Regional Syllabus',
      desc: 'MHT-CET, WBJEE, KCET. Focus on 12th state board syllabus. High scoring exams for top state government colleges.',
      colleges: 'Top State Govt Colleges (COEP, VJTI, Jadavpur)',
      dates: 'May',
      color: 'bg-green-50 border-green-200',
      barColor: 'bg-green-500',
      icon: <GraduationCap className="w-6 h-6 text-green-600" />
    }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 pb-10">
      
      {/* Header */}
      <div className="bg-white py-12 px-4 border-b border-slate-200">
         <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Know Your Battlefield</h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                A comprehensive guide to difficulty levels, target colleges, and exam strategies for 2025 aspirants.
            </p>
         </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
         
         {/* Main Comparison Matrix */}
         <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
             <div className="bg-slate-900 text-white p-6 flex items-center space-x-3">
                 <BarChart3 className="w-6 h-6 text-yellow-400" />
                 <h2 className="text-xl font-bold">Exam Comparison Matrix</h2>
             </div>
             
             <div className="divide-y divide-slate-100">
                 {exams.map((exam, idx) => (
                     <div key={idx} className={`p-6 transition-all hover:bg-slate-50 ${exam.color} border-l-4`}>
                         <div className="flex flex-col md:flex-row gap-6">
                             
                             {/* Left: Identity */}
                             <div className="w-full md:w-1/4 shrink-0">
                                 <div className="flex items-center gap-3 mb-2">
                                     <div className="bg-white p-2 rounded-lg shadow-sm">{exam.icon}</div>
                                     <h3 className="text-xl font-bold text-slate-800">{exam.name}</h3>
                                 </div>
                                 
                                 <div className="mt-4">
                                     <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase mb-1">
                                         <span>Difficulty</span>
                                         <div className="flex">
                                             {[...Array(5)].map((_, i) => (
                                                 <Flame key={i} className={`w-3 h-3 ${i < exam.difficulty ? 'text-orange-500 fill-orange-500' : 'text-slate-300'}`} />
                                             ))}
                                         </div>
                                     </div>
                                     <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                         <div className={`h-full ${exam.barColor} rounded-full`} style={{ width: `${(exam.difficulty / 5) * 100}%` }}></div>
                                     </div>
                                 </div>
                             </div>

                             {/* Middle: Strategy */}
                             <div className="w-full md:w-1/3 flex flex-col justify-center md:border-l border-slate-200/50 md:pl-6">
                                 <div className="flex items-center gap-2 mb-2">
                                     <Target className="w-4 h-4 text-slate-400" />
                                     <p className="text-sm font-bold text-slate-700">{exam.focus}</p>
                                 </div>
                                 <p className="text-sm text-slate-600 leading-relaxed">
                                     {exam.desc}
                                 </p>
                             </div>

                             {/* Right: Logistics */}
                             <div className="w-full md:w-1/3 md:border-l border-slate-200/50 md:pl-6 space-y-3">
                                 <div className="flex items-start">
                                    <Building className="w-4 h-4 text-slate-400 mt-0.5 mr-2 shrink-0" />
                                    <div>
                                        <span className="text-xs font-bold text-slate-500 uppercase block">Colleges</span>
                                        <p className="text-sm text-slate-800 font-medium">{exam.colleges}</p>
                                    </div>
                                 </div>
                                 <div className="flex items-start">
                                    <Calendar className="w-4 h-4 text-slate-400 mt-0.5 mr-2 shrink-0" />
                                    <div>
                                        <span className="text-xs font-bold text-slate-500 uppercase block">Exam Window</span>
                                        <p className="text-sm text-slate-800">{exam.dates}</p>
                                    </div>
                                 </div>
                             </div>

                         </div>
                     </div>
                 ))}
             </div>
         </div>

         {/* Strategy Cards */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-800 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                  <div className="relative z-10">
                      <h3 className="text-lg font-bold mb-2">JEE Advanced Strategy</h3>
                      <p className="text-sm text-slate-300 leading-relaxed">
                          Do not chase 100% syllabus. Focus on 100% depth in 80% of topics. Solve problems that mix multiple concepts (e.g. Electrostatics + Rotation).
                      </p>
                  </div>
                  <Layers className="absolute -bottom-4 -right-4 w-24 h-24 text-slate-700 opacity-50" />
              </div>

              <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                  <div className="relative z-10">
                      <h3 className="text-lg font-bold mb-2">JEE Main Strategy</h3>
                      <p className="text-sm text-blue-100 leading-relaxed">
                          Speed and Coverage are key. You cannot leave any chapter. For Chemistry, treat NCERT as your Bible. Memorize every line of Inorganic.
                      </p>
                  </div>
                  <BookOpen className="absolute -bottom-4 -right-4 w-24 h-24 text-blue-800 opacity-50" />
              </div>

              <div className="bg-purple-600 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                  <div className="relative z-10">
                      <h3 className="text-lg font-bold mb-2">BITSAT Strategy</h3>
                      <p className="text-sm text-purple-100 leading-relaxed">
                          Time Management is everything. You have to solve 130 questions. Don't get stuck on one hard problem. English & Logic are bonus marks—don't ignore them!
                      </p>
                  </div>
                  <Zap className="absolute -bottom-4 -right-4 w-24 h-24 text-purple-800 opacity-50" />
              </div>
         </div>

      </div>
    </div>
  );
};
