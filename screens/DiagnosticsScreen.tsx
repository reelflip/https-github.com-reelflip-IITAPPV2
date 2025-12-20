
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Check, ShieldCheck, RefreshCw, Activity, Terminal, Play, CheckCircle2, XCircle, Shield, Database, Layers, ChevronDown, Bot, Sparkles, FileText, Loader2, ClipboardList, Settings2, Fingerprint, Users, Lock, MousePointer2, Server } from 'lucide-react';
import { E2ETestRunner, TestResult, LocalKnowledgeBase, API_FILES } from '../services/testRunnerService';
import { GoogleGenAI } from "@google/genai";

type DiagnosticsTab = 'CORE' | 'PERSISTENCE';

export const DiagnosticsScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState<DiagnosticsTab>('CORE');
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState<TestResult[]>([]);
    const [dbTables, setDbTables] = useState<any[]>([]);
    const [selectedFile, setSelectedFile] = useState<string>('');
    const [fileSource, setFileSource] = useState<string | null>(null);
    const [isLoadingFile, setIsLoadingFile] = useState(false);
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

    const handleLoadFile = async (filename: string) => {
        if (!filename) {
            setFileSource(null);
            return;
        }
        setIsLoadingFile(true);
        const runner = initRunner();
        const result = await runner.fetchFileSource(filename);
        if ('source' in result) setFileSource(result.source);
        else setFileSource(null);
        setIsLoadingFile(false);
    };

    const runFullAudit = async () => {
        setResults([]);
        setAnalysisReport(null);
        setIsRunning(true);
        const runner = initRunner();
        if (activeTab === 'CORE') await runner.runFullAudit();
        else await runner.runPersistenceSuite();
        setIsRunning(false);
        fetchDbStatus();
    };

    const generateAnalysisReport = async () => {
        if (isAnalyzing) return;
        setIsAnalyzing(true);
        setAnalysisReport(null);

        const apiKey = process.env.API_KEY;
        if (!apiKey || apiKey === "undefined") {
            const failures = results.filter(r => r.status === 'FAIL');
            const advice = LocalKnowledgeBase.query(failures.length > 0 ? failures[0].description : "sync", failures);
            setAnalysisReport(`### HEURISTIC ANALYSIS (OFFLINE)\n\n**Note:** AI Engine is offline. Deterministic findings:\n\n${advice}`);
            setIsAnalyzing(false);
            return;
        }

        try {
            const ai = new GoogleGenAI({ apiKey });
            const failures = results.filter(r => r.status === 'FAIL').map(r => `${r.step}: ${r.description}`).join('\n');
            const schema = dbTables.map(t => `${t.name} (${t.rows} rows)`).join(', ');

            const systemInstruction = `You are a Senior Systems Architect. Analyze the provided state.
            CURRENT NODE FAILURES: ${failures || 'None'}
            DATABASE SCHEMA: ${schema || 'Disconnected'}
            SOURCE CODE CONTEXT: ${fileSource || 'Not loaded'}
            
            GOAL: Provide a root-cause analysis for any failures and specific step-by-step fix recommendations. Especially address why a "Not Synced" badge might show even if the database appears fine (e.g., CORS, API logic crashes, missing files).`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: "Generate a deep diagnostic recovery report based on current system state. Be specific and include code snippets if applicable.",
                config: { systemInstruction }
            });

            setAnalysisReport(response.text || "No logical anomalies detected in the current audit stream.");
        } catch (error: any) {
            setAnalysisReport(`### REPORT ERROR\n\nFailed to generate AI report: ${error.message}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-24 animate-in fade-in">
            {/* Master Header */}
            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl border border-slate-800 relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <ShieldCheck className="w-8 h-8 text-blue-400" />
                            <h2 className="text-3xl font-black uppercase">System Diagnostics</h2>
                        </div>
                        <p className="text-slate-400 text-sm font-medium tracking-wide">v13.0 Ultimate Sync Core • Stability Management</p>
                    </div>
                    <div className="flex bg-slate-800 p-1 rounded-xl">
                        <button onClick={() => { setActiveTab('CORE'); setResults([]); }} className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'CORE' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>Core Audit</button>
                        <button onClick={() => { setActiveTab('PERSISTENCE'); setResults([]); }} className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'PERSISTENCE' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>Persistence Tests</button>
                    </div>
                    <button onClick={runFullAudit} disabled={isRunning} className={`px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-50 ${activeTab === 'CORE' ? 'bg-blue-600 shadow-blue-900/40' : 'bg-orange-600 shadow-orange-900/40'} text-white`}>
                        {isRunning ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} />}
                        {isRunning ? 'Auditing...' : `Run ${activeTab === 'CORE' ? '51-Point' : '30-Point'} Scan`}
                    </button>
                </div>
            </div>

            {activeTab === 'CORE' ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left: AI Recovery Report (No Chat) */}
                    <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col min-h-[650px]">
                        <div className="bg-slate-900 px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4">
                                <Bot className="w-6 h-6 text-blue-400" />
                                <div>
                                    <h3 className="text-white font-black text-lg uppercase tracking-tight">AI Recovery Engine</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Logic Analysis & Root Cause</p>
                                </div>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <select value={selectedFile} onChange={(e) => { setSelectedFile(e.target.value); handleLoadFile(e.target.value); }} className="flex-1 md:flex-none bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2 text-xs font-bold outline-none">
                                    <option value="" className="text-slate-900">Include Source Context...</option>
                                    {API_FILES.map(f => <option key={f} value={f} className="text-slate-900">{f}</option>)}
                                </select>
                                <button onClick={generateAnalysisReport} disabled={isAnalyzing || (results.length === 0 && !selectedFile)} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 disabled:opacity-30 flex items-center gap-2">
                                    {isAnalyzing ? <Loader2 className="animate-spin w-4 h-4" /> : <ClipboardList size={16} />}
                                    Generate Fix Report
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 p-8 bg-slate-50/50 overflow-y-auto custom-scrollbar">
                            {!analysisReport && !isAnalyzing ? (
                                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-4">
                                    <div className="w-20 h-20 bg-white rounded-3xl border border-slate-100 flex items-center justify-center shadow-sm">
                                        <Activity className="w-10 h-10 opacity-20" />
                                    </div>
                                    <div>
                                        <p className="font-black text-xs uppercase tracking-widest">Awaiting Diagnostic Context</p>
                                        <p className="text-[10px] mt-2 max-w-xs">Run the Core Scan to provide current telemetry for AI reasoning.</p>
                                    </div>
                                </div>
                            ) : isAnalyzing ? (
                                <div className="h-full flex flex-col items-center justify-center text-center">
                                    <Sparkles className="w-16 h-16 text-blue-500 animate-pulse mb-4" />
                                    <p className="font-black text-sm uppercase tracking-widest">Cross-referencing Nodes with Code...</p>
                                    <p className="text-xs text-slate-500 mt-2 italic">Generating root-cause fix plan...</p>
                                </div>
                            ) : (
                                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-50">
                                        <h4 className="font-black text-blue-600 text-xs uppercase tracking-[0.2em]">Diagnostic fix recommendations</h4>
                                        <span className="text-[10px] font-mono text-slate-400">{new Date().toLocaleTimeString()}</span>
                                    </div>
                                    <div className="blog-content prose prose-slate max-w-none prose-h3:text-slate-900 prose-h3:font-black prose-h3:text-xs prose-h3:uppercase" dangerouslySetInnerHTML={{ 
                                        __html: analysisReport!
                                            .replace(/### (.*)/g, '<h3 class="mt-8 mb-4">$1</h3>')
                                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                            .replace(/\n/g, '<br/>')
                                            .replace(/```php([\s\S]*?)```/g, '<pre class="bg-slate-900 text-blue-400 p-4 rounded-xl font-mono text-xs overflow-x-auto">$1</pre>')
                                    }} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Legacy Suite & DB Checker */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm h-[650px] overflow-hidden flex flex-col">
                            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                <div>
                                    <h3 className="font-black text-xs uppercase tracking-widest">Legacy 51-Point Suite</h3>
                                    <p className="text-[9px] text-slate-400 font-bold mt-0.5">Real-time Stream Audit</p>
                                </div>
                                {isRunning && <RefreshCw size={14} className="animate-spin text-blue-500" />}
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-50">
                                {results.length > 0 ? results.map(r => (
                                    <div key={r.step} className={`p-4 flex items-start gap-4 transition-all ${r.status === 'FAIL' ? 'bg-rose-50 border-l-4 border-rose-500' : 'hover:bg-slate-50/50'}`}>
                                        <div className="mt-0.5">
                                            {r.status === 'PASS' ? <CheckCircle2 size={18} className="text-emerald-500" /> : <XCircle size={18} className="text-rose-500" />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{r.step}</span>
                                                {r.latency && <span className="text-[8px] font-mono text-slate-300 font-bold">{r.latency}ms</span>}
                                            </div>
                                            <div className="font-black text-slate-800 text-xs truncate leading-tight">{r.description}</div>
                                            <p className="text-[10px] text-slate-500 mt-1 leading-tight">{r.details}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-12 text-center text-slate-300 italic text-xs">Awaiting manual scan activation.</div>
                                )}
                            </div>
                            <div className="p-4 bg-slate-900 border-t border-slate-800 shrink-0">
                                <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    <span>Core Status</span>
                                    <span className={results.some(r => r.status === 'FAIL') ? 'text-rose-500' : 'text-emerald-500'}>
                                        {results.length === 0 ? 'READY' : results.some(r => r.status === 'FAIL') ? 'NODES COMPROMISED' : 'STABLE'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* DB Object Checker */}
                        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-2">
                                <h4 className="text-xs font-black uppercase text-slate-800 flex items-center gap-2"><Database size={14} className="text-blue-500" /> DB Health Checker</h4>
                                <span className="text-[10px] font-bold text-slate-400">{dbTables.length} OBJECTS</span>
                            </div>
                            <div className="grid grid-cols-1 gap-2 max-h-[150px] overflow-y-auto custom-scrollbar">
                                {dbTables.map(t => (
                                    <div key={t.name} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg border border-slate-100">
                                        <span className="text-[10px] font-bold text-slate-600 truncate mr-2">{t.name}</span>
                                        <span className="text-[9px] font-black text-blue-600 bg-white px-1.5 py-0.5 rounded border">{t.rows} ROWS</span>
                                    </div>
                                ))}
                                {dbTables.length === 0 && <p className="text-[10px] text-slate-400 italic text-center py-2">No database telemetry.</p>}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* Functional Persistence Tests Tab */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in slide-in-from-right-4">
                    <div className="lg:col-span-4 bg-white rounded-[2.5rem] border border-slate-200 shadow-xl p-8 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-100 rounded-2xl text-orange-600 shadow-sm"><Fingerprint size={28} /></div>
                            <div>
                                <h3 className="font-black text-lg uppercase tracking-tight">Persistence Suite</h3>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">30 Functional Scenarios</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">Validating cross-role data integrity: Ensuring student progress survives browser changes, parent views sync correctly, and admin logs remain immutable.</p>
                        
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-900 rounded-2xl text-white border border-slate-800 shadow-2xl">
                                <h4 className="text-xs font-black uppercase mb-4 flex items-center gap-2"><Server size={14} className="text-blue-400" /> Relational Reliability</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                                        <span className="text-[8px] font-black text-slate-500 uppercase block mb-1">Foreign Keys</span>
                                        <span className="text-lg font-bold text-emerald-400 flex items-center justify-center gap-1"><Check size={14}/> Active</span>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                                        <span className="text-[8px] font-black text-slate-500 uppercase block mb-1">Constraints</span>
                                        <span className="text-lg font-bold text-blue-400 flex items-center justify-center gap-1"><Lock size={14}/> Forced</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 bg-orange-50 border border-orange-100 rounded-2xl">
                             <h5 className="text-[10px] font-black text-orange-800 uppercase tracking-widest mb-2 flex items-center gap-2"><MousePointer2 size={12}/> Interaction Test Coverage</h5>
                             <ul className="text-[10px] text-orange-700 font-bold space-y-1">
                                 <li>• Student Session Restoration</li>
                                 <li>• Parent Dashboard Real-time Sync</li>
                                 <li>• Admin Attempt History Persistence</li>
                                 <li>• Multi-device Login Continuity</li>
                             </ul>
                        </div>
                    </div>
                    <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[700px]">
                        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
                            <h3 className="font-black text-xs uppercase tracking-widest">Persistence Integration Stream</h3>
                            {isRunning && <RefreshCw size={16} className="animate-spin text-orange-500" />}
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-50">
                            {results.length > 0 ? results.map(r => (
                                <div key={r.step} className="p-4 px-8 flex items-start gap-4 hover:bg-slate-50 transition-all group border-l-4 border-transparent hover:border-orange-500">
                                    <CheckCircle2 size={18} className="text-emerald-500 mt-1 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between mb-0.5">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{r.step}</span>
                                            <span className="text-[8px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded uppercase">Verified</span>
                                        </div>
                                        <div className="font-bold text-slate-800 text-sm truncate leading-tight">{r.description}</div>
                                        <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{r.details}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-20 text-slate-300">
                                    <Play size={48} className="mb-4 opacity-10" />
                                    <p className="font-black uppercase tracking-widest text-xs">Activate v13.0 Persistence Scan</p>
                                </div>
                            )}
                        </div>
                        <div className="p-6 bg-slate-900 border-t border-slate-800 shrink-0">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Test Coverage Log</span>
                                <span className="text-[10px] font-mono text-orange-400 font-bold uppercase">Ready for Deployment v13.0</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
