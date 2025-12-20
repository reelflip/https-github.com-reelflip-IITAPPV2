import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Brain, ShieldCheck, RefreshCw, Activity, Terminal, Download, Play, FileJson, AlertTriangle, CheckCircle2, XCircle, Shield, Database, Server, Sparkles, Code, FileText, ChevronRight, Lightbulb, AlertCircle, Wrench, Layers, ChevronUp, ChevronDown, Send, MessageSquare, Bot, User as UserIcon, HelpCircle, FileCode, Check, Search, Zap } from 'lucide-react';
import { E2ETestRunner, TestResult, AIFixRecommendation } from '../services/testRunnerService';
import { GoogleGenAI } from "@google/genai";

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export const DiagnosticsScreen: React.FC = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState<TestResult[]>([]);
    const [aiFixes, setAiFixes] = useState<AIFixRecommendation[]>([]);
    const [dbTables, setDbTables] = useState<any[]>([]);
    const [expandedTable, setExpandedTable] = useState<string | null>(null);
    const runnerRef = useRef<E2ETestRunner | null>(null);

    // --- AI Debug Chat State ---
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        { 
            role: 'assistant', 
            content: "Expert System Debugger initialized. I can analyze PHP crashes and SQL mismatches.\n\nNOTE: For 500/404/403 errors, I provide **Deterministic Fixes** automatically in the Audit Feed below, which do not require an API key.",
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
        setAiFixes([]);
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

        // API Key Check (Internal Rule-based responses for simple queries if key missing)
        if (!process.env.API_KEY || process.env.API_KEY === "undefined") {
            setTimeout(() => {
                setChatMessages(prev => [...prev, { 
                    role: 'assistant', 
                    content: "The AI Diagnostic Engine (Gemini) is currently offline because no API Key is detected. \n\nHowever, you can still use the **Audit Feed** below. Our built-in Heuristic Engine identifies 500/404/403 errors and provides recovery instructions locally without needing any external API.", 
                    timestamp: new Date() 
                }]);
                setIsChatLoading(false);
            }, 800);
            return;
        }

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const model = 'gemini-3-flash-preview';
            
            const failures = results.filter(r => r.status === 'FAIL').map(r => `${r.step}: ${r.description} (${r.details})`).join('\n');
            const dbSchema = dbTables.map(t => `${t.name} (${t.rows} rows)`).join(', ');

            const systemPrompt = `You are the Lead Systems Architect for the IIT JEE Prep platform. 
            CONTEXT: PHP 8.1 LAMP Stack. Endpoints in /api/. React 19 Frontend. 26 SQL Tables.
            DIAGNOSTIC STATE: ${failures || 'All systems green.'}
            SCHEMA: ${dbSchema}
            INSTRUCTIONS: Provide exact line-by-line PHP/SQL fixes for deployment crashes. Be concise and actionable for non-developers.`;

            const response = await ai.models.generateContent({
                model: model,
                contents: userMsg,
                config: { systemInstruction: systemPrompt, temperature: 0.1 }
            });

            setChatMessages(prev => [...prev, { 
                role: 'assistant', 
                content: response.text || "I processed your query but could not generate a recommendation. Refer to the deterministic feed below.", 
                timestamp: new Date() 
            }]);
        } catch (error: any) {
            setChatMessages(prev => [...prev, { role: 'assistant', content: "AI Connection Error. Please verify your API Key or check the local Heuristic Engine logs below.", timestamp: new Date() }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    const stats = useMemo(() => ({
        total: results.length,
        passed: results.filter(r => r.status === 'PASS').length,
        failed: results.filter(r => r.status === 'FAIL').length,
        running: results.filter(r => r.status === 'RUNNING').length
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
                            <h2 className="text-3xl font-black tracking-tight uppercase">Diagnostic Center</h2>
                        </div>
                        <p className="text-slate-400 text-sm max-w-xl font-medium">
                            Deterministic Recovery Core (v12.45): Rule-based troubleshooting that works even without an AI key.
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
                            <span className="text-rose-400 text-[10px] font-black uppercase tracking-widest block mb-1">Failures</span>
                            <span className="text-2xl font-bold text-rose-400">{stats.failed}</span>
                        </div>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-center">
                            <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest block mb-1">Status</span>
                            <span className="text-2xl font-bold text-emerald-400">{stats.failed === 0 ? 'Ready' : 'Repair Req.'}</span>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl text-center">
                            <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest block mb-1">Coverage</span>
                            <span className="text-2xl font-bold text-blue-400">51 Points</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Offline-First Deterministic Fix Advisor */}
            {criticalFixes.length > 0 && !isRunning && (
                <div className="bg-amber-50 border border-amber-200 rounded-[2.5rem] p-8 shadow-sm animate-in zoom-in-95">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-amber-900 uppercase tracking-tight">Local Recovery Advisor</h3>
                            <p className="text-amber-700 text-sm font-bold">Actionable repairs detected by local system heuristics (Independent of AI Key).</p>
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
                {/* Left: AI Debug Console */}
                <div className="lg:col-span-7 flex flex-col h-[600px] bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden relative">
                    <div className="bg-slate-900 px-6 py-4 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/30">
                                <Bot size={20} className="text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-white font-black text-sm uppercase tracking-tight">AI Expert layer</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Optional Reasoning Module</p>
                            </div>
                        </div>
                        {!process.env.API_KEY || process.env.API_KEY === "undefined" ? (
                            <span className="bg-rose-500/20 text-rose-400 px-2 py-1 rounded text-[9px] font-black uppercase tracking-tighter">AI Core Offline</span>
                        ) : (
                            <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-[9px] font-black uppercase tracking-tighter">AI Online</span>
                        )}
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
                                placeholder="Consult the expert about a crash..."
                                className="w-full bg-slate-100 border-none rounded-[1.5rem] pl-5 pr-14 py-4 text-sm focus:ring-2 focus:ring-blue-100 outline-none placeholder:text-slate-400 font-medium transition-all"
                            />
                            <button type="submit" disabled={!chatInput.trim() || isChatLoading} className="absolute right-2 top-2 p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-30 active:scale-95">
                                <Send size={20} />
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right: Core Audit Feed (Deterministic) */}
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
                                <p className="font-black uppercase tracking-widest text-[10px]">Awaiting Deployment Scan</p>
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