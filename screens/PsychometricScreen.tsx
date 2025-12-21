
import React, { useState, useEffect } from 'react';
import { User, PsychometricReport } from '../lib/types';
import { PSYCHOMETRIC_QUESTIONS, generatePsychometricReport } from '../lib/psychometricData';
import { Brain, ArrowRight, RefreshCw, BarChart2, FileText, Sparkles, ChevronRight, Loader2, Info, TrendingUp, Lightbulb, Heart, Zap, Star } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';

interface Props {
    user: User;
    reportData?: PsychometricReport; 
    onSaveReport?: (report: PsychometricReport) => void;
}

export const PsychometricScreen: React.FC<Props> = ({ user, reportData, onSaveReport }) => {
    const [started, setStarted] = useState(false);
    const [currentStep, setCurrentStep] = useState(0); 
    const [responses, setResponses] = useState<Record<number, number>>({});
    const [analyzing, setAnalyzing] = useState(false);
    
    const isParent = user.role === 'PARENT';
    const report = reportData || null;

    const handleAnswer = (qId: number, value: number) => {
        setResponses(prev => ({ ...prev, [qId]: value }));
    };

    const QUESTIONS_PER_PAGE = 5;
    const totalPages = Math.ceil(PSYCHOMETRIC_QUESTIONS.length / QUESTIONS_PER_PAGE);
    
    const currentQuestions = PSYCHOMETRIC_QUESTIONS.slice(
        currentStep * QUESTIONS_PER_PAGE, 
        (currentStep + 1) * QUESTIONS_PER_PAGE
    );

    const handleNext = () => {
        if (currentStep < totalPages - 1) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            finishTest();
        }
    };

    const finishTest = async () => {
        setAnalyzing(true);
        setTimeout(() => {
            const generatedReport = generatePsychometricReport(responses);
            if (onSaveReport) onSaveReport(generatedReport);
            setAnalyzing(false);
        }, 1500);
    };

    const getParentTipIcon = (tip: string) => {
        if (tip.includes("Stress") || tip.includes("Burnout")) return <Heart className="w-5 h-5 text-rose-500" />;
        if (tip.includes("Study Support") || tip.includes("Strategy")) return <Brain className="w-5 h-5 text-blue-500" />;
        return <Lightbulb className="w-5 h-5 text-slate-500" />;
    };

    if (analyzing) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] animate-in fade-in">
                <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mb-6">
                    <Brain className="w-10 h-10 text-violet-600 animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Synthesizing Profile...</h2>
            </div>
        );
    }

    if (report) {
        return (
            <div className="space-y-8 animate-in fade-in pb-20">
                <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
                    <div className="relative z-10 flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <Brain className="w-8 h-8 text-violet-400" />
                            <h2 className="text-2xl font-black uppercase tracking-tight">Psychometric Results</h2>
                        </div>
                        <p className="text-violet-200 font-medium">A Behavioral Blueprint for JEE v17.1</p>
                    </div>
                    <div className="relative z-10 flex flex-col items-center">
                        <span className="text-5xl font-black">{report.overallScore}%</span>
                        <span className="text-[10px] font-black uppercase text-violet-400 tracking-widest">Readiness Score</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><BarChart2 size={20}/> Profile Dynamics</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {Object.entries(report.scores).map(([dim, score]: [string, any]) => (
                                    <div key={dim} className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold uppercase text-slate-500">
                                            <span>{dim}</span>
                                            <span>{score}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${score > 70 ? 'bg-green-500' : score > 45 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{width: `${score}%`}} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm blog-content">
                             <div dangerouslySetInnerHTML={{ __html: report.detailedAnalysis?.replace(/###/g, '<h3 class="mt-8 mb-3 text-indigo-600 font-bold uppercase text-sm tracking-widest">').replace(/\n/g, '<br/>') || '' }} />
                        </div>
                    </div>
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl">
                            <h3 className="font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2 text-blue-400"><TrendingUp size={16}/> Corrective Action</h3>
                            <div className="space-y-3">
                                {report.actionPlan.map((action, idx) => (
                                    <div key={idx} className="bg-white/5 border border-white/10 p-3 rounded-xl flex gap-3">
                                        <span className="text-blue-400 font-black">0{idx+1}</span>
                                        <p className="text-xs text-blue-50 leading-relaxed">{action}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!started) {
        return (
            <div className="max-w-3xl mx-auto py-12 animate-in fade-in">
                <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-12 text-center relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-violet-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl">
                            <Brain size={48} />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 mb-4">Exam Ready?</h1>
                        <p className="text-slate-500 text-lg mb-10"> JEE isn't just about IQ. It's about EQ, temperament, and habits. Discover your preparation persona.</p>
                        <button onClick={() => setStarted(true)} className="bg-slate-900 text-white px-12 py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-violet-600 transition-all flex items-center justify-center mx-auto gap-3">
                            Start Assessment <ArrowRight />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-8 animate-in fade-in">
            <div className="mb-10">
                <div className="flex justify-between mb-2"><span className="font-black text-slate-800">Diagnostic Phase {currentStep+1}</span></div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-violet-600 transition-all duration-500" style={{width: `${(currentStep+1)/totalPages*100}%`}} /></div>
            </div>
            <div className="space-y-6">
                {currentQuestions.map(q => (
                    <div key={q.id} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                        <p className="text-xl font-bold text-slate-800 mb-6">{q.text}</p>
                        <div className="flex justify-between bg-slate-50 p-1.5 rounded-2xl">
                            {[1, 2, 3, 4, 5].map(val => (
                                <button key={val} onClick={() => handleAnswer(q.id, val)} className={`w-12 h-12 rounded-xl flex items-center justify-center font-black transition-all ${responses[q.id] === val ? 'bg-violet-600 text-white' : 'bg-white text-slate-400 hover:text-violet-600'}`}>{val}</button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-8 flex justify-end">
                <button onClick={handleNext} disabled={currentQuestions.some(q => !responses[q.id])} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold disabled:opacity-30">Continue <ChevronRight size={18} className="inline ml-2"/></button>
            </div>
        </div>
    );
};
