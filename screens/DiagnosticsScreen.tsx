
import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, RefreshCw, Activity, Play, CheckCircle2, XCircle, Database, Layers, Bot, Sparkles, ClipboardList, Loader2, Fingerprint, MousePointer2, Server, Check, Lock, ShieldAlert, Users, User, FileText, Settings, Key, AlertTriangle, Zap, Download, FileJson, Share2, ClipboardCheck } from 'lucide-react';
import { E2ETestRunner, TestResult, CATEGORY_MAP, CategoryKey } from '../services/testRunnerService';
import { GoogleGenAI } from "@google/genai";

export const DiagnosticsScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState<CategoryKey>('INFRA');
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState<TestResult[]>([]);
    const [dbTables, setDbTables] = useState<any[]>([]);
    const [analysisReport, setAnalysisReport] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const runnerRef = useRef<E2ETestRunner | null>(null);

    const initRunner = () => {
        if (!runnerRef.current) {
            runnerRef.current = new E2ETestRunner((newResults) => setResults(newResults));
        }
        return runnerRef.current;
    };

    const fetchDbStatus = async () => {
        try {
            const res = await fetch('/api/test_db.php');
            const data = await res.json();
            if (data.tables) setDbTables(data.tables);
        } catch (e) {}
    };

    useEffect(() => { fetchDbStatus(); }, []);

    const runMasterAudit = async () => {
        if (!confirm("This will execute all 121 real-time server tests (A.01 to J.10). Continue?")) return;
        setIsRunning(true);
        const runner = initRunner();
        await runner.runFullAudit();
        setIsRunning(false);
        fetchDbStatus();
    };

    const exportAuditReport = () => {
        const runner = initRunner();
        runner.exportReport();
    };

    const generateAIReport = async () => {
        if (isAnalyzing || results.length === 0) return;
        setIsAnalyzing(true);
        const apiKey = process.env.API_KEY;
        if (!apiKey || apiKey === "undefined") {
            setAnalysisReport("### API KEY MISSING\nPlease configure an API key in system settings to use live AI diagnostics.");
            setIsAnalyzing(false);
            return;
        }

        try {
            const ai = new GoogleGenAI({ apiKey });
            const failures = results.filter(r => r.status === 'FAIL').map(r => `[${r.id}] ${r.description}: ${r.details}`).join('\n');
            const prompt = `Act as a Systems Reliability Engineer. Analyze these diagnostic results from an IIT preparation platform. 
            TOTAL TESTS: 121. FAILURES DETECTED:\n${failures || 'No failures in executed tests.'}
            Examine potential cascading risks between Infrastructure (A) and Student Core (D). Provide a specific technical resolution plan.`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: prompt,
                config: { systemInstruction: "You are a World-Class Systems Architect and Cybersecurity Lead." }
            });
            setAnalysisReport(response.text || "Status optimal.");
        } catch (error: any) {
            setAnalysisReport(`### ANALYSIS ERROR\n\n${error.message}`);
        } finally { setIsAnalyzing(false); }
    };

    const currentResults = results.filter(r => r.category === activeTab);
    const totalExecuted = results.length;
    const totalPassed = results.filter(r => r.status === 'PASS').length;
    const progressPercent = Math.round((totalExecuted / 121) * 100);

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-24 animate-in fade-in">
            {/* Master Header */}
            <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-800 relative overflow-hidden">
                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-900/50">
                                <ShieldCheck className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black uppercase tracking-tight">121-Point Master Audit</h2>
                                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">v13.5 • E2E • Role-Based • Data-Persistent • Live SQL</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3">
                        <button 
                            onClick={runMasterAudit} 
                            disabled={isRunning}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center gap-2 active:scale-95 disabled:opacity-50 transition-all"
                        >
                            {isRunning ? <RefreshCw className="animate-spin w-5 h-5" /> : <Zap className="w-5 h-5" />}
                            Execute Full Suite
                        </button>
                        <button 
                            onClick={exportAuditReport}
                            disabled={results.length === 0}
                            className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest border border-slate-700 flex items-center gap-2 active:scale-95 disabled:opacity-50 transition-all"
                        >
                            <Download className="w-5 h-5" />
                            Export for AI Studio
                        </button>
                    </div>
                </div>
                
                {/* Global Progress Bar */}
                <div className="mt-10 relative h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-all duration-700"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
                <div className="mt-4 flex justify-between items-center">
                    <span className="text-[11px] font-black uppercase text-slate-500 tracking-[0.2em]">Platform Coverage: {progressPercent}%</span>
                    <div className="flex gap-4 text-[11px] font-black uppercase">
                        <span className="text-emerald-500">{totalPassed} PASSED</span>
                        <span className="text-rose-500">{results.filter(r => r.status === 'FAIL').length} FAILED</span>
                    </div>
                </div>
                
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none"></div>
            </div>

            {/* AI Studio Instruction Box */}
            <div className="bg-indigo-50 border border-indigo-200 p-5 rounded-3xl flex items-start gap-4">
                <div className="p-2 bg-indigo-600 rounded-xl text-white mt-1">
                    <Bot size={20} />
                </div>
                <div>
                    <h4 className="text-xs font-black uppercase text-indigo-900 tracking-tight mb-1">Deep AI Analysis Guide</h4>
                    <p className="text-[11px] text-indigo-700 leading-relaxed font-medium">
                        Click <strong>"Export for AI Studio"</strong> to download the full 121-point JSON report. 
                        Upload this file to <a href="https://aistudio.google.com" target="_blank" className="underline font-black">Google AI Studio</a> with a prompt like 
                        <em> "Examine this diagnostic report for the IIT JEE Prep system and suggest code fixes for the failing logic gates."</em>
                    </p>
                </div>
            </div>

            {/* Category Navigation */}
            <div className="flex flex-wrap gap-2 pb-2 overflow-x-auto no-scrollbar">
                {(Object.entries(CATEGORY_MAP) as [CategoryKey, any][]).map(([key, config]) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${
                            activeTab === key 
                            ? 'bg-white text-blue-600 border-blue-200 shadow-lg' 
                            : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-white hover:text-slate-600'
                        }`}
                    >
                        {config.prefix}. {config.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Result Stream */}
                <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col min-h-[700px]">
                    <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <div>
                            <h3 className="font-black text-slate-800 text-xs uppercase tracking-[0.2em]">{CATEGORY_MAP[activeTab].label}</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Stricty logic verification • No mocking</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase">{results.filter(r => r.category === activeTab).length} / {CATEGORY_MAP[activeTab].count} DONE</span>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-50">
                        {currentResults.length > 0 ? currentResults.map(r => (
                            <div key={r.id} className={`p-6 px-10 flex items-start gap-8 transition-all ${r.status === 'FAIL' ? 'bg-rose-50/50' : 'hover:bg-slate-50'}`}>
                                <div className={`mt-1.5 shrink-0 ${r.status === 'PASS' ? 'text-emerald-500' : r.status === 'RUNNING' ? 'text-blue-500 animate-spin' : 'text-rose-500'}`}>
                                    {r.status === 'PASS' ? <CheckCircle2 size={24} /> : r.status === 'RUNNING' ? <RefreshCw size={24} /> : <XCircle size={24} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{r.id}</span>
                                        <span className="text-[9px] font-mono text-slate-300">{r.latency ? `${r.latency}ms` : ''}</span>
                                    </div>
                                    <div className="font-bold text-slate-800 text-base mb-1">{r.description}</div>
                                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic">{r.details || 'Awaiting execution thread...'}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300 p-20 text-center">
                                <ClipboardCheck size={64} className="mb-6 opacity-10" />
                                <p className="font-black uppercase text-xs tracking-[0.2em] mb-2">Category Not Yet Scanned</p>
                                <p className="text-[10px] text-slate-400 max-w-xs mx-auto">Trigger the Master Audit or run this specific category to verify real-time SQL state.</p>
                            </div>
                        )}
                    </div>
                    <div className="p-5 bg-slate-900 border-t border-slate-800 text-white flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Logic Tier</span>
                            <span className="bg-blue-600 px-3 py-1 rounded-lg text-[9px] font-black">PLATINUM_SYNC</span>
                        </div>
                        <span className="text-[10px] font-mono text-blue-400 font-bold uppercase">PROD_MODE: STRICT_SQL_ROUNDTRIP</span>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-5">
                            <Database size={20} className="text-blue-500" />
                            <h4 className="text-xs font-black uppercase text-slate-800 tracking-tighter">Live SQL Telemetry</h4>
                        </div>
                        <div className="space-y-4">
                            {dbTables.map(t => (
                                <div key={t.name} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:border-blue-200 shadow-sm group">
                                    <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight">{t.name}</span>
                                    <span className="bg-white px-3 py-1 rounded-xl border border-blue-50 text-[10px] font-black text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">{t.rows} Rows</span>
                                </div>
                            ))}
                            {dbTables.length === 0 && <p className="text-[10px] text-slate-400 italic text-center py-6">Handshake needed with SQL server.</p>}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                        <Sparkles className="absolute -right-8 -top-8 w-40 h-40 opacity-10" />
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                            <Bot size={18} className="text-blue-400" /> Advanced AI Scan
                        </h4>
                        <p className="text-[11px] text-indigo-100 leading-relaxed font-medium mb-10 opacity-80">
                            Perform a real-time pattern analysis on your 121-point audit results using the Gemini 3 Pro reasoning engine.
                        </p>
                        <button 
                            onClick={generateAIReport} 
                            disabled={results.length === 0 || isAnalyzing} 
                            className="w-full bg-white text-indigo-900 border border-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl hover:bg-indigo-50 active:scale-95 disabled:opacity-50"
                        >
                            {isAnalyzing ? <RefreshCw className="animate-spin w-5 h-5" /> : <Share2 className="w-5 h-5" />}
                            Run Failure Analysis
                        </button>
                        {analysisReport && (
                            <div className="mt-8 p-6 bg-black/40 rounded-2xl text-[11px] leading-relaxed text-indigo-50 border border-white/10 max-h-[400px] overflow-y-auto custom-scrollbar font-medium backdrop-blur-md">
                                <div className="prose prose-invert prose-sm" dangerouslySetInnerHTML={{ __html: analysisReport.replace(/\n/g, '<br/>').replace(/###/g, '<h4 class="font-black text-blue-400 mt-6 mb-3 uppercase tracking-widest">') }} />
                            </div>
                        )}
                    </div>

                    <div className="bg-amber-50 border border-amber-200 p-8 rounded-[2.5rem] space-y-4">
                        <div className="flex items-center gap-3 text-amber-800">
                            <ShieldAlert size={22} />
                            <h4 className="text-xs font-black uppercase tracking-tighter">Production Warning</h4>
                        </div>
                        <p className="text-[11px] text-amber-700 leading-relaxed font-bold">
                            Diagnostic suite is currently in <strong>ACTIVE_WRITE</strong> mode. Tests involving registration or test submissions will modify real database records. Use for system validation only.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};