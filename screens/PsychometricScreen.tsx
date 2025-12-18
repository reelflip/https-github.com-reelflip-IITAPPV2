import React, { useState, useEffect } from 'react';
import { User, PsychometricReport } from '../lib/types';
import { PSYCHOMETRIC_QUESTIONS, generatePsychometricReport, PSYCHOMETRIC_DIMENSIONS } from '../lib/psychometricData';
import { Brain, ArrowRight, CheckCircle, AlertTriangle, Activity, Loader2, Sparkles, HeartPulse, ChevronRight, RefreshCw, BarChart2, FileText, Users, Lightbulb, Heart, Zap, Clock, TrendingUp, Info } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface Props {
    user: User;
    // If viewing as parent/readonly
    reportData?: PsychometricReport; 
}

export const PsychometricScreen: React.FC<Props> = ({ user, reportData: initialReport }) => {
    const [started, setStarted] = useState(false);
    const [currentStep, setCurrentStep] = useState(0); 
    const [responses, setResponses] = useState<Record<number, number>>({});
    const [analyzing, setAnalyzing] = useState(false);
    const [report, setReport] = useState<PsychometricReport | null>(initialReport || null);
    const [loading, setLoading] = useState(false);
    
    const isParent = user.role === 'PARENT';

    useEffect(() => {
        if (!report && !started) {
            const checkReport = async () => {
                setLoading(true);
                try {
                    const targetId = isParent && user.linkedStudentId ? user.linkedStudentId : user.id;
                    if (!targetId) return;
                    
                    const res = await fetch(`/api/get_psychometric.php?user_id=${targetId}`);
                    if(res.ok) {
                        const data = await res.json();
                        if(data && data.report) {
                            setReport(data.report);
                        } else {
                            if (!isParent) {
                                const saved = localStorage.getItem(`psych_report_${user.id}`);
                                if(saved) setReport(JSON.parse(saved));
                            }
                        }
                    }
                } catch(e) { 
                    console.error(e);
                } finally {
                    setLoading(false);
                }
            };
            checkReport();
        }
    }, [user.id, isParent, user.linkedStudentId]);

    const handleStart = () => setStarted(true);

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
        setTimeout(async () => {
            const generatedReport = generatePsychometricReport(responses);
            try {
                await fetch('/api/save_psychometric.php', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ user_id: user.id, report: generatedReport })
                });
                localStorage.setItem(`psych_report_${user.id}`, JSON.stringify(generatedReport));
                setReport(generatedReport);
            } catch(e) { 
                alert("Failed to save report. Local result shown.");
                setReport(generatedReport);
            } finally {
                setAnalyzing(false);
            }
        }, 2000);
    };

    const handleRetake = () => {
        if(confirm("Are you sure? This will overwrite your previous assessment analysis.")) {
            setReport(null);
            setResponses({});
            setCurrentStep(0);
            setStarted(false);
        }
    };

    const getParentTipIcon = (tip: string) => {
        if (tip.includes("Stress") || tip.includes("Burnout")) return <Heart className="w-5 h-5 text-rose-500" />;
        if (tip.includes("Study Support") || tip.includes("Strategy")) return <Brain className="w-5 h-5 text-blue-500" />;
        if (tip.includes("Focus") || tip.includes("Habits")) return <Zap className="w-5 h-5 text-amber-500" />;
        if (tip.includes("Motivation") || tip.includes("Mindset")) return <Sparkles className="w-5 h-5 text-purple-500" />;
        return <Lightbulb className="w-5 h-5 text-slate-500" />;
    };

    if (analyzing || loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] animate-in fade-in">
                <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mb-6 relative">
                    <div className="absolute inset-0 border-4 border-violet-200 rounded-full animate-ping opacity-30"></div>
                    <Brain className="w-10 h-10 text-violet-600 animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                    {loading ? 'Retrieving Report...' : 'Processing Insights...'}
                </h2>
                <p className="text-slate-500 text-center max-w-md">
                    Building your psychometric profile based on JEE-standard behavioral patterns.
                </p>
            </div>
        );
    }

    if (report) {
        /* Fix: Cast Object.entries to properly typed array to avoid 'unknown' comparison issues */
        const radarData = (Object.entries(report.scores) as [string, number][]).map(([dim, score]) => ({
            subject: dim.split(' ')[0], 
            A: score,
            fullMark: 100
        }));

        return (
            <div className="space-y-8 animate-in fade-in pb-20">
                {/* Hero Summary */}
                <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
                    <div className="relative z-10 flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-violet-500/20 rounded-xl border border-violet-500/30">
                                <Brain className="w-6 h-6 text-violet-400" />
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-tight">Psychometric Report</h2>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-4">
                            <div className="px-4 py-2 bg-white/10 rounded-xl border border-white/20 backdrop-blur-md">
                                <span className="text-[10px] font-bold text-violet-300 uppercase block mb-0.5">Profile Archetype</span>
                                <span className="text-sm font-black text-white">{report.profileType}</span>
                            </div>
                            <div className="px-4 py-2 bg-white/10 rounded-xl border border-white/20 backdrop-blur-md">
                                <span className="text-[10px] font-bold text-violet-300 uppercase block mb-0.5">Status</span>
                                <span className="text-sm font-black text-white">{report.overallScore > 70 ? 'Excellent' : report.overallScore > 40 ? 'Developing' : 'Critical'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 flex flex-col items-center gap-2">
                        <div className="relative w-28 h-28 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="56" cy="56" r="50" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="transparent" />
                                <circle cx="56" cy="56" r="50" stroke="#8b5cf6" strokeWidth="8" fill="transparent" strokeDasharray={314} strokeDashoffset={314 - (314 * report.overallScore) / 100} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                            </svg>
                            <span className="absolute text-3xl font-black text-white">{report.overallScore}%</span>
                        </div>
                        <span className="text-[10px] font-black uppercase text-violet-400 tracking-widest">Exam Readiness</span>
                    </div>
                    
                    {!isParent && (
                        <button onClick={handleRetake} className="relative z-10 p-2 text-slate-400 hover:text-white transition-colors"><RefreshCw size={18}/></button>
                    )}
                    <div className="absolute right-0 top-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                </div>

                <div className="bg-violet-50 p-6 rounded-2xl border border-violet-100 flex gap-4">
                    <Sparkles className="w-6 h-6 text-violet-600 shrink-0" />
                    <div>
                        <h3 className="font-bold text-violet-900 text-sm uppercase tracking-wider mb-1">Executive Summary</h3>
                        <p className="text-violet-800 leading-relaxed text-sm font-medium">{report.summary}</p>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Detailed Analysis Column */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* Dimensional Breakdown - VISUAL */}
                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                            <h3 className="font-black text-slate-800 text-lg mb-8 uppercase tracking-tight flex items-center gap-2">
                                <BarChart2 className="w-5 h-5 text-violet-600" /> Dimensional Deep Dive
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                {/* Fix: Explicitly cast entries to [string, number][] to fix Operator '>' cannot be applied to types 'unknown' and 'number' error */}
                                {(Object.entries(report.scores) as [string, number][]).map(([dim, score]) => (
                                    <div key={dim} className="space-y-2">
                                        <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wide">
                                            <span>{dim}</span>
                                            <span className={score > 70 ? 'text-green-600' : score > 45 ? 'text-amber-600' : 'text-rose-600'}>{score}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-1000 ${score > 70 ? 'bg-green-500' : score > 45 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                                                style={{ width: `${score}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Detailed Analysis Text */}
                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                            <h3 className="font-black text-slate-800 text-lg mb-6 uppercase tracking-tight flex items-center gap-2">
                                <FileText className="w-5 h-5 text-indigo-600" /> Psychological Narrative
                            </h3>
                            <div className="blog-content prose prose-slate max-w-none prose-h3:text-indigo-600 prose-h3:font-black prose-h3:text-sm prose-h3:uppercase prose-h3:tracking-widest">
                                <div dangerouslySetInnerHTML={{ __html: report.detailedAnalysis?.replace(/###/g, '<h3 class="mt-8 mb-3">').replace(/\n/g, '<br/>') || '' }} />
                            </div>
                        </div>
                    </div>

                    {/* Actionable Sidebar */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Parent Tips if applicable */}
                        {isParent && report.parentTips && (
                            <div className="bg-amber-50 p-6 rounded-3xl border border-amber-200 shadow-sm space-y-4">
                                <h3 className="font-black text-amber-900 text-sm uppercase tracking-widest flex items-center gap-2">
                                    <Users className="w-5 h-5" /> Parent Guidance
                                </h3>
                                <div className="space-y-4">
                                    {report.parentTips.map((tip, idx) => (
                                        <div key={idx} className="flex gap-3 bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
                                            <div className="shrink-0 mt-0.5">{getParentTipIcon(tip)}</div>
                                            <p className="text-xs text-slate-700 leading-relaxed font-bold">{tip.split(':')[1] || tip}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action Plan */}
                        <div className="bg-slate-900 p-6 rounded-3xl shadow-xl space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/30">
                                    <TrendingUp className="w-5 h-5 text-blue-400" />
                                </div>
                                <h3 className="font-black text-white text-sm uppercase tracking-widest">Growth Plan</h3>
                            </div>
                            <div className="space-y-3">
                                {report.actionPlan.map((action, idx) => (
                                    <div key={idx} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex gap-4 hover:bg-white/10 transition-colors">
                                        <span className="text-blue-400 font-black text-lg">0{idx + 1}</span>
                                        <p className="text-xs text-blue-50 leading-relaxed font-medium">{action}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Key Critical Insights */}
                        <div className="space-y-4">
                            <h3 className="font-black text-slate-500 text-xs uppercase tracking-widest ml-1">Critical Markers</h3>
                            {report.insights.map((insight, idx) => (
                                <div key={idx} className={`p-4 rounded-2xl border flex gap-3 ${
                                    insight.status === 'GOOD' ? 'bg-emerald-50 border-emerald-100' :
                                    insight.status === 'POOR' ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-200'
                                }`}>
                                    <div className={`mt-0.5 shrink-0 ${insight.status === 'GOOD' ? 'text-emerald-600' : insight.status === 'POOR' ? 'text-rose-600' : 'text-slate-500'}`}>
                                        {insight.status === 'GOOD' ? <CheckCircle size={16} /> : 
                                         insight.status === 'POOR' ? <AlertTriangle size={16} /> : <Info size={16} />}
                                    </div>
                                    <p className={`text-[11px] font-bold leading-tight ${insight.status === 'GOOD' ? 'text-emerald-900' : insight.status === 'POOR' ? 'text-rose-900' : 'text-slate-900'}`}>
                                        {insight.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!started) {
        return (
            <div className="max-w-3xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden text-center p-12 relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-violet-50 rounded-full -mr-32 -mt-32 pointer-events-none"></div>
                    <div className="relative z-10">
                        <div className="w-24 h-24 bg-violet-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-violet-200 transform -rotate-3 hover:rotate-0 transition-transform">
                            <HeartPulse className="w-12 h-12" />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Psychometric Deep Dive</h1>
                        <p className="text-lg text-slate-500 mb-10 max-w-lg mx-auto leading-relaxed">
                            A 45-point diagnostic scan identifying behavioral bottlenecks, learning plateaus, and emotional readiness for the JEE exam cycle.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-violet-200 transition-colors group">
                                <span className="text-2xl mb-3 block group-hover:scale-110 transition-transform">📉</span>
                                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest mb-1">Burnout Risk</h3>
                                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Detect cognitive fatigue patterns before they impact mock test scores.</p>
                            </div>
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-violet-200 transition-colors group">
                                <span className="text-2xl mb-3 block group-hover:scale-110 transition-transform">🎯</span>
                                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest mb-1">Focus Balance</h3>
                                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Analyze the ratio between active problem solving and passive reading.</p>
                            </div>
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-violet-200 transition-colors group">
                                <span className="text-2xl mb-3 block group-hover:scale-110 transition-transform">🛡️</span>
                                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest mb-1">Temperament</h3>
                                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Evaluate your biological response to difficult problems under time pressure.</p>
                            </div>
                        </div>

                        <button 
                            onClick={handleStart}
                            className="bg-slate-900 hover:bg-violet-600 text-white text-lg font-black py-4 px-12 rounded-2xl shadow-xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center mx-auto gap-3"
                        >
                            Begin Diagnostic <ArrowRight className="w-6 h-6" />
                        </button>
                        <p className="text-[10px] text-slate-400 mt-6 font-bold uppercase tracking-widest">Confidential • 5 Minute Duration • Personalized Action Plan</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-8 animate-in fade-in">
            <div className="mb-10 text-center">
                <div className="flex justify-between items-end mb-4">
                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Diagnostic Phase {currentStep + 1} / {totalPages}</h2>
                    <span className="text-xs font-black text-violet-600 bg-violet-50 px-3 py-1 rounded-full uppercase">
                        {Math.round(((Object.keys(responses).length) / PSYCHOMETRIC_QUESTIONS.length) * 100)}% COMPLETE
                    </span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 p-0.5">
                    <div 
                        className="h-full bg-violet-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(139,92,246,0.5)]" 
                        style={{ width: `${((Object.keys(responses).length) / PSYCHOMETRIC_QUESTIONS.length) * 100}%` }}
                    />
                </div>
            </div>

            <div className="space-y-8">
                {currentQuestions.map((q) => (
                    <div key={q.id} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex items-start gap-4 mb-6">
                            <span className="text-[10px] font-black text-slate-300 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 uppercase shrink-0 mt-1">Item {q.id}</span>
                            <p className="text-xl font-bold text-slate-800 leading-snug">{q.text}</p>
                        </div>
                        
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                                {[1, 2, 3, 4, 5].map((val) => (
                                    <button
                                        key={val}
                                        onClick={() => handleAnswer(q.id, val)}
                                        className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center font-black text-sm transition-all transform active:scale-90 ${
                                            responses[q.id] === val 
                                            ? 'bg-violet-600 text-white shadow-xl scale-110 z-10' 
                                            : 'bg-white text-slate-400 hover:bg-violet-50 hover:text-violet-600'
                                        }`}
                                    >
                                        {val}
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-between px-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                <span>Strongly Disagree</span>
                                <span>Strongly Agree</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 flex justify-between items-center pb-20">
                <p className="text-xs text-slate-400 italic">Please answer honestly for the most accurate analysis.</p>
                <button 
                    onClick={handleNext}
                    disabled={currentQuestions.some(q => !responses[q.id])}
                    className="bg-slate-900 hover:bg-violet-600 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed shadow-2xl transition-all flex items-center gap-3 active:scale-95"
                >
                    {currentStep < totalPages - 1 ? 'Save & Continue' : 'Run Full Analysis'} <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
