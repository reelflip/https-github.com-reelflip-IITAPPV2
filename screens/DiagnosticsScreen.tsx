
import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, RefreshCw, Activity, Play, CheckCircle2, XCircle, Database, Layers, Bot, Sparkles, ClipboardList, Loader2, Server, Check, Lock, ShieldAlert, FileText, Settings, AlertTriangle, Zap, Download, FileJson, Share2, ClipboardCheck, Wrench, Shield, Circle, LayoutGrid, Globe, Terminal, FileCode, Search, ChevronRight, HelpCircle, Code } from 'lucide-react';
import { E2ETestRunner, TestResult, CATEGORY_MAP, CategoryKey, GateCheck, ApiEndpointResult } from '../services/testRunnerService';

type DiagTab = 'MASTER' | 'DATABASE' | 'ENDPOINTS' | 'RESOLUTION';

export const DiagnosticsScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState<DiagTab>('MASTER');
    const [activeCategory, setActiveCategory] = useState<CategoryKey>('INFRA');
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState<TestResult[]>([]);
    const [isGating, setIsGating] = useState(false);
    const [dbTables, setDbTables] = useState<any[]>([]);
    const [gateChecks, setGateChecks] = useState<Record<string, GateCheck>>({});
    const [isScanningEndpoints, setIsScanningEndpoints] = useState(false);
    const [endpointResults, setEndpointResults] = useState<ApiEndpointResult[]>([]);

    const runnerRef = useRef<E2ETestRunner | null>(null);

    const initRunner = () => {
        if (!runnerRef.current) {
            runnerRef.current = new E2ETestRunner((newResults) => setResults(newResults));
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

    const runGateCheck = async () => {
        setIsGating(true);
        const runner = initRunner();
        const checks = await runner.runDbGate();
        setGateChecks(checks);
        setIsGating(false);
        fetchDbStatus();
    };

    const runEndpointAudit = async () => {
        setIsScanningEndpoints(true);
        const runner = initRunner();
        await runner.runApiAudit(setEndpointResults);
        setIsScanningEndpoints(false);
    };

    const runMasterAudit = async () => {
        setIsRunning(true);
        const runner = initRunner();
        await runner.runFullAudit();
        setIsRunning(false);
        fetchDbStatus();
    };

    // --- RESOLUTION ENGINE LOGIC ---
    const getResolutionSteps = () => {
        const issues = [];
        const has404 = endpointResults.some(r => r.code === 404);
        const has500 = endpointResults.some(r => r.code === 500);
        const has400 = endpointResults.some(r => r.code === 400);
        const dbFail = gateChecks.connectivity?.status === 'FAIL';

        if (has404) {
            issues.push({
                title: "API Routing Disconnect (404)",
                cause: "The server is looking for files in /api/ but the request is being intercepted by the frontend router.",
                fix: "Create a .htaccess file in your public_html folder with: \n\nRewriteEngine On\nRewriteCond %{REQUEST_URI} ^/api/ [NC]\nRewriteRule ^api/(.*)$ api/$1 [L]"
            });
        }
        if (dbFail) {
            issues.push({
                title: "MySQL Handshake Refused",
                cause: "PHP config.php exists but the database user/pass/host is rejected by the server.",
                fix: "Login to Hostinger CPanel > Databases > MySQL. Verify that your DB User has 'All Privileges' assigned to the DB Name. Ensure '$host' is 'localhost'."
            });
        }
        if (has400) {
            issues.push({
                title: "JSON Payload Blocked (400)",
                cause: "Hostinger ModSecurity is blocking the application/json header or the PHP input stream is not being read correctly.",
                fix: "In your PHP files, use: \n$data = json_decode(file_get_contents('php://input'));\nInstead of $_POST."
            });
        }
        return issues;
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-24 animate-in fade-in">
            {/* Header */}
            <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-800 relative overflow-hidden">
                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-900/50">
                                <ShieldCheck className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black uppercase tracking-tight">System Integrity Hub</h2>
                                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Diagnostic & Deployment Analyzer • v17.0</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex bg-slate-800 p-1 rounded-2xl border border-slate-700 shadow-inner flex-wrap justify-center">
                        <button onClick={() => setActiveTab('MASTER')} className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'MASTER' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>Master Suite</button>
                        <button onClick={() => setActiveTab('DATABASE')} className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'DATABASE' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>DB Integrity</button>
                        <button onClick={() => setActiveTab('ENDPOINTS')} className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'ENDPOINTS' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400'}`}>Endpoints</button>
                        <button onClick={() => setActiveTab('RESOLUTION')} className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'RESOLUTION' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400'}`}>Resolution Hub</button>
                    </div>
                </div>
            </div>

            {activeTab === 'RESOLUTION' && (
                <div className="animate-in slide-in-from-bottom-4 space-y-6">
                    <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-4 bg-emerald-100 text-emerald-600 rounded-3xl"><Wrench size={32} /></div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Deployment Resolution Center</h3>
                                <p className="text-slate-500 font-bold">Step-by-step technical fixes for your specific server environment.</p>
                            </div>
                        </div>

                        {getResolutionSteps().length > 0 ? (
                            <div className="space-y-6">
                                {getResolutionSteps().map((step, i) => (
                                    <div key={i} className="bg-slate-50 border border-slate-200 rounded-[2rem] p-8">
                                        <div className="flex items-start gap-6">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-emerald-600 shadow-sm border border-slate-100 shrink-0">{i+1}</div>
                                            <div className="flex-1">
                                                <h4 className="text-lg font-black text-slate-800 uppercase mb-2">{step.title}</h4>
                                                <p className="text-slate-600 text-sm mb-4 leading-relaxed font-medium"><span className="text-rose-500 font-bold uppercase text-xs">Root Cause:</span> {step.cause}</p>
                                                <div className="bg-slate-900 rounded-2xl p-6 relative">
                                                    <div className="absolute top-4 right-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Concrete Solution</div>
                                                    <pre className="text-emerald-400 font-mono text-xs whitespace-pre-wrap leading-relaxed overflow-x-auto">{step.fix}</pre>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center flex flex-col items-center">
                                <CheckCircle2 size={64} className="text-emerald-500 mb-4" />
                                <h4 className="text-xl font-black text-slate-800 uppercase">No System Blockers Detected</h4>
                                <p className="text-slate-500 mt-2">Run the 'Master Suite' or 'Endpoints' probe to trigger the resolution analyzer.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* MASTER SUITE CONTENT */}
            {activeTab === 'MASTER' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-2">
                    <div className="lg:col-span-3 space-y-4">
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Suite Navigation</h3>
                            <div className="space-y-1">
                                {(Object.entries(CATEGORY_MAP) as [CategoryKey, any][]).map(([key, config]) => (
                                    <button key={key} onClick={() => setActiveCategory(key)} className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-between group ${activeCategory === key ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
                                        <span>{config.prefix}. {config.label}</span>
                                        {results.some(r => r.category === key && r.status === 'FAIL') && <AlertTriangle className="w-3 h-3 text-white" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button onClick={runMasterAudit} disabled={isRunning} className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95">
                            {isRunning ? <RefreshCw className="animate-spin w-5 h-5" /> : <Play className="w-5 h-5" />}
                            Run Live Server Audit
                        </button>
                    </div>

                    <div className="lg:col-span-9 space-y-6">
                        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col min-h-[600px]">
                            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                <div>
                                    <h3 className="font-black text-slate-800 text-xs uppercase tracking-[0.2em]">{CATEGORY_MAP[activeCategory].label}</h3>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{results.filter(r => r.category === activeCategory).length} items scanned</p>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                                {results.filter(r => r.category === activeCategory).length > 0 ? results.filter(r => r.category === activeCategory).map(r => (
                                    <div key={r.id} className={`p-6 px-10 flex items-start gap-8 transition-all ${r.status === 'FAIL' ? 'bg-rose-50/50' : 'hover:bg-slate-50'}`}>
                                        <div className={`mt-1.5 shrink-0 ${r.status === 'PASS' ? 'text-emerald-500' : r.status === 'RUNNING' ? 'text-blue-500 animate-spin' : 'text-rose-500'}`}>
                                            {r.status === 'PASS' ? <CheckCircle2 size={24} /> : r.status === 'RUNNING' ? <RefreshCw size={24} /> : <XCircle size={24} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-1.5">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{r.id}</span>
                                                <span className="text-[9px] font-mono text-slate-300">{r.latency ? `${r.latency}ms` : ''}</span>
                                            </div>
                                            <div className="font-bold text-slate-800 text-base mb-1">{r.description}</div>
                                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic">{r.details || 'Awaiting live probe...'}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-300 p-20 text-center opacity-40">
                                        <ClipboardList size={64} className="mb-6" />
                                        <p className="font-black uppercase text-xs tracking-[0.2em]">Diagnostic Suite Ready</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ENDPOINT AUDIT */}
            {activeTab === 'ENDPOINTS' && (
                <div className="animate-in slide-in-from-left-2 space-y-6">
                    <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
                            <h3 className="text-xl font-black uppercase text-slate-800 tracking-tighter flex items-center gap-2"><Globe className="text-orange-600" size={24}/> Endpoint Logic Map</h3>
                            <button onClick={runEndpointAudit} disabled={isScanningEndpoints} className="bg-orange-600 text-white px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-100 hover:bg-orange-700 transition-all flex items-center gap-2 active:scale-95">
                                {isScanningEndpoints ? <RefreshCw className="animate-spin w-4 h-4" /> : <Play className="w-4 h-4" />} Probe Live Endpoints
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {endpointResults.map(res => (
                                <div key={res.file} className={`p-4 rounded-[1.5rem] border flex flex-col justify-between transition-all hover:shadow-md ${res.status === 'OK' ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50/50 border-rose-100'}`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="min-w-0">
                                            <div className="font-black text-slate-800 text-xs truncate mb-1 uppercase tracking-tight">{res.file}</div>
                                            <span className={`px-2 py-0.5 rounded-lg font-mono text-[9px] font-bold ${res.code === 200 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>HTTP {res.code}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase mt-auto">
                                        <span className="flex items-center gap-1"><RefreshCw size={10} className={res.status === 'RUNNING' ? 'animate-spin' : ''} /> {res.time}ms</span>
                                        {res.status !== 'OK' && <button onClick={() => setActiveTab('RESOLUTION')} className="text-blue-600 font-black flex items-center gap-1">Fix <ChevronRight size={10}/></button>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* DATABASE TAB (SIMILAR TO BEFORE BUT NO SIMULATOR) */}
            {activeTab === 'DATABASE' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-right-2">
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl p-8">
                            <h3 className="font-black text-slate-800 text-xs uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><Activity className="text-indigo-600" size={16}/> Link Validation</h3>
                            <div className="space-y-4">
                                {Object.values(gateChecks).map((check: any) => (
                                    <div key={check.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                                        <div className="flex items-center gap-4">
                                            {check.status === 'PASS' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-rose-500" />}
                                            <div><p className="text-[11px] font-black text-slate-700 uppercase tracking-tight">{check.label}</p><p className="text-[9px] font-bold text-slate-400 uppercase">{check.msg}</p></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button onClick={runGateCheck} disabled={isGating} className="w-full bg-indigo-600 text-white py-4 rounded-[1.5rem] mt-8 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 active:scale-95">
                                {isGating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />} Run Integrity Scan
                            </button>
                        </div>
                    </div>
                    <div className="lg:col-span-8 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
                        <h3 className="text-xl font-black uppercase text-slate-800 tracking-tighter mb-10 flex items-center gap-3"><Database className="text-indigo-600" size={24}/> SQL Registry (v17.0)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {dbTables.map(t => (
                                <div key={t.name} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm group">
                                    <div className="flex items-center gap-3"><div className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 group-hover:text-indigo-600 transition-colors"><Layers size={18}/></div><span className="text-[13px] font-black text-slate-700 uppercase tracking-tight">{t.name}</span></div>
                                    <span className="bg-white px-4 py-1.5 rounded-xl border border-indigo-100 text-[11px] font-black text-indigo-600">{t.rows} Entries</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
