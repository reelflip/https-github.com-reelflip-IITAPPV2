import React, { useState, useRef, useMemo } from 'react';
import { ShieldCheck, RefreshCw, Activity, Terminal, Download, HeartPulse, Play, FileJson, AlertTriangle, CheckCircle2, XCircle, Beaker, Shield, UserCheck, Database, Server } from 'lucide-react';
import { E2ETestRunner, TestResult } from '../services/testRunnerService';

export const DiagnosticsScreen: React.FC = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState<TestResult[]>([]);
    const runnerRef = useRef<E2ETestRunner | null>(null);

    const initRunner = () => {
        if (!runnerRef.current) {
            runnerRef.current = new E2ETestRunner((newResults) => setResults(newResults));
        }
        return runnerRef.current;
    };

    const runFullAudit = async () => {
        setResults([]);
        setIsRunning(true);
        const runner = initRunner();
        await runner.runFullAudit();
        setIsRunning(false);
    };

    const downloadReport = () => {
        const runner = initRunner();
        runner.downloadJSONReport();
    };

    const stats = useMemo(() => ({
        total: results.length,
        passed: results.filter(r => r.status === 'PASS').length,
        failed: results.filter(r => r.status === 'FAIL').length,
        skipped: results.filter(r => r.status === 'SKIPPED').length,
        running: results.filter(r => r.status === 'RUNNING').length
    }), [results]);

    const groupedResults = useMemo(() => {
        const groups: Record<string, TestResult[]> = {
            'System Health': [],
            'Functional E2E': [],
            'Advanced Prep Tools': [],
            'Security & Roles': []
        };
        results.forEach(r => {
            const stepNum = parseInt(r.step.split('.')[1]);
            if (r.step.startsWith('H.')) groups['System Health'].push(r);
            else if (r.step.startsWith('E.')) {
                if (stepNum >= 40 && stepNum <= 43) groups['Advanced Prep Tools'].push(r);
                else if (stepNum === 51) groups['Security & Roles'].push(r);
                else groups['Functional E2E'].push(r);
            }
        });
        return groups;
    }, [results]);

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in">
            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl border border-slate-800 relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <Beaker className="w-8 h-8 text-blue-400" />
                            <h2 className="text-3xl font-black tracking-tight uppercase">Integrity Audit v12.26</h2>
                        </div>
                        <p className="text-slate-400 text-sm max-w-xl">
                            Comprehensive points scan verifying server reliability, database schema compliance, advanced tool persistence, and cross-role screen accessibility.
                        </p>
                    </div>
                    <div className="flex gap-3 shrink-0">
                        {results.length > 0 && (
                            <button onClick={downloadReport} className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all border border-slate-700 active:scale-95">
                                <Download size={18} /> Export JSON
                            </button>
                        )}
                        <button onClick={runFullAudit} disabled={isRunning} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-blue-900/40 disabled:opacity-50 active:scale-95">
                            {isRunning ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} />}
                            {isRunning ? 'Auditing Platform...' : 'Execute Full Audit'}
                        </button>
                    </div>
                </div>
                {results.length > 0 && (
                    <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4 animate-in slide-in-from-top-4">
                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center">
                            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest block">Total Scan</span>
                            <span className="text-2xl font-bold text-white">{stats.total} / 51</span>
                        </div>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-center">
                            <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest block">Passed</span>
                            <span className="text-2xl font-bold text-emerald-400">{stats.passed}</span>
                        </div>
                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-center">
                            <span className="text-red-400 text-[10px] font-black uppercase tracking-widest block">Failed</span>
                            <span className="text-2xl font-bold text-red-400">{stats.failed}</span>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl text-center">
                            <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest block">Score</span>
                            <span className="text-2xl font-bold text-blue-400">{stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0}%</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-blue-600" /> Platform Status
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                <span className="text-sm font-medium text-slate-600">Runtime Version</span>
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase">12.26</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                <span className="text-sm font-medium text-slate-600">Database</span>
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">Live</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
                    <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center sticky top-0 z-10 backdrop-blur-sm">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm uppercase tracking-wider">
                            <Terminal className="w-4 h-4 text-slate-400" /> Execution Trace
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {results.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-20 text-slate-400">
                                <Activity className="w-16 h-16 mb-4 opacity-5" />
                                <p className="font-bold text-slate-500">System idle</p>
                                <p className="text-xs mt-2">Initialize the audit sequence to verify platform integrity.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50 pb-8">
                                {Object.entries(groupedResults).map(([group, groupLogs]) => (groupLogs as TestResult[]).length > 0 && (
                                    <React.Fragment key={group}>
                                        <div className="bg-slate-100/50 px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">{group}</div>
                                        {(groupLogs as TestResult[]).map((r) => (
                                            <div key={r.step} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                                <div className="flex gap-4 items-start">
                                                    <div className={`mt-1 p-1 rounded-full ${
                                                        r.status === 'PASS' ? 'bg-emerald-50 text-emerald-600' : 
                                                        r.status === 'FAIL' ? 'bg-red-50 text-red-600' : 
                                                        r.status === 'RUNNING' ? 'bg-blue-50 text-blue-600 animate-pulse' :
                                                        'bg-slate-50 text-slate-300'
                                                    }`}>
                                                        {r.status === 'PASS' ? <CheckCircle2 size={16} /> : 
                                                         r.status === 'FAIL' ? <XCircle size={16} /> : <Activity size={16} />}
                                                    </div>
                                                    <div>
                                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{r.step}</div>
                                                        <div className="font-bold text-slate-800 text-sm">{r.description}</div>
                                                        {r.details && <p className="text-[11px] mt-0.5 text-slate-500">{r.details}</p>}
                                                    </div>
                                                </div>
                                                {r.latency && <div className="text-[9px] font-mono text-slate-300">{r.latency}ms</div>}
                                            </div>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};