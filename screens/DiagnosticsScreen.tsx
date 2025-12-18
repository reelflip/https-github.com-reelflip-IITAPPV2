import React, { useState } from 'react';
import { Database, Activity, Loader2, Play, CheckCircle2, XCircle, Users, ShieldCheck, Server, RefreshCw, Terminal } from 'lucide-react';
import { E2ETestRunner, TestResult } from '../services/testRunnerService';

export const DiagnosticsScreen: React.FC = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState<TestResult[]>([]);
    const [systemPulse, setSystemPulse] = useState<'IDLE' | 'SCANNING'>('IDLE');

    const runE2ESuite = async () => {
        setIsRunning(true);
        const runner = new E2ETestRunner((newResults) => setResults(newResults));
        await runner.runSuite();
        setIsRunning(false);
    };

    const repairSchema = async () => {
        setSystemPulse('SCANNING');
        try {
            const res = await fetch('/api/migrate_db.php');
            if (res.ok) alert("Schema repair successful.");
        } catch (e) { alert("Repair failed."); }
        setSystemPulse('IDLE');
    };

    return (
        <div className="space-y-6 p-4 max-w-5xl mx-auto">
            {/* Header Area */}
            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-slate-800">
                <div>
                    <h2 className="text-2xl font-black flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-blue-400" />
                        System Integrity Auditor
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Verified E2E testing for Auth, Persistence, and Data Gating.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={repairSchema}
                        disabled={systemPulse === 'SCANNING'}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all border border-slate-700"
                    >
                        {systemPulse === 'SCANNING' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Server className="w-4 h-4" />}
                        Repair Schema
                    </button>
                    <button 
                        onClick={runE2ESuite} 
                        disabled={isRunning}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
                    >
                        {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                        Run Full E2E Suite
                    </button>
                </div>
            </div>

            {/* Test Log */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm uppercase tracking-wider">
                        <Terminal className="w-4 h-4 text-slate-400" />
                        Execution Log
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">v12.22_STABLE</span>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {results.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-12 text-slate-400">
                            <Activity className="w-16 h-16 mb-4 opacity-10" />
                            <p className="font-medium">No tests currently running.</p>
                            <p className="text-xs max-w-xs mt-1">Start the suite to validate account linking, data visibility, and database persistence.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {results.map((r, i) => (
                                <div key={i} className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors animate-in slide-in-from-left-2">
                                    <div className="flex gap-4">
                                        <div className={`mt-1 h-2 w-2 rounded-full ${
                                            r.status === 'PASS' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 
                                            r.status === 'FAIL' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 
                                            'bg-blue-500 animate-pulse'
                                        }`}></div>
                                        <div>
                                            <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-0.5">{r.step}</div>
                                            <div className="font-bold text-slate-800 text-base">{r.description}</div>
                                            {r.details && <p className="text-xs text-slate-500 mt-1 italic">{r.details}</p>}
                                        </div>
                                    </div>
                                    <div className={`text-xs font-black px-3 py-1 rounded-full uppercase ${
                                        r.status === 'PASS' ? 'text-green-600 bg-green-50' : 
                                        r.status === 'FAIL' ? 'text-red-600 bg-red-50' : 
                                        'text-blue-600 bg-blue-50'
                                    }`}>
                                        {r.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {results.length > 0 && isRunning && (
                    <div className="p-4 bg-blue-50 border-t border-blue-100 flex items-center justify-center gap-3">
                        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                        <span className="text-xs font-bold text-blue-700">Simulating cross-browser persistence...</span>
                    </div>
                )}
            </div>

            {/* Regression Guard Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl">
                    <h4 className="font-bold text-emerald-900 flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-5 h-5" /> Data Gating Guard
                    </h4>
                    <p className="text-xs text-emerald-800/80 leading-relaxed">
                        This suite verifies that Parents **cannot** write to Student progress tables and that the Syllabus view is strictly `read-only` and `summary-only` in Parent mode.
                    </p>
                </div>
                <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl">
                    <h4 className="font-bold text-amber-900 flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5" /> Multiple Connection Test
                    </h4>
                    <p className="text-xs text-amber-800/80 leading-relaxed">
                        The framework simulates multiple incoming invitations to a single student to ensure the database correctly handles concurrency and state transitions.
                    </p>
                </div>
            </div>
        </div>
    );
};