import React, { useState, useRef } from 'react';
import { ShieldCheck, RefreshCw, Activity, Terminal, Download, HeartPulse, Play, FileJson, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
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

    const stats = {
        total: results.length,
        passed: results.filter(r => r.status === 'PASS').length,
        failed: results.filter(r => r.status === 'FAIL').length,
        skipped: results.filter(r => r.status === 'SKIPPED').length
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-12">
            {/* Action Header */}
            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl border border-slate-800 relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <ShieldCheck className="w-8 h-8 text-cyan-400" />
                            <h2 className="text-3xl font-black tracking-tight">System Integrity Audit</h2>
                        </div>
                        <p className="text-slate-400 text-sm max-w-xl">
                            Comprehensive 26-point scan verifying server environment, database schema integrity, and API accessibility. 
                            If you encounter 403 Forbidden errors, run this audit to identify the specific endpoint failure.
                        </p>
                    </div>
                    
                    <div className="flex gap-3 shrink-0">
                        {results.length > 0 && (
                            <button 
                                onClick={downloadReport}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all border border-slate-700 active:scale-95"
                            >
                                <Download size={18} /> Export Report
                            </button>
                        )}
                        <button 
                            onClick={runFullAudit}
                            disabled={isRunning}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-blue-900/40 disabled:opacity-50 active:scale-95"
                        >
                            {isRunning ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} />}
                            {isRunning ? 'Running Sequence...' : 'Start 26-Point Audit'}
                        </button>
                    </div>
                </div>

                {/* Performance & Status Summary */}
                {results.length > 0 && (
                    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-top-4">
                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col">
                            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Completed</span>
                            <span className="text-2xl font-bold text-white">{stats.total} / 26</span>
                        </div>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex flex-col">
                            <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Passed</span>
                            <span className="text-2xl font-bold text-emerald-400">{stats.passed}</span>
                        </div>
                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex flex-col">
                            <span className="text-red-400 text-[10px] font-black uppercase tracking-widest">Failed</span>
                            <span className="text-2xl font-bold text-red-400">{stats.failed}</span>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex flex-col">
                            <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Success Rate</span>
                            <span className="text-2xl font-bold text-blue-400">{stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0}%</span>
                        </div>
                    </div>
                )}
                
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
            </div>

            {/* Test List Container */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm uppercase tracking-wider">
                        <Terminal className="w-4 h-4 text-slate-400" /> Execution Logs
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 px-3 py-1 bg-slate-100 rounded-full">ENVIRONMENT: PRODUCTION</span>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {results.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-20 text-slate-400">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                <Activity className="w-10 h-10 opacity-10" />
                            </div>
                            <p className="font-bold text-slate-500 text-lg">System Idle</p>
                            <p className="text-sm max-w-sm mt-2">Initialize the audit sequence to verify server integrity and connectivity.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {results.map((r, i) => (
                                <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors animate-in slide-in-from-left-2">
                                    <div className="flex gap-5 items-start">
                                        <div className={`mt-1.5 p-1 rounded-full ${
                                            r.status === 'PASS' ? 'bg-emerald-50 text-emerald-600' : 
                                            r.status === 'FAIL' ? 'bg-red-50 text-red-600' : 
                                            r.status === 'SKIPPED' ? 'bg-slate-50 text-slate-400' :
                                            'bg-blue-50 text-blue-600 animate-pulse'
                                        }`}>
                                            {r.status === 'PASS' ? <CheckCircle2 size={18} /> : 
                                             r.status === 'FAIL' ? <XCircle size={18} /> : <Activity size={18} />}
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{r.step}</div>
                                            <div className="font-bold text-slate-800 text-sm md:text-base leading-tight">{r.description}</div>
                                            {r.details && (
                                                <p className={`text-xs mt-1.5 font-medium ${r.status === 'FAIL' ? 'text-red-500' : 'text-slate-500'}`}>
                                                    {r.details}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0 ml-4">
                                        <div className={`text-[10px] font-black px-3 py-1 rounded-full uppercase mb-1 border ${
                                            r.status === 'PASS' ? 'text-emerald-700 bg-emerald-50 border-emerald-100' : 
                                            r.status === 'FAIL' ? 'text-red-700 bg-red-50 border-red-100' : 
                                            'text-slate-500 bg-slate-100 border-slate-200'
                                        }`}>
                                            {r.status}
                                        </div>
                                        {r.latency && <div className="text-[9px] font-mono font-bold text-slate-400">{r.latency}ms</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {results.length > 0 && stats.failed > 0 && (
                    <div className="p-6 bg-red-50 border-t border-red-100 flex items-start gap-4">
                        <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={24} />
                        <div>
                            <p className="text-sm font-black text-red-900 uppercase tracking-tight">Critical Warnings Detected</p>
                            <p className="text-xs text-red-800 mt-1 leading-relaxed">
                                The audit detected {stats.failed} failures. If your API returns <strong>403 Forbidden</strong>, your server may be blocking requests via ModSecurity. 
                                Ensure you have uploaded all files from the Deployment Center and that your <strong>config.php</strong> has correct credentials.
                            </p>
                            <button 
                                onClick={() => (window as any).setCurrentScreen?.('deployment')} 
                                className="mt-3 text-[10px] font-black uppercase text-red-700 bg-white border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50"
                            >
                                Fix in Deployment Center
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};