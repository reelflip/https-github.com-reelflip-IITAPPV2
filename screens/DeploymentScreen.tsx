
import React, { useState } from 'react';
import { getBackendFiles, generateSQLSchema } from '../services/generatorService';
import { Download, Server, BookOpen, Package, FileText, Folder, ArrowRight, ShieldCheck, Database, Layout, Activity, PlugZap, CheckCircle2, XCircle, Lock, AlertTriangle, RefreshCw, List, ChevronDown, ChevronUp, Table as TableIcon, Layers, Info, Filter, FileJson, Terminal } from 'lucide-react';
import JSZip from 'jszip';

export const DeploymentScreen: React.FC = () => {
    
    const [activeTab, setActiveTab] = useState<'guide' | 'architecture' | 'integrity'>('guide');
    const [dbConfig, setDbConfig] = useState({ 
        host: "localhost", 
        name: "u123456789_prep", 
        user: "u123456789_admin", 
        pass: "password" 
    });
    
    const [isZipping, setIsZipping] = useState(false);
    const [integrityResults, setIntegrityResults] = useState<any[]>([]);
    const [dbTables, setDbTables] = useState<any[]>([]);
    const [scanning, setScanning] = useState(false);
    const [scanningDb, setScanningDb] = useState(false);

    const runIntegrityScan = async () => {
        setScanning(true);
        setIntegrityResults([]);
        const API_FILES = ['test_db.php', 'login.php', 'get_dashboard.php'];
        const results = [];
        for (const file of API_FILES) {
            const start = performance.now();
            let status = 'UNKNOWN';
            let code = 0;
            try {
                // Diagnostics use GET now to avoid body requirement
                const res = await fetch(`/api/${file}`, { method: 'GET', cache: 'no-store' }); 
                code = res.status;
                if (res.ok) status = 'OK';
                else if (res.status === 404) status = 'MISSING';
                else status = 'ERROR';
            } catch (e) { status = 'NET_ERR'; }
            results.push({ file, status, code, time: Math.round(performance.now() - start) });
            setIntegrityResults([...results]); 
        }
        setScanning(false);
    };

    const scanDatabase = async () => {
        setScanningDb(true);
        try {
            const res = await fetch('/api/test_db.php', { cache: 'no-store' });
            const data = await res.json();
            if (data.status === 'success' && data.tables) {
                setDbTables(data.tables);
            } else {
                alert(`MySQL Error: ${data.message || 'Check credentials'}`);
            }
        } catch (e) {
            alert("Endpoint unreachable. Ensure you have uploaded the api/ folder to your server.");
        }
        setScanningDb(false);
    };

    const downloadAllZip = async () => {
        setIsZipping(true);
        try {
            const zip = new JSZip();
            const backendFiles = getBackendFiles(dbConfig);
            const apiFolder = zip.folder("api");
            if (apiFolder) {
                backendFiles.filter(f => f.folder === 'deployment/api').forEach(file => apiFolder.file(file.name, file.content));
            }
            zip.file('database_mysql.sql', generateSQLSchema());
            
            const content = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url; link.download = "IITGEE_MySQL_Bundle_v16.zip";
            link.click();
        } catch (error) { alert("Zip failed."); }
        setIsZipping(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in pb-12">
            {/* Header */}
            <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Database className="text-blue-400" />
                            <h2 className="text-3xl font-bold">MySQL Sync Console</h2>
                            <span className="px-2 py-1 rounded-md bg-indigo-600 text-[10px] font-black text-white uppercase tracking-widest">v16.0 ENGINE</span>
                        </div>
                        <p className="text-slate-400 text-lg">Connected to Hostinger MySQL environment.</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setActiveTab('guide')} className={`px-6 py-2 rounded-lg text-sm font-bold ${activeTab === 'guide' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Guide</button>
                        <button onClick={() => setActiveTab('integrity')} className={`px-6 py-2 rounded-lg text-sm font-bold ${activeTab === 'integrity' ? 'bg-orange-600 text-white' : 'text-slate-400'}`}>Verify</button>
                    </div>
                </div>
            </div>

            {activeTab === 'guide' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 text-indigo-600"><Terminal size={20} /> MySQL Instructions</h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">1. Database Config</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><label className="text-[10px] font-bold text-slate-500 uppercase">DBHOST</label><input className="w-full p-2 border rounded mt-1 text-sm font-mono" value={dbConfig.host} onChange={e => setDbConfig({...dbConfig, host: e.target.value})}/></div>
                                        <div><label className="text-[10px] font-bold text-slate-500 uppercase">DBNAME</label><input className="w-full p-2 border rounded mt-1 text-sm font-mono" value={dbConfig.name} onChange={e => setDbConfig({...dbConfig, name: e.target.value})}/></div>
                                        <div><label className="text-[10px] font-bold text-slate-500 uppercase">DBUSER</label><input className="w-full p-2 border rounded mt-1 text-sm font-mono" value={dbConfig.user} onChange={e => setDbConfig({...dbConfig, user: e.target.value})}/></div>
                                        <div><label className="text-[10px] font-bold text-slate-500 uppercase">DBPASS</label><input className="w-full p-2 border rounded mt-1 text-sm font-mono" type="password" value={dbConfig.pass} onChange={e => setDbConfig({...dbConfig, pass: e.target.value})}/></div>
                                    </div>
                                </div>
                                <ul className="space-y-3 text-sm text-slate-600 list-disc pl-5 font-medium">
                                    <li>Extract the <code>api/</code> folder to your <code>public_html</code> root.</li>
                                    <li>Import <code>database_mysql.sql</code> via phpMyAdmin in your Hostinger panel.</li>
                                    <li>Ensure <strong>PDO MySQL</strong> is enabled in your PHP Selector settings.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                        <div className="bg-indigo-900 rounded-2xl p-8 text-white shadow-xl flex flex-col h-full">
                            <h3 className="text-xl font-bold mb-4">MySQL Bundle</h3>
                            <p className="text-indigo-200 text-sm mb-8 font-medium italic">Optimized for Hostinger LAMP stacks. Includes full relational schema.</p>
                            <button onClick={downloadAllZip} disabled={isZipping} className="w-full bg-white text-indigo-900 font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all active:scale-95">
                                {isZipping ? <RefreshCw className="animate-spin" /> : <Download />}
                                Download v16.0 ZIP
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'integrity' && (
                <div className="space-y-8 animate-in slide-in-from-right-4">
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Activity className="text-orange-500"/> MySQL Link Status</h3>
                            <div className="flex gap-2">
                                <button onClick={runIntegrityScan} disabled={scanning} className="bg-slate-800 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2">
                                    {scanning ? <RefreshCw className="animate-spin" /> : <Activity />} Scan Endpoints
                                </button>
                                <button onClick={scanDatabase} disabled={scanningDb} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2">
                                    {scanningDb ? <RefreshCw className="animate-spin" /> : <RefreshCw />} Test Connection
                                </button>
                            </div>
                        </div>

                        {integrityResults.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                                {integrityResults.map(res => (
                                    <div key={res.file} className={`p-4 border rounded-xl flex flex-col justify-between ${res.status === 'OK' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                                        <span className="text-xs font-black text-slate-800 truncate mb-1 uppercase">{res.file}</span>
                                        <span className={`text-[10px] font-bold ${res.code === 200 ? 'text-emerald-600' : 'text-rose-600'}`}>HTTP {res.code} ({res.status})</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {dbTables.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {dbTables.map(t => (
                                    <div key={t.name} className="p-4 bg-slate-50 border rounded-xl flex justify-between items-center">
                                        <div className="flex items-center gap-3"><Layers className="text-slate-400" size={16}/> <span className="text-sm font-bold text-slate-700">{t.name}</span></div>
                                        <span className="text-[10px] font-black bg-white px-2 py-1 rounded border text-blue-600">{t.rows} rows</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center text-slate-400 border-2 border-dashed rounded-3xl">
                                <AlertTriangle size={48} className="mx-auto mb-4 opacity-20" />
                                <p className="font-bold">No active tables detected. Run the test above.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
