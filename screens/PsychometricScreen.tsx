
import React, { useState, useEffect } from 'react';
import { User, PsychometricReport } from '../lib/types';
import { PSYCHOMETRIC_QUESTIONS, generatePsychometricReport, PSYCHOMETRIC_DIMENSIONS } from '../lib/psychometricData';
import { Brain, ArrowRight, CheckCircle, AlertTriangle, Activity, Loader2, Sparkles, HeartPulse, ChevronRight, RefreshCw, BarChart2, FileText, Users, Lightbulb } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface Props {
    user: User;
    // If viewing as parent/readonly
    reportData?: PsychometricReport; 
}

export const PsychometricScreen: React.FC<Props> = ({ user, reportData: initialReport }) => {
    const [started, setStarted] = useState(false);
    const [currentStep, setCurrentStep] = useState(0); // 0 to questions.length/batch
    const [responses, setResponses] = useState<Record<number, number>>({});
    const [analyzing, setAnalyzing] = useState(false);
    const [report, setReport] = useState<PsychometricReport | null>(initialReport || null);
    
    const isParent = user.role === 'PARENT';

    // Check if user already has a report on load
    useEffect(() => {
        if (!report) {
            const checkReport = async () => {
                try {
                    const targetId = isParent && user.linkedStudentId ? user.linkedStudentId : user.id;
                    const res = await fetch(`/api/get_psychometric.php?user_id=${targetId}`);
                    if(res.ok) {
                        const data = await res.json();
                        if(data && data.report) {
                            setReport(data.report);
                        }
                    }
                } catch(e) { 
                    // Fallback to local
                    const targetId = isParent && user.linkedStudentId ? user.linkedStudentId : user.id;
                    const saved = localStorage.getItem(`psych_report_${targetId}`);
                    if(saved) setReport(JSON.parse(saved));
                }
            };
            checkReport();
        }
    }, [user.id, report, isParent, user.linkedStudentId]);

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
        // Simulate "Thinking" time
        setTimeout(async () => {
            const generatedReport = generatePsychometricReport(responses);
            setReport(generatedReport);
            setAnalyzing(false);
            
            // Persist
            try {
                await fetch('/api/save_psychometric.php', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ user_id: user.id, report: generatedReport })
                });
            } catch(e) { console.error("Save failed", e); }
            
            localStorage.setItem(`psych_report_${user.id}`, JSON.stringify(generatedReport));
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

    if (analyzing) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] animate-in fade-in">
                <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mb-6 relative">
                    <div className="absolute inset-0 border-4 border-violet-200 rounded-full animate-ping opacity-30"></div>
                    <Brain className="w-10 h-10 text-violet-600 animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Analyzing your psyche...</h2>
                <p className="text-slate-500 text-center max-w-md">
                    Our AI expert is evaluating your stress levels, study patterns, and exam temperament to build a personalized profile.
                </p>
            </div>
        );
    }

    if (report) {
        // --- REPORT VIEW ---
        const radarData = Object.entries(report.scores).map(([dim, score]) => ({
            subject: dim.split(' ')[0], // Shorten name
            A: score,
            fullMark: 100
        }));

        return (
            <div className="space-y-8 animate-in fade-in pb-12">
                <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <Brain className="w-8 h-8 text-violet-400" />
                            <h2 className="text-2xl font-bold">Psychometric Profile</h2>
                        </div>
                        <p className="text-slate-400 max-w-xl">
                            Assessment Date: {new Date(report.date).toLocaleDateString()}
                        </p>
                        <div className="mt-4 inline-flex items-center px-4 py-2 bg-white/10 rounded-full border border-white/20 backdrop-blur-md">
                            <span className="text-sm font-bold text-violet-300 mr-2">Archetype:</span>
                            <span className="text-sm font-bold text-white">{report.profileType}</span>
                        </div>
                    </div>
                    {/* Only show retake if it's the student viewing their own report */}
                    {!isParent && !initialReport && (
                        <button 
                            onClick={handleRetake}
                            className="relative z-10 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" /> Retake Test
                        </button>
                    )}
                    <div className="absolute right-0 top-0 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Col: Radar & Overall */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Overall Exam Readiness</h3>
                            <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="64" cy="64" r="60" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                                    <circle cx="64" cy="64" r="60" stroke={report.overallScore > 70 ? "#10b981" : report.overallScore > 40 ? "#f59e0b" : "#ef4444"} strokeWidth="8" fill="transparent" strokeDasharray={377} strokeDashoffset={377 - (377 * report.overallScore) / 100} strokeLinecap="round" />
                                </svg>
                                <span className="absolute text-3xl font-black text-slate-800">{report.overallScore}%</span>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm h-80">
                            <h3 className="text-center text-sm font-bold text-slate-500 mb-2">Dimensional Balance</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b' }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                                    <Radar name="Student" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
                                    <Tooltip />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Middle: Summary & Insights */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* PARENT SPECIFIC SECTION - Visible ONLY to Parents */}
                        {isParent && report.parentTips && (
                            <div className="bg-amber-50 rounded-xl border border-amber-200 p-6 shadow-sm animate-in slide-in-from-right-4">
                                <h3 className="font-bold text-amber-900 text-lg mb-4 flex items-center">
                                    <Users className="w-6 h-6 mr-2 text-amber-600" /> Parental Guidance Zone
                                </h3>
                                <div className="space-y-3">
                                    <p className="text-sm text-amber-800 mb-2 font-medium">Based on your child's psychometric profile, here are personalized ways you can support them:</p>
                                    {report.parentTips.map((tip, idx) => (
                                        <div key={idx} className="flex items-start gap-3 bg-white p-3 rounded-lg border border-amber-100">
                                            <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                            <p className="text-sm text-slate-700 leading-relaxed">{tip}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="bg-violet-50 p-6 rounded-xl border border-violet-100">
                            <h3 className="text-lg font-bold text-violet-900 mb-3 flex items-center">
                                <Sparkles className="w-5 h-5 mr-2" /> Executive Summary
                            </h3>
                            <p className="text-violet-800 leading-relaxed text-sm">
                                {report.summary}
                            </p>
                        </div>

                        {/* Detailed Deep Dive Analysis */}
                        {report.detailedAnalysis && (
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center">
                                    <FileText className="w-5 h-5 mr-2 text-indigo-600" /> Deep Breakdown
                                </h3>
                                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                    {report.detailedAnalysis}
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-800 text-lg">Key Insights</h3>
                            {report.insights.map((insight, idx) => (
                                <div key={idx} className={`p-4 rounded-xl border flex gap-4 ${
                                    insight.status === 'GOOD' ? 'bg-green-50 border-green-200' :
                                    insight.status === 'POOR' ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'
                                }`}>
                                    <div className={`mt-1 p-1.5 rounded-full h-fit shrink-0 ${
                                        insight.status === 'GOOD' ? 'bg-green-200 text-green-700' :
                                        insight.status === 'POOR' ? 'bg-red-200 text-red-700' : 'bg-slate-200 text-slate-600'
                                    }`}>
                                        {insight.status === 'GOOD' ? <CheckCircle className="w-4 h-4" /> : 
                                         insight.status === 'POOR' ? <AlertTriangle className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <h4 className={`text-sm font-bold uppercase mb-1 ${
                                            insight.status === 'GOOD' ? 'text-green-800' :
                                            insight.status === 'POOR' ? 'text-red-800' : 'text-slate-700'
                                        }`}>{insight.dimension}</h4>
                                        <p className={`text-sm leading-relaxed ${
                                            insight.status === 'GOOD' ? 'text-green-700' :
                                            insight.status === 'POOR' ? 'text-red-700' : 'text-slate-600'
                                        }`}>
                                            {insight.text}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Hide Action Plan for parents if too granular, or show it. Keeping it as it gives context. */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                            <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center">
                                <Activity className="w-5 h-5 mr-2 text-blue-600" /> 
                                {isParent ? "Student's Action Plan" : "Personalized Action Plan"}
                            </h3>
                            <ul className="space-y-3">
                                {report.actionPlan.map((action, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">
                                        <span className="bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{idx + 1}</span>
                                        {action}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Parent View: Empty State (No report found)
    if (isParent && !report) {
        return (
            <div className="max-w-2xl mx-auto py-12 px-4 animate-in fade-in">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-12 text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users className="w-10 h-10 text-slate-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Assessment Pending</h2>
                    <p className="text-slate-500 mb-6 max-w-md mx-auto">
                        The student has not taken the psychometric assessment yet. Once they complete it, you will see a detailed breakdown of their learning style, stress levels, and specific tips for how you can support them.
                    </p>
                    <div className="inline-flex items-center text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
                        <Activity className="w-4 h-4 mr-2" /> Waiting for student action
                    </div>
                </div>
            </div>
        );
    }

    if (!started) {
        // Parent should not see the "Start" screen if no report exists, but logic above handles isParent && !report.
        // So this block is exclusively for STUDENTS who haven't started.
        return (
            <div className="max-w-3xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-center p-12">
                    <div className="w-24 h-24 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-8">
                        <HeartPulse className="w-12 h-12 text-violet-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-4">IIT-JEE Psychometric Assessment</h1>
                    <p className="text-lg text-slate-500 mb-8 max-w-lg mx-auto leading-relaxed">
                        Success in JEE isn't just about Physics, Chemistry, and Maths. It's about your mindset, stress management, and strategy.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <span className="text-2xl mb-2 block">🧘</span>
                            <h3 className="font-bold text-slate-800 text-sm">Stress Analysis</h3>
                            <p className="text-xs text-slate-500 mt-1">Identify burnout risks before they affect your score.</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <span className="text-2xl mb-2 block">🧠</span>
                            <h3 className="font-bold text-slate-800 text-sm">Learning Style</h3>
                            <p className="text-xs text-slate-500 mt-1">Are you a rote learner or a conceptual thinker?</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <span className="text-2xl mb-2 block">🎯</span>
                            <h3 className="font-bold text-slate-800 text-sm">Exam Temperament</h3>
                            <p className="text-xs text-slate-500 mt-1">How well do you handle exam-hall pressure?</p>
                        </div>
                    </div>

                    <button 
                        onClick={handleStart}
                        className="bg-violet-600 hover:bg-violet-700 text-white text-lg font-bold py-4 px-10 rounded-xl shadow-lg shadow-violet-200 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center mx-auto gap-2"
                    >
                        Start Assessment <ArrowRight className="w-5 h-5" />
                    </button>
                    <p className="text-xs text-slate-400 mt-4">Takes approx 5-7 minutes • 45 Questions</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-8 animate-in fade-in">
            <div className="mb-8">
                <div className="flex justify-between items-end mb-2">
                    <h2 className="text-xl font-bold text-slate-800">Section {currentStep + 1} of {totalPages}</h2>
                    <span className="text-sm text-slate-500 font-medium">
                        {Math.round(((Object.keys(responses).length) / PSYCHOMETRIC_QUESTIONS.length) * 100)}% Completed
                    </span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-violet-600 transition-all duration-500 ease-out" 
                        style={{ width: `${((Object.keys(responses).length) / PSYCHOMETRIC_QUESTIONS.length) * 100}%` }}
                    ></div>
                </div>
            </div>

            <div className="space-y-8">
                {currentQuestions.map((q) => (
                    <div key={q.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-lg font-medium text-slate-800 mb-4">{q.text}</p>
                        
                        <div className="flex justify-between items-center gap-2">
                            <div className="text-[10px] font-bold text-slate-400 w-16 text-center">Strongly Disagree</div>
                            <div className="flex-1 flex justify-between bg-slate-50 p-1 rounded-full border border-slate-100">
                                {[1, 2, 3, 4, 5].map((val) => (
                                    <button
                                        key={val}
                                        onClick={() => handleAnswer(q.id, val)}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all transform hover:scale-110 ${
                                            responses[q.id] === val 
                                            ? 'bg-violet-600 text-white shadow-md ring-2 ring-violet-200' 
                                            : 'bg-white text-slate-500 hover:bg-violet-50'
                                        }`}
                                    >
                                        {val}
                                    </button>
                                ))}
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 w-16 text-center">Strongly Agree</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 flex justify-end">
                <button 
                    onClick={handleNext}
                    disabled={currentQuestions.some(q => !responses[q.id])}
                    className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all"
                >
                    {currentStep < totalPages - 1 ? 'Next Section' : 'Analyze Results'} <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
