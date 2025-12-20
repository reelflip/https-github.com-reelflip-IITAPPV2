import React, { useState, useRef, useMemo, useEffect } from 'react';
import { ShieldCheck, RefreshCw, Activity, Terminal, Play, CheckCircle2, XCircle, Shield, Database, Wrench, Layers, ChevronUp, ChevronDown, Send, MessageSquare, Bot, User as UserIcon, AlertTriangle, Zap, Info } from 'lucide-react';
import { E2ETestRunner, TestResult, LocalKnowledgeBase } from '../services/testRunnerService';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export const DiagnosticsScreen: React.FC = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState<TestResult[]>([]);
    const [dbTables, setDbTables] = useState<any[]>([]);
    const [expandedTable, setExpandedTable] = useState<string | null>(null);
    const runnerRef = useRef<E2ETestRunner | null>(null);

    // --- Local Rule-Based Chat State ---
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        { 
            role: 'assistant', 
            content: "Welcome to the Keyless Diagnostic Assistant. I use built-in logic to analyze crashes, syntax errors, and database mismatches locally.\n\nHow can I help you troubleshoot your deployment today?",
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

        // Simulated processing time for "Expert Analysis" feel
        setTimeout(() => {
            const responseText = LocalKnowledgeBase.query(userMsg, results.filter(r => r.status === 'FAIL'));
            setChatMessages(prev => [...prev, { 
                role: 'assistant', 
                content: responseText, 
                timestamp: new Date() 
            }]);
            setIsChatLoading(false);
        }, 600);
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
                            <h2 className="text-3xl font-black tracking-tight uppercase">Identity Recovery Core</h2>
                        </div>
                        <p className="text-slate-400 text-sm max-w-xl font-medium">
                            Deterministic v12.45 Core: Rule-based troubleshooting that works 100% offline with zero API key dependency.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3 shrink-0">
                        <button onClick={runFullAudit} disabled={isRunning} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-blue-900/40 disabled:opacity-50 active:scale-95">
                            {isRunning ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} />}
                            {isRunning ? 'Auditing 51 Nodes...' : 'Run Deterministic Scan'}
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
                            <span className="text-rose-400 text-[10px] font-black uppercase tracking-widest block mb-1">Errors</span>
                            <span className="text-2xl font-bold text-rose-400">{stats.failed}</span>
                        </div>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-center">
                            <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest block mb-1">Sync status</span>
                            <span className="text-2xl font-bold text-emerald-400">Offline-Core</span>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl text-center">
                            <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest block mb-1">Coverage</span>
                            <span className="text-2xl font-bold text-blue-400">51 Points</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Deterministic Fix Advisor */}
            {criticalFixes.length > 0 && !isRunning && (
                <div className="bg-amber-50 border border-amber-200 rounded-[2.5rem] p-8 shadow-sm animate-in zoom-in-95">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-amber-900 uppercase tracking-tight">Built-in Recovery Engine</h3>
                            <p className="text-amber-700 text-sm font-bold">Rule-based repairs identified by the heuristic core.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {criticalFixes.map((fix, idx) => (
                            <div key={idx} className="bg-white border border-amber-100 p-5 rounded-2xl shadow-sm group hover:border-amber-400 transition-all">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded uppercase">{fix.step}</span>
                                    <span className="font-bold text-slate-800 text-sm">{fix.description}</span>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    {fix.metadata?.deterministicAdvice}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Rule-Based Chat Assistant */}
                <div className="lg:col-span-7 flex flex-col h-[600px] bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden relative">
                    <div className="bg-slate-900 px-6 py-4 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/30">
                                <Bot size={20} className="text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-white font-black text-sm uppercase tracking-tight">Local Expert System</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">100% Dependency-Free Logic Assistant</p>
                            </div>
                        </div>
                        <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-[9px] font-black uppercase tracking-tighter">Keyless Mode</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 custom-scrollbar">
                        {chatMessages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                                <div className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`mt-1 shrink-0 w-9 h-9 rounded-2xl flex items-center justify-center border shadow-sm ${msg.role === 'user' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-blue-600'}`}>
                                        {msg.role === 'user' ? <UserIcon size={16} /> : <Zap size={20} />}
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
                                    <Activity size={18} />
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
                                placeholder="Ask about login, 500 errors, or DB config..."
                                className="w-full bg-slate-100 border-none rounded-[1.5rem] pl-5 pr-14 py-4 text-sm focus:ring-2 focus:ring-blue-100 outline-none placeholder:text-slate-400 font-medium transition-all"
                            />
                            <button type="submit" disabled={!chatInput.trim() || isChatLoading} className="absolute right-2 top-2 p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-30 active:scale-95">
                                <Send size={20} />
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right: Core Audit Feed */}
                <div className="lg:col-span-5 flex flex-col bg-white rounded-[2.5rem] border border-slate-200 shadow-sm h-[600px] overflow-hidden">
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
            </div>
        </div>
    );
};