import React, { useState, useRef } from 'react';
import { Database, Activity, Loader2, Play, CheckCircle2, ShieldCheck, Server, RefreshCw, Terminal, Download, HeartPulse } from 'lucide-react';
import { E2ETestRunner, TestResult } from '../services/testRunnerService';

export const DiagnosticsScreen: React.FC = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState<TestResult[]>([]);
    const [systemPulse, setSystemPulse] = useState<'IDLE' | 'SCANNING'>('IDLE');
    const runnerRef = useRef<E2ETestRunner | null>(null);

    const initRunner = () => {
        if (!runnerRef.current) {
            runnerRef.current = new E2ETestRunner((newResults) => setResults(newResults));
        }
        return runnerRef.current;
    };

    const runHealthSuite = async () => {
        setIsRunning(true);
        const runner = initRunner();
        await runner.runHealthSuite();
        setIsRunning(false);
    };

    const runE2ESuite = async () => {
        setIsRunning(true);
        const runner = initRunner();
        await runner.runSuite();
        setIsRunning(false);
    };

    const downloadReport = () => {
        const runner = initRunner();
        runner.downloadJSONReport();
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
            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl border border-slate-800">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h2 className="text-2xl font-black flex items-center gap-3">
                            <ShieldCheck className="w-8 h-8 text-blue-400" />
                            System Integrity Auditor
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">Multi-layer diagnostic suite for IITGEEPrep core systems.</p>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={repairSchema}
                            disabled={systemPulse === 'SCANNING'}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all border border-slate-700"
                        >
                            {systemPulse === 'SCANNING' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Server className="w-4 h-4" />}
                            Repair Schema
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    <button 
                        onClick={runHealthSuite}
                        disabled={isRunning}
                        className="bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl flex items-center justify-between group transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <HeartPulse className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            <div className="text-left">
                                <div className="font-bold">System Health</div>
                                <div className="text-[10px] opacity-70">Ping DB, API Integrity, Folder Permissions</div>
                            </div>
                        </div>
                        <Play size={16} />
                    </button>

                    <button 
                        onClick={runE2ESuite}
                        disabled={isRunning}
                        className="bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-400 p-4 rounded-2xl flex items-center justify-between group transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <Activity className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            <div className="text-left">
                                <div className="font-bold">Lifecycle E2E</div>
                                <div className="text-[10px] opacity-70">Auth, Persistence, Multi-Role Handshake</div>
                            </div>
                        </div>
                        <Play size={16} />
                    </button>
                </div>
            </div>

            {/* Test Log */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm uppercase tracking-wider">
                        <Terminal className="w-4 h-4 text-slate-400" />
                        Live Execution Log
                    </h3>
                    {results.length > 0 && (
                        <button 
                            onClick={downloadReport}
                            className="text-blue-600 hover:text-blue-700 text-xs font-bold flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100"
                        >
                            <Download className="w-3.5 h-3.5" /> Download Report (.json)
                        </button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto">
                    {results.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-12 text-slate-400">
                            <Activity className="w-16 h-16 mb-4 opacity-10" />
                            <p className="font-medium">No active tests.</p>
                            <p className="text-xs max-w-xs mt-1">Select a suite above to begin auditing the system stability.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {results.map((r, i) => (
                                <div key={i} className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors animate-in slide-in-from-left-2">
                                    <div className="flex gap-4">
                                        <div className={`mt-1 h-2 w-2 rounded-full ${
                                            r.status === 'PASS' ? 'bg-green-500' : 
                                            r.status === 'FAIL' ? 'bg-red-500' : 
                                            'bg-blue-500 animate-pulse'
                                        }`}></div>
                                        <div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{r.step}</div>
                                            <div className="font-bold text-slate-800 text-base">{r.description}</div>
                                            {r.details && <p className="text-xs text-slate-500 mt-1 italic opacity-70">{r.details}</p>}
                                        </div>
                                    </div>
                                    <div className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                                        r.status === 'PASS' ? 'text-green-600 bg-green-50 border border-green-100' : 
                                        r.status === 'FAIL' ? 'text-red-600 bg-red-50 border border-red-100' : 
                                        'text-blue-600 bg-blue-50 border border-blue-100'
                                    }`}>
                                        {r.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};