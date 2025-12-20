import React, { useState, useRef, useMemo, useEffect } from 'react';
import { ShieldCheck, RefreshCw, Activity, Terminal, Play, CheckCircle2, XCircle, Shield, Database, Wrench, Layers, ChevronUp, ChevronDown, Send, MessageSquare, Bot, User as UserIcon, AlertTriangle, Zap, Info, FileCode, Search, Sparkles, Code, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { E2ETestRunner, TestResult, LocalKnowledgeBase, API_FILES } from '../services/testRunnerService';
import { GoogleGenAI } from "@google/genai";

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export const DiagnosticsScreen: React.FC = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState<TestResult[]>([]);
    const [dbTables, setDbTables] = useState<any[]>([]);
    const [selectedFile, setSelectedFile] = useState<string>('');
    const [fileSource, setFileSource] = useState<string | null>(null);
    const [isLoadingFile, setIsLoadingFile] = useState(false);
    const runnerRef = useRef<E2ETestRunner | null>(null);

    // --- AI Assistant State ---
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        { 
            role: 'assistant', 
            content: "Identity Diagnostic Core v12.45 initialized. I am your advanced AI Systems Architect.\n\nI can analyze server-side PHP code, interpret database health, and debug complex deployment crashes. Select a file below to begin a deep analysis session.",
            timestamp: new Date()
        }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

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
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

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
            setChatMessages(prev => [...prev, {
                role: 'assistant',
                content: `Loaded source code for **${filename}**. I have analyzed its structure. You can now ask questions about its logic, security, or potential bugs.`,
                timestamp: new Date()
            }]);
        } else {
            setFileSource(null);
            setChatMessages(prev => [...prev, {
                role: 'assistant',
                content: `Error: Unable to fetch source for **${filename}**. Ensure the file exists in your /api folder.`,
                timestamp: new Date()
            }]);
        }
        setIsLoadingFile(false);
    };

    const runFullAudit = async () => {
        setResults([]);
        setIsRunning(true);
        const runner = initRunner();
        await runner.runFullAudit();
        setIsRunning(false);
        fetchDbStatus();
    };

    const handleChatSubmit = async (e?: React.FormEvent) => {
        if(e) e.preventDefault();
        if (!chatInput.trim() || isChatLoading) return;

        const userMsg = chatInput.trim();
        setChatInput('');
        setChatMessages(prev => [...prev, { role: 'user', content: userMsg, timestamp: new Date() }]);
        setIsChatLoading(true);

        const apiKey = process.env.API_KEY;
        if (!apiKey || apiKey === "undefined") {
            setTimeout(() => {
                const responseText = LocalKnowledgeBase.query(userMsg, results.filter(r => r.status === 'FAIL'));
                setChatMessages(prev => [...prev, { 
                    role: 'assistant', 
                    content: "Gemini API key is not configured. Falling back to Local Heuristic logic:\n\n" + responseText, 
                    timestamp: new Date() 
                }]);
                setIsChatLoading(false);
            }, 600);
            return;
        }

        try {
            const ai = new GoogleGenAI({ apiKey });
            const failures = results.filter(r => r.status === 'FAIL').map(r => `${r.step}: ${r.description} (${r.details})`).join('\n');
            const schema = dbTables.map(t => `${t.name} (${t.rows} rows, ${t.columns?.length || 0} cols)`).join(', ');

            const systemInstruction = `You are a Lead Systems Architect for a LAMP stack IIT JEE platform. 
            DATABASE SCHEMA: ${schema || 'No tables detected yet.'}
            CURRENT FAILURES: ${failures || 'All green.'}
            ${fileSource ? `SELECTED FILE CODE:\n\n${fileSource}` : 'No file currently loaded for source analysis.'}
            
            GOAL: Analyze issues, provide root-cause explanations, and step-by-step fix suggestions. Be precise with code snippets.`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: userMsg,
                config: { systemInstruction }
            });

            setChatMessages(prev => [...prev, { 
                role: 'assistant', 
                content: response.text || "Analysis complete but no text was returned.", 
                timestamp: new Date() 
            }]);
        } catch (error: any) {
            setChatMessages(prev => [...prev, { 
                role: 'assistant', 
                content: `AI Expert session encountered an error: ${error.message || 'Unknown network failure'}.`, 
                timestamp: new Date() 
            }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    const stats = useMemo(() => ({
        total: results.length,
        passed: results.filter(r => r.status === 'PASS').length,
        failed: results.filter(r => r.status === 'FAIL').length,
    }), [results]);

    const criticalFixes = useMemo(() => results.filter(r => r.status === 'FAIL' && r.metadata?.deterministicAdvice), [results]);

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-24 animate-in fade-in">
            {/* Header */}
            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl border border-slate-800 relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <ShieldCheck className="w-8 h-8 text-blue-400" />
                            <h2 className="text-3xl font-black tracking-tight uppercase">Identity Diagnostic Core</h2>
                        </div>
                        <p className="text-slate-400 text-sm max-w-xl font-medium">
                            Recovery Core v12.45: Combining deterministic scanning with Gemini-Pro source analysis for absolute system stability.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3 shrink-0">
                        <button onClick={runFullAudit} disabled={isRunning} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-blue-900/40 disabled:opacity-50 active:scale-95">
                            {isRunning ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} />}
                            {isRunning ? 'Auditing 51 Nodes...' : 'Launch 51-Point Scan'}
                        </button>
                    </div>
                </div>
                {results.length > 0 && (
                    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-top-4">
                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center">
                            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest block mb-1">Health Score</span>
                            <span className="text-2xl font-bold text-white">{Math.round((stats.passed / (stats.total || 1)) * 100)}%</span>
                        </div>
                        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl text-center">
                            <span className="text-rose-400 text-[10px] font-black uppercase tracking-widest block mb-1">Errors Detected</span>
                            <span className="text-2xl font-bold text-rose-400">{stats.failed}</span>
                        </div>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-center">
                            <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest block mb-1">AI Linkage</span>
                            <span className="text-2xl font-bold text-emerald-400">{process.env.API_KEY ? 'Active' : 'Offline'}</span>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl text-center">
                            <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest block mb-1">Depth</span>
                            <span className="text-2xl font-bold text-blue-400">51 Nodes</span>
                        </div>
                    </div>
                )}
            </div>

            {/* AI Analysis Tool Bar */}
            <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
                <div className="flex items-center gap-4 shrink-0">
                    <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                        <FileCode size={24} />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-800 text-sm uppercase tracking-tight">Source Code Analysis</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase">Fetch local files for AI expert review</p>
                    </div>
                </div>
                <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="relative">
                        <select 
                            value={selectedFile}
                            onChange={(e) => {
                                setSelectedFile(e.target.value);
                                handleLoadFile(e.target.value);
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 appearance-none transition-all"
                        >
                            <option value="">Select File to Analyze...</option>
                            {API_FILES.map(file => (
                                <option key={file} value={file}>{file}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={16} />
                    </div>
                    <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                        {isLoadingFile ? (
                            <div className="flex items-center gap-2 text-indigo-600 animate-pulse">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-xs font-black uppercase">Reading Source...</span>
                            </div>
                        ) : fileSource ? (
                            <div className="flex items-center gap-2 text-emerald-600">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-xs font-black uppercase">Source Context Loaded</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-slate-400">
                                <Info className="w-4 h-4" />
                                <span className="text-xs font-black uppercase">No Context Selected</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Interactive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: AI Debug Console (Pro Active) */}
                <div className="lg:col-span-7 flex flex-col h-[650px] bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden relative">
                    <div className="bg-slate-900 px-6 py-4 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/30">
                                <Bot size={20} className="text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-white font-black text-sm uppercase tracking-tight">AI Expert Assistant</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Advanced Logical Reasoner (Gemini 3 Pro)</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {fileSource && <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-[9px] font-black uppercase">Code-Aware</span>}
                            <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-[9px] font-black uppercase">v12.45</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 custom-scrollbar">
                        {chatMessages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                                <div className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`mt-1 shrink-0 w-9 h-9 rounded-2xl flex items-center justify-center border shadow-sm ${msg.role === 'user' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-blue-600'}`}>
                                        {msg.role === 'user' ? <UserIcon size={16} /> : <Sparkles size={18} />}
                                    </div>
                                    <div className={`p-4 rounded-3xl text-sm leading-relaxed shadow-sm border ${
                                        msg.role === 'user' 
                                        ? 'bg-slate-900 text-white border-slate-800 rounded-tr-none' 
                                        : 'bg-white text-slate-700 border-slate-100 rounded-tl-none'
                                    }`}>
                                        <div className="prose prose-sm prose-slate max-w-none">
                                            <div className="whitespace-pre-wrap font-medium">{msg.content}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isChatLoading && (
                            <div className="flex justify-start">
                                <div className="w-9 h-9 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-sm animate-pulse">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                </div>
                                <div className="ml-3 bg-white p-3 rounded-2xl border border-slate-100 italic text-xs text-slate-400">
                                    Cross-referencing file source with server logs...
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <form onSubmit={handleChatSubmit} className="p-4 bg-white border-t border-slate-100">
                        <div className="relative">
                            <input 
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder={fileSource ? `Ask about ${selectedFile}...` : "Consult the expert about a system issue..."}
                                className="w-full bg-slate-100 border-none rounded-[1.5rem] pl-5 pr-14 py-4 text-sm focus:ring-2 focus:ring-blue-100 outline-none placeholder:text-slate-400 font-medium transition-all"
                            />
                            <button type="submit" disabled={!chatInput.trim() || isChatLoading} className="absolute right-2 top-2 p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-30 active:scale-95">
                                <Send size={20} />
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right Column: Deterministic Audit Feed & Deterministic Fixes */}
                <div className="lg:col-span-5 flex flex-col gap-6 h-[650px]">
                    <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-3">
                                <Terminal size={18} className="text-slate-400" />
                                <h3 className="font-black text-slate-700 text-xs uppercase tracking-widest">Audit Stream</h3>
                            </div>
                            {isRunning && <RefreshCw size={14} className="animate-spin text-blue-500" />}
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {results.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-12 text-slate-300">
                                    <Shield className="w-12 h-12 mb-3 opacity-10" />
                                    <p className="font-black uppercase tracking-widest text-[10px]">Awaiting Manual Scan</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {results.map((r) => (
                                        <div key={r.step} className={`p-4 flex items-start gap-4 transition-all ${r.status === 'FAIL' ? 'bg-rose-50/40' : 'hover:bg-slate-50/50'}`}>
                                            <div className={`mt-1 shrink-0 ${r.status === 'PASS' ? 'text-emerald-500' : r.status === 'FAIL' ? 'text-rose-500' : 'text-blue-500 animate-pulse'}`}>
                                                {r.status === 'PASS' ? <CheckCircle2 size={16} /> : r.status === 'FAIL' ? <XCircle size={16} /> : <Activity size={16} />}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{r.step}</span>
                                                    {r.latency && <span className="text-[8px] font-mono text-slate-300">{r.latency}ms</span>}
                                                </div>
                                                <div className="font-bold text-slate-800 text-xs truncate">{r.description}</div>
                                                <p className={`text-[10px] mt-1 leading-tight font-medium ${r.status === 'FAIL' ? 'text-rose-700' : 'text-slate-500'}`}>
                                                    {r.details}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Fix Shortcut */}
                    {criticalFixes.length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <AlertTriangle size={18} className="text-amber-600" />
                                <h4 className="font-black text-amber-900 text-xs uppercase tracking-tight">Active Recovery Alerts</h4>
                            </div>
                            <div className="space-y-2">
                                {criticalFixes.slice(0, 2).map((fix, idx) => (
                                    <div key={idx} className="bg-white p-3 rounded-xl border border-amber-100 text-[10px] font-bold text-slate-600 leading-tight">
                                        {fix.description}: {fix.metadata?.deterministicAdvice}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};