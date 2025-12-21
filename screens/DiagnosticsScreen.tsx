
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ShieldCheck, RefreshCw, Activity, Play, CheckCircle2, XCircle, Database, Layers, Bot, Sparkles, ClipboardList, Loader2, Fingerprint, MousePointer2, Server, Check, Lock, ShieldAlert, Users, User, FileText, Settings, Key, AlertTriangle, Zap, Download, FileJson, Share2, ClipboardCheck, Wrench, Shield, Circle, LayoutGrid } from 'lucide-react';
import { E2ETestRunner, TestResult, CATEGORY_MAP, CategoryKey, GateCheck } from '../services/testRunnerService';
import { GoogleGenAI } from "@google/genai";

export const DiagnosticsScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState<CategoryKey>('INFRA');
    const [isRunning, setIsRunning] = useState(false);
    const [isGating, setIsGating] = useState(false);
    const [gatePassed, setGatePassed] = useState(false);
    const [gateChecks, setGateChecks] = useState<Record<string, GateCheck>>({
        connectivity: { id: 'connectivity', label: 'Connectivity', status: 'PENDING', msg: 'Handshake required' },
        schema: { id: 'schema', label: 'Schema Existence', status: 'PENDING', msg: 'Awaiting handshake' },
        columns: { id: 'columns', label: 'Column Integrity', status: 'PENDING', msg: 'Awaiting schema' },
        integrity: { id: 'integrity', label: 'Key & Relations', status: 'PENDING', msg: 'Awaiting column check' },
        write_safety: { id: 'write_safety', label: 'Write-Safety', status: 'PENDING', msg: 'Awaiting integrity' }
    });
    const [results, setResults] = useState<TestResult[]>([]);
    const [dbTables, setDbTables] = useState<any[]>([]);
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
        setGatePassed(false);
        const runner = initRunner();
        const checks = await runner.runDbGate();
        setGateChecks(checks);
        
        // Fix: Explicitly cast Object.values result to GateCheck[] to resolve property access on 'unknown' error
        const allPass = (Object.values(checks) as GateCheck[]).every(c => c.status === 'PASS');
        setGatePassed(allPass);
        setIsGating(false);
        fetchDbStatus();
    };

    const runMasterAudit = async () => {
        if (!gatePassed) {
            alert("Please complete the Database Pre-Check Gate first.");
            return;
        }
        if (!confirm("This will execute all 121 real-time server tests (A.01 to J.10). Continue?")) return;
        setIsRunning(true);
        const runner = initRunner();
        await runner.runFullAudit();
        setIsRunning(false);
        fetchDbStatus();
    };

    const exportAuditReport = () => {
        const runner = initRunner();
        runner.exportReport();
    };

    const resolutionGuidance = useMemo(() => {
        const dbFail = results.find(r => r.id === 'A.02' && r.status === 'FAIL');
        if (dbFail) {
            return {
                title: "Critical Database Failure (A.02)",
                cause: "Connection Refused. The PHP backend cannot reach the MySQL server.",
                steps: [
                    "Go to the 'Deployment' tab and verify host/user/pass.",
                    "Ensure MySQL service is running on your host.",
                    "Check if the database name actually exists.",
                    "Verify your PHP version is 7.4+ with PDO enabled."
                ]
            };
        }
        const blocks = results.filter(r => r.status === 'INFRA_BLOCK');
        if (blocks.length > 0) {
            return {
                title: "Cascading Infrastructure Block",
                cause: `${blocks.length} tests are skipped because Category A is unstable.`,
                steps: [
                    "Fix Category A (INFRA) failures first.",
                    "Ensure /api/test_db.php exists and is accessible."
                ]
            };
        }
        return null;
    }, [results]);

    const generateAIReport = async () => {
        if (isAnalyzing || results.length === 0) return;
        setIsAnalyzing(true);
        const apiKey = process.env.API_KEY;
        if (!apiKey || apiKey === "undefined") {
            setAnalysisReport("### API KEY MISSING\nPlease configure an API key in system settings to use live AI diagnostics.");
            setIsAnalyzing(false);
            return;
        }

        try {
            const ai = new GoogleGenAI({ apiKey });
            const failures = results.filter(r => r.status === 'FAIL').map(r => `[${r.id}] ${r.description}: ${r.details}`).join('\n');
            const prompt = `Act as a Senior SRE. Analyze these diagnostic results: 121 TOTAL, ${results.filter(r => r.status === 'FAIL').length} FAILED.
            Failures list:\n${failures}
            Identify the root cause of any systemic failure and suggest a fix.`;

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

    const currentResults = results.filter(r => r.category === activeTab);
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
                                <h2 className="text-3xl font-black uppercase tracking-tight">System Integrity Lab</h2>
                                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Master Diagnostic Center • v13.5</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3">
                        <button 
                            onClick={runMasterAudit} 
                            disabled={isRunning || !gatePassed} 
                            className={`px-8 py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center gap-2 transition-all active:scale-95 ${gatePassed ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-800 text-slate-500 opacity-50 cursor-not-allowed'}`}
                        >
                            {isRunning ? <RefreshCw className="animate-spin w-5 h-5" /> : <Play className="w-5 h-5" />}
                            Execute 121-Test Suite
                        </button>
                        <button onClick={exportAuditReport} disabled={results.length === 0} className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest border border-slate-700 flex items-center gap-2 active:scale-95 disabled:opacity-50 transition-all">
                            <Download className="w-5 h-5" />
                            Export Data
                        </button>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none"></div>
            </div>

            {/* STAGE 1: THE GATE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-[2.5rem] border-2 border-slate-200 shadow-xl overflow-hidden">
                        <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                            <div>
                                <h3 className="font-black text-slate-800 text-xs uppercase tracking-[0.2em]">Stage 1: DB Readiness Gate</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Mandatory Pre-Diagnostic Step</p>
                            </div>
                            <Shield className={`w-5 h-5 ${gatePassed ? 'text-emerald-500' : 'text-slate-300'}`} />
                        </div>
                        <div className="p-6 space-y-4">
                            {/* Fix: Explicitly cast Object.values result to GateCheck[] to resolve property access on 'unknown' error in mapping */}
                            {(Object.values(gateChecks) as GateCheck[]).map((check) => (
                                <div key={check.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 group transition-all hover:border-blue-200">
                                    <div className="flex items-center gap-3">
                                        {check.status === 'PASS' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : 
                                         check.status === 'FAIL' ? <XCircle className="w-4 h-4 text-rose-500" /> :
                                         check.status === 'RUNNING' ? <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" /> :
                                         <Circle className="w-4 h-4 text-slate-300" />}
                                        <div>
                                            <p className="text-xs font-black text-slate-700 uppercase tracking-tight">{check.label}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">{check.msg}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            <button 
                                onClick={runGateCheck} 
                                disabled={isGating}
                                className="w-full mt-4 bg-slate-900 hover:bg-black text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
                            >
                                {isGating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                Initialize DB Checker
                            </button>
                        </div>
                        {!gatePassed && (
                            <div className="px-6 pb-6 pt-2">
                                <p className="text-[9px] font-black text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-100 uppercase tracking-widest leading-relaxed">
                                    <ShieldAlert className="inline-block w-3 h-3 mr-1 mb-0.5" /> Stage 2 (121 Tests) remains locked until Stage 1 validation is 100% compliant.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Live SQL Telemetry */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-5">
                            <Database size={20} className="text-blue-500" />
                            <h4 className="text-xs font-black uppercase text-slate-800 tracking-tighter">Live SQL Telemetry</h4>
                        </div>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                            {dbTables.map(t => (
                                <div key={t.name} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:border-blue-200 shadow-sm group">
                                    <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight">{t.name}</span>
                                    <span className="bg-white px-3 py-1 rounded-xl border border-blue-50 text-[10px] font-black text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">{t.rows} Rows</span>
                                </div>
                            ))}
                            {dbTables.length === 0 && <p className="text-[10px] text-slate-400 italic text-center py-6">Database Link Blocked.</p>}
                        </div>
                    </div>
                </div>

                {/* STAGE 2: SUITE */}
                <div className="lg:col-span-8 space-y-6">
                    {resolutionGuidance && (
                        <div className="bg-rose-50 border-2 border-rose-200 p-6 rounded-[2rem] flex items-start gap-6 animate-in slide-in-from-top-4">
                            <div className="p-4 bg-rose-600 text-white rounded-2xl shadow-lg">
                                <Wrench size={24} />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-rose-900 font-black uppercase tracking-tight text-lg mb-1">{resolutionGuidance.title}</h4>
                                <p className="text-rose-700 font-bold text-sm mb-4">{resolutionGuidance.cause}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                                    {resolutionGuidance.steps.map((step, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs font-bold text-rose-600">
                                            <Check size={14} className="shrink-0" /> {step}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2 pb-2 overflow-x-auto no-scrollbar">
                        {(Object.entries(CATEGORY_MAP) as [CategoryKey, any][]).map(([key, config]) => (
                            <button key={key} onClick={() => setActiveTab(key)} className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${activeTab === key ? 'bg-white text-blue-600 border-blue-200 shadow-lg' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-white hover:text-slate-600'}`}>
                                {config.prefix}. {config.label}
                            </button>
                        ))}
                    </div>

                    <div className={`bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col min-h-[600px] transition-all ${!gatePassed ? 'opacity-30 grayscale pointer-events-none' : ''}`}>
                        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="font-black text-slate-800 text-xs uppercase tracking-[0.2em]">{CATEGORY_MAP[activeTab].label}</h3>
                            {results.length > 0 && <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress: {progressPercent}%</span>}
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-50">
                            {currentResults.length > 0 ? currentResults.map(r => (
                                <div key={r.id} className={`p-6 px-10 flex items-start gap-8 transition-all ${r.status === 'FAIL' ? 'bg-rose-50/50' : r.status === 'INFRA_BLOCK' ? 'opacity-50 grayscale' : 'hover:bg-slate-50'}`}>
                                    <div className={`mt-1.5 shrink-0 ${r.status === 'PASS' ? 'text-emerald-500' : r.status === 'RUNNING' ? 'text-blue-500 animate-spin' : r.status === 'INFRA_BLOCK' ? 'text-slate-300' : 'text-rose-500'}`}>
                                        {r.status === 'PASS' ? <CheckCircle2 size={24} /> : r.status === 'RUNNING' ? <RefreshCw size={24} /> : <XCircle size={24} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-1.5">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{r.id}</span>
                                            <span className="text-[9px] font-mono text-slate-300">{r.latency ? `${r.latency}ms` : ''}</span>
                                        </div>
                                        <div className="font-bold text-slate-800 text-base mb-1">{r.description}</div>
                                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic">{r.details || 'Awaiting execution thread...'}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-300 p-20 text-center">
                                    <ClipboardList size={64} className="mb-6 opacity-10" />
                                    <p className="font-black uppercase text-xs tracking-[0.2em]">Diagnostic Stream Empty</p>
                                    <p className="text-[10px] text-slate-400 mt-2 max-w-xs">Complete Stage 1 and run the Master Suite to populate live telemetry.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Failure Analyst Footnote */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                <Sparkles className="absolute -right-8 -top-8 w-40 h-40 opacity-10" />
                <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-center">
                    <div className="flex-1">
                        <h4 className="text-sm font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                            <Bot size={18} className="text-blue-400" /> AI failure Analyst (Gemini 3 Pro)
                        </h4>
                        <p className="text-xs text-indigo-100 leading-relaxed font-medium opacity-80 max-w-xl">
                            Our reasoning engine can parse the 121-point report to detect complex cascading failure patterns (e.g. why A.02 causes D.01 to timeout). Use this for Tier-3 debugging.
                        </p>
                        <button 
                            onClick={generateAIReport} 
                            disabled={results.length === 0 || isAnalyzing} 
                            className="mt-6 bg-white text-indigo-900 px-10 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl hover:bg-indigo-50 active:scale-95 disabled:opacity-50"
                        >
                            {isAnalyzing ? <RefreshCw className="animate-spin w-5 h-5" /> : <Share2 className="w-5 h-5" />}
                            Execute Deep Reasoning Scan
                        </button>
                    </div>
                    {analysisReport && (
                        <div className="flex-1 bg-black/40 rounded-2xl p-6 text-[11px] leading-relaxed text-indigo-50 border border-white/10 max-h-[300px] overflow-y-auto custom-scrollbar font-medium backdrop-blur-md">
                            <div className="prose prose-invert prose-sm" dangerouslySetInnerHTML={{ __html: analysisReport.replace(/\n/g, '<br/>').replace(/###/g, '<h4 class="font-black text-blue-400 mt-6 mb-3 uppercase tracking-widest">') }} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
