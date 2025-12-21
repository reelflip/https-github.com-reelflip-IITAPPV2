
import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, RefreshCw, Activity, Play, CheckCircle2, XCircle, Database, Layers, Bot, Sparkles, ClipboardList, Loader2, Fingerprint, MousePointer2, Server, Check, Lock, ShieldAlert, Users, User, FileText, Settings, Key, AlertTriangle, Zap, Download, FileJson, Share2 } from 'lucide-react';
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

    const runSelectedSuite = async () => {
        setIsRunning(true);
        const runner = initRunner();
        await runner.runCategory(activeTab);
        setIsRunning(false);
        fetchDbStatus();
    };

    const runMasterAudit = async () => {
        if (!confirm("This will execute 121 real-time server tests. Continue?")) return;
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
            setAnalysisReport("### API KEY MISSING\nPlease select an API key in the deployment settings to use live AI diagnostics.");
            setIsAnalyzing(false);
            return;
        }

        try {
            const ai = new GoogleGenAI({ apiKey });
            const failures = results.filter(r => r.status === 'FAIL').map(r => `[${r.id}] ${r.description}: ${r.details}`).join('\n');
            const prompt = `Analyze these 121 diagnostic checkpoints for an IIT JEE preparation platform. 
            Failures Detected:\n${failures || 'No failures in executed tests.'}
            Provide a technical resolution plan.`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: prompt,
                config: { systemInstruction: "You are a Senior Systems Architect and Cybersecurity Expert." }
            });
            setAnalysisReport(response.text || "Status optimal.");
        } catch (error: any) {
            setAnalysisReport(`### ERROR\n\n${error.message}`);
        } finally { setIsAnalyzing(false); }
    };

    const currentResults = results.filter(r => r.category === activeTab);
    const totalExecuted = results.length;
    const totalPassed = results.filter(r => r.status === 'PASS').length;
    const progressPercent = Math.round((totalExecuted / 121) * 100);

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-24 animate-in fade-in">
            {/* Header */}
            <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-800 relative overflow-hidden">
                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-900/50">
                                <ShieldCheck className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black uppercase tracking-tight">Master Audit Engine</h2>
                                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">v13.8 • 121 Logic Checkpoints • Zero Mocking</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3">
                        <button 
                            onClick={runMasterAudit} 
                            disabled={isRunning}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center gap-2 active:scale-95 disabled:opacity-50 transition-all"
                        >
                            {isRunning ? <RefreshCw className="animate-spin w-4 h-4" /> : <Zap className="w-4 h-4" />}
                            Execute 121 Tests
                        </button>
                        <button 
                            onClick={exportAuditReport}
                            disabled={results.length === 0}
                            className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest border border-slate-700 flex items-center gap-2 active:scale-95 disabled:opacity-50 transition-all"
                        >
                            <Download className="w-4 h-4" />
                            Export Master Report
                        </button>
                    </div>
                </div>
                
                {/* Master Progress Bar */}
                <div className="mt-8 relative h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
                <div className="mt-3 flex justify-between text-[10px] font-black uppercase text-slate-500 tracking-widest">
                    <span>Audit Coverage: {progressPercent}%</span>
                    <span>{totalPassed} Passed • {results.filter(r => r.status === 'FAIL').length} Failed</span>
                </div>
                
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
            </div>

            {/* Category Navigation */}
            <div className="flex flex-wrap gap-2 pb-2">
                {(Object.entries(CATEGORY_MAP) as [CategoryKey, any][]).map(([key, config]) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                            activeTab === key 
                            ? 'bg-white text-blue-600 border-blue-200 shadow-sm' 
                            : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-white hover:text-slate-600'
                        }`}
                    >
                        {config.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Result Stream */}
                <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col min-h-[600px]">
                    <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <div>
                            <h3 className="font-black text-slate-800 text-xs uppercase tracking-[0.2em]">{CATEGORY_MAP[activeTab].label}</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Live Database Round-Trip Verification</p>
                        </div>
                        <button 
                            onClick={runSelectedSuite}
                            disabled={isRunning}
                            className="text-blue-600 hover:text-blue-800 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100"
                        >
                            {isRunning ? <Loader2 className="animate-spin w-3 h-3" /> : <Play className="w-3 h-3" />}
                            Execute {CATEGORY_MAP[activeTab].count} Tests
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-50">
                        {currentResults.length > 0 ? currentResults.map(r => (
                            <div key={r.id} className={`p-5 px-8 flex items-start gap-6 transition-all ${r.status === 'FAIL' ? 'bg-rose-50/50' : 'hover:bg-slate-50'}`}>
                                <div className={`mt-1 shrink-0 ${r.status === 'PASS' ? 'text-emerald-500' : r.status === 'RUNNING' ? 'text-blue-500 animate-spin' : 'text-rose-500'}`}>
                                    {r.status === 'PASS' ? <CheckCircle2 size={22} /> : r.status === 'RUNNING' ? <RefreshCw size={22} /> : <XCircle size={22} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{r.id}</span>
                                        <span className="text-[9px] font-mono text-slate-300">{r.latency ? `${r.latency}ms` : ''}</span>
                                    </div>
                                    <div className="font-bold text-slate-800 text-sm truncate">{r.description}</div>
                                    <p className="text-[10px] text-slate-500 mt-1.5 font-medium leading-relaxed italic">{r.details || 'Pending execution...'}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300 p-20 text-center">
                                <Zap size={64} className="mb-6 opacity-10" />
                                <p className="font-black uppercase text-xs tracking-[0.2em] mb-2">Manual Scan Required</p>
                                <p className="text-[10px] text-slate-400 max-w-xs mx-auto">Select a category and trigger the execution suite to perform real-time SQL and role handshakes.</p>
                            </div>
                        )}
                    </div>
                    <div className="p-4 bg-slate-900 border-t border-slate-800 text-white flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Logic Integrity Level</span>
                            <span className="bg-blue-600 px-2 py-0.5 rounded text-[8px] font-black">HIGH</span>
                        </div>
                        <span className="text-[10px] font-mono text-blue-400 font-bold uppercase">PROD_MODE: STRICT_SQL</span>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-4">
                            <Database size={18} className="text-blue-500" />
                            <h4 className="text-xs font-black uppercase text-slate-800 tracking-tighter">Database Telemetry</h4>
                        </div>
                        <div className="space-y-3">
                            {dbTables.map(t => (
                                <div key={t.name} className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:border-blue-200">
                                    <span className="text-[11px] font-bold text-slate-600">{t.name}</span>
                                    <span className="text-blue-600 bg-white px-2 py-0.5 rounded-lg border border-blue-50 text-[10px] font-black">{t.rows} Rows</span>
                                </div>
                            ))}
                            {dbTables.length === 0 && <p className="text-[10px] text-slate-400 italic text-center py-6">No SQL data retrieved. Run INFRA audit.</p>}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                        <Sparkles className="absolute -right-6 -top-6 w-32 h-32 opacity-10" />
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <Bot size={16} className="text-blue-400" /> AI Diagnostic Hub
                        </h4>
                        <p className="text-[11px] text-indigo-200 leading-relaxed font-medium mb-8">
                            Export your 121-point report to Google AI Studio or analyze live failures using the integrated Gemini 3 Engine.
                        </p>
                        <div className="space-y-3">
                            <button 
                                onClick={generateAIReport} 
                                disabled={results.length === 0 || isAnalyzing} 
                                className="w-full bg-white/10 hover:bg-white/20 border border-white/20 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg backdrop-blur-sm"
                            >
                                {isAnalyzing ? <RefreshCw className="animate-spin w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                                Analyze Failure Patterns
                            </button>
                        </div>
                        {analysisReport && (
                            <div className="mt-8 p-5 bg-black/40 rounded-2xl text-[11px] leading-relaxed text-indigo-100 border border-white/5 max-h-[300px] overflow-y-auto custom-scrollbar font-medium">
                                <div className="prose prose-invert prose-sm" dangerouslySetInnerHTML={{ __html: analysisReport.replace(/\n/g, '<br/>').replace(/###/g, '<h4 class="font-black text-blue-400 mt-4 mb-2 uppercase">') }} />
                            </div>
                        )}
                    </div>

                    <div className="bg-amber-50 border border-amber-200 p-6 rounded-[2.5rem] space-y-4">
                        <div className="flex items-center gap-2 text-amber-800">
                            <ShieldAlert size={18} />
                            <h4 className="text-xs font-black uppercase tracking-tighter">Security Alert</h4>
                        </div>
                        <p className="text-[11px] text-amber-700 leading-relaxed font-bold">
                            Auditor is currently in <strong>LIVE_DB_INTERACTION</strong> mode. Tests B.01, D.01 and F.08 will perform actual INSERT/UPDATE operations. Use carefully on production data.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
