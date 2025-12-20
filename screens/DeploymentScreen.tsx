import React, { useState } from 'react';
import { getBackendFiles, generateSQLSchema } from '../services/generatorService';
import { Download, Server, BookOpen, Package, FileText, Folder, ArrowRight, ShieldCheck, Database, Layout, Activity, PlugZap, CheckCircle2, XCircle, Lock, AlertTriangle, RefreshCw, List, ChevronDown, ChevronUp, Table as TableIcon, Layers, Info } from 'lucide-react';
import JSZip from 'jszip';

export const DeploymentScreen: React.FC = () => {
    
    const [activeTab, setActiveTab] = useState<'guide' | 'architecture' | 'integrity'>('guide');
    const [dbConfig, setDbConfig] = useState({ host: "localhost", name: "u123456789_iitjee", user: "u123456789_admin", pass: "" });
    const [isZipping, setIsZipping] = useState(false);
    const [integrityResults, setIntegrityResults] = useState<any[]>([]);
    const [dbTables, setDbTables] = useState<any[]>([]);
    const [scanning, setScanning] = useState(false);
    const [scanningDb, setScanningDb] = useState(false);
    const [repairing, setRepairing] = useState(false);
    const [expandedTable, setExpandedTable] = useState<string | null>(null);

    const API_FILES = [
        'index.php', 'config.php', 'cors.php', 'test_db.php', 'migrate_db.php',
        'login.php', 'register.php', 'google_login.php', 'update_password.php',
        'get_dashboard.php', 'sync_progress.php', 
        'save_attempt.php', 'save_timetable.php',
        'manage_users.php', 'manage_content.php', 'manage_tests.php', 
        'manage_syllabus.php', 'manage_questions.php', 'manage_backlogs.php',
        'manage_goals.php', 'manage_mistakes.php', 'manage_notes.php',
        'manage_videos.php', 'manage_contact.php', 'contact.php',
        'manage_settings.php', 'update_profile.php', 'track_visit.php',
        'get_admin_stats.php', 'search_students.php', 'send_request.php',
        'respond_request.php', 'get_psychometric.php', 'save_psychometric.php',
        'delete_account.php', 'upload_avatar.php'
    ];

    const getStatusInfo = (code: number, text?: string) => {
        if (text?.includes("DATABASE_CONNECTION_ERROR")) return { desc: 'DB Link Failed', msg: 'PHP is OK, but MySQL credentials rejected.' };
        switch (code) {
            case 200: return { desc: 'Success', msg: 'File reachable and active.' };
            case 400: return { desc: 'Bad Request', msg: 'Invalid input parameters.' };
            case 401: return { desc: 'Unauthorized', msg: 'Auth token missing or invalid.' };
            case 403: return { desc: 'Forbidden', msg: 'Check folder permissions.' };
            case 404: return { desc: 'Not Found', msg: 'File is missing from server.' };
            case 500: return { desc: 'Syntax Error', msg: 'PHP engine crashed. Likely code error.' };
            case 0: return { desc: 'Network Error', msg: 'CORS or Connection timeout.' };
            default: return { desc: 'Unknown', msg: 'Unexpected response code.' };
        }
    };

    const runIntegrityScan = async () => {
        setScanning(true);
        setIntegrityResults([]);
        const results = [];
        for (const file of API_FILES) {
            const start = performance.now();
            let status = 'UNKNOWN';
            let code = 0;
            let responseText = '';
            try {
                const res = await fetch(`/api/${file}`, { method: 'POST', body: '{}', cache: 'no-store' }); 
                code = res.status;
                responseText = await res.clone().text();
                if (res.ok) {
                   if (responseText.includes("DATABASE_CONNECTION_ERROR")) status = 'DB_ERROR';
                   else status = 'OK';
                }
                else if (res.status === 403) status = 'PERM_ERR';
                else if (res.status === 404) status = 'MISSING';
                else if (res.status === 500) status = 'CRASH';
                else status = 'ERROR';
            } catch (e) { status = 'NET_ERR'; }
            results.push({ file, status, code, time: Math.round(performance.now() - start), text: responseText });
            setIntegrityResults([...results]); 
        }
        setScanning(false);
    };

    const scanDatabase = async () => {
        setScanningDb(true);
        setDbTables([]);
        try {
            const res = await fetch('/api/test_db.php', { cache: 'no-store' });
            const data = await res.json();
            if (data.status === 'CONNECTED') {
                setDbTables(data.tables || []);
            } else {
                alert("Database Connectivity Error: " + (data.message || data.details || "Access Denied"));
            }
        } catch (e) {
            alert("API Unreachable: Ensure test_db.php exists in /api folder.");
        } finally {
            setScanningDb(false);
        }
    };

    const runDbRepair = async () => {
        setRepairing(true);
        try {
            const res = await fetch('/api/migrate_db.php');
            if(res.ok) {
                alert("v12.32 Stability Core Schema Verification Successful!");
                scanDatabase();
            }
            else throw new Error(`HTTP ${res.status}`);
        } catch(e: any) { alert("Sync Failed: " + e.message); }
        finally { setRepairing(false); }
    };

    const downloadAllZip = async () => {
        setIsZipping(true);
        try {
            const zip = new JSZip();
            const backendFiles = getBackendFiles(dbConfig);
            const apiFolder = zip.folder("deployment/api");
            if (apiFolder) backendFiles.forEach(file => apiFolder.file(file.name, file.content));
            const content = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url; link.download = "IITGEEPrep_Stability_v12_32.zip";
            link.click();
        } catch (error) { alert("Zip creation failed."); }
        setIsZipping(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in pb-12">
            <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-3xl font-bold">Deployment Center</h2>
                            <span className="px-2 py-1 rounded-md bg-blue-600 text-xs font-mono text-white animate-pulse">v12.32 STABILITY CORE</span>
                        </div>
                        <p className="text-slate-400 text-lg">Fixing syntax errors and database connectivity issues.</p>
                    </div>
                    <div className="flex bg-slate-700/50 p-1 rounded-xl border border-slate-600/50">
                        <button onClick={() => setActiveTab('guide')} className={`px-6 py-2 rounded-lg text-sm font-bold ${activeTab === 'guide' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Guide</button>
                        <button onClick={() => setActiveTab('integrity')} className={`px-6 py-2 rounded-lg text-sm font-bold ${activeTab === 'integrity' ? 'bg-orange-600 text-white' : 'text-slate-400'}`}>Integrity</button>
                    </div>
                </div>
            </div>

            {activeTab === 'integrity' && (
                <div className="space-y-8">
                    {/* Database Link Health Check */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                            <div><h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Database className="text-blue-500" size={20}/> Database Stability Tracker</h3><p className="text-sm text-slate-500">Essential for fixing "Connection Refused" errors.</p></div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <button onClick={runDbRepair} disabled={repairing} className="flex-1 md:flex-none bg-slate-800 hover:bg-black text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50">{repairing ? <RefreshCw className="animate-spin" size={18}/> : <ShieldCheck size={18}/>} Sync Schema</button>
                                <button onClick={scanDatabase} disabled={scanningDb} className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50">{scanningDb ? <RefreshCw className="animate-spin" size={18}/> : <RefreshCw size={18}/>} Test MySQL Connection</button>
                            </div>
                        </div>

                        {dbTables.length === 0 && !scanningDb ? (
                            <div className="py-12 text-center text-rose-500 bg-rose-50 rounded-2xl border border-dashed border-rose-200 flex flex-col items-center">
                                <AlertTriangle size={48} className="mb-4" />
                                <p className="font-bold uppercase tracking-widest text-xs">No Database Connectivity</p>
                                <p className="text-sm mt-2 max-w-sm">System diagnostic shows DB link is broken. Re-upload <b>config.php</b> with correct credentials.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {dbTables.map(table => (
                                    <div key={table.name} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:border-blue-300 transition-all">
                                        <div 
                                            onClick={() => setExpandedTable(expandedTable === table.name ? null : table.name)}
                                            className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${expandedTable === table.name ? 'bg-blue-50' : 'bg-white hover:bg-slate-50'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-lg ${expandedTable === table.name ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                    <Layers size={18} />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-slate-800 text-sm tracking-tight">{table.name}</h4>
                                                    <div className="flex gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                                        <span>{table.columns?.length || 0} Fields</span>
                                                        <span>•</span>
                                                        <span className="text-blue-600">{table.rows} Records</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {expandedTable === table.name ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                                        </div>
                                        
                                        {expandedTable === table.name && (
                                            <div className="bg-white border-t border-slate-100 animate-in slide-in-from-top-2">
                                                <table className="w-full text-left text-[11px]">
                                                    <thead className="bg-slate-50 text-slate-400 uppercase font-black tracking-widest">
                                                        <tr>
                                                            <th className="px-4 py-2 border-b">Field</th>
                                                            <th className="px-4 py-2 border-b">Type</th>
                                                            <th className="px-4 py-2 border-b">Null</th>
                                                            <th className="px-4 py-2 border-b">Key</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-50">
                                                        {table.columns.map((col: any) => (
                                                            <tr key={col.name} className="hover:bg-slate-50/50 transition-colors">
                                                                <td className="px-4 py-2 font-bold text-slate-700">{col.name}</td>
                                                                <td className="px-4 py-2 text-slate-500 font-mono text-[10px]">{col.type}</td>
                                                                <td className="px-4 py-2 text-slate-400">{col.null}</td>
                                                                <td className="px-4 py-2">
                                                                    {col.key === 'PRI' ? (
                                                                        <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter">Primary</span>
                                                                    ) : col.key ? (
                                                                        <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter">{col.key}</span>
                                                                    ) : '-'}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* API File Integrity Section */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Activity className="text-orange-500" size={20}/> Module Health Scan (v12.32)</h3>
                                <p className="text-sm text-slate-500">Checking for 500 Syntax Crashes and 404 Missing Files.</p>
                            </div>
                            <button onClick={runIntegrityScan} disabled={scanning} className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50">{scanning ? <RefreshCw className="animate-spin" size={18}/> : <Activity size={18}/>} Run System-Wide Scan</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {integrityResults.map(res => {
                                const info = getStatusInfo(res.code, res.text);
                                return (
                                    <div key={res.file} className={`p-4 rounded-2xl border flex flex-col justify-between transition-all hover:shadow-md ${res.status === 'OK' ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50/50 border-rose-100'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="min-w-0">
                                                <div className="font-black text-slate-800 text-xs truncate mb-1">{res.file}</div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-1.5 py-0.5 rounded-md font-mono text-[10px] font-bold ${res.code === 200 && !res.text.includes('DATABASE_CONNECTION_ERROR') ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                        HTTP {res.code}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400">{res.time}ms</span>
                                                </div>
                                            </div>
                                            <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-lg border ${res.status === 'OK' ? 'bg-white border-emerald-200 text-emerald-600' : 'bg-white border-rose-200 text-rose-600'}`}>
                                                {res.status}
                                            </span>
                                        </div>
                                        <div className="mt-2 pt-2 border-t border-slate-200/40 flex items-start gap-2">
                                            <Info size={12} className="mt-0.5 text-slate-400 shrink-0" />
                                            <div>
                                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none mb-0.5">{info.desc}</p>
                                                <p className="text-[9px] text-slate-500 leading-tight">{info.msg}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'guide' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 text-rose-600"><AlertTriangle className="animate-bounce" /> URGENT: Stability Update</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">The previous release (v12.31) contained critical syntax errors that caused 500 crashes. Please follow these steps <b>immediately</b>:</p>
                        <ol className="space-y-4 text-slate-600 text-sm list-decimal pl-5">
                            <li>Download the <strong>v12.32 Stability Core Bundle</strong>.</li>
                            <li><b>Replace all files</b> in your <code>/api</code> directory with the new ones. This fixes the internal syntax engine.</li>
                            <li>Go to <b>Integrity</b> and click <b>Sync Schema</b> to verify and repair your database tables.</li>
                            <li>If "DB Link Failed" persists, verify your <code>config.php</code> credentials manually.</li>
                        </ol>
                    </div>
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-rose-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col h-full">
                            <div className="flex-1">
                                <h3 className="text-xl font-bold mb-2">Get Stability Bundle</h3>
                                <p className="text-rose-200 text-sm mb-6 leading-relaxed">Fixes all syntax errors and "500 Internal Server" issues from v12.31.</p>
                            </div>
                            <button onClick={downloadAllZip} disabled={isZipping} className="w-full bg-white text-rose-900 font-black py-3 rounded-xl flex items-center justify-center transition-all disabled:opacity-50 shadow-lg active:scale-95 mt-4">
                                {isZipping ? <RefreshCw className="animate-spin mr-2"/> : <Download className="mr-2"/>} Download v12.32 .zip
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};