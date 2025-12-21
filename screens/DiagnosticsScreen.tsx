
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ShieldCheck, RefreshCw, Activity, Play, CheckCircle2, XCircle, Database, Layers, Bot, Sparkles, ClipboardList, Loader2, Server, Check, Lock, ShieldAlert, FileText, Settings, AlertTriangle, Zap, Download, FileJson, Share2, ClipboardCheck, Wrench, Shield, Circle, LayoutGrid, Globe, Terminal, FileCode, Search, ChevronRight } from 'lucide-react';
import { E2ETestRunner, TestResult, CATEGORY_MAP, CategoryKey, GateCheck, ApiEndpointResult } from '../services/testRunnerService';
import { GoogleGenAI } from "@google/genai";

type DiagTab = 'MASTER' | 'DATABASE' | 'ENDPOINTS';

export const DiagnosticsScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState<DiagTab>('MASTER');
    const [activeCategory, setActiveCategory] = useState<CategoryKey>('INFRA');
    
    // Suite States
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState<TestResult[]>([]);
    
    // DB States
    const [isGating, setIsGating] = useState(false);
    const [dbTables, setDbTables] = useState<any[]>([]);
    const [gateChecks, setGateChecks] = useState<Record<string, GateCheck>>({
        connectivity: { id: 'connectivity', label: 'Connectivity', status: 'PENDING', msg: 'Awaiting start' },
        schema: { id: 'schema', label: 'Schema Existence', status: 'PENDING', msg: 'Awaiting start' },
        columns: { id: 'columns', label: 'Column Integrity', status: 'PENDING', msg: 'Awaiting start' },
        integrity: { id: 'integrity', label: 'Key & Relations', status: 'PENDING', msg: 'Awaiting start' },
        write_safety: { id: 'write_safety', label: 'Write-Safety', status: 'PENDING', msg: 'Awaiting start' }
    });

    // Endpoint States
    const [isScanningEndpoints, setIsScanningEndpoints] = useState(false);
    const [endpointResults, setEndpointResults] = useState<ApiEndpointResult[]>([]);

    // Analysis States
    const [analysisReport, setAnalysisReport] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    
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

    useEffect(() => { fetchDbStatus(); }, []);

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
        if (!confirm("This will execute all 121 real-time server tests (A.01 to J.10). Continue?")) return;
        setIsRunning(true);
        const runner = initRunner();
        await runner.runFullAudit();
        setIsRunning(false);
        fetchDbStatus();
    };

    const generateAIReport = async () => {
        if (isAnalyzing || results.length === 0) return;
        setIsAnalyzing(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const failures = results.filter(r => r.status === 'FAIL').map(r => `[${r.id}] ${r.description}: ${r.details}`).join('\n');
            const prompt = `Act as a Senior SRE. Analyze these diagnostic results: ${results.length} executed, ${results.filter(r => r.status === 'FAIL').length} failures.
            Identify cascading patterns and specific PHP/MySQL misconfigurations.`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: prompt,
                config: { systemInstruction: "Expert System Reliability Engineer." }
            });
            setAnalysisReport(response.text || "Report empty.");
        } catch (error: any) {
            setAnalysisReport(`### ERROR\n\n${error.message}`);
        } finally { setIsAnalyzing(false); }
    };

    const currentResults = results.filter(r => r.category === activeCategory);
    const progressPercent = Math.round((results.length / 121) * 100);

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
                                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Diagnostic & Connection Analysis • v13.5</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex bg-slate-800 p-1 rounded-2xl border border-slate-700 shadow-inner">
                        <button 
                            onClick={() => setActiveTab('MASTER')} 
                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'MASTER' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            <LayoutGrid className="w-4 h-4 mb-1 mx-auto" /> Master Suite
                        </button>
                        <button 
                            onClick={() => setActiveTab('DATABASE')} 
                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'DATABASE' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Database className="w-4 h-4 mb-1 mx-auto" /> DB Integrity
                        </button>
                        <button 
                            onClick={() => setActiveTab('ENDPOINTS')} 
                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'ENDPOINTS' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Globe className="w-4 h-4 mb-1 mx-auto" /> Endpoints
                        </button>
                    </div>
                </div>
            </div>

            {/* TAB: MASTER SUITE (121 TESTS) */}
            {activeTab === 'MASTER' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-2">
                    <div className="lg:col-span-3 space-y-4">
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Suite Navigation</h3>
                            <div className="space-y-1">
                                {(Object.entries(CATEGORY_MAP) as [CategoryKey, any][]).map(([key, config]) => (
                                    <button 
                                        key={key} 
                                        onClick={() => setActiveCategory(key)} 
                                        className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-between group ${activeCategory === key ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        <span>{config.prefix}. {config.label}</span>
                                        {results.some(r => r.category === key && r.status === 'FAIL') && <AlertTriangle className="w-3 h-3 text-white" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button 
                            onClick={runMasterAudit} 
                            disabled={isRunning} 
                            className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95"
                        >
                            {isRunning ? <RefreshCw className="animate-spin w-5 h-5" /> : <Play className="w-5 h-5" />}
                            Run All 121 Tests
                        </button>
                    </div>

                    <div className="lg:col-span-9 space-y-6">
                        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col min-h-[600px]">
                            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                <div>
                                    <h3 className="font-black text-slate-800 text-xs uppercase tracking-[0.2em]">{CATEGORY_MAP[activeCategory].label}</h3>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{results.filter(r => r.category === activeCategory).length} items scanned</p>
                                </div>
                                {results.length > 0 && <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Overall Progress: {progressPercent}%</span>}
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-50">
                                {currentResults.length > 0 ? currentResults.map(r => (
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
                                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic">{r.details || 'Awaiting thread...'}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-300 p-20 text-center opacity-40">
                                        <ClipboardList size={64} className="mb-6" />
                                        <p className="font-black uppercase text-xs tracking-[0.2em]">Diagnostic Suite Ready</p>
                                    </div>
                                )}
                            </div>
                            {results.length > 0 && (
                                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                                    <button onClick={() => initRunner().exportReport()} className="bg-white text-slate-700 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 shadow-sm flex items-center gap-2">
                                        <Download className="w-4 h-4" /> Export Suite JSON
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: DATABASE INTEGRITY */}
            {activeTab === 'DATABASE' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-right-2">
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl p-8">
                            <h3 className="font-black text-slate-800 text-xs uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <Activity className="text-indigo-600" size={16}/> Deep Link Validation
                            </h3>
                            <div className="space-y-4">
                                {(Object.values(gateChecks) as GateCheck[]).map((check) => (
                                    <div key={check.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                                        <div className="flex items-center gap-4">
                                            {check.status === 'PASS' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : 
                                             check.status === 'FAIL' ? <XCircle className="w-4 h-4 text-rose-500" /> :
                                             check.status === 'RUNNING' ? <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin" /> :
                                             <Circle className="w-4 h-4 text-slate-300" />}
                                            <div>
                                                <p className="text-[11px] font-black text-slate-700 uppercase tracking-tight">{check.label}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">{check.msg}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-1 gap-3 mt-8">
                                <button onClick={runGateCheck} disabled={isGating} className="w-full bg-indigo-600 text-white py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 active:scale-95">
                                    {isGating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />} Run Integrity Scan
                                </button>
                                <button onClick={() => initRunner().exportJson('DB_Gate_Report', gateChecks)} disabled={isGating} className="w-full bg-slate-50 text-slate-500 border border-slate-200 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                    <FileJson className="w-4 h-4" /> Export Errors (JSON)
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-8 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-10 border-b border-slate-100 pb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Database size={24}/></div>
                                <div>
                                    <h3 className="text-xl font-black uppercase text-slate-800 tracking-tighter">SQL Explorer (v13.5)</h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Active Table Registry</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase">{dbTables.length} Tables Sync'd</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {dbTables.length > 0 ? dbTables.map(t => (
                                <div key={t.name} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-white transition-all shadow-sm group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 group-hover:text-indigo-600 transition-colors"><Layers size={18}/></div>
                                        <span className="text-[13px] font-black text-slate-700 uppercase tracking-tight">{t.name}</span>
                                    </div>
                                    <span className="bg-white px-4 py-1.5 rounded-xl border border-indigo-100 text-[11px] font-black text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">{t.rows} Entries</span>
                                </div>
                            )) : (
                                <div className="col-span-full py-20 text-center flex flex-col items-center justify-center grayscale opacity-50">
                                    <ShieldAlert size={48} className="text-slate-300 mb-4" />
                                    <p className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em]">Run integrity scan to load tables</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: ENDPOINT AUDIT */}
            {activeTab === 'ENDPOINTS' && (
                <div className="animate-in slide-in-from-left-2 space-y-6">
                    <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
                            <div>
                                <h3 className="text-xl font-black uppercase text-slate-800 tracking-tighter flex items-center gap-2">
                                    <Globe className="text-orange-600" size={24}/> Endpoint Logic Map
                                </h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Verifying 38 Synchronized PHP Handlers</p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => initRunner().exportJson('API_Endpoint_Report', endpointResults)} disabled={endpointResults.length === 0} className="bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2">
                                    <FileJson className="w-4 h-4" /> Export Report
                                </button>
                                <button onClick={runEndpointAudit} disabled={isScanningEndpoints} className="bg-orange-600 text-white px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-100 hover:bg-orange-700 transition-all flex items-center gap-2 active:scale-95">
                                    {isScanningEndpoints ? <RefreshCw className="animate-spin w-4 h-4" /> : <Play className="w-4 h-4" />} Probe Endpoints
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {endpointResults.length > 0 ? endpointResults.map(res => (
                                <div key={res.file} className={`p-4 rounded-[1.5rem] border flex flex-col justify-between transition-all hover:shadow-md ${res.status === 'OK' ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50/50 border-rose-100'}`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="min-w-0">
                                            <div className="font-black text-slate-800 text-xs truncate mb-1 uppercase tracking-tight">{res.file}</div>
                                            <span className={`px-2 py-0.5 rounded-lg font-mono text-[9px] font-bold ${res.code === 200 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>HTTP {res.code}</span>
                                        </div>
                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg border bg-white ${res.status === 'OK' ? 'border-emerald-200 text-emerald-600' : 'border-rose-200 text-rose-600'}`}>
                                            {res.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase mt-auto">
                                        <span className="flex items-center gap-1"><RefreshCw size={10} className={res.status === 'RUNNING' ? 'animate-spin' : ''} /> {res.time}ms</span>
                                        {res.status === 'CRASH' && <span className="text-rose-500 font-black">Requires Repair</span>}
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-full py-32 text-center flex flex-col items-center justify-center opacity-30">
                                    <FileCode size={64} className="text-slate-300 mb-4" />
                                    <p className="font-black uppercase text-sm tracking-[0.3em]">Initialize probe to verify handler logic</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* AI Failure Analyst Footnote (Decoupled & Available Always) */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                <Sparkles className="absolute -right-8 -top-8 w-40 h-40 opacity-10" />
                <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-center">
                    <div className="flex-1">
                        <h4 className="text-sm font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                            <Bot size={18} className="text-blue-400" /> Root-Cause Reasoning (Gemini 3 Pro)
                        </h4>
                        <p className="text-xs text-indigo-100 leading-relaxed font-medium opacity-80 max-w-xl">
                            Our reasoning engine parses the 121-point suite, SQL registries, and endpoint response headers to identify hidden systemic risks. Use this for resolving "Server Unreachable" loops.
                        </p>
                        <button 
                            onClick={generateAIReport} 
                            disabled={results.length === 0 || isAnalyzing} 
                            className="mt-6 bg-white text-indigo-900 px-10 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl hover:bg-indigo-50 active:scale-95 disabled:opacity-50"
                        >
                            {isAnalyzing ? <Loader2 className="animate-spin w-5 h-5" /> : <Share2 className="w-5 h-5" />}
                            Execute Deep Reasoning Scan
                        </button>
                    </div>
                    {analysisReport && (
                        <div className="flex-1 bg-black/40 rounded-2xl p-6 text-[11px] leading-relaxed text-indigo-50 border border-white/10 max-h-[300px] overflow-y-auto custom-scrollbar font-medium backdrop-blur-md font-mono">
                            <div className="prose prose-invert prose-sm" dangerouslySetInnerHTML={{ __html: analysisReport.replace(/\n/g, '<br/>').replace(/###/g, '<h4 class="font-black text-blue-400 mt-6 mb-3 uppercase tracking-widest">') }} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
