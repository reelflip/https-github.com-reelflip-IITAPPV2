
import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, RefreshCw, Activity, Play, CheckCircle2, XCircle, Database, Layers, Bot, Sparkles, ClipboardList, Loader2, Fingerprint, MousePointer2, Server, Check, Lock, ShieldAlert, ShieldCheck as ShieldIcon, Users, User, FileText, Settings, Key, AlertTriangle, Zap } from 'lucide-react';
import { E2ETestRunner, TestResult, API_FILES } from '../services/testRunnerService';
import { GoogleGenAI } from "@google/genai";

type DiagCategory = 'INFRA' | 'AUTH' | 'STUDENT' | 'PARENT' | 'ADMIN' | 'SECURITY' | 'INTEGRITY';

export const DiagnosticsScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState<DiagCategory>('INFRA');
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState<TestResult[]>([]);
    const [dbTables, setDbTables] = useState<any[]>([]);
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
        setIsRunning(true);
        const runner = initRunner();
        await runner.runSuite(activeTab);
        setIsRunning(false);
        fetchDbStatus();
    };

    const categories: {id: DiagCategory, label: string, icon: any}[] = [
        { id: 'INFRA', label: 'Infrastructure', icon: Server },
        { id: 'AUTH', label: 'Auth & Identity', icon: Key },
        { id: 'STUDENT', label: 'Student Core', icon: User },
        { id: 'PARENT', label: 'Parent Role', icon: Users },
        { id: 'ADMIN', label: 'Admin Ops', icon: Settings },
        { id: 'INTEGRITY', label: 'Data Integrity', icon: Database },
        { id: 'SECURITY', label: 'Security', icon: ShieldAlert },
    ];

    const currentResults = results.filter(r => r.category === activeTab);
    const passCount = currentResults.filter(r => r.status === 'PASS').length;

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-24 animate-in fade-in">
            {/* Header */}
            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl border border-slate-800 relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <ShieldCheck className="w-8 h-8 text-blue-400" />
                            <h2 className="text-3xl font-black uppercase">Master Diagnostic Hub</h2>
                        </div>
                        <p className="text-slate-400 text-sm font-medium">121 Multi-Role Logic Gates • 0% Mocking • Live SQL Ops</p>
                    </div>
                    <button onClick={runFullAudit} disabled={isRunning} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg active:scale-95 disabled:opacity-50">
                        {isRunning ? <RefreshCw className="animate-spin" /> : <Play />}
                        {isRunning ? 'Auditing...' : 'Execute Suite'}
                    </button>
                </div>
            </div>

            {/* Category Nav */}
            <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                    <button 
                        key={cat.id}
                        onClick={() => setActiveTab(cat.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
                            activeTab === cat.id 
                            ? 'bg-blue-600 text-white border-blue-500 shadow-md' 
                            : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'
                        }`}
                    >
                        <cat.icon size={14} />
                        {cat.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Result Stream */}
                <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col min-h-[600px]">
                    <div className="px-8 py-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <div>
                            <h3 className="font-black text-xs uppercase tracking-[0.2em]">{activeTab} Verification Stream</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Live Database Round-Trip Enforcement</p>
                        </div>
                        <div className="flex gap-2">
                             <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{passCount} PASSED</span>
                             <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">v13.7 ENGINE</span>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-50">
                        {currentResults.length > 0 ? currentResults.map(r => (
                            <div key={r.step} className={`p-4 px-8 flex items-start gap-5 transition-all ${r.status === 'FAIL' ? 'bg-rose-50 border-l-4 border-rose-500' : 'hover:bg-slate-50'}`}>
                                {r.status === 'PASS' ? <CheckCircle2 size={20} className="text-emerald-500 mt-0.5" /> : r.status === 'RUNNING' ? <Loader2 size={20} className="text-blue-500 mt-0.5 animate-spin" /> : <XCircle size={20} className="text-rose-500 mt-0.5" />}
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{r.step}</span>
                                        <span className="text-[8px] font-mono text-slate-300">{r.latency ? `${r.latency}ms` : ''}</span>
                                    </div>
                                    <div className="font-bold text-slate-800 text-sm">{r.description}</div>
                                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed font-medium">{r.details}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300 p-20 text-center">
                                <Zap size={48} className="mb-4 opacity-10" />
                                <p className="font-black uppercase text-xs tracking-widest">Select category and run diagnostic to verify live logic</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* DB Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-4 border-b pb-2">
                            <Database size={16} className="text-blue-500" />
                            <h4 className="text-xs font-black uppercase text-slate-800 tracking-tighter">Live Schema Consistency</h4>
                        </div>
                        <div className="space-y-2">
                            {dbTables.map(t => (
                                <div key={t.name} className="flex justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-bold text-slate-600">
                                    <span>{t.name}</span>
                                    <span className="text-blue-600 bg-white px-1.5 py-0.5 rounded border">{t.rows} Records</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="bg-amber-50 border border-amber-200 p-6 rounded-[2rem] space-y-4">
                        <div className="flex items-center gap-2 text-amber-800">
                            <ShieldAlert size={18} />
                            <h4 className="text-xs font-black uppercase">Security Mode</h4>
                        </div>
                        <p className="text-[10px] text-amber-700 leading-relaxed font-bold">
                            Diagnostic suite is currently operating in <strong>STRICT_DB_IO</strong> mode. All tests interact with production-grade PHP controllers.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
