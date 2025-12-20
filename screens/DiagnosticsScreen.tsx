import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Brain, ShieldCheck, RefreshCw, Activity, Terminal, Download, HeartPulse, Play, FileJson, AlertTriangle, CheckCircle2, XCircle, Beaker, Shield, UserCheck, Database, Server, Sparkles, Code, FileText, ChevronRight, Lightbulb, AlertCircle, Wrench, FileCode, Layers, ChevronUp, ChevronDown } from 'lucide-react';
import { E2ETestRunner, TestResult, AIFixRecommendation } from '../services/testRunnerService';

export const DiagnosticsScreen: React.FC = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState<TestResult[]>([]);
    const [aiFixes, setAiFixes] = useState<AIFixRecommendation[]>([]);
    const [dbTables, setDbTables] = useState<any[]>([]);
    const [expandedTable, setExpandedTable] = useState<string | null>(null);
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

    const failedSteps = useMemo(() => results.filter(r => r.status === 'FAIL'), [results]);

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-24 animate-in fade-in">
            {/* Master Header */}
            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl border border-slate-800 relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <Wrench className="w-8 h-8 text-blue-400" />
                            <h2 className="text-3xl font-black tracking-tight uppercase">System Health Dashboard</h2>
                        </div>
                        <p className="text-slate-400 text-sm max-w-xl font-medium">
                            Dual-Core Diagnostics: Deterministic Legacy Suite (51 Tests) & AI-Assisted Recovery.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3 shrink-0">
                        {results.length > 0 && (
                            <button onClick={downloadReport} className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all border border-slate-700 active:scale-95">
                                <Download size={18} /> Export Results
                            </button>
                        )}
                        <button onClick={runFullAudit} disabled={isRunning} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-blue-900/40 disabled:opacity-50 active:scale-95">
                            {isRunning ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} />}
                            {isRunning ? 'Auditing 51 Nodes...' : 'Run Legacy Audit Suite'}
                        </button>
                    </div>
                </div>
                {results.length > 0 && (
                    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-top-4">
                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest block mb-1">Coverage</span>
                            <span className="text-2xl font-bold text-white">{Math.round((results.length / 51) * 100)}% of 51</span>
                        </div>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl">
                            <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest block mb-1">Passed</span>
                            <span className="text-2xl font-bold text-emerald-400">{stats.passed} Checks</span>
                        </div>
                        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl">
                            <span className="text-red-400 text-[10px] font-black uppercase tracking-widest block mb-1">Critical Failures</span>
                            <span className="text-2xl font-bold text-red-400">{stats.failed} Errors</span>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl">
                            <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest block mb-1">Host Response</span>
                            <span className="text-2xl font-bold text-blue-400">{Math.round(results.reduce((acc, r) => acc + (r.latency || 0), 0) / (results.length || 1))}ms</span>
                        </div>
                    </div>
                )}
            </div>

            {/* AI Advisor Panel (Dynamic) */}
            {failedSteps.length > 0 && !isRunning && (
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-3xl shadow-xl text-white animate-in zoom-in-95">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
                                <h3 className="text-xl font-black uppercase tracking-tight">AI Intelligent Recovery</h3>
                            </div>
                            <p className="text-indigo-100 text-sm font-medium">Found {failedSteps.length} legacy failures. Consultant the AI for specific code-level patch instructions.</p>
                        </div>
                        <button 
                            onClick={runAIDiagnosis} 
                            disabled={isAnalyzing}
                            className="bg-white text-indigo-700 px-8 py-3 rounded-xl font-black text-sm flex items-center gap-2 hover:bg-indigo-50 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                        >
                            {isAnalyzing ? <RefreshCw className="animate-spin" size={18} /> : <Brain size={18} />}
                            {isAnalyzing ? 'Analyzing 51-Point Log...' : 'Run AI Fix Analysis'}
                        </button>
                    </div>

                    {aiFixes.length > 0 && (
                        <div className="mt-8 space-y-4">
                            {aiFixes.map((fix, idx) => (
                                <div key={idx} className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
                                    <div className="p-5 border-b border-white/10 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <span className="bg-white/20 px-2 py-1 rounded text-[10px] font-black">{fix.stepId}</span>
                                            <h4 className="font-bold text-white">{fix.problem}</h4>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-white/50">Match Confidence</span>
                                            <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-400" style={{ width: `${fix.confidence * 100}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-5 space-y-6">
                                        {fix.filesToModify.map((file, fIdx) => (
                                            <div key={fIdx} className="space-y-3">
                                                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-200">
                                                    <FileCode size={14} /> {file.path}
                                                </div>
                                                <div className="p-4 bg-slate-900/50 rounded-xl border border-white/10 text-sm">
                                                    <div className="flex items-center gap-2 text-amber-300 mb-2 font-bold">
                                                        <Activity size={14} /> Recommended Action: {file.action}
                                                    </div>
                                                    {file.codeSnippet && (
                                                        <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto p-3 bg-black/30 rounded-lg">
                                                            {file.codeSnippet}
                                                        </pre>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* System Status Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                            <Database className="w-5 h-5 text-blue-600" /> Database Integrity
                        </h3>
                        <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
                            {dbTables.length === 0 ? (
                                <p className="text-xs text-slate-400 italic py-4 text-center">Run audit to refresh DB state.</p>
                            ) : dbTables.map(table => (
                                <div key={table.name} className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50">
                                    <button 
                                        onClick={() => setExpandedTable(expandedTable === table.name ? null : table.name)}
                                        className="w-full p-3 flex items-center justify-between hover:bg-slate-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Layers size={14} className="text-slate-400" />
                                            <span className="text-xs font-bold text-slate-700">{table.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{table.rows} Row</span>
                                            {expandedTable === table.name ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                                        </div>
                                    </button>
                                    {expandedTable === table.name && (
                                        <div className="p-3 bg-white border-t border-slate-100 animate-in slide-in-from-top-1">
                                            {table.columns.map((col: any) => (
                                                <div key={col.name} className="flex justify-between text-[10px] py-1 border-b border-slate-50 last:border-0">
                                                    <span className="font-bold text-slate-500">{col.name}</span>
                                                    <span className="text-slate-400 font-mono">{col.type}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                            <Activity className="w-5 h-5 text-orange-500" /> Server Parameters
                        </h3>
                        <div className="space-y-2">
                            <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">PHP Version</span>
                                <span className="text-[10px] font-black text-slate-800">8.1+ Detected</span>
                            </div>
                            <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">API Count</span>
                                <span className="text-[10px] font-black text-slate-800">38 Enpoints</span>
                            </div>
                            <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Audit Depth</span>
                                <span className="text-[10px] font-black text-slate-800">51 Integrity Nodes</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Legacy Deterministic Audit Stream */}
                <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
                    <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center sticky top-0 z-10 backdrop-blur-sm">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm uppercase tracking-wider">
                            <Terminal className="w-4 h-4 text-slate-400" /> Legacy Audit Stream (51 Deterministic Tests)
                        </h3>
                        <SyncStatusBadge status={isRunning ? 'SYNCING' : 'IDLE'} show={isRunning} />
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {results.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-20 text-slate-400">
                                <Shield className="w-16 h-16 mb-4 opacity-5" />
                                <p className="font-bold text-slate-500 uppercase tracking-widest text-xs">Ready for Deterministic Scan</p>
                                <p className="text-[11px] mt-2 font-medium max-w-[200px]">Launch the 51-node legacy audit to verify table existence, schema mismatches, and core connectivity.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 pb-20">
                                {results.map((r) => (
                                    <div key={r.step} className={`p-4 flex items-start justify-between transition-all ${r.status === 'FAIL' ? 'bg-rose-50/30' : 'hover:bg-slate-50/50'}`}>
                                        <div className="flex gap-4 items-start">
                                            <div className={`mt-0.5 p-1.5 rounded-lg border ${
                                                r.status === 'PASS' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 
                                                r.status === 'FAIL' ? 'bg-rose-50 border-rose-100 text-rose-600' : 
                                                r.status === 'RUNNING' ? 'bg-blue-50 border-blue-100 text-blue-600 animate-pulse' :
                                                'bg-slate-50 border-slate-100 text-slate-300'
                                            }`}>
                                                {r.status === 'PASS' ? <CheckCircle2 size={16} /> : 
                                                 r.status === 'FAIL' ? <XCircle size={16} /> : <Activity size={16} />}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.15em]">{r.step}</span>
                                                    {r.status === 'FAIL' && <span className="px-1.5 py-0.5 bg-rose-600 text-white text-[8px] font-black rounded uppercase">Fix Req</span>}
                                                </div>
                                                <div className="font-bold text-slate-800 text-xs truncate max-w-[400px]">{r.description}</div>
                                                <p className={`text-[10px] mt-1 font-medium ${r.status === 'FAIL' ? 'text-rose-700 font-bold' : 'text-slate-500'}`}>{r.details}</p>
                                                
                                                {r.status === 'FAIL' && r.metadata?.rawResponse && (
                                                    <div className="mt-3 p-3 bg-slate-900 rounded-xl text-[9px] font-mono text-rose-400 overflow-x-auto max-w-lg border border-slate-800 shadow-inner">
                                                        <div className="flex justify-between items-center mb-1 text-slate-500">
                                                            <span className="font-black">LOG_DUMP</span>
                                                            <span>{r.metadata.httpCode}</span>
                                                        </div>
                                                        {r.metadata.rawResponse.slice(0, 300)}...
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {r.latency && <div className="text-[9px] font-mono font-black text-slate-300 shrink-0 ml-2">{r.latency}ms</div>}
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

const SyncStatusBadge = ({status, show}: any) => {
    if(!show) return null;
    return (
        <div className={`px-2 py-1 rounded-full text-[9px] font-black uppercase flex items-center gap-1.5 ${status === 'SYNCING' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
            {status === 'SYNCING' && <RefreshCw size={10} className="animate-spin" />}
            {status === 'SYNCING' ? 'Running Tests...' : 'Idle'}
        </div>
    );
};
