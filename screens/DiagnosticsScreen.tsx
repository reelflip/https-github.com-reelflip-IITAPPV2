import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Brain, ShieldCheck, RefreshCw, Activity, Terminal, Download, Play, FileJson, AlertTriangle, CheckCircle2, XCircle, Shield, Database, Server, Sparkles, Code, FileText, ChevronRight, Lightbulb, AlertCircle, Wrench, Layers, ChevronUp, ChevronDown, Send, MessageSquare, Bot, User as UserIcon, HelpCircle, FileCode, Check, Search } from 'lucide-react';
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
            content: "Expert System Debugger initialized. I have full knowledge of the api/ endpoints, SQL schema, and React frontend structure. \n\nHow can I help you today? You can paste an error log, ask about a specific PHP file, or request a database integrity check.",
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

    const runAIDiagnosis = async () => {
        const failedTests = results.filter(r => r.status === 'FAIL');
        if (failedTests.length === 0) {
            alert("No failures detected in the legacy suite to analyze!");
            return;
        }
        setIsAnalyzing(true);
        const runner = initRunner();
        const fixes = await runner.getAIDiagnosis(failedTests);
        setAiFixes(fixes);
        setIsAnalyzing(false);
    };

    const handleChatSubmit = async (e?: React.FormEvent) => {
        if(e) e.preventDefault();
        if (!chatInput.trim() || isChatLoading) return;

        const userMsg = chatInput.trim();
        setChatInput('');
        setChatMessages(prev => [...prev, { role: 'user', content: userMsg, timestamp: new Date() }]);
        setIsChatLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const model = 'gemini-3-flash-preview';
            
            // Collect context for the AI
            const failures = results.filter(r => r.status === 'FAIL').map(r => `${r.step}: ${r.description} (${r.details})`).join('\n');
            const dbSchema = dbTables.map(t => `${t.name} (${t.rows} rows, ${t.columns?.length} cols)`).join(', ');

            const systemPrompt = `You are the Lead Systems Architect for the IIT JEE Prep platform. 
            CONTEXT:
            - Backend: LAMP Stack (PHP 8.1+, MySQL). Endpoints located in /api/ folder.
            - Frontend: React 19 (TypeScript/Vite).
            - Database: 26 tables in total. Key tables: users, test_attempts, user_progress.
            - Critical Files: migrate_db.php (Schema manager), config.php (DB credentials), cors.php (Access policy).
            
            DIAGNOSTIC STATE:
            - Detected Failures: ${failures || 'None currently detected'}
            - DB Schema Status: ${dbSchema || 'Unknown - run audit'}
            
            USER ROLE: Platform Administrator (non-developer).
            GOAL: Help the admin self-heal deployment issues without developer support.
            
            INSTRUCTIONS:
            1. If asked about a file (e.g., sync_progress.php), explain its function and likely points of failure (CORS, missing columns).
            2. If an error log is pasted, identify the exact PHP file and line number if possible.
            3. For database mismatches, always suggest running migrate_db.php or provide the specific SQL ALTER TABLE query.
            4. Detect missing files (404) or permission issues (403) and suggest server-level fixes.
            5. Provide exact, copy-pasteable code blocks for PHP or JS modifications.
            6. Correlate current diagnostic failures with potential root causes.
            
            Format responses with bold headers and clear steps.`;

            const response = await ai.models.generateContent({
                model: model,
                contents: userMsg,
                config: {
                    systemInstruction: systemPrompt,
                    temperature: 0.1 // Precision focus
                }
            });

            setChatMessages(prev => [...prev, { 
                role: 'assistant', 
                content: response.text || "I was unable to process that query. Please ensure your API key is correctly configured and the server is responsive.", 
                timestamp: new Date() 
            }]);
        } catch (error: any) {
            let errorMsg = "Error connecting to AI Debugging Core. Check your internet or API key.";
            if (error?.message?.includes("API key")) errorMsg = "The AI Diagnostic API Key is missing or invalid. Deployment intelligence is limited to deterministic tests.";
            setChatMessages(prev => [...prev, { role: 'assistant', content: errorMsg, timestamp: new Date() }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    const downloadReport = () => {
        const runner = initRunner();
        runner.downloadJSONReport();
    };

    const stats = useMemo(() => ({
        total: results.length,
        passed: results.filter(r => r.status === 'PASS').length,
        failed: results.filter(r => r.status === 'FAIL').length,
        running: results.filter(r => r.status === 'RUNNING').length
    }), [results]);

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-24 animate-in fade-in">
            {/* Header */}
            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl border border-slate-800 relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <Wrench className="w-8 h-8 text-blue-400" />
                            <h2 className="text-3xl font-black tracking-tight uppercase">Admin Logic Center</h2>
                        </div>
                        <p className="text-slate-400 text-sm max-w-xl font-medium">
                            Dual-Core Diagnostics: Deterministic 51-Point Audit + Self-Healing AI Expert.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3 shrink-0">
                        {results.length > 0 && (
                            <button onClick={downloadReport} className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all border border-slate-700 active:scale-95">
                                <Download size={18} /> Export Log
                            </button>
                        )}
                        <button onClick={runFullAudit} disabled={isRunning} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-blue-900/40 disabled:opacity-50 active:scale-95">
                            {isRunning ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} />}
                            {isRunning ? 'Auditing 51 Nodes...' : 'Launch Full System Audit'}
                        </button>
                    </div>
                </div>
                {results.length > 0 && (
                    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-top-4">
                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest block mb-1">Audit Coverage</span>
                            <span className="text-2xl font-bold text-white">{Math.round((results.length / 51) * 100)}% Verified</span>
                        </div>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl">
                            <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest block mb-1">Functional</span>
                            <span className="text-2xl font-bold text-emerald-400">{stats.passed} Passed</span>
                        </div>
                        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl">
                            <span className="text-red-400 text-[10px] font-black uppercase tracking-widest block mb-1">Critical Faults</span>
                            <span className="text-2xl font-bold text-red-400">{stats.failed} Errors</span>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl">
                            <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest block mb-1">Avg Latency</span>
                            <span className="text-2xl font-bold text-blue-400">{results.length > 0 ? Math.round(results.reduce((acc, r) => acc + (r.latency || 0), 0) / results.length) : 0}ms</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left: AI Debug Console (New Feature) */}
                <div className="lg:col-span-8 flex flex-col h-[700px] bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden relative group">
                    <div className="bg-slate-900 px-6 py-4 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/30">
                                <MessageSquare size={20} className="text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-white font-black text-sm uppercase tracking-tight">AI Expert Debug Console</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Post-Deployment Self-Healing Interface</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] font-black text-slate-500 uppercase">Model: Gemini 3 Flash</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 custom-scrollbar">
                        {chatMessages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                                <div className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`mt-1 shrink-0 w-9 h-9 rounded-2xl flex items-center justify-center border shadow-sm ${msg.role === 'user' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-blue-600'}`}>
                                        {msg.role === 'user' ? <UserIcon size={16} /> : <Bot size={20} />}
                                    </div>
                                    <div className={`p-4 rounded-3xl text-sm leading-relaxed shadow-sm border ${
                                        msg.role === 'user' 
                                        ? 'bg-slate-900 text-white border-slate-800 rounded-tr-none' 
                                        : 'bg-white text-slate-700 border-slate-100 rounded-tl-none'
                                    }`}>
                                        <div className="prose prose-sm prose-slate max-w-none">
                                            <div className="whitespace-pre-wrap font-medium">{msg.content}</div>
                                        </div>
                                        <div className={`text-[9px] mt-2 font-black uppercase tracking-widest ${msg.role === 'user' ? 'text-slate-500' : 'text-slate-300'}`}>
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isChatLoading && (
                            <div className="flex justify-start animate-in fade-in">
                                <div className="flex gap-3">
                                    <div className="w-9 h-9 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-sm">
                                        <RefreshCw size={18} className="animate-spin" />
                                    </div>
                                    <div className="bg-white border border-slate-100 p-4 rounded-3xl rounded-tl-none shadow-sm flex items-center gap-3">
                                        <div className="flex gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.3s]"></div>
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.15s]"></div>
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce"></div>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analyzing platform logic...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                        <form onSubmit={handleChatSubmit} className="relative group">
                            <textarea 
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChatSubmit(); } }}
                                placeholder="E.g. Why did sync_progress.php return 500? Or ask about DB mismatches..."
                                className="w-full bg-slate-100 border-none rounded-[1.5rem] pl-5 pr-14 py-4 text-sm focus:ring-2 focus:ring-blue-100 outline-none placeholder:text-slate-400 font-medium resize-none max-h-32 min-h-[56px] transition-all"
                            />
                            <button 
                                type="submit" 
                                disabled={!chatInput.trim() || isChatLoading}
                                className="absolute right-2 top-2 p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-30 active:scale-95"
                            >
                                <Send size={20} />
                            </button>
                        </form>
                        <div className="mt-3 flex flex-wrap gap-2 px-1">
                            <button onClick={() => { setChatInput("Cross-check my database schema vs current failures."); handleChatSubmit(); }} className="text-[10px] font-black uppercase text-slate-500 hover:text-blue-600 bg-slate-100 px-3 py-1 rounded-full transition-colors border border-slate-200">DB Schema Check</button>
                            <button onClick={() => { setChatInput("List all 38 PHP endpoints and their expected status codes."); handleChatSubmit(); }} className="text-[10px] font-black uppercase text-slate-500 hover:text-blue-600 bg-slate-100 px-3 py-1 rounded-full transition-colors border border-slate-200">Endpoint Map</button>
                            <button onClick={() => { setChatInput("Analyze the last failing diagnostic test for root causes."); handleChatSubmit(); }} className="text-[10px] font-black uppercase text-slate-500 hover:text-blue-600 bg-slate-100 px-3 py-1 rounded-full transition-colors border border-slate-200">Failure Correlation</button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Deterministic Stats & Audit Stream */}
                <div className="lg:col-span-4 space-y-6">
                    
                    {/* DB Summary Card */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2 text-xs uppercase tracking-widest">
                            <Database className="w-4 h-4 text-blue-600" /> Database Registry
                        </h3>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                            {dbTables.length === 0 ? (
                                <div className="text-center py-8">
                                    <Database size={32} className="mx-auto text-slate-200 mb-2" />
                                    <p className="text-xs text-slate-400 italic">Audit required to map tables.</p>
                                </div>
                            ) : dbTables.map(table => (
                                <div key={table.name} className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50">
                                    <button 
                                        onClick={() => setExpandedTable(expandedTable === table.name ? null : table.name)}
                                        className="w-full p-4 flex items-center justify-between hover:bg-slate-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                                <Layers size={14} className="text-blue-400" />
                                            </div>
                                            <span className="text-xs font-bold text-slate-700 truncate">{table.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-[9px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{table.rows} Row</span>
                                            {expandedTable === table.name ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                                        </div>
                                    </button>
                                    {expandedTable === table.name && (
                                        <div className="p-4 bg-white border-t border-slate-100 animate-in slide-in-from-top-1">
                                            {table.columns.map((col: any) => (
                                                <div key={col.name} className="flex justify-between text-[10px] py-1.5 border-b border-slate-50 last:border-0">
                                                    <span className="font-bold text-slate-500">{col.name}</span>
                                                    <span className="text-slate-400 font-mono tracking-tighter">{col.type}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Audit Stream Panel */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[400px]">
                        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
                            <h3 className="font-black text-slate-700 flex items-center gap-2 text-[10px] uppercase tracking-widest">
                                <Terminal className="w-4 h-4 text-slate-400" /> Core Audit Feed
                            </h3>
                            {isRunning && <SyncStatusBadge status="SYNCING" />}
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {results.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-12 text-slate-300">
                                    <Shield className="w-12 h-12 mb-3 opacity-10" />
                                    <p className="font-black uppercase tracking-widest text-[10px]">Deterministic Scan Ready</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {results.map((r) => (
                                        <div key={r.step} className={`p-4 flex items-start gap-3 transition-all ${r.status === 'FAIL' ? 'bg-rose-50/30' : 'hover:bg-slate-50/50'}`}>
                                            <div className={`mt-0.5 shrink-0 ${
                                                r.status === 'PASS' ? 'text-emerald-500' : 
                                                r.status === 'FAIL' ? 'text-rose-500' : 
                                                'text-blue-500 animate-pulse'
                                            }`}>
                                                {r.status === 'PASS' ? <CheckCircle2 size={16} /> : 
                                                 r.status === 'FAIL' ? <XCircle size={16} /> : <Activity size={16} />}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{r.step}</span>
                                                    {r.status === 'FAIL' && <span className="bg-rose-600 text-white text-[7px] font-black px-1.5 rounded uppercase">Critical</span>}
                                                </div>
                                                <div className="font-bold text-slate-800 text-[11px] truncate">{r.description}</div>
                                                <p className={`text-[10px] mt-0.5 leading-tight ${r.status === 'FAIL' ? 'text-rose-700 font-bold' : 'text-slate-500'}`}>{r.details}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Self-Help Quick Tips */}
                    <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 shadow-sm">
                        <h3 className="font-black text-blue-900 mb-3 flex items-center gap-2 text-xs uppercase tracking-widest">
                            <ShieldAlert size={16} /> Survival Guide
                        </h3>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600 h-fit"><FileCode size={12}/></div>
                                <div>
                                    <p className="text-[10px] font-black text-blue-800 uppercase tracking-tight">CORS Issues</p>
                                    <p className="text-[10px] text-blue-700 leading-tight">Verify that cors.php exists and headers are being sent before session init.</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600 h-fit"><Database size={12}/></div>
                                <div>
                                    <p className="text-[10px] font-black text-blue-800 uppercase tracking-tight">DB Access Denied</p>
                                    <p className="text-[10px] text-blue-700 leading-tight">Usually incorrect host or password in config.php. Re-download bundle.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SyncStatusBadge = ({status}: any) => {
    return (
        <div className={`px-2 py-1 rounded-full text-[9px] font-black uppercase flex items-center gap-1.5 ${status === 'SYNCING' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>
            <RefreshCw size={10} className="animate-spin" /> Audit Active
        </div>
    );
};

const ShieldAlert = ({size}: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
);

const FileCode = ({size}: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/></svg>
);
