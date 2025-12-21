
import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, RefreshCw, Activity, Play, CheckCircle2, XCircle, Database, Layers, Bot, Sparkles, ClipboardList, Loader2, Fingerprint, MousePointer2, Server, Check, Lock, ShieldAlert } from 'lucide-react';
import { E2ETestRunner, TestResult, LocalKnowledgeBase, API_FILES } from '../services/testRunnerService';
import { GoogleGenAI } from "@google/genai";

type DiagnosticsTab = 'CORE' | 'FUNCTIONAL' | 'PERSISTENCE';

export const DiagnosticsScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState<DiagnosticsTab>('CORE');
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState<TestResult[]>([]);
    const [dbTables, setDbTables] = useState<any[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisReport, setAnalysisReport] = useState<string | null>(null);
    const runnerRef = useRef<E2ETestRunner | null>(null);

    const initRunner = () => {
        if (!runnerRef.current) {
            runnerRef.current = new E2ETestRunner((newResults) => setResults(newResults as TestResult[]));
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

    const runFullAudit = async () => {
        setResults([]);
        setAnalysisReport(null);
        setIsRunning(true);
        const runner = initRunner();
        if (activeTab === 'CORE') await runner.runFullAudit();
        else if (activeTab === 'FUNCTIONAL') await runner.runFunctionalSuite();
        else await runner.runPersistenceSuite();
        setIsRunning(false);
        fetchDbStatus();
    };

    const generateAnalysisReport = async () => {
        if (isAnalyzing) return;
        setIsAnalyzing(true);
        const apiKey = process.env.API_KEY;
        if (!apiKey || apiKey === "undefined") {
            const advice = LocalKnowledgeBase.query("diag", results.filter(r => r.status === 'FAIL'));
            setAnalysisReport(`### HEURISTIC ANALYSIS (OFFLINE)\n\n${advice}`);
            setIsAnalyzing(false);
            return;
        }
        try {
            const ai = new GoogleGenAI({ apiKey });
            const failures = results.filter(r => r.status === 'FAIL').map(r => `${r.step}: ${r.description}`).join('\n');
            const systemInstruction = `You are a Systems Architect. Analyzing real-time database write/read failures. CURRENT ERRORS: ${failures || 'None'}. Provide specific code-level PHP/SQL fixes.`;
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: "Analyze the current live system state and generate a fix report.",
                config: { systemInstruction }
            });
            setAnalysisReport(response.text || "System performing within operational parameters.");
        } catch (error: any) {
            setAnalysisReport(`### ANALYSIS ERROR\n\n${error.message}`);
        } finally { setIsAnalyzing(false); }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-24 animate-in fade-in">
            {/* Header */}
            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl border border-slate-800 relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <ShieldCheck className="w-8 h-8 text-blue-400" />
                            <h2 className="text-3xl font-black uppercase">Live System Audit</h2>
                        </div>
                        <p className="text-slate-400 text-sm font-medium">v13.7 Production Logic • Real SQL Round-Trip Verification</p>
                    </div>
                    <div className="flex bg-slate-800 p-1 rounded-xl">
                        <button onClick={() => { setActiveTab('CORE'); setResults([]); }} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === 'CORE' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Node Health</button>
                        <button onClick={() => { setActiveTab('FUNCTIONAL'); setResults([]); }} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === 'FUNCTIONAL' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>Business Logic</button>
                        <button onClick={() => { setActiveTab('PERSISTENCE'); setResults([]); }} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === 'PERSISTENCE' ? 'bg-orange-600 text-white' : 'text-slate-400'}`}>SQL Round-Trip</button>
                    </div>
                    <button onClick={runFullAudit} disabled={isRunning} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg active:scale-95 disabled:opacity-50">
                        {isRunning ? <RefreshCw className="animate-spin" /> : <Play />}
                        {isRunning ? 'Auditing...' : 'Run Live Scan'}
                    </button>
                </div>
                <div className="absolute right-0 top-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
            </div>

            {/* Mock Data Warning */}
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-4">
                <ShieldAlert className="text-amber-600 shrink-0" size={24} />
                <p className="text-xs font-bold text-amber-900 leading-tight">
                    <span className="uppercase block text-[10px] opacity-60">Audit Mode: REAL_TIME_PERSISTENCE</span>
                    Mocking is disabled. Every test below executes actual PHP scripts and database queries. Verify schema in sidebar before running.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Result Stream */}
                <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col min-h-[600px]">
                    <div className="px-8 py-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h3 className="font-black text-xs uppercase tracking-[0.2em]">{activeTab} Stream</h3>
                        <div className="flex gap-2">
                             <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">Live Server</span>
                             <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">v13.7 logic</span>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-50">
                        {results.length > 0 ? results.map(r => (
                            <div key={r.step} className={`p-4 px-8 flex items-start gap-5 transition-all ${r.status === 'FAIL' ? 'bg-rose-50 border-l-4 border-rose-500' : 'hover:bg-slate-50'}`}>
                                {r.status === 'PASS' ? <CheckCircle2 size={20} className="text-emerald-500 mt-0.5" /> : <XCircle size={20} className="text-rose-500 mt-0.5" />}
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{r.step}</span>
                                        <span className="text-[8px] font-mono text-slate-300">{r.latency ? `${r.latency}ms` : ''}</span>
                                    </div>
                                    <div className="font-bold text-slate-800 text-sm">{r.description}</div>
                                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{r.details}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300 p-20 text-center">
                                <Server size={48} className="mb-4 opacity-10" />
                                <p className="font-black uppercase text-xs tracking-widest">Manual Scan Required to verify database IO</p>
                            </div>
                        )}
                    </div>
                    <div className="p-4 bg-slate-900 border-t border-slate-800 text-white flex justify-between">
                        <span className="text-[10px] font-black text-slate-500 uppercase">Integrity Level: HIGH (SQL ROUND-TRIP)</span>
                        <span className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-tighter">Mock-Free Audit</span>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-4 border-b pb-2">
                            <Database size={16} className="text-blue-500" />
                            <h4 className="text-xs font-black uppercase text-slate-800">DB Live Count</h4>
                        </div>
                        <div className="space-y-2">
                            {dbTables.map(t => (
                                <div key={t.name} className="flex justify-between p-2 bg-slate-50 rounded-lg border border-slate-100 text-[10px] font-bold text-slate-600">
                                    <span>{t.name}</span>
                                    <span className="text-blue-600 bg-white px-1.5 py-0.5 rounded border">{t.rows} Records</span>
                                </div>
                            ))}
                            {dbTables.length === 0 && <p className="text-[10px] text-slate-400 italic text-center py-4">Run scan to fetch SQL telemetry.</p>}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
                        <Sparkles className="absolute -right-4 -top-4 w-24 h-24 opacity-5" />
                        <h4 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Bot size={14} className="text-blue-400" /> AI Diagnostic Recovery
                        </h4>
                        <button onClick={generateAnalysisReport} disabled={results.length === 0 || isAnalyzing} className="w-full bg-white/10 hover:bg-white/20 border border-white/20 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                            {isAnalyzing ? <RefreshCw className="animate-spin" size={14} /> : <ClipboardList size={14} />}
                            Analyze Failures
                        </button>
                        {analysisReport && (
                            <div className="mt-4 p-4 bg-black/40 rounded-xl text-[10px] leading-relaxed text-indigo-100 border border-white/5 max-h-[300px] overflow-y-auto custom-scrollbar">
                                <div dangerouslySetInnerHTML={{ __html: analysisReport.replace(/\n/g, '<br/>') }} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
