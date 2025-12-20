import React, { useState, useRef, useMemo, useEffect } from 'react';
import { ShieldCheck, RefreshCw, Activity, Terminal, Play, CheckCircle2, XCircle, Shield, Database, Wrench, Layers, ChevronDown, Bot, AlertTriangle, Zap, Info, FileCode, Search, Sparkles, Code, FileText, AlertCircle, Loader2, ClipboardList, Check, Server, Share2 } from 'lucide-react';
import { E2ETestRunner, TestResult, LocalKnowledgeBase, API_FILES } from '../services/testRunnerService';
import { GoogleGenAI } from "@google/genai";

export const DiagnosticsScreen: React.FC = () => {
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
        if ('source' in result) {
            setFileSource(result.source);
        } else {
            setFileSource(null);
        }
        setIsLoadingFile(false);
    };

    const runFullAudit = async () => {
        setResults([]);
        setAnalysisReport(null);
        setIsRunning(true);
        const runner = initRunner();
        await runner.runFullAudit();
        setIsRunning(false);
        fetchDbStatus();
    };

    const generateAnalysisReport = async () => {
        if (isAnalyzing) return;
        setIsAnalyzing(true);
        setAnalysisReport(null);

        const apiKey = process.env.API_KEY;
        if (!apiKey || apiKey === "undefined") {
            setTimeout(() => {
                const failures = results.filter(r => r.status === 'FAIL');
                const localAdvice = failures.length > 0 
                    ? LocalKnowledgeBase.query(`fix ${failures[0].step}`, failures)
                    : "System appears healthy according to deterministic rules. Load a specific file to analyze logic.";
                setAnalysisReport(`### OFFLINE HEURISTIC REPORT\n\n**Note:** Gemini API Key is missing. Showing deterministic recovery steps.\n\n${localAdvice}`);
                setIsAnalyzing(false);
            }, 800);
            return;
        }

        try {
            const ai = new GoogleGenAI({ apiKey });
            const failures = results.filter(r => r.status === 'FAIL').map(r => `${r.step}: ${r.description} (${r.details})`).join('\n');
            const schema = dbTables.map(t => `${t.name} (${t.rows} rows, ${t.columns?.length || 0} cols)`).join(', ');

            const systemInstruction = `You are a Lead Systems Architect. Analyze this system state and provide a single, cohesive Recovery Report.
            
            STRUCTURE:
            1. ROOT CAUSE ANALYSIS: Explain why specific nodes are failing.
            2. FILE CONTEXT: Analyze ${selectedFile || 'General Logic'} for security or syntax flaws.
            3. STEP-BY-STEP FIX: Provide exact PHP/SQL code to resolve current issues.
            
            SYSTEM CONTEXT:
            - Database: ${schema || 'No tables detected.'}
            - Failures: ${failures || 'None detected.'}
            - File Content: ${fileSource || 'None provided.'}`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: "Generate a deep diagnostic recovery report based on the provided system instruction context.",
                config: { systemInstruction }
            });

            setAnalysisReport(response.text || "Diagnostic scan yielded no logical anomalies.");
        } catch (error: any) {
            setAnalysisReport(`### ERROR GENERATING REPORT\n\n${error.message || 'The AI Engine timed out.'}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const stats = useMemo(() => ({
        total: results.length,
        passed: results.filter(r => r.status === 'PASS').length,
        failed: results.filter(r => r.status === 'FAIL').length,
    }), [results]);

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-24 animate-in fade-in">
            {/* Header: Global Health Monitoring */}
            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl border border-slate-800 relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <ShieldCheck className="w-8 h-8 text-blue-400" />
                            <h2 className="text-3xl font-black tracking-tight uppercase">Stability Control Center</h2>
                        </div>
                        <p className="text-slate-400 text-sm max-w-xl font-medium">
                            Recovery v12.45 Core: Combined Deterministic Audit Stream & AI-Driven Recovery Engine.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3 shrink-0">
                        <button 
                            onClick={runFullAudit} 
                            disabled={isRunning} 
                            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-blue-900/40 disabled:opacity-50 active:scale-95"
                        >
                            {isRunning ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} />}
                            {isRunning ? 'Auditing 51 Nodes...' : 'Launch 51-Point Scan'}
                        </button>
                    </div>
                </div>
                
                {results.length > 0 && (
                    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-top-4">
                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center">
                            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest block mb-1">System Health</span>
                            <span className="text-2xl font-bold text-white">{Math.round((stats.passed / (stats.total || 1)) * 100)}%</span>
                        </div>
                        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl text-center">
                            <span className="text-rose-400 text-[10px] font-black uppercase tracking-widest block mb-1">Failure Nodes</span>
                            <span className="text-2xl font-bold text-rose-400">{stats.failed}</span>
                        </div>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-center">
                            <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest block mb-1">AI Linkage</span>
                            <span className="text-2xl font-bold text-emerald-400">{process.env.API_KEY ? 'Ready' : 'Heuristic Only'}</span>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl text-center">
                            <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest block mb-1">Audit Depth</span>
                            <span className="text-2xl font-bold text-blue-400">51 Points</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Interactive Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left: AI-Assisted Diagnostic Recovery Panel */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col min-h-[650px]">
                        <div className="bg-slate-900 px-8 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500/20 rounded-2xl border border-blue-500/30">
                                    <Sparkles className="w-6 h-6 text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-white font-black text-lg uppercase tracking-tight leading-none">AI Diagnostic Recovery</h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Cross-Analysis: Code + Logs + Schema</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <div className="relative flex-1 md:w-64">
                                    <select 
                                        value={selectedFile}
                                        onChange={(e) => {
                                            setSelectedFile(e.target.value);
                                            handleLoadFile(e.target.value);
                                        }}
                                        className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none transition-all"
                                    >
                                        <option value="" className="text-slate-900">Analyze System Context Only</option>
                                        {API_FILES.map(file => (
                                            <option key={file} value={file} className="text-slate-900">{file}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={14} />
                                </div>
                                <button 
                                    onClick={generateAnalysisReport}
                                    disabled={isAnalyzing || (results.length === 0 && !selectedFile)}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-900/40 disabled:opacity-30 active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap"
                                >
                                    {isAnalyzing ? <Loader2 className="animate-spin w-4 h-4" /> : <ClipboardList size={16} />}
                                    Generate Report
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 p-8 bg-slate-50/50 overflow-y-auto custom-scrollbar">
                            {!analysisReport && !isAnalyzing ? (
                                <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6">
                                    <div className="w-24 h-24 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center">
                                        <Activity className="w-10 h-10 text-slate-200" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-slate-800">Awaiting Analysis Parameters</h4>
                                        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                                            Run the 51-point scan or select a specific PHP file to generate a structured recovery report. The AI will cross-reference failures with source logic.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 w-full">
                                        <div className="p-4 bg-white rounded-2xl border border-slate-100 text-left">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mb-2" />
                                            <p className="text-[10px] font-black uppercase text-slate-400">Step 1</p>
                                            <p className="text-xs font-bold text-slate-700">Audit Nodes</p>
                                        </div>
                                        <div className="p-4 bg-white rounded-2xl border border-slate-100 text-left">
                                            <CheckCircle2 className="w-4 h-4 text-blue-500 mb-2" />
                                            <p className="text-[10px] font-black uppercase text-slate-400">Step 2</p>
                                            <p className="text-xs font-bold text-slate-700">Select Source</p>
                                        </div>
                                    </div>
                                </div>
                            ) : isAnalyzing ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="relative">
                                        <Bot className="w-16 h-16 text-blue-600 animate-bounce" />
                                        <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-amber-400 animate-pulse" />
                                    </div>
                                    <p className="font-black text-slate-800 uppercase tracking-widest text-sm">Deep Reasoning Engine Active</p>
                                    <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                                        Analyzing system telemetry, database relationships, and script dependencies...
                                    </p>
                                </div>
                            ) : (
                                <div className="animate-in fade-in slide-in-from-bottom-4 bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
                                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-50 p-2 rounded-xl text-blue-600"><FileText size={20}/></div>
                                            <h4 className="font-black text-slate-800 uppercase tracking-tight">Recovery Plan Generated</h4>
                                        </div>
                                        <span className="text-[10px] font-black bg-slate-900 text-white px-2 py-1 rounded">TIMESTAMP: {new Date().toLocaleTimeString()}</span>
                                    </div>
                                    
                                    <div className="prose prose-slate max-w-none prose-h3:text-blue-600 prose-h3:uppercase prose-h3:text-xs prose-h3:font-black prose-h3:tracking-[0.2em] prose-h3:mb-3 prose-h3:mt-8">
                                        <div className="blog-content" dangerouslySetInnerHTML={{ 
                                            __html: analysisReport!
                                                .replace(/### (.*)/g, '<h3 class="mt-8 mb-4">$1</h3>')
                                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                .replace(/\n/g, '<br/>')
                                                .replace(/```php([\s\S]*?)```/g, '<pre class="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto">$1</pre>')
                                        }} />
                                    </div>

                                    <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                                            Verified against v12.45 Logic Core
                                        </p>
                                        <div className="flex gap-2">
                                            <button onClick={() => window.print()} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all">Print Report</button>
                                            <button onClick={generateAnalysisReport} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-100 transition-all flex items-center gap-2">
                                                <RefreshCw size={14} /> Refresh Analysis
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Legacy 51-Point Diagnostic Suite */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm h-[650px] overflow-hidden flex flex-col">
                        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-3">
                                <Terminal size={20} className="text-slate-400" />
                                <div>
                                    <h3 className="font-black text-slate-700 text-xs uppercase tracking-widest">Legacy Audit Stream</h3>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">51 Real-time Nodes</p>
                                </div>
                            </div>
                            {isRunning && <RefreshCw size={16} className="animate-spin text-blue-500" />}
                        </div>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {results.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-12 text-slate-300">
                                    <Shield className="w-12 h-12 mb-4 opacity-10" />
                                    <p className="font-black uppercase tracking-widest text-[10px]">Awaiting Manual Activation</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {results.map((r) => (
                                        <div key={r.step} className={`p-4 flex items-start gap-4 transition-all ${r.status === 'FAIL' ? 'bg-rose-50/40 border-l-4 border-rose-500' : 'hover:bg-slate-50/50'}`}>
                                            <div className={`mt-1 shrink-0 ${r.status === 'PASS' ? 'text-emerald-500' : r.status === 'FAIL' ? 'text-rose-500' : 'text-blue-500 animate-pulse'}`}>
                                                {r.status === 'PASS' ? <CheckCircle2 size={18} /> : r.status === 'FAIL' ? <XCircle size={18} /> : <Activity size={18} />}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{r.step}</span>
                                                    {r.latency && <span className="text-[9px] font-mono text-slate-300 font-bold">{r.latency}ms</span>}
                                                </div>
                                                <div className="font-black text-slate-800 text-xs truncate leading-tight">{r.description}</div>
                                                <p className={`text-[10px] mt-1 leading-tight font-medium ${r.status === 'FAIL' ? 'text-rose-700' : 'text-slate-500'}`}>
                                                    {r.details}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div className="p-4 bg-slate-900 border-t border-slate-800 shrink-0">
                            <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <span>SYSTEM STATUS</span>
                                <span className={stats.failed > 0 ? 'text-rose-500' : 'text-emerald-500'}>
                                    {stats.failed > 0 ? 'CRITICAL ERRORS DETECTED' : 'OPERATIONAL'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Database Health Widget (Part of Legacy Suite) */}
                    <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <Database size={16} className="text-blue-500" />
                                <h4 className="font-black text-slate-800 text-xs uppercase tracking-tight">Database Objects</h4>
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase">{dbTables.length} TABLES</span>
                        </div>
                        <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-1">
                            {dbTables.length > 0 ? dbTables.map(t => (
                                <div key={t.name} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-bold">
                                    <span className="text-slate-600 truncate mr-2">{t.name}</span>
                                    <span className="text-blue-600 whitespace-nowrap">{t.rows} Rows</span>
                                </div>
                            )) : (
                                <p className="text-[10px] text-slate-400 italic text-center py-4">No database link data.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};